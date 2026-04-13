import InteractiveWaveShader from "../components/ui/flowing-waves-shader";

export default function DemoWave() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* 
        This is a full-screen container that renders the background wave shader.
        The shader itself places its canvas fixed to the background.
        We can overlay content here.
      */}
      <InteractiveWaveShader />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-white drop-shadow-lg mb-4">
          Interactive WebGL Waves
        </h1>
        <p className="text-xl text-gray-200 drop-shadow max-w-2xl">
          Use the buttons below to switch active states and dim the center effect.<br/>
          Click anywhere on the screen to shoot footballs!
        </p>
      </div>
    </div>
  );
}
