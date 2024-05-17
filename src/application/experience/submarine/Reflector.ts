import { Application } from "../../Application";
import { resources } from "../../resources/Resources";
import {
  Group,
  Vector3,
  SpotLight,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  MeshLambertMaterial,
  BoxGeometry,
  CylinderGeometry,
} from "three";

export class Reflector {
  instance: Group = new Group();
  private lampInstance: Group = new Group();
  private direction: Vector3 = new Vector3(0, -1, 0);
  private lampWorldDirection: Vector3 = new Vector3(0, -1, 0);
  private lampWorldPosition: Vector3 = new Vector3(0, 0, 0);
  private lightedObjectPosition: Vector3 = new Vector3(0, 0, 0);
  private colors = { spotlightColor: 0xa8efff };
  private spotLight!: SpotLight;
  private cone!: Mesh;
  private coneMaterial!: MeshBasicMaterial;
  private coneMaterial2!: MeshBasicMaterial;
  private lightPower: number = 1;
  private readonly lightMaxIntensity: number = 250;

  private lastTargetLightBeamRotation = 0;

  constructor(
    private application: Application,
    private offsetY: number = 0,
  ) {
    this.createReflector();
    this.setDebug();
  }

  createReflector() {
    const lampGeometry = new SphereGeometry(
      0.15,
      8,
      8,
      Math.PI,
      Math.PI * 2,
      0,
      Math.PI * 0.5,
    );
    const lampMaterial = new MeshLambertMaterial({
      color: "black",
    });
    const lampMesh = new Mesh(lampGeometry, lampMaterial);

    const handle = new Group();
    const handlerGeometry = new BoxGeometry(0.1, 0.3, 0.1);
    const handlerGeometry2 = new BoxGeometry(0.3, 0.07, 0.07);
    const handleMesh = new Mesh(handlerGeometry, lampMaterial);
    const handleMesh2 = new Mesh(handlerGeometry2, lampMaterial);
    handleMesh.position.y = 0.11;
    handleMesh.position.x = -0.4;
    handleMesh.rotation.z = Math.PI / 4;

    handleMesh2.position.x = -0.17;
    handle.add(handleMesh);
    handle.add(handleMesh2);

    const coneHeight = 15;
    const angle = Math.PI / 4;
    const coneGeometry = new CylinderGeometry(
      0.1,
      coneHeight * Math.tan(angle) * 0.55,
      coneHeight,
      64,
      1,
      true,
      Math.PI / 2,
      Math.PI,
    );

    const coneMaterial = new MeshBasicMaterial({
      color: this.colors.spotlightColor,
      transparent: true,
      opacity: 0.09,
      fog: true,
      map: resources.getTexture("lightRay"),
      alphaMap: resources.getTexture("lightRay"),
    });

    const coneGeometry2 = new CylinderGeometry(
      0.1,
      coneHeight * Math.tan(angle) * 0.85,
      coneHeight,
      64,
      1,
      true,
      Math.PI / 2,
      Math.PI,
    );

    const coneMaterial2 = new MeshBasicMaterial({
      color: this.colors.spotlightColor,
      transparent: true,
      opacity: 0.03,
      fog: true,
      map: resources.getTexture("lightRay2"),
      alphaMap: resources.getTexture("lightRay2"),
    });

    const cone = new Mesh(coneGeometry, coneMaterial);
    cone.position.y = (-1 * coneHeight) / 2;
    cone.rotation.y = Math.PI;

    const cone2 = new Mesh(coneGeometry2, coneMaterial2);

    cone.add(cone2);
    this.coneMaterial = coneMaterial;
    this.coneMaterial2 = coneMaterial2;

    const spotLight = new SpotLight(this.colors.spotlightColor, this.lightMaxIntensity, 30); //0x7eeefc
    spotLight.penumbra = 1;

    spotLight.position.y = 0;
    spotLight.position.z = 0;
    spotLight.position.x = 0;

    spotLight.target.position.y = -2;
    spotLight.target.position.z = 0;
    spotLight.target.position.x = 0;

    spotLight.angle = angle;
    spotLight.map = resources.getTexture("flashlightLight");

    this.spotLight = spotLight;

    this.lampInstance.add(spotLight);
    this.lampInstance.add(spotLight.target);
    this.lampInstance.add(cone);
    this.lampInstance.add(lampMesh);

    this.instance.add(handle);
    this.instance.add(this.lampInstance);
    this.instance.position.y = this.offsetY;

    this.cone = cone;
  }

