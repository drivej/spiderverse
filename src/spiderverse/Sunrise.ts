import gsap from 'gsap';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky';

export class Sunrise extends Sky {
  effectController = {
    turbidity: 1,
    rayleigh: 1,
    mieCoefficient: 0,
    mieDirectionalG: 0,
    elevation: -5,
    azimuth: 0,
    exposure: 1
  };
  sun: THREE.Vector3;

  constructor() {
    super();
    this.sun = new THREE.Vector3();
    this.scale.setScalar(450000);
    const uniforms = this.material.uniforms;
    uniforms['turbidity'].value = this.effectController.turbidity;
    uniforms['rayleigh'].value = this.effectController.rayleigh;
    uniforms['mieCoefficient'].value = this.effectController.mieCoefficient;
    uniforms['mieDirectionalG'].value = this.effectController.mieDirectionalG;
    this.updateSun();
  }

  updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - this.effectController.elevation);
    const theta = THREE.MathUtils.degToRad(this.effectController.azimuth);
    this.sun.setFromSphericalCoords(1, phi, theta);
    this.material.uniforms['sunPosition'].value.copy(this.sun);
  }

  setElevation(val:number){
    this.effectController.elevation = val;
    this.updateSun();
  }

  startSunrise() {
    gsap.to(this.effectController, {
      elevation: 4,
      duration: 200,
      onUpdate: () => {
        this.updateSun();
      }
    });
  }
}
