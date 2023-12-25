import { Application } from "../../Application";
import { resources } from "../../resources/Resources";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Map {
  private instance!: THREE.Group;
  private physicBodies!: CANNON.Body[];

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
    const wallRight = new CANNON.Box(new CANNON.Vec3(0.5, 3.5 + 4.5, 6));
    const wallLeft = new CANNON.Box(new CANNON.Vec3(0.5, 3.5 + 4.5, 6));
    const floor2Right = new CANNON.Box(new CANNON.Vec3(6.4, 7.5, 6));
    const floor2Left = new CANNON.Box(new CANNON.Vec3(2, 7.5, 6));
    const floor3Right = new CANNON.Box(new CANNON.Vec3(1.5, 3, 6));
    const floor3Left = new CANNON.Box(new CANNON.Vec3(1.5, 3, 6));

    const floor4Right = new CANNON.Box(new CANNON.Vec3(8.5, 0.2, 6));
    const floor4Left = new CANNON.Box(new CANNON.Vec3(13.5, 0.2, 6));

    const lastWall = new CANNON.Box(new CANNON.Vec3(0.5, 30.4, 6));
    const lastFloor = new CANNON.Box(new CANNON.Vec3(24.5, 0.2, 6));

    const floorBody = new CANNON.Body({ mass: 0, shape: floor });
    const ceilingBody = new CANNON.Body({ mass: 0, shape: ceiling });
    const wallLeftBody = new CANNON.Body({ mass: 0, shape: wallLeft });
    const wallRightBody = new CANNON.Body({ mass: 0, shape: wallRight });
    const floor2RightBody = new CANNON.Body({ mass: 0, shape: floor2Right });
    const floor2LeftBody = new CANNON.Body({ mass: 0, shape: floor2Left });
    const floor3RightBody = new CANNON.Body({ mass: 0, shape: floor3Right });
    const floor3LeftBody = new CANNON.Body({ mass: 0, shape: floor3Left });

    const floor4RightBody = new CANNON.Body({ mass: 0, shape: floor4Right });
    const floor4LeftBody = new CANNON.Body({ mass: 0, shape: floor4Left });

    const lastRightWallBody = new CANNON.Body({
      mass: 0,
      shape: lastWall,
    });
    const lastLeftWallBody = new CANNON.Body({ mass: 0, shape: lastWall });
    const lastFloorBody = new CANNON.Body({ mass: 0, shape: lastFloor });

    const rampBody = new CANNON.Body({ mass: 0, shape: ramp });
    const rampBody2 = new CANNON.Body({ mass: 0, shape: ramp });

    rampBody.position.set(25.5, -8.45, -2.4);
    rampBody2.position.set(25.5, -8.45, 2.4);

    wallRightBody.position.set(-modelOffset + 30, 3.5 - 4.5, 0);
    wallLeftBody.position.set(-modelOffset - 1, 3.5 - 4.5, 0);
    ceilingBody.position.set(-modelOffset + 15, 7.5, 0);
    floorBody.position.set(-modelOffset + 12.1, -0.1, 0);

    floor2RightBody.position.set(-modelOffset + 23, -16.5, 0);
    floor2LeftBody.position.set(-modelOffset + 1.4, -16.5, 0);

    floor3RightBody.position.set(13.4, -3 - 24, 0);
    floor3LeftBody.position.set(3.6, -3 - 24, 0);

    floor4RightBody.position.set(-2.2, -30.2, 0);
    floor4LeftBody.position.set(24, -30.2, 0);

    lastRightWallBody.position.set(-11.3, -60, 0);
    lastLeftWallBody.position.set(37.9, -60, 0);

    lastFloorBody.position.set(13, -90.6, 0);

    this.physicBodies = [
      rampBody,
      rampBody2,

      floorBody,
      ceilingBody,
      wallRightBody,
      wallLeftBody,
      floor2RightBody,
      floor2LeftBody,
      floor3RightBody,
      floor3LeftBody,

      floor4RightBody,
      floor4LeftBody,

      lastRightWallBody,
      lastLeftWallBody,
      lastFloorBody,
    ];
  }

  private setupCollisionSound() {
    this.physicBodies.forEach((physicBody) => {
      physicBody.addEventListener(
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
    });
  }

  addInstanceToScene() {
    this.application.scene.add(this.instance);
  }

  addBodyToPhysicalWorld() {
    this.physicBodies.forEach((physicBody) => {
      this.application.physicWorld.addBody(physicBody);
    });
  }
}