  private adjustLampDirection() {
    const bottomThreshold = -Math.PI / 3;
    const topThreshold = Math.PI / 5;

    const directionAngle = Math.atan2(
      this.direction.y,
      Math.abs(this.direction.x),
    );

    if (directionAngle > bottomThreshold && directionAngle < topThreshold) {
      this.lampWorldDirection.x = Math.cos(directionAngle);
      this.lampWorldDirection.y = Math.sin(directionAngle);
    }
    if (this.direction.x <= 0 && this.lampWorldDirection.x > 0) {
      this.lampWorldDirection.x *= -1;
    } else if (this.direction.x > 0 && this.lampWorldDirection.x < 0) {
      this.lampWorldDirection.x *= -1;
    }

    this.lampWorldDirection.normalize();
  }

  private setDebug() {
    if (this.application.debug) {
      const folder = this.application.debug.addFolder("Reflector");

      folder.open();

      folder.add(this.spotLight, "intensity", 0, 20000).name("light intensity");

      folder
        .addColor(this.colors, "spotlightColor")
        .name("light color")
        .onChange(() => {
          this.spotLight.color.set(this.colors.spotlightColor);
          this.coneMaterial.color.set(this.colors.spotlightColor);
        });
    }
  }

  setDirection(direction: THREE.Vector3) {
    this.direction.copy(direction);
  }

  getRangeFactor(
    objectPosition: THREE.Object3D,
    dataObject: { range: number; distance: number },
  ) {
    const lampWorldPosition = this.instance.getWorldPosition(
      this.lampWorldPosition,
    );
    const lampToObject = objectPosition
      .getWorldPosition(this.lightedObjectPosition)
      .sub(lampWorldPosition);

    const distance = lampToObject.length();
    lampToObject.normalize();

    dataObject.distance = distance;
    dataObject.range = lampToObject.dot(this.lampWorldDirection);
    return dataObject;
  }

  private adjustLampRotation() {
    const threshold = 0.001;
    const lampRadius = Math.abs(this.offsetY);

    this.lampInstance.rotation.z =
      Math.min(
        Math.max(
          -Math.PI / 3,
          Math.atan2(this.direction.y, Math.abs(this.direction.x)),
        ),
        Math.PI / 5,
      ) +
      Math.PI / 2;

    const targetY = this.direction.x > 0 ? 0 : Math.PI;
    const rotationYDifference = Math.abs(targetY - this.instance.rotation.y);
    if (rotationYDifference < threshold) {
      this.instance.rotation.y = targetY;
    } else {
      this.instance.rotation.y += (targetY - this.instance.rotation.y) * 0.08;
    }

    const angle = Math.atan2(this.direction.y, this.direction.x);
    const horizontalAngle = Math.abs(
      Math.atan2(this.direction.y, this.direction.x),
    );

    const lampOnTopSide = angle > 0;
    const lampOnRightSide = horizontalAngle < Math.PI / 2;

    const rightSideX = Math.sin(Math.PI * 0.25) * lampRadius;
    const leftSideX = Math.sin(Math.PI * 0.75) * -lampRadius;

    const targetX = lampOnRightSide ? rightSideX : leftSideX;
    this.instance.position.x += (targetX - this.instance.position.x) * 0.08;

    const difference = Math.abs(this.instance.position.x - targetX);
    const percentage = difference / (rightSideX - leftSideX);

    this.instance.position.z = Math.sin(Math.PI * percentage) * lampRadius * -1;

    const targetBeamRotation = lampOnRightSide
      ? Math.PI
      : lampOnTopSide
        ? Math.PI * 2
        : 0;
    const rotationDifference = Math.abs(
      targetBeamRotation - this.cone.rotation.y,
    );

    if (rotationDifference < 0.001) {
      this.cone.rotation.y = targetBeamRotation;
    } else {
      this.cone.rotation.y +=
        (targetBeamRotation - this.cone.rotation.y) * 0.08;
    }

    // Handle special cases for 360-degree beam light rotation
    if (
      this.lastTargetLightBeamRotation == 0 &&
      targetBeamRotation == Math.PI * 2
    ) {
      this.cone.rotation.y = 2 * Math.PI;
    } else if (
      this.lastTargetLightBeamRotation == Math.PI * 2 &&
      targetBeamRotation == 0
    ) {
      this.cone.rotation.y = 0;
    }

    this.lastTargetLightBeamRotation = targetBeamRotation;

    this.cone.rotation.y +=
      Math.sin(this.application.time.getElapsedTime() * 0.3) * 0.009;
  }
  
  private adjustLightPower() {
    this.spotLight.intensity = this.lightPower * this.lightMaxIntensity
  }
  
  setLightPower(power: number) {
    this.lightPower = power;
    //change cone opacity based on power
    this.coneMaterial.opacity = power * 0.09;
    this.coneMaterial2.opacity = power * 0.03;
  }

  update() {
    this.adjustLampRotation();
    this.adjustLampDirection();
    this.adjustLightPower()
  }
}
