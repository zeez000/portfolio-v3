import gsap from 'gsap';
import { scrollState } from './scroll.js';

const FS = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform vec2 m;

float band(vec2 uv,float y,float amp,float freq,float speed){
  float wave=sin(uv.x*freq+t*speed+sin(uv.x*1.7-t*.05)*.9)*amp;
  float d=abs(uv.y-(y+wave));
  return smoothstep(.19,.0,d);
}

void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=uv-.5;
  p.x*=r.x/r.y;

  vec3 base=vec3(.022,.026,.055);
  float a=band(p,.12,.11,3.2,.13);
  float b=band(p,-.05,.09,4.0,-.10);
  float c=band(p,.25,.07,5.3,.08);

  vec3 cyan=vec3(.05,.62,.88);
  vec3 violet=vec3(.38,.18,.82);
  vec3 magenta=vec3(.72,.12,.66);

  vec3 col=base;
  col+=cyan*a*.36;
  col+=violet*b*.30;
  col+=magenta*c*.18;

  vec2 mouse=m-.5;
  mouse.x*=r.x/r.y;
  float glow=exp(-length(p-mouse)*2.6);
  col+=vec3(.09,.19,.34)*glow*.22;

  float edge=smoothstep(.95,.22,length(p));
  col*=.72+.34*edge;
  col+=vec3(.02,.04,.08)*(1.0-uv.y)*.35;

  gl_FragColor=vec4(col,1.0);
}`;

export function initBackground() {
  const cv = document.getElementById('bg');
  if (!cv || matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return;

  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;

  const mk = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    return s;
  };

  const vs = mk(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}');
  const fs = mk(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;

  const pr = gl.createProgram();
  gl.attachShader(pr, vs);
  gl.attachShader(pr, fs);
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;

  gl.useProgram(pr);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);

  const loc = gl.getAttribLocation(pr, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uR = gl.getUniformLocation(pr, 'r');
  const uT = gl.getUniformLocation(pr, 't');
  const uM = gl.getUniformLocation(pr, 'm');

  const q = new URLSearchParams(location.search);
  let scale = +q.get('bgscale') || 0.42;
  let fps = +q.get('bgfps') || 30;
  let last = 0;
  let slow = 0;
  let frames = 0;
  let dead = false;
  let mx = .72, my = .28, tx = mx, ty = my;

  const size = () => {
    cv.width = Math.max(2, innerWidth * scale | 0);
    cv.height = Math.max(2, innerHeight * scale | 0);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(uR, cv.width, cv.height);
  };

  size();
  addEventListener('resize', size, { passive: true });
  addEventListener('pointermove', (e) => {
    tx = e.clientX / innerWidth;
    ty = 1 - e.clientY / innerHeight;
  }, { passive: true });

  const tick = (time) => {
    if (document.hidden || dead) return;
    if (Math.abs(scrollState.velocity) > 8) return;

    const reading = document.body.classList.contains('reading');
    const targetFps = reading ? 18 : fps;
    if (time - last < 1 / targetFps) return;

    const dt = Math.min(.05, time - last || .016);
    last = time;
    mx += (tx - mx) * Math.min(1, dt * 3.2);
    my += (ty - my) * Math.min(1, dt * 3.2);

    const t0 = performance.now();
    gl.uniform1f(uT, time);
    gl.uniform2f(uM, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (++frames > 12 && frames <= 80) {
      slow += performance.now() - t0 > 8 ? 1 : 0;
      if (frames === 80 && slow > 24) {
        if (fps > 22) fps = 22;
        else if (scale > .32) { scale = .32; size(); }
        else dead = true;
      }
    }
  };

  gsap.ticker.add(tick);
}
