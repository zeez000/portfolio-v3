import gsap from 'gsap';
import { scrollState } from './scroll.js';
const FS = `precision mediump float;uniform vec2 r;uniform float t;
void main(){vec2 p=gl_FragCoord.xy/r;p.x*=r.x/r.y;vec2 q=p*1.4;
q+=.35*vec2(sin(q.y*2.1+t*.12),cos(q.x*1.7-t*.10));q+=.25*vec2(sin(q.y*3.3-t*.08),cos(q.x*2.9+t*.09));
float s=sin(q.x*2.2+q.y*1.6+t*.06)*.5+.5;float h=smoothstep(.2,.9,s);
vec3 a=vec3(.03,.05,.16),b=vec3(.16,.08,.38),c=vec3(.02,.30,.38);
vec3 col=mix(a,b,h)+c*smoothstep(.65,1.,sin(q.y*2.6-q.x*1.1+t*.05)*.5+.5)*.5;
col*=.55;gl_FragColor=vec4(col,1.);}`;
export function initBackground() {
  const cv = document.getElementById('bg');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return;
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, mk(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
  gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't');
  const q = new URLSearchParams(location.search); // ?bgscale=0.5&bgfps=60 for measuring
  let scale = +q.get('bgscale') || 0.4, fps = +q.get('bgfps') || 30, last = 0, slow = 0, n = 0, dead = false;
  const size = () => { cv.width = Math.max(2, innerWidth * scale | 0); cv.height = Math.max(2, innerHeight * scale | 0); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(uR, cv.width, cv.height); };
  size(); addEventListener('resize', size);
  const tick = (time) => {
    if (document.hidden || dead) return;
    if (Math.abs(scrollState.velocity) > 6) return;             // yield to fast scrolling
    const caseOpen = document.body.classList.contains('reading');
    if (time - last < 1 / (caseOpen ? 12 : fps)) return;
    const t0 = performance.now(); last = time;
    gl.uniform1f(uT, time); gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (++n > 10 && n <= 70) { slow += performance.now() - t0 > 8 ? 1 : 0;
      if (n === 70 && slow > 20) { if (fps > 20) fps = 20; else { dead = true; } } }
  };
  gsap.ticker.add(tick);
}
