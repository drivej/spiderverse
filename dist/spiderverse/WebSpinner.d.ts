import * as THREE from 'three';
import { Chain } from './Chain';
import { Moover } from './Moov';
export declare class WebSpinner extends THREE.Group {
    line: THREE.Line;
    fromPoint: THREE.Vector3;
    toPoint: THREE.Vector3;
    currentPoint: THREE.Vector3;
    vector: THREE.Vector3;
    speed: number;
    lerpValue: number;
    attachDistance: number;
    staticLength: number;
    maxDistance: number;
    elasticity: number;
    isActive: boolean;
    isAttached: boolean;
    fromObject: THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial>;
    toObject: THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial>;
    tween: Moover;
    chain: Chain;
    forceFactor: number;
    constructor();
    attachTo(intersection: THREE.Intersection<THREE.Object3D<THREE.Event>>): void;
    detach(): void;
    distance(): number;
    update(): void;
    getVector(): THREE.Vector3;
}
//# sourceMappingURL=WebSpinner.d.ts.map