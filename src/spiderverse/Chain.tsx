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
    const linePoints = Array.from({ length }, () => new THREE.Vector3());
    this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePoints), new THREE.LineBasicMaterial({ color: 0xcccccc }));
    this.add(this.line);

    const testPoints = Array.from({ length:2 }, () => new THREE.Vector3());
    this.test = new THREE.Line(new THREE.BufferGeometry().setFromPoints(testPoints), new THREE.LineBasicMaterial({ color: 0xffcccc }));
    this.add(this.test);

    this.visible = false;
  }

  fromTo(fromPoint: THREE.Vector3, toPoint: THREE.Vector3) {
    this.visible = true;
    const d = this.links.length - 1;
    const positions = this.line.geometry.attributes.position.array as Float32Array;

    this.links.forEach((link, i) => {
      if (i <= d) {
        link.visible = true;
        link.position.lerpVectors(fromPoint, toPoint, i / d);
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
