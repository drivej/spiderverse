import * as THREE from 'three';
export declare class Ligament extends THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial> {
    _active: boolean;
    constructor({ color }?: {
        color?: number;
    });
    fromTo(from: THREE.Vector3, to: THREE.Vector3): void;
    to(point: THREE.Vector3): void;
    from(point: THREE.Vector3): void;
    set active(val: boolean);
    get active(): boolean;
}
//# sourceMappingURL=Ligament.d.ts.map