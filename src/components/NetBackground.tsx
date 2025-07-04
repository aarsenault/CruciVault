import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import type { VantaEffectInstance } from "vanta/dist/vanta.net.min";
import NET from "vanta/dist/vanta.net.min";

export const NetBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const vantaRef = useRef<VantaEffectInstance | null>(null);

  useEffect(() => {
    if (!vantaRef.current && containerRef.current) {
      vantaRef.current = NET({
        el: containerRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: true,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0xadc1de,
        backgroundColor: 0x111116,
        points: 10.0,
        maxDistance: 26.0,
        spacing: 17.0,
        vertexColors: false,
      });
    }
    return () => {
      vantaRef.current?.destroy();
      vantaRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};
