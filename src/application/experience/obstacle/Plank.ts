import { Box3, Object3D, Vector3 } from "three";
import * as CANNON from "cannon-es";
import { Application } from "../../Application";

export class Plank {
  private readonly bodyObject3D: Object3D;
  private bodyPhysicalId: number | undefined;
  private force: CANNON.Vec3 = new CANNON.Vec3(0, -0.3, 0);
  private isForceApplied: boolean = false;
  private isInit: boolean = false;

  constructor(
    private application: Application,
    private model: Object3D,
    private initialPosition?: [x: number, y: number, z: number],
  ) {
    this.bodyObject3D = model;
  }

  async init() {
    await this.createPhysicalBody();
    this.isInit = true;
  }

  setPosition(x: number, y: number, z: number) {
    if (this.bodyPhysicalId === undefined) return;
    this.model.position.set(x, y, z);
    this.application.physicApi.setBodyPosition(this.bodyPhysicalId, x, y, z);
  }

  addInstanceToScene() {
    this.application.scene.add(this.bodyObject3D);
  }

  update() {
    if (this.bodyPhysicalId === undefined) return;

    if (this.isForceApplied) {
      this.application.physicApi.applyForce({
        id: this.bodyPhysicalId,
        force: [this.force.x, this.force.y, this.force.z],
      });
    }

    const bodyData = this.application.physicApi.getBodyData(
      this.bodyPhysicalId,
    );
    this.bodyObject3D.position.copy(bodyData.position);
    this.bodyObject3D.quaternion.copy(bodyData.quaternion);
  }

  applyForce() {
    this.isForceApplied = true;
  }

  private async createPhysicalBody() {
    const boundingBox = new Box3().setFromObject(this.model);
    const sizeVector = new Vector3();
    boundingBox.getSize(sizeVector);

    this.bodyPhysicalId = await this.application.physicApi.addBody({
      mass: 1,
      allowSleep: true,
      sleepSpeedLimit: 0.1,
      position: this.initialPosition,
      shapes: [
        {
          type: "box",
          halfExtents: [sizeVector.x / 2, sizeVector.y / 2, sizeVector.z / 2],
        },
      ],
    });
  }
}
