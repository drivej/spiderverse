import { createInfiniteColorPlane, createSphere, KeyboardKeys, KeyController, MouseController, VRButton, XRRemote, XRRemoteEvent, XRRemoteEventType, XRWorld } from '@drivej/xrworld';
import gsap from 'gsap';
import * as THREE from 'three';
import { City } from './generateCity';
import { Moov } from './Moov';
import { Sunrise } from './Sunrise';
import { WebSpinner } from './WebSpinner';

function initSpiderverse() {
  const world = new XRWorld();
  world.camera.position.set(-63, 46, 37);

  world.initControllers();
  world.initOrbitControls();

  world.renderer.xr.addEventListener('sessionstart', () => {
    firstPerson = world.dolly;
  });

  world.renderer.shadowMap.enabled = true;

  const plane = createInfiniteColorPlane();
  // plane.receiveShadow = true;
  world.scene.add(plane);

  const sunrise = new Sunrise();
  sunrise.setElevation(0.04);
  world.scene.add(sunrise);
  sunrise.startSunrise();

  const city = new City({ rows: 10, columns: 10 });
  world.scene.add(city);

  const intersectables: THREE.Object3D[] = [plane, ...city.buildings];

  const gravity = -Math.pow(9.82, 2);
  const globalForces = new THREE.Vector3(0, gravity, 0);
  const globalFriction = 0.99999;

  const firstPersonObject = createSphere({ radius: 2, color: 0xff0000, position: [-80, 10, -10] });
  firstPersonObject.geometry.computeBoundingSphere();
  world.scene.add(firstPersonObject);

  const dummyRemoteLeft = createSphere({ radius: 1, color: 0x00ff00, position: [0, 0, 0] });
  firstPersonObject.add(dummyRemoteLeft);

  const dummyRemoteRight = createSphere({ radius: 1, color: 0xff0000, position: [0, 0, 0] });
  firstPersonObject.add(dummyRemoteRight);

  const cameraHit = createSphere({ radius: 5, color: 0x2266bb, position: [-80, 10, -10] });
  world.scene.add(cameraHit);

  const mouseHit = createSphere({ radius: 5, color: 0xff66bb, position: [-120, 10, -10] });
  mouseHit.visible = false;
  world.scene.add(mouseHit);

  const webSpinnerLeft = new WebSpinner();
  world.scene.add(webSpinnerLeft);

  const webSpinnerRight = new WebSpinner();
  world.scene.add(webSpinnerRight);

  let firstPerson: THREE.Object3D = firstPersonObject;
  const firstPersonVector = new THREE.Vector3();
  const tmpVector = new THREE.Vector3();
  const tmpMatrix = new THREE.Matrix4();
  const raycaster = new THREE.Raycaster();

  function getIntersections(object: THREE.Object3D, targets: THREE.Object3D<THREE.Event>[]) {
    tmpMatrix.identity().extractRotation(object.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(object.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tmpMatrix);
    return raycaster.intersectObjects(targets, true);
  }

  function getWebIntersection(controller: THREE.XRTargetRaySpace) {
    const intersections = getIntersections(controller, intersectables);
    if (intersections.length > 0) {
      return intersections[0];
    }
    return null;
  }

  // VR Controllers

  function onSelectStart(e: XRRemoteEvent) {
    const intersection = getWebIntersection(e.ref.controller);
    if (intersection) {
      const spinner = e.ref.userData.webSpinner as WebSpinner;
      spinner.attachTo(intersection);
      spinner.chain.visible = true;
      spinner.toObject.position.copy(intersection.point);
    }
  }

  function onSelectEnd(e: XRRemoteEvent) {
    (e.ref.userData.webSpinner as WebSpinner).detach();
    (e.ref.userData.webSpinner as WebSpinner).chain.visible = false;
  }

  function onMove(e: XRRemoteEvent) {
    if (!(e.ref.userData.webSpinner as WebSpinner).isActive) {
      const intersection = getWebIntersection(e.ref.controller);
      if (intersection) {
        (e.ref.userData.webSpinner as WebSpinner).toObject.position.copy(intersection.point);
      }
    }
  }

  function updateWebSpinnerFromPoint(remote: XRRemote) {
    const spinner = remote.userData.webSpinner as WebSpinner;
    if (world.VRSessionActive) {
      remote.grip.getWorldPosition(spinner.fromPoint);
      remote.grip.getWorldPosition(spinner.fromObject.position);
    } else {
      firstPerson.getWorldPosition(spinner.fromPoint);
      firstPerson.getWorldPosition(spinner.fromObject.position);
    }
  }

  world.rightController.userData.webSpinner = webSpinnerRight;
  world.rightController.on(XRRemoteEventType.SELECT_START, onSelectStart);
  world.rightController.on(XRRemoteEventType.MOVE, onMove);
  world.rightController.on(XRRemoteEventType.SELECT_END, onSelectEnd);

  world.leftController.userData.webSpinner = webSpinnerLeft;
  world.leftController.on(XRRemoteEventType.SELECT_START, onSelectStart);
  world.leftController.on(XRRemoteEventType.MOVE, onMove);
  world.leftController.on(XRRemoteEventType.SELECT_END, onSelectEnd);

  // mouse for browser testing

  let currentSpinner = webSpinnerRight;

  const mouse = new MouseController(world.renderer.domElement)
    .onClick((_e) => {
      // currentSpinner = currentSpinner === leftSpinner ? rightSpinner : leftSpinner;
      currentSpinner = currentSpinner === webSpinnerRight ? webSpinnerLeft : webSpinnerRight;
      raycaster.setFromCamera(mouse.relative, world.camera);
      const intersections = raycaster.intersectObjects(intersectables, false);
      if (intersections.length > 0) {
        const intersection = intersections[0];
        currentSpinner.toPoint.copy(intersection.point);
        currentSpinner.toObject.position.copy(intersection.point);
        // attachWeb(currentSpinner, intersection);
        currentSpinner.attachTo(intersection);
      }
    })
    .onMove((_e) => {
      raycaster.setFromCamera(mouse.relative, world.camera);
      const intersections = raycaster.intersectObjects(intersectables, true);
      if (intersections.length > 0) {
        const intersection = intersections[0];
        // currentSpinner.toObject.position.copy(intersection.point);
        mouseHit.position.copy(intersection.point);
      }
    });

  const keyboard = new KeyController();

  keyboard
    .onPress(' ', (_e) => {
      firstPersonVector.add(new THREE.Vector3(0, 20, 0));
    })
    .onPress(KeyboardKeys.ArrowUp, () => {
      firstPersonVector.add(new THREE.Vector3(0, 0, -20));
    })
    .onPress(KeyboardKeys.ArrowDown, () => {
      firstPersonVector.add(new THREE.Vector3(0, 0, 20));
    })
    .onPress(KeyboardKeys.ArrowLeft, () => {
      firstPersonVector.add(new THREE.Vector3(-20, 0, 0));
    })
    .onPress(KeyboardKeys.ArrowRight, () => {
      firstPersonVector.add(new THREE.Vector3(20, 0, 0));
    })
    .onPress('i', (_e) => {
      console.log('firstPersonVector', firstPersonVector.toArray());
      console.log('firstPerson.position', firstPerson.position.toArray());
    });

  // Hit Test on Buildings

  function willHitObstacle(position: THREE.Vector3, vector: THREE.Vector3, intersectables: THREE.Object3D<THREE.Event>[], hitBuffer = 0) {
    raycaster.set(position, vector.clone().normalize()); // this normalize is extremely important
    const intersections = raycaster.intersectObjects(intersectables, false);
    if (intersections.length > 0) {
      const intersection = intersections[0];
      const len = vector.length();
      if (intersection.distance < len + hitBuffer) {
        return { hit: true, intersection };
      }
    }
    return { hit: false };
  }

  function checkCamera() {
    world.dummyCam.getWorldPosition(raycaster.ray.origin);
    // raycaster.ray.origin.copy(world.dummyCam.getWorldPosition());
    world.dummyCam.getWorldDirection(raycaster.ray.direction);
    // raycaster.ray.direction.applyQuaternion(world.dummyCam.quaternion).add(world.dummyCam.position);
    const intersections = raycaster.intersectObjects(intersectables, false);
    if (intersections.length > 0) {
      // const intersection = intersections[0];
      cameraHit.material.color.set(0x00ff33);
      // cameraHit.position.copy(intersection.point);
    } else {
      cameraHit.material.color.set(0x003333);
    }
  }

  const vectorTick: THREE.Vector3 = new THREE.Vector3();
  const hitBuffer = 2;

  world.beforeRender = (delta) => {
    gsap.ticker.tick();
    checkCamera();
    // align web spinners with remote position
    updateWebSpinnerFromPoint(world.leftController);
    updateWebSpinnerFromPoint(world.rightController);

    if (!world.VRSessionActive) {
      dummyRemoteLeft.getWorldPosition(webSpinnerLeft.fromPoint);
      dummyRemoteLeft.getWorldPosition(webSpinnerLeft.fromObject.position);
      dummyRemoteRight.getWorldPosition(webSpinnerRight.fromPoint);
      dummyRemoteRight.getWorldPosition(webSpinnerRight.fromObject.position);
    }

    const leftSpinnerVectorTick = webSpinnerLeft.getVector().multiplyScalar(delta);
    const rightSpinnerVectorTick = webSpinnerRight.getVector().multiplyScalar(delta);
    const globalForcesTick = globalForces.clone().multiplyScalar(delta);
    const globalFrictionTick = 1 - globalFriction * delta;

    firstPersonVector.add(leftSpinnerVectorTick);
    firstPersonVector.add(rightSpinnerVectorTick);
    firstPersonVector.add(globalForcesTick);
    firstPersonVector.multiplyScalar(globalFrictionTick);

    vectorTick.copy(firstPersonVector).multiplyScalar(delta);

    // const hitTest = willHitObstacle(vectorTick);
    const hitTest = willHitObstacle(firstPerson.position, vectorTick, intersectables, hitBuffer);

    if (hitTest && hitTest.hit === true) {
      const method = 0;
      // method 1
      if (method < 1) {
        vectorTick.reflect(hitTest.intersection!.face!.normal).multiplyScalar(0.5);
        firstPersonVector.reflect(hitTest.intersection!.face!.normal).multiplyScalar(0.5);
      } else if (method > 1) {
        // place at hit position
        // TODO: advance the position along the reflected ray
        // const d = hitTest.intersection.distance - vectorTick.length();
        const b = hitBuffer - hitTest.intersection!.distance;
        const a = vectorTick.length() - b;
        vectorTick.normalize().multiplyScalar(a);
        // const a = firstPerson.position.clone().add(firstPerson.position.clone().normalize().multiplyScalar(x));
        // firstPerson.position.copy(a);
        // const a = (vectorTick.length() + hitTest.intersection.distance) - hitBuffer;
        // const b = hitBuffer - hitTest.intersection.distance;
        // vectorTick.normalize();
        // firstPersonHit.position.copy(hitTest.intersection.point);
        vectorTick.reflect(hitTest.intersection!.face!.normal); //.multiplyScalar(0.5);
        firstPersonVector.reflect(hitTest.intersection!.face!.normal); //.multiplyScalar(0.5);
        // firstPerson.position.copy(a);
        // vectorTick.normalize().multiplyScalar(b);
        firstPersonVector.multiplyScalar(0.01);
      }

      // console.log(d);
      // firstPersonVector.normalize().multiplyScalar(vectorTick.length() - hitTest.intersection.distance);
      // firstPerson.position.copy(hitTest.intersection.point);
      // bounce off surface
    }

    // set tmpVector to future position
    // tmpVector.copy(firstPerson.position).add(vectorTick); // next position

    // detect ground hit
    // if (tmpVector.y < 2) {
    //   firstPersonVector.multiply(new THREE.Vector3(1, -0.5, 1));
    // }

    firstPerson.position.add(vectorTick);

    if (!world.VRSessionActive) {
      // face dummy avatar in direction of movement - fail
      tmpVector.lerpVectors(webSpinnerLeft.toPoint, webSpinnerRight.toPoint, 0.5);
      firstPerson.lookAt(tmpVector);
    }

    if (firstPerson.position.y < 2) {
      firstPerson.position.y = 2;
    }
    updateWebSpinnerFromPoint(world.leftController);
    updateWebSpinnerFromPoint(world.rightController);

    webSpinnerLeft.update();
    webSpinnerRight.update();

    Moov.update(delta);
  };

  world.vrButton = VRButton.createButton(world.renderer);

  return world;
}

export { initSpiderverse };
