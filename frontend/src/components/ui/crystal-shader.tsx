import { useRef, useEffect } from 'react';

interface InteractiveShaderProps {
  cellDensity?: number;
  animationSpeed?: number;
  warpFactor?: number;
  mouseInfluence?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function InteractiveShader({
  cellDensity = 8.0,
  animationSpeed = 0.2,
  warpFactor = 0.6,
  mouseInfluence = 0.15,
  style,
  className,
}: InteractiveShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Forward-declared so resizeCanvas (called after init) can reference it
    let iResolutionLoc: WebGLUniformLocation | null = null;

    function resizeCanvas() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      if (iResolutionLoc) {
        gl!.uniform2f(iResolutionLoc, canvas!.width, canvas!.height);
      }
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mousePos.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    }

    function compileShader(src: string, type: number): WebGLShader | null {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl!.getShaderInfoLog(s));
        gl!.deleteShader(s);
        return null;
      }
      return s;
    }

    const vertexShaderSrc = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Neon Arena brand: dark crystal cells cycling between cyan (#72dcff) and green (#2ff801)
    const fragmentShaderSrc = `
      precision highp float;
      uniform vec2  iResolution;
      uniform float iTime;
      uniform vec2  iMouse;
      uniform float uCellDensity;
      uniform float uAnimationSpeed;
      uniform float uWarpFactor;
      uniform float uMouseInfluence;
      #define PI 3.14159265359

      vec2 random2(vec2 p) {
        return fract(sin(vec2(
          dot(p, vec2(127.1, 311.7)),
          dot(p, vec2(269.5, 183.3))
        )) * 43758.5453);
      }

      vec2 voronoi(vec2 x, float time) {
        vec2 n = floor(x);
        vec2 f = fract(x);
        float m  = 10.0;
        float m2 = 10.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = random2(n + g);
            o = 0.5 + 0.5 * sin(time + o * PI * 2.0);
            float d = length(g - f + o);
            if (d < m) { m2 = m; m = d; }
            else if (d < m2) { m2 = d; }
          }
        }
        return vec2(m, m2);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

        // Mouse repel
        vec2 m = iMouse * 2.0 - 1.0;
        m.y *= -1.0;
        float md = length(uv - m);
        vec2 disp = normalize(uv - m)
          * (1.0 - smoothstep(0.0, 0.5, md))
          * uMouseInfluence;
        uv -= disp;

        float t = iTime * uAnimationSpeed;

        // Two-layer Voronoi for domain warping
        vec2 b = voronoi(uv * uCellDensity, t);
        vec2 w = voronoi(uv * uCellDensity + b.yy * uWarpFactor, t);
        float pattern = w.y - w.x;

        // Neon Arena brand palette
        vec3 bgDark      = vec3(0.055, 0.055, 0.059);   // #0e0e0f
        vec3 primaryCyan = vec3(0.447, 0.863, 1.0);      // #72dcff
        vec3 secondGreen = vec3(0.184, 0.973, 0.004);    // #2ff801

        // Smooth per-cell color oscillation
        float colorCycle = 0.5 + 0.5 * sin(t * 0.4 + w.x * 3.5 + w.y * 2.0);
        vec3 activeColor = mix(primaryCyan, secondGreen, colorCycle);

        // Crystal edge highlight (sharp rim at cell boundary)
        float edgeRim   = 1.0 - smoothstep(0.0, 0.03, pattern);
        // Soft interior fill
        float interior  = 1.0 - smoothstep(0.03, 0.18, pattern);
        // Center glow
        float centerGlow = pow(max(0.0, 1.0 - b.x * 2.8), 5.0);

        vec3 col = bgDark;
        col += activeColor * interior * 0.18;
        col += activeColor * edgeRim  * 0.55;
        col += activeColor * centerGlow * 1.2;
        // White-hot center specular
        col += vec3(0.82, 0.96, 1.0) * pow(centerGlow, 3.0) * 0.7;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const vShader = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
    const fShader = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);
    if (!vShader || !fShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const aPosLoc = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosLoc);

    iResolutionLoc              = gl.getUniformLocation(program, 'iResolution');
    const iTimeLoc              = gl.getUniformLocation(program, 'iTime');
    const iMouseLoc             = gl.getUniformLocation(program, 'iMouse');
    const uCellDensityLoc       = gl.getUniformLocation(program, 'uCellDensity');
    const uAnimationSpeedLoc    = gl.getUniformLocation(program, 'uAnimationSpeed');
    const uWarpFactorLoc        = gl.getUniformLocation(program, 'uWarpFactor');
    const uMouseInfluenceLoc    = gl.getUniformLocation(program, 'uMouseInfluence');

    const quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 1);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const start = performance.now();
    let rafId: number;

    function render() {
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      const now = (performance.now() - start) / 1000;
      gl!.uniform1f(iTimeLoc, now);
      gl!.uniform2f(iMouseLoc, mousePos.current.x, mousePos.current.y);
      gl!.uniform1f(uCellDensityLoc, cellDensity);
      gl!.uniform1f(uAnimationSpeedLoc, animationSpeed);
      gl!.uniform1f(uWarpFactorLoc, warpFactor);
      gl!.uniform1f(uMouseInfluenceLoc, mouseInfluence);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      if (!gl.isContextLost()) {
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
        gl.deleteProgram(program);
        gl.deleteBuffer(buf);
      }
    };
  }, [cellDensity, animationSpeed, warpFactor, mouseInfluence]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'block',
        ...style,
      }}
    />
  );
}
