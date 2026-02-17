import { clamp, createInfiniteColorPlane, createSphere, KeyboardControllerPayload, KeyboardKeys, KeyController, MouseController, VRButton, XRHand, XRRemote, XRRemoteEvent, XRRemoteEventType, XRWorld } from '@drivej/xrworld';
import gsap from 'gsap';
import * as THREE from 'three';
import { City } from './generateCity';
import { Moov } from './Moov';
import { Sunrise } from './Sunrise';
import { VRTextSprite } from './VRTextSprite';
import { WebSpinner } from './WebSpinner';

function initSpiderverse() {
  const world = new XRWorld();
  world.camera.position.set(-63, 46, 37);

  world.initControllers();
  world.initOrbitControls();

  world.renderer.xr.addEventListener('sessionstart', () => {
    killMouse();
    firstPerson = world.dolly;
  });

  const log = new VRTextSprite();
  log.position.set(0, 0, -1);
  world.camera.add(log);

  world.renderer.shadowMap.enabled = true;

  const plane = createInfiniteColorPlane({ color: 0xbbbbbb });
  plane.name = 'plane';
  // plane.receiveShadow = true;
  world.scene.add(plane);

  const sunrise = new Sunrise();
  sunrise.setElevation(0.04);
  world.scene.add(sunrise);
  sunrise.startSunrise();

  const city = new City({ rows: 10, columns: 10 });
  world.scene.add(city);

  const intersectables: THREE.Object3D[] = [plane, ...city.buildings, ...city.streets];

  const gravity = -Math.pow(9.82, 2);
  const globalForces = new THREE.Vector3(0, gravity, 0);
  const globalFriction = 0.99999;

  const firstPersonObject = createSphere({ radius: 2, color: 0x0000ff, position: [-80, 10, -10] });
  firstPersonObject.geometry.computeBoundingSphere();
  world.scene.add(firstPersonObject);

  const dummyRemoteLeft = createSphere({ radius: 1, color: 0x00ff00, position: [0, 0, 0] });
  firstPersonObject.add(dummyRemoteLeft);

  const dummyRemoteRight = createSphere({ radius: 1, color: 0xff0000, position: [0, 0, 0] });
  firstPersonObject.add(dummyRemoteRight);

  const cameraHit = createSphere({ radius: 5, color: 0xcccccc, position: [-80, 10, -10] });
  world.scene.add(cameraHit);

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
      // spinner.chain.visible = true;
      spinner.toObject.position.copy(intersection.point);
    }
  }

  function onSelectEnd(e: XRRemoteEvent) {
    (e.ref.userData.webSpinner as WebSpinner).detach();
    // (e.ref.userData.webSpinner as WebSpinner).chain.visible = false;
  }

  function onMove(e: XRRemoteEvent) {
    updatePullForces();
    const spinner = e.ref.userData.webSpinner as WebSpinner;
    if (!spinner.isActive) {
      const intersection = getWebIntersection(e.ref.controller);
      if (intersection) {
        spinner.toObject.position.copy(intersection.point);
        spinner.intersection = intersection;
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
  //
  // START: browser testing
  //
  let currentSpinner = webSpinnerRight;
  let mouseHit: THREE.Mesh;

  function onMouseClick(e: { mouse: MouseController }) {
    currentSpinner = currentSpinner === webSpinnerRight ? webSpinnerLeft : webSpinnerRight;
    raycaster.setFromCamera(e.mouse.relative, world.camera);
    const intersections = raycaster.intersectObjects(intersectables, false);
    if (intersections.length > 0) {
      const intersection = intersections[0];
      currentSpinner.toPoint.copy(intersection.point);
      currentSpinner.toObject.position.copy(intersection.point);
      currentSpinner.attachTo(intersection);
    }
  }

  function onMouseMove(e: { mouse: MouseController }) {
    raycaster.setFromCamera(e.mouse.relative, world.camera);
    const intersections = raycaster.intersectObjects(intersectables, false);
    if (intersections.length > 0) {
      const intersection = intersections[0];
      mouseHit.position.copy(intersection.point);
    }
  }

  function handleKeyPress(e: KeyboardControllerPayload) {
    switch (e.key) {
      case ' ':
        firstPersonVector.add(new THREE.Vector3(0, 20, 0));
        break;

      case KeyboardKeys.ArrowUp:
        firstPersonVector.add(new THREE.Vector3(0, 0, -20));
        break;
      case KeyboardKeys.ArrowDown:
        firstPersonVector.add(new THREE.Vector3(0, 0, 20));
        break;
      case KeyboardKeys.ArrowLeft:
        firstPersonVector.add(new THREE.Vector3(-20, 0, 0));
        break;
      case KeyboardKeys.ArrowRight:
        firstPersonVector.add(new THREE.Vector3(20, 0, 0));
        break;
      case 'i':
        console.log('firstPersonVector', firstPersonVector.toArray());
        console.log('firstPerson.position', firstPerson.position.toArray());
    }
  }

  function dummyMouseEvent() {}

  function initNonVR() {
    mouseHit = createSphere({ radius: 1, color: 0xff6600, position: [-120, 10, -10] });
    world.scene.add(mouseHit);

    const mouse = new MouseController(world.renderer.domElement).onClick(onMouseClick).onDown(dummyMouseEvent).onUp(dummyMouseEvent).onMove(onMouseMove);
    const keyboard = new KeyController().on('down', handleKeyPress);
    const kill = () => {
      keyboard.off('down');
      mouse.off('down');
      mouse.off('up');
      mouse.off('move');
      world.scene.remove(mouseHit);
    };

    return kill;
  }

  const killMouse = initNonVR();
  //
  // END: browser testing
  //

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

  // function checkCamera() {
  // world.dummyCam.getWorldPosition(raycaster.ray.origin);
  // // raycaster.ray.origin.copy(world.dummyCam.getWorldPosition());
  // world.dummyCam.getWorldDirection(raycaster.ray.direction);
  // // raycaster.ray.direction.applyQuaternion(world.dummyCam.quaternion).add(world.dummyCam.position);
  // const intersections = raycaster.intersectObjects(intersectables, false);
  // if (intersections.length > 0) {
  //   // const intersection = intersections[0];
  //   cameraHit.material.color.set(0x00ff33);
  //   // cameraHit.position.copy(intersection.point);
  // } else {
  //   cameraHit.material.color.set(0x003333);
  // }
  // }

  const minDistance = 0.25;
  const maxDistance = 0.65;
  const rangeDistance = maxDistance - minDistance;
  const minElasticity = 0.0001;
  const maxElasticity = 1;
  const rangeElasticity = maxElasticity - minElasticity;

  function updateSpinnerForces(spinner: WebSpinner, target: THREE.Vector3) {
    const d = spinner.fromPoint.distanceTo(target);
    const p = clamp((d - minDistance) / rangeDistance, 0, 1);
    spinner.elasticity = minElasticity + rangeElasticity * p;
  }

  function updatePullForces() {
    if (webSpinnerLeft.isAttached || webSpinnerRight.isAttached) {
      const target = new THREE.Vector3();
      target.setFromMatrixPosition(world.camera.matrixWorld);

      if (webSpinnerLeft.isAttached) {
        updateSpinnerForces(webSpinnerLeft, target);
      }

      if (webSpinnerRight.isAttached) {
        updateSpinnerForces(webSpinnerRight, target);
      }
    }
  }

  const lastCameraPosition = new THREE.Vector3();
  const cameraVelocity = new THREE.Vector3();
  // const XheadQuat = new THREE.Quaternion();
  // const XinvHeadQuat = new THREE.Quaternion();
  // const velocityHead = new THREE.Vector3();

  function XupdateCameraVelocity() {
    cameraVelocity.subVectors(world.camera.position, lastCameraPosition);
    lastCameraPosition.copy(world.camera.position);
    // get XR camera (actual headset pose)
    const xrCam = world.renderer.xr.getCamera();
    // headset rotation
    xrCam.getWorldQuaternion(headQuat);
    // inverse rotation
    invHeadQuat.copy(headQuat).invert();
    // velocityHead.copy(controllerVelocity).applyQuaternion(invHeadQuat);
  }

  const lastHeadPos = new THREE.Vector3();
  const headPos = new THREE.Vector3();
  const headVelWorld = new THREE.Vector3();

  const headQuat = new THREE.Quaternion();
  const invHeadQuat = new THREE.Quaternion();

  function updateCameraVelocity(delta: number) {
    // XR camera is the actual headset pose during VR
    const xrCam = world.renderer.xr.getCamera();

    xrCam.getWorldPosition(headPos);
    headVelWorld.subVectors(headPos, lastHeadPos).divideScalar(delta);
    lastHeadPos.copy(headPos);

    xrCam.getWorldQuaternion(headQuat);
    invHeadQuat.copy(headQuat).invert();
  }

  function updateHandVelocity(remote: XRRemote, hand: XRHand, delta: number) {
    // remote.grip.getWorldPosition(tmpVector);
    // tmpVector.copy(remote.grip.position);
    tmpVector.subVectors(remote.grip.position, world.camera.position);
    hand.moveVector.subVectors(tmpVector, hand.lastPosition).divideScalar(delta);
    hand.lastPosition.copy(tmpVector);
  }

  const vectorTick: THREE.Vector3 = new THREE.Vector3();
  const hitBuffer = 2;
  // const speeds: number[] = [];
  let runSpeed = 0;
  const runScale = 1;
  const runDecay = 0.95;

  function test() {
    const leftVelRel = new THREE.Vector3();
    const rightVelRel = new THREE.Vector3();
    leftVelRel.copy(world.leftHand.moveVector).sub(headVelWorld).applyQuaternion(invHeadQuat);
    rightVelRel.copy(world.rightHand.moveVector).sub(headVelWorld).applyQuaternion(invHeadQuat);

    // const leftSpeed = leftVelRel.length();
    // const rightSpeed = rightVelRel.length();
    const leftSpeed = world.leftHand.moveVector.length();
    const rightSpeed = world.rightHand.moveVector.length();

    log.setText(`q ${leftSpeed.toFixed(3)}:${rightSpeed.toFixed(3)}`);
    log.setText(`q ${leftSpeed.toFixed(3)}:${rightSpeed.toFixed(3)}`);
  }

  world.beforeRender = (delta) => {
    gsap.ticker.tick();
    // checkCamera();
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

    const hitTest = willHitObstacle(firstPerson.position, vectorTick, intersectables, hitBuffer);

    const objLeft = webSpinnerLeft.intersection?.object;
    const objRight = webSpinnerRight.intersection?.object;
    const isSameObj = objLeft && objRight && objLeft === objRight;
    const hitLeftRun = isSameObj && objLeft?.userData.runnable;
    const hitRightRun = isSameObj && objRight?.userData.runnable;
    const isNear = webSpinnerLeft.intersection?.distance ?? (10 < 6 && webSpinnerRight.intersection?.distance) ?? 10 < 6;
    const hitStreet = isSameObj && isNear && hitLeftRun && hitRightRun;

    const fwd = new THREE.Vector3();
    const velHead = new THREE.Vector3();

    const leftVelRel = new THREE.Vector3();
    const rightVelRel = new THREE.Vector3();

    // test();

    if (world.VRSessionActive && hitStreet) {
      updateCameraVelocity(delta);
      updateHandVelocity(world.leftController, world.leftHand, delta);
      updateHandVelocity(world.rightController, world.rightHand, delta);

      // find relative movement
      // const leftSpeed = velocityHead.copy(world.leftController.moveVector).applyQuaternion(invHeadQuat).length() * 10;
      // const rightSpeed = velocityHead.copy(world.rightController.moveVector).applyQuaternion(invHeadQuat).length() * 10;

      leftVelRel.copy(world.leftHand.moveVector).sub(headVelWorld).applyQuaternion(invHeadQuat);
      rightVelRel.copy(world.rightHand.moveVector).sub(headVelWorld).applyQuaternion(invHeadQuat);

      // const leftSpeed = leftVelRel.length();
      // const rightSpeed = rightVelRel.length();

      // incorrect using world movement of controllers
      const leftSpeed = world.leftHand.moveVector.length();
      const rightSpeed = world.rightHand.moveVector.length();

      runSpeed += (leftSpeed + rightSpeed) / 2;

      log.setText(`${leftSpeed.toFixed(1)}:${rightSpeed.toFixed(1)}`);

      // if (leftSpeed > 0.5 && rightSpeed > 0.5) {
      //   const totalSpeed = leftSpeed + rightSpeed;

      //   speeds.push(totalSpeed);
      //   if (speeds.length > 100) speeds.shift();

      //   const avgSpeed = speeds.reduce((s, n) => s + n, 0) / speeds.length;
      // log.setText(`${leftSpeed.toFixed(1)}:${rightSpeed.toFixed(1)}:${avgSpeed.toFixed(1)}`);

      // ✅ Get the HMD-facing direction, not dolly's direction
      // const xrCam = world.renderer.xr.getCamera(); //orld.camera);
      // xrCam.getWorldDirection(fwd);

      // // Flatten to XZ plane
      // fwd.y = 0;
      // if (fwd.lengthSq() > 1e-8 && avgSpeed > 0.01) {
      //   fwd.normalize();

      //   // ✅ velocity (m/s) * delta (s) = meters per frame
      //    // tweak
      //   world.dolly.position.addScaledVector(fwd, avgSpeed * delta * runScale);
      // }
      // }
      if (runSpeed > 0.1) {
        const xrCam = world.renderer.xr.getCamera(); //orld.camera);
        xrCam.getWorldDirection(fwd);
        fwd.y = 0; // Flatten to XZ plane
        fwd.normalize();
        world.dolly.position.addScaledVector(fwd, runSpeed * delta * runScale);
      }
    }

    runSpeed *= runDecay;
    // if (world.VRSessionActive) {
    //   if (hitStreet) {
    //     // Make first person move along ground in direction of VR headset
    //     updateHandVelocity(world.leftController, world.leftHand, delta);
    //     updateHandVelocity(world.rightController, world.rightHand, delta);

    //     const leftSpeed = world.leftHand.moveVector.length();
    //     const rightSpeed = world.rightHand.moveVector.length();
    //     const totalSpeed = leftSpeed + rightSpeed;
    //     speeds.push(totalSpeed);
    //     if (speeds.length > 20) speeds.shift();
    //     const avgSpeed = speeds.reduce((s, n) => s + n, 0) / speeds.length;

    //     // Get the direction the VR headset is facing
    //     world.dolly.getWorldDirection(tmpVector);
    //     tmpVector.y = 0; // Keep movement on horizontal plane only

    //     if (tmpVector.lengthSq() > 0 && avgSpeed > 0.01) {
    //       tmpVector.normalize(); // Get unit direction vector
    //       world.dolly.position.addScaledVector(tmpVector, avgSpeed); // Move in headset direction
    //     }

    //     log.setText(`L: ${leftSpeed.toFixed(2)} R: ${rightSpeed.toFixed(2)} avg: ${avgSpeed.toFixed(2)}`);
    //   }
    // }

    vectorTick.copy(firstPersonVector).multiplyScalar(delta);

    if (hitTest && hitTest.hit === true) {
      // const method = 0;
      // method 1
      // if (method < 1) {
      // if (!hitStreet) {
      vectorTick.reflect(hitTest.intersection!.face!.normal).multiplyScalar(0.5);
      firstPersonVector.reflect(hitTest.intersection!.face!.normal).multiplyScalar(0.5);
      // }
      // } else if (method > 1) {
      //   // place at hit position
      //   // TODO: advance the position along the reflected ray
      //   // const d = hitTest.intersection.distance - vectorTick.length();
      //   const b = hitBuffer - hitTest.intersection!.distance;
      //   const a = vectorTick.length() - b;
      //   vectorTick.normalize().multiplyScalar(a);
      //   // const a = firstPerson.position.clone().add(firstPerson.position.clone().normalize().multiplyScalar(x));
      //   // firstPerson.position.copy(a);
      //   // const a = (vectorTick.length() + hitTest.intersection.distance) - hitBuffer;
      //   // const b = hitBuffer - hitTest.intersection.distance;
      //   // vectorTick.normalize();
      //   // firstPersonHit.position.copy(hitTest.intersection.point);
      //   vectorTick.reflect(hitTest.intersection!.face!.normal); //.multiplyScalar(0.5);
      //   firstPersonVector.reflect(hitTest.intersection!.face!.normal); //.multiplyScalar(0.5);
      //   // firstPerson.position.copy(a);
      //   // vectorTick.normalize().multiplyScalar(b);
      //   if (hitStreet) {
      //     // firstPersonVector.multiplyScalar(0.5);
      //   } else {
      //     firstPersonVector.multiplyScalar(0.01);
      //   }
      // }

      // const v1 = world.leftController.moveVector;
      // console.log(h.constructor.name, h instanceof XRHand, h.getLinearVelocity)
      // let v1 = { length: () => -1 };

      // const current = new THREE.Vector3(); //.copy(world.leftHand.controller.position);
      // world.leftHand.controller.position;
      // const remote = world.leftController;
      // remote.grip.getWorldPosition(current);

      // console.log(d);
      // firstPersonVector.normalize().multiplyScalar(vectorTick.length() - hitTest.intersection.distance);
      // firstPerson.position.copy(hitTest.intersection.point);
      // bounce off surface
    }

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

  //
  //
  //
  // test

  // webSpinnerLeft.position.set(10, 10, -20);
  // webSpinnerRight.position.set(10, 10, 0);
  // webSpinnerRight.toObject.material.color.set(0x0066ff);

  // const chain = new Chain(11);
  // // world.scene.add(chain);

  // world.camera.position.z = -150;
  // world.camera.position.x = -150;
  // world.camera.lookAt(city.buildings[0].position);
  // city.buildings[0].setOpacity(0.5);

  // const center = { x: firstPersonObject.position.x, z: firstPersonObject.position.z };
  // let jiggleIndex = 0;

  // // const length = 2;
  // // const linePoints = Array.from({ length }, () => new THREE.Vector3());

  // // const positions = [
  // //   0, 0, 0,
  // //   5, 5, 0,
  // //   10, 0, 0
  // // ];

  // // const geometry = new LineGeometry().setPositions(positions);
  // // geometry.setPositions(positions);

  // // const material = new LineMaterial({color: 0xcccccc, linewidth: 5});

  // // material.resolution.set(window.innerWidth, window.innerHeight);

  // const thickLine = new Line2(new LineGeometry().setPositions([0,0,0,0,0,0]), new LineMaterial({color: 0xcccccc, linewidth: 5}));
  // thickLine.material.resolution.set(window.innerWidth, window.innerHeight);
  // world.scene.add(thickLine);

  // // const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePoints), new THREE.LineBasicMaterial({ color: 0xff6600 }));
  // // world.scene.add(line);

  // setInterval(() => {
  //   jiggleIndex += 0.1;
  //   firstPersonObject.position.x = center.x + Math.sin(jiggleIndex) * 3;
  //   firstPersonObject.position.z = center.z + Math.cos(jiggleIndex) * 3;
  //   firstPersonObject.lookAt(city.buildings[0].position);

  //   const fromPoint = firstPersonObject.position;
  //   const toPoint = city.buildings[0].position;
  //   const direction = new THREE.Vector3().subVectors(toPoint, fromPoint).normalize();
  //   const raycaster = new THREE.Raycaster(fromPoint, direction);
  //   const hits = raycaster.intersectObjects(intersectables, false);

  //   // START: find position on surface of building where intersection occurs between firstPersonObject and city.buildings[0]
  //   const inters = hits; //getIntersections(firstPersonObject, [city.buildings[0]]);
  //   if (inters.length) {
  //     chain.fromTo(firstPersonObject.position, inters[0].point);
  //     thickLine.geometry.setFromPoints([firstPersonObject.position, inters[0].point]);

  //   } else {
  //     chain.fromTo(firstPersonObject.position, city.buildings[0].position);
  //   }
  // }, 50);
  //
  // lift city.buildings[0] off the ground a little.
  // why does this not affect the position of the buildings? Write a comment explaining why this next line has no affect.
  // city.buildings[0].position.y += 2;
  // const intersections = getIntersections(dummyRemoteLeft, [city.buildings[0]]);
  // webSpinnerLeft.attachTo(intersections[0]);
  // webSpinnerLeft.position.x = 0;
  // webSpinnerLeft.position.y = 20;
  // webSpinnerLeft.position.z = 0;
  //
  //
  //

  return world;
}

export { initSpiderverse };
