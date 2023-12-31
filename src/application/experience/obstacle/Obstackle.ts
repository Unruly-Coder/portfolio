import { Group } from "three";

import { Application } from "../../Application";
import { PlanksObstacle } from "./PlanksObstacle";

export class Obstacle {
  private instance: Group = new Group();
  private physicBodyId: number | undefined;

  private isPermanentBroken: boolean = false;
  private width: number = 4;
  private height: number = 0.1;
  private depth: number = 4;
  private isInit: boolean = false;

  private planksObstacle: PlanksObstacle;

  constructor(
    private application: Application,
    private initialPosition?: [x: number, y: number, z: number],
  ) {
    this.planksObstacle = new PlanksObstacle(application, initialPosition);
  }

  async init() {
    await this.createPhysicalBody();
    await this.planksObstacle.init();
    this.setupCollisionSound();

    if (this.physicBodyId === undefined)
      throw new Error("physicBodyId is undefined");

    const bodyData = this.application.physicApi.getBodyData(this.physicBodyId);

    this.application.physicApi.addListener(this.physicBodyId, "collide", () => {
      if (this.isPermanentBroken) return;

      if (!bodyData.collisionResponse) {
        this.broke();
      }
    });

    this.isInit = true;
  }
  addInstanceToScene() {
    this.application.scene.add(this.instance);
    this.planksObstacle.addInstanceToScene();
  }

  private async createPhysicalBody() {
    this.physicBodyId = await this.application.physicApi.addBody({
      mass: 0,
      position: this.initialPosition,
      shapes: [
        {
          type: "box",
          halfExtents: [this.width / 2, this.height / 2, this.depth / 2],
        },
      ],
    });
  }

  private setupCollisionSound() {
    if (this.physicBodyId === undefined) {
      throw new Error(
        "physicBodyId is undefined. Collision sound setup failed.",
      );
    }

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

        if (impactVelocity > 0.1 && this.isActive) {
          this.application.sound.sounds.impactmetal.volume(
            Math.min(impactVelocity * 0.5, 1),
          );
          this.application.sound.sounds.impactmetal.play();
        }

        if (!this.isActive && !this.isPermanentBroken) {
          this.application.sound.sounds.bigimpact.play();
        }
      },
    );
  }

  setPosition(x: number, y: number, z: number) {
    if (this.physicBodyId === undefined) {
      throw new Error("physicBodyId is undefined. Cannot set position.");
    }

    this.instance.position.x = x;
    this.instance.position.y = y;
    this.instance.position.z = z;
    this.application.physicApi.setBodyPosition(this.physicBodyId, x, y, z);

    this.planksObstacle.setPosition(x, y, z);
  }

  get isActive() {
    if (this.physicBodyId === undefined) {
      throw new Error(
        "physicBodyId is undefined. Cannot determine activity status.",
      );
    }

    if (this.isPermanentBroken) return false;
    const bodyData = this.application.physicApi.getBodyData(this.physicBodyId);
    return bodyData.collisionResponse;
  }

  deactivate() {
    if (this.physicBodyId === undefined) {
      throw new Error("physicBodyId is undefined. Cannot deactivate.");
    }

    this.application.physicApi.setBodyCollisionResponse(
      this.physicBodyId,
      false,
    );
  }

  activate() {
    if (this.physicBodyId === undefined) {
      throw new Error(
        "Cannot activate due to permanent breakage or undefined physicBodyId.",
      );
    }

    if (this.isPermanentBroken) return;

    this.application.physicApi.setBodyCollisionResponse(
      this.physicBodyId,
      true,
    );
  }

  broke() {
    if (this.physicBodyId === undefined) {
      throw new Error("physicBodyId is undefined. Cannot break.");
    }

    this.isPermanentBroken = true;
    this.application.physicApi.setBodyCollisionResponse(
      this.physicBodyId,
      false,
    );
    this.planksObstacle.applyForceToPlanks();
  }

  update() {
    if (!this.isInit) return;

    this.planksObstacle.update();
  }
}
