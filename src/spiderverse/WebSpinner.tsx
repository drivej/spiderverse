import { createSphere } from '@drivej/xrworld';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Moov, Moover } from './Moov';

export class WebSpinner extends THREE.Group {
  line: Line2;
  fromPoint = new THREE.Vector3();
  toPoint = new THREE.Vector3();
  currentPoint = new THREE.Vector3();
  vector = new THREE.Vector3();
  speed = 1600; // meters/second
  lerpValue = 0;
  attachDistance = 0;
  staticLength = 0;
  maxDistance = 1000;
  elasticity = 0.05; // lower is higher rebound
  isActive = false;
  isAttached = false;
  fromObject: THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial>;
  toObject: THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial>;
  tween!: Moover;
  forceFactor = 1.3;
  activeColor = 0x00ff00;
  inactiveColor = 0x42f54b;

  constructor() {
    super();
    this.line = new Line2(new LineGeometry().setPositions([0, 0, 0, 0, 0, 0]), new LineMaterial({ color: 0xcccccc, linewidth: 5 }));
    this.line.material.resolution.set(window.innerWidth, window.innerHeight);
    this.fromObject = createSphere({ radius: 0.08, color: 0xcccccc, opacity: 0.5, position: [-50, 10, 30] });
    this.toObject = createSphere({ radius: 0.5, color: 0xff6600, position: [-50, 9, 30] });
    this.add(this.toObject);
    this.add(this.line);
  }

  attachTo(intersection: THREE.Intersection<THREE.Object3D<THREE.Event>>) {
    const distance = this.fromPoint.distanceTo(intersection.point);
    if (distance > 500) {
      return;
    }
    this.toPoint = intersection.point;
    this.currentPoint.copy(this.fromPoint);
    this.attachDistance = intersection.distance;
    this.staticLength = this.attachDistance * this.elasticity;
    this.isAttached = false;
    this.isActive = true;
    this.line.visible = true;
    this.toObject.material.color.set(0xf542f2);

    this.lerpValue = 0;
    const duration = this.attachDistance / this.speed;
    this.line.geometry.setFromPoints([this.fromPoint, this.fromPoint]);

    this.tween = Moov.go({
      ease: Moov.ease.inExpo,
      duration,
      onUpdate: (val) => {
        this.currentPoint.lerpVectors(this.fromPoint, this.toPoint, val);
        this.toObject.material.color.set(this.activeColor);
      },
      onComplete: () => {
        this.isAttached = true;
      }
    });
  }

  detach() {
    this.tween.stop();
    this.isAttached = false;
    this.isActive = false;
    this.line.visible = false;
    this.toObject.material.color.set(this.inactiveColor);
  }

  distance() {
    return this.fromPoint.distanceTo(this.toPoint);
  }

  update() {
    if (this.isActive) {
      this.line.geometry.setFromPoints([this.fromPoint, this.currentPoint]);
    }
  }

  getVector() {
    if (this.isAttached) {
      this.vector.subVectors(this.toPoint, this.fromPoint);
      const e = this.vector.length() - this.staticLength;
      this.vector.normalize().multiplyScalar(e * this.forceFactor);
    }
    return this.vector;
  }
}
