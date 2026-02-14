import * as THREE from 'three';
export declare class Building extends THREE.Mesh<THREE.BoxGeometry, THREE.Material[]> {
    constructor({ height, width, depth }?: {
        height?: number;
        width?: number;
        depth?: number;
    });
    containsPoint(point: THREE.Vector3): void;
}
//# sourceMappingURL=Building.d.ts.map