import * as THREE from 'three';
export declare class Chain extends THREE.Group {
    links: THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial>[];
    line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    test: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    constructor(length?: number);
    fromTo(fromPoint: THREE.Vector3, toPoint: THREE.Vector3): void;
}
//# sourceMappingURL=Chain.d.ts.map