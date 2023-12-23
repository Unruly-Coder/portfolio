import { Box3, Object3D, Vector3 } from "three";
import * as CANNON from "cannon-es";
import { Application } from "../../Application";

export class Plank {
  private readonly bodyObject3D: Object3D;
  private readonly bodyPhysical: CANNON.Body;
  private force: CANNON.Vec3 = new CANNON.Vec3(0, -0.3, 0);
  private isForceApplied: boolean = false;

  constructor(
    private application: Application,
    private model: Object3D,
  ) {
    this.bodyObject3D = model;
    this.bodyPhysical = this.createPhysicalBody();
  }

  setPosition(x: number, y: number, z: number) {
    this.bodyPhysical.position.set(x, y, z);
    this.model.position.set(x, y, z);
  }

  addInstanceToScene() {
    this.application.scene.add(this.bodyObject3D);
  }

  addBodyToPhysicalWorld() {
    this.application.physicWorld.addBody(this.bodyPhysical);
  }

  update() {
    if (this.isForceApplied) {
      this.bodyPhysical.applyForce(this.force);
    }

    this.bodyObject3D.position.x = this.bodyPhysical.position.x;
    this.bodyObject3D.position.y = this.bodyPhysical.position.y;
    this.bodyObject3D.position.z = this.bodyPhysical.position.z;

    this.bodyObject3D.quaternion.x = this.bodyPhysical.quaternion.x;
    this.bodyObject3D.quaternion.y = this.bodyPhysical.quaternion.y;
    this.bodyObject3D.quaternion.z = this.bodyPhysical.quaternion.z;
    this.bodyObject3D.quaternion.w = this.bodyPhysical.quaternion.w;
  }

  applyForce() {
    this.isForceApplied = true;
  }

  private createPhysicalBody() {
    const boundingBox = new Box3().setFromObject(this.model);
    const sizeVector = new Vector3();
    boundingBox.getSize(sizeVector);

    const box = new CANNON.Box(
      new CANNON.Vec3(sizeVector.x / 2, sizeVector.y / 2, sizeVector.z / 2),
    );

    return new CANNON.Body({
      mass: 1,
      shape: box,
      allowSleep: true,
      sleepSpeedLimit: 0.1,
    });
  }
}
