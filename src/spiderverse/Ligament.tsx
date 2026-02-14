import * as THREE from 'three';

export class Ligament extends THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial> {
  _active = true;

  constructor({color = 0xcccccc}:{color?:number} = {}) {
    super(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color }));
  }

  fromTo(from: THREE.Vector3, to: THREE.Vector3) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    positions[0] = from.x;
    positions[1] = from.y;
    positions[2] = from.z;
    positions[3] = to.x;
    positions[4] = to.y;
    positions[5] = to.z;
    this.geometry.attributes.position.needsUpdate = true;
  }

  to(point: THREE.Vector3) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    positions[0] = point.x;
    positions[1] = point.y;
    positions[2] = point.z;
    this.geometry.attributes.position.needsUpdate = true;
  }

  from(point: THREE.Vector3) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    positions[3] = point.x;
    positions[4] = point.y;
    positions[5] = point.z;
    this.geometry.attributes.position.needsUpdate = true;
  }

  set active(val: boolean) {
    this._active = val;
    if (val) {
      this.visible = true;
    } else {
      this.visible = false;
    }
  }

  get active() {
    return this._active;
  }
}
