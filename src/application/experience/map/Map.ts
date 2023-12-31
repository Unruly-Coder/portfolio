import { Application } from "../../Application";
import { resources } from "../../resources/Resources";
import { Group } from "three";

export class Map {
  private instance!: Group;
  private physicBodyId: number | undefined;

  constructor(private application: Application) {
    this.createRoomObject3d();
  }

  async init() {
    await this.createRoomPhysicBody();
    this.setupCollisionSound();
  }

  private createRoomObject3d() {
    const map = resources.getGltf("map");
    this.instance = map.scene;
  }

  private async createRoomPhysicBody() {
    const modelOffset = 3 * 0.5;

    this.physicBodyId = await this.application.physicApi.addBody({
      mass: 0,
      position: [0, 0, 0],
      shapes: [
        {
          type: "box", // floor
          halfExtents: [12.7, 0.2, 6],
          offset: [-modelOffset + 12.1, -0.1, 0],
        },
        {
          type: "box", // ceiling
          halfExtents: [15.5, 0.5, 6],
          offset: [-modelOffset + 15, 7.5, 0],
        },
        {
          type: "box", // wall
          halfExtents: [0.5, 3.5 + 4.5, 6],
          offset: [-modelOffset - 1, 3.5 - 4.5, 0],
        },
        {
          type: "box", // wall
          halfExtents: [0.5, 3.5 + 4.5, 6],
          offset: [-modelOffset + 30, 3.5 - 4.5, 0],
        },
        {
          type: "box", // floor2Right
          halfExtents: [6.4, 7.5, 6],
          offset: [-modelOffset + 23, -16.5, 0],
        },
        {
          type: "box", // floor2Left
          halfExtents: [2, 7.5, 6],
          offset: [-modelOffset + 1.4, -16.5, 0],
        },
        {
          type: "box", // floor3
          halfExtents: [1.5, 3, 6],
          offset: [13.4, -3 - 24, 0],
        },
        {
          type: "box", // floor3
          halfExtents: [1.5, 3, 6],
          offset: [3.6, -3 - 24, 0],
        },
        {
          type: "box", // floor4Right
          halfExtents: [8.5, 0.2, 6],
          offset: [-2.2, -30.2, 0],
        },
        {
          type: "box", // floor4Left
          halfExtents: [13.5, 0.2, 6],
          offset: [24, -30.2, 0],
        },
        {
          type: "box", // lastWall
          halfExtents: [0.5, 30.4, 6],
          offset: [-11.3, -60, 0],
        },
        {
          type: "box", // lastWall
          halfExtents: [0.5, 30.4, 6],
          offset: [37.9, -60, 0],
        },
        {
          type: "box", // lastFloor
          halfExtents: [24.5, 0.2, 6],
          offset: [13, -90.6, 0],
        },
        {
          type: "box", // ramp
          halfExtents: [2.3, 0.6, 0.05],
          offset: [25.5, -8.45, -2.4],
        },
        {
          type: "box", // ramp
          halfExtents: [2.3, 0.6, 0.05],
          offset: [25.5, -8.45, 2.4],
        },
      ],
    });
  }

  private setupCollisionSound() {
    if (this.physicBodyId === undefined)
      throw new Error("physicBodyId is undefined");

    this.application.physicApi.addListener(
      this.physicBodyId,
      "collide",
      (event) => {
        const targetData = this.application.physicApi.getBodyData(
          event.targetId,
        );
        const impactVelocity = parseFloat(
          ((event.contact.impactVelocity * targetData.mass) / 100).toFixed(1),
        );

        if (impactVelocity > 0.1) {
          this.application.sound.sounds.impactmetal.volume(
            Math.min(impactVelocity * 0.5, 1),
          );
          this.application.sound.sounds.impactmetal.play();
        }
      },
    );
  }

  addInstanceToScene() {
    this.application.scene.add(this.instance);
  }
}
