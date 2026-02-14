import { Grid, XRWorld } from '@drivej/xrworld';
import * as THREE from 'three';
import { Building } from './Building';
export declare const buildingFloorHeight = 4.5;
interface CityConfig {
    rows?: number;
    columns?: number;
}
export declare function createCityStreets(grid: Grid<any>): THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial[]>;
export declare class City extends THREE.Group {
    buildings: THREE.Object3D[];
    constructor(config?: CityConfig);
}
export declare function generateCity(world: XRWorld, rows?: number, columns?: number): Building[];
export {};
//# sourceMappingURL=generateCity.d.ts.map