import { createSphere } from '@drivej/xrworld';
import * as THREE from 'three';
import { Chain } from './Chain';
import { Moov, Moover } from './Moov';

export class WebSpinner extends THREE.Group {
  line: THREE.Line;
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
  chain: Chain;
  forceFactor = 1.3;

  constructor() {
    super();
    this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffcccc }));
    this.fromObject = createSphere({ radius: 0.08, color: 0xcccccc, opacity: 0.5 });
    this.toObject = createSphere({ radius: 0.5, color: 0x42f54b, position: [-50, 10, 30] });
    this.chain = new Chain(200);
    this.add(this.fromObject);
    this.add(this.toObject);
    this.add(this.chain);
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

    this.tween = Moov.go({
      ease: Moov.ease.inExpo,
      duration,
      onUpdate: (val) => {
        this.currentPoint.lerpVectors(this.fromPoint, this.toPoint, val);
        this.toObject.material.color.set(0xffffff * Math.random());
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
    this.toObject.material.color.set(0x42f54b);
  }

  distance() {
    return this.fromPoint.distanceTo(this.toPoint);
  }

  update() {
    if (this.isActive) {
      this.chain.fromTo(this.fromPoint, this.currentPoint);
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
