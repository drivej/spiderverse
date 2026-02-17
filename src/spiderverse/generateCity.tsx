import { Grid, rand } from '@drivej/xrworld';
import * as THREE from 'three';
import imgCityBlock from '../assets/images/city-block.jpg?url';
import { Building } from './Building';

const metersPerFoot = 0.3048;
const laneWidth = 12 * metersPerFoot;
const shoulderWidth = 8 * metersPerFoot;
const cityBlockWidth = 265 * metersPerFoot;
const cityBlockDepth = cityBlockWidth;
const sidewalkWidth = 12 * metersPerFoot;
export const buildingFloorHeight = 4.5;
const curbHeight = 2;

interface CityConfig {
  rows?: number;
  columns?: number;
}

const sideMaterial = new THREE.MeshStandardMaterial({
  color: 0xcccccc
});

export function createCityStreets(grid: Grid<any>) {
  const texture = new THREE.TextureLoader().load(imgCityBlock, () => {
    texture.needsUpdate = true;
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(grid.columns, grid.rows);

  const material = new THREE.MeshStandardMaterial({ map: texture });

  texture.anisotropy = 16;
  const geo = new THREE.BoxGeometry(grid.width, 1, grid.height);
  // right, left, top, bottom, front, back
  const mesh = new THREE.Mesh(geo, [sideMaterial, sideMaterial, material, sideMaterial, sideMaterial, sideMaterial]);
  mesh.name = 'street';
  mesh.userData.runnable = true;
  return mesh;
}

export class City extends THREE.Group {
  buildings: Building[] = [];
  streets: THREE.Object3D[] = [];

  constructor(config: CityConfig = { rows: 10, columns: 10 }) {
    super();

    const grid = new Grid(
      config.rows, //
      config.columns,
      cityBlockWidth + sidewalkWidth * 2 + laneWidth * 2 + shoulderWidth * 2,
      cityBlockDepth + sidewalkWidth * 2 + laneWidth * 2 + shoulderWidth * 2
    );

    const streets = createCityStreets(grid);
    streets.position.set(grid.width * 0.5 - grid.colWidth * 0.5, 0.5, grid.height * 0.5 - grid.colWidth * 0.5);
    this.add(streets);
    // this.buildings.push(streets);
    this.streets.push(streets);

    grid.cells.forEach((cell) => {
      const cityBlock = new THREE.Object3D();
      cityBlock.position.setX(cell.x);
      cityBlock.position.setZ(cell.y);

      const height = buildingFloorHeight * (20 + Math.pow(Math.random() * Math.pow(100, 1 / 3), 3));
      let buildingWidth = rand(cityBlockWidth * 0.5, cityBlockWidth, true);
      let buildingDepth = rand(cityBlockDepth * 0.5, cityBlockDepth, true);

      const building = new Building({ width: buildingWidth, height, depth: buildingDepth });

      cityBlock.add(building);
      this.buildings.push(building);

      this.add(cityBlock);
    });
  }
}

// export function generateCity(world: XRWorld, rows = 10, columns = 10) {
//   const group = new THREE.Group();
//   const buildings: Building[] = [];
//   const grid = new Grid(rows, columns, cityBlockWidth + sidewalkWidth * 2 + laneWidth * 2 + shoulderWidth * 2, cityBlockDepth + sidewalkWidth * 2 + laneWidth * 2 + shoulderWidth * 2);

//   grid.cells.forEach((cell) => {
//     const cityBlock = new THREE.Object3D();
//     cityBlock.position.setX(cell.x);
//     cityBlock.position.setZ(cell.y);

//     const height = buildingFloorHeight * rand(4, 40, true);
//     let buildingWidth = rand(cityBlockWidth * 0.5, cityBlockWidth, true);
//     buildingWidth = ~~(buildingWidth / 30) * 30;
//     let buildingDepth = rand(cityBlockDepth * 0.5, cityBlockDepth, true);
//     buildingDepth = ~~(buildingDepth / 30) * 30;

//     const building = new Building({ width: buildingWidth, height, depth: buildingDepth });
//     building.position.setX((cityBlockWidth - buildingWidth) * [-0.5, 0.5][rand(0, 1, true)]);
//     building.position.setZ((cityBlockDepth - buildingDepth) * [-0.5, 0.5][rand(0, 1, true)]);
//     building.position.y += curbHeight;

//     cityBlock.add(building);
//     buildings.push(building);

//     group.add(cityBlock);
//   });
//   world.scene.add(group);
//   return buildings;
// }
