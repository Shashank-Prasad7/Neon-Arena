import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Spark {
  id: number;
  x: number;
  y: number;
  // xDrift / yDrift are baked-in at creation so Math.random() is never called
  // inside the animate prop. Calling Math.random() there re-runs on every
  // React render and snaps all sparks to new targets → causes the flicker.
  xDrift: number;
  yDrift: number;
  color: string;
  size: number;
}

const SPARK_COLORS = ['#7ad9ff', '#65c7ff', '#72dcff', '#42d4ff'];

export default function FootballCursorEffect() {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    document.body.style.cursor = 'crosshair';

    const addSpark = (x: number, y: number, size = Math.random() * 6 + 4) => {
      const spark: Spark = {
        id: Date.now() + Math.random(),
        x,
        y,
        xDrift: (Math.random() - 0.5) * 30,  // computed once, stable across renders
        yDrift: (Math.random() - 0.5) * 30,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        size,
      };

      setSparks((prev) => [...prev.slice(-14), spark]);

      window.setTimeout(() => {
        setSparks((prev) => prev.filter((item) => item.id !== spark.id));
      }, 800);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (Math.random() < 0.28) {
        addSpark(event.clientX, event.clientY);
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      for (let index = 0; index < 8; index += 1) {
        const angle = (index / 8) * Math.PI * 2;
        const distance = 18 + Math.random() * 12;
        addSpark(
          event.clientX + Math.cos(angle) * distance,
          event.clientY + Math.sin(angle) * distance,
          Math.random() * 8 + 6,
        );
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            initial={{
              x: spark.x,
              y: spark.y,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: spark.x + spark.xDrift,
              y: spark.y + spark.yDrift,
              scale: 1,
              opacity: 0,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: spark.size,
              height: spark.size,
              background: spark.color,
              borderRadius: '50%',
              boxShadow: `0 0 20px ${spark.color}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
