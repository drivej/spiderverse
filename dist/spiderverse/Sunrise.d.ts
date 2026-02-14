import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky';
export declare class Sunrise extends Sky {
    effectController: {
        turbidity: number;
        rayleigh: number;
        mieCoefficient: number;
        mieDirectionalG: number;
        elevation: number;
        azimuth: number;
        exposure: number;
    };
    sun: THREE.Vector3;
    constructor();
    updateSun(): void;
    setElevation(val: number): void;
    startSunrise(): void;
}
//# sourceMappingURL=Sunrise.d.ts.map