import { Application } from "../../Application";
import { resources } from "../../resources/Resources";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Map {
  private instance!: THREE.Group;
  private physicBody!: CANNON.Body;

  constructor(private application: Application) {
    this.createRoomObject3d();
    this.createRoomPhysicBody();
    this.setupCollisionSound();
  }

  private createRoomObject3d() {
    const map = resources.getGltf("map");
    this.instance = map.scene;
  }

  private createRoomPhysicBody() {
    const modelOffset = 3 * 0.5;

    const ramp = new CANNON.Box(new CANNON.Vec3(2.3, 0.6, 0.05));

    const floor = new CANNON.Box(new CANNON.Vec3(12.7, 0.2, 6));
    const ceiling = new CANNON.Box(new CANNON.Vec3(15.5, 0.5, 6));
    const wall = new CANNON.Box(new CANNON.Vec3(0.5, 3.5 + 4.5, 6));

    const floor2Right = new CANNON.Box(new CANNON.Vec3(6.4, 7.5, 6));
    const floor2Left = new CANNON.Box(new CANNON.Vec3(2, 7.5, 6));

    const floor3 = new CANNON.Box(new CANNON.Vec3(1.5, 3, 6));

    const floor4Right = new CANNON.Box(new CANNON.Vec3(8.5, 0.2, 6));
    const floor4Left = new CANNON.Box(new CANNON.Vec3(13.5, 0.2, 6));

    const lastWall = new CANNON.Box(new CANNON.Vec3(0.5, 30.4, 6));
    const lastFloor = new CANNON.Box(new CANNON.Vec3(24.5, 0.2, 6));

    const roomBody = new CANNON.Body({ mass: 0 });
    roomBody.addShape(floor, new CANNON.Vec3(-modelOffset + 12.1, -0.1, 0));
    roomBody.addShape(ceiling, new CANNON.Vec3(-modelOffset + 15, 7.5, 0));
    roomBody.addShape(wall, new CANNON.Vec3(-modelOffset - 1, 3.5 - 4.5, 0));
    roomBody.addShape(wall, new CANNON.Vec3(-modelOffset + 30, 3.5 - 4.5, 0));
    roomBody.addShape(
      floor2Right,
      new CANNON.Vec3(-modelOffset + 23, -16.5, 0),
    );
    roomBody.addShape(
      floor2Left,
      new CANNON.Vec3(-modelOffset + 1.4, -16.5, 0),
    );
    roomBody.addShape(floor3, new CANNON.Vec3(13.4, -3 - 24, 0));
    roomBody.addShape(floor3, new CANNON.Vec3(3.6, -3 - 24, 0));
    roomBody.addShape(floor4Right, new CANNON.Vec3(-2.2, -30.2, 0));
    roomBody.addShape(floor4Left, new CANNON.Vec3(24, -30.2, 0));
    roomBody.addShape(lastWall, new CANNON.Vec3(-11.3, -60, 0));
    roomBody.addShape(lastWall, new CANNON.Vec3(37.9, -60, 0));
    roomBody.addShape(lastFloor, new CANNON.Vec3(13, -90.6, 0));
    roomBody.addShape(ramp, new CANNON.Vec3(25.5, -8.45, -2.4));
    roomBody.addShape(ramp, new CANNON.Vec3(25.5, -8.45, 2.4));

    this.physicBody = roomBody;
  }

  private setupCollisionSound() {
    this.physicBody.addEventListener(
      "collide",
      (event: {
        contact: {
          bi: any;
          getImpactVelocityAlongNormal: () => any;
        };
      }) => {
        const impactVelocity = parseFloat(
          (
            (event.contact.getImpactVelocityAlongNormal() *
              event.contact.bi.mass) /
            100
          ).toFixed(1),
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

  addBodyToPhysicalWorld() {
    this.application.physicWorld.addBody(this.physicBody);
  }
}
