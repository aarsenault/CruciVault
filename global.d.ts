declare module "vanta/dist/vanta.net.min" {
  import type * as THREE from "three";

  export interface VantaNETOptions {
    el: HTMLElement | string;
    THREE?: typeof THREE;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    backgroundColor?: number;
    color?: number;
    color2?: number;
    maxDistance?: number;
    spacing?: number;
    showLines?: boolean;
    [key: string]: unknown;
  }

  export interface VantaEffectInstance {
    setOptions: (opts: Partial<VantaNETOptions>) => void;
    destroy: () => void;
    [key: string]: unknown;
  }

  export default function NET(options: VantaNETOptions): VantaEffectInstance;
}
