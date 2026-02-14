import { createSphere, rand } from '@drivej/xrworld';
import * as THREE from 'three';

export class Chain extends THREE.Group {
  links: THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial>[] = [];
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  test: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;

  constructor(length = 20) {
    super();
    let i = length;
    while (i--) {
      const link = createSphere({ radius: 0.035, color: 0xcccccc, position: [rand(-50, 50), rand(3, 30), rand(-50, 50)] });
      this.links.push(link);
      this.add(link);
    }
    this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new Array(length).fill(new THREE.Vector3())), new THREE.LineBasicMaterial({ color: 0xcccccc }));
    this.add(this.line);

    this.test = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new Array(2).fill(new THREE.Vector3())), new THREE.LineBasicMaterial({ color: 0xffcccc }));
    this.add(this.test);

    this.visible = false;
  }

  fromTo(fromPoint: THREE.Vector3, toPoint: THREE.Vector3) {
    this.visible = true;
    const d = this.links.length;
    const positions = this.line.geometry.attributes.position.array as Float32Array;

    this.links.forEach((link, i) => {
      if (i < d) {
        link.visible = true;
        link.position.lerpVectors(fromPoint, toPoint, (i + 1) / d);
        positions[i * 3] = link.position.x;
        positions[i * 3 + 1] = link.position.y;
        positions[i * 3 + 2] = link.position.z;
      } else {
        link.visible = false;
      }
    });
    this.line.geometry.attributes.position.needsUpdate = true;
  }
}
