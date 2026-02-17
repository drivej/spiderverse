import * as THREE from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import imgSrc4 from '../assets/images/brick-building.jpg?url';
import imgSrc2 from '../assets/images/building-2.jpg?url';
import imgSrc1 from '../assets/images/BuildingsHighRise0628_2_download600.jpg?url';
import imgRoof from '../assets/images/RooftilesBitumen0011_1_350.jpg?url';
// import { rand } from '../../js/Utils';
import { rand } from '@drivej/xrworld';
import { buildingFloorHeight } from './generateCity';

// const testMaterial = new THREE.MeshStandardMaterial({
//   color: 0xffffff
// });

// const roofMaterial = new THREE.MeshStandardMaterial({
//   color: 0xcccccc,
//   roughness: 1.0,
//   metalness: 0.1
//   // transparent:true,
//   // opacity:0.5,
// });

const edgeMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa
  // roughness: 1.0,
  // metalness: 0.1
});

// const redMaterial = new THREE.MeshStandardMaterial({
//   color: 0xff0000
//   // roughness: 1.0,
//   // metalness: 0.1
// });

interface BuildingAsset {
  width: number;
  height: number;
  src: string;
}

const nyBrick = {
  src: imgSrc4,
  width: 7,
  height: 7
} as BuildingAsset;

const glassAndConcrete = {
  src: imgSrc1,
  width: 15,
  height: 15
} as BuildingAsset;

const modernSquareConcrete = {
  src: imgSrc2, // 7x7 windows, each 2m
  width: 14,
  height: 14
} as BuildingAsset;

const bitumenRoof = {
  src: imgRoof,
  width: 13,
  height: 13
} as BuildingAsset;

const roofColliderMaterial = new THREE.MeshBasicMaterial({
  visible: false,
  depthWrite: false
});

const tallAssets = [glassAndConcrete, modernSquareConcrete];
const shortAssets = [nyBrick];
const edgeHeight = 0.2;

function getMaterial(asset: BuildingAsset, width: number, height: number) {
  const texture = new THREE.TextureLoader().load(asset.src, () => {
    texture.needsUpdate = true;
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(width / asset.width, height / asset.height); // width, height

  const material = new THREE.MeshStandardMaterial({ map: texture });
  return material;
}

export class Building extends THREE.Mesh<THREE.BoxGeometry, THREE.Material[]> {
  constructor({ height = 20, width = 10, depth = 5 }: { height?: number; width?: number; depth?: number } = {}) {
    const assetSet = height < buildingFloorHeight * 30 ? shortAssets : tallAssets;
    const asset = assetSet[rand(0, assetSet.length - 1, true)];
    // adjust size so assets fit perfectly
    width -= width % asset.width;
    height -= height % asset.height;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    // right/left texture
    const t1 = getMaterial(asset, depth, height);
    // fromt/back texture
    const t2 = getMaterial(asset, width, height);

    const roofMaterial = getMaterial(bitumenRoof, width, depth);
    // right, left, top, bottom, front, back
    const materials = [t1, t1, roofMaterial, roofMaterial, t2, t2];
    super(geometry, materials);
    this.position.setY(height * 0.5);
    this.name = 'building';
    geometry.computeBoundingBox();

    // build edge on top
    const edgeY = height * 0.5 + edgeHeight * 0.5;
    const edgeX = width * 0.5 - edgeHeight * 0.5;
    const edgeZ = depth * 0.5 - edgeHeight * 0.5;

    const edgeZGeometry = new THREE.BoxGeometry(width, edgeHeight, edgeHeight);
    const edgeZAxis = new THREE.Mesh(edgeZGeometry, edgeMaterial);

    edgeZAxis.position.set(0, edgeY, edgeZ);
    this.add(edgeZAxis);

    const edgeZAxisFront = edgeZAxis.clone();
    edgeZAxisFront.position.set(0, edgeY, -edgeZ);
    this.add(edgeZAxisFront);

    const edgeXGeometry = new THREE.BoxGeometry(depth, edgeHeight, edgeHeight);
    const edgeXAxis = new THREE.Mesh(edgeXGeometry, edgeMaterial);
    edgeXAxis.rotateY(degToRad(90));

    edgeXAxis.position.set(edgeX, edgeY, 0);
    this.add(edgeXAxis);

    const edgeXAxisFront = edgeXAxis.clone();
    edgeXAxisFront.position.set(-edgeX, edgeY, 0);

    // roof
    const roofGeo = new THREE.PlaneGeometry(width, depth);
    const roof = new THREE.Mesh(roofGeo, roofColliderMaterial);

    // orient flat (XZ plane)
    roof.rotation.x = -Math.PI / 2;

    // position slightly above the top face to avoid z-fighting
    roof.position.set(0, height * 0.5 + 0.01, 0);

    // identify this surface in raycasts
    roof.name = 'buildingRoof';
    roof.userData.runnable = true;
    roof.userData.surface = 'roof';
    roof.userData.building = this;

    // attach to building so it moves together
    this.add(roof);
    this.add(edgeXAxisFront);

    // this.castShadow = true;
    // this.receiveShadow = true;
  }

  containsPoint(point: THREE.Vector3) {
    this.geometry.boundingBox!.containsPoint(point);
  }

  setOpacity(opacity: number) {
    // Fade this building (it uses Material[])
    const mats = Array.isArray(this.material) ? this.material : [this.material];

    mats.forEach((mat) => {
      if (mat instanceof THREE.Material) {
        mat.transparent = opacity < 1; // only enable when needed
        (mat as any).opacity = opacity; // MeshStandardMaterial supports this
        mat.depthWrite = opacity === 1; // helps with sorting artifacts
        mat.needsUpdate = true;
      }
    });

    // Fade children (edges)
    this.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const childMats = Array.isArray(obj.material) ? obj.material : [obj.material];

        childMats.forEach((m) => {
          if (m instanceof THREE.Material) {
            m.transparent = opacity < 1;
            (m as any).opacity = opacity;
            m.depthWrite = opacity === 1;
            m.needsUpdate = true;
          }
        });
      }
    });
  }
}
