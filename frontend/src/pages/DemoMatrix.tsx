import CelestialMatrixShader from '@/components/ui/martrix-shader';

export default function DemoMatrix() {
  return (
    <div className="app-container">
      <CelestialMatrixShader />
      <div className="overlay-content">
        <h1 className="title">Celestial Matrix</h1>
        <p className="description">An Interactive WebGL Shader</p>
      </div>
    </div>
  );
}
