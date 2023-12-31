import { Plank } from "./Plank";
import { Application } from "../../Application";
import { resources } from "../../resources/Resources";

export class PlanksObstacle {
  private planks: Plank[] = [];
  private planksData: { x: number; y: number; z: number }[] = [];
  private isInit: boolean = false;

  constructor(
    private application: Application,
    private initialPosition?: [x: number, y: number, z: number],
  ) {
    this.createPlanks();
  }

  async init() {
    await Promise.all(this.planks.map((plank) => plank.init()));
    this.isInit = true;
  }

  private createPlanks() {
    const meshes = resources.getGltf("plank_1").scene.clone().children;
    meshes.forEach((mesh, i) => {
      const initPosition = {
        x: mesh.position.x,
        y: mesh.position.y - 0.2,
        z: mesh.position.z,
      };
      this.planksData.push(initPosition);

      const initialGlobalPosition: [number, number, number] | undefined = this
        .initialPosition
        ? [
            this.initialPosition[0] + initPosition.x,
            this.initialPosition[1] + initPosition.y,
            this.initialPosition[2] + initPosition.z,
          ]
        : undefined;
      const plank = new Plank(this.application, mesh, initialGlobalPosition);
      this.planks.push(plank);
    });
  }

  setPosition(x: number, y: number, z: number) {
    this.planks.forEach((plank, i) => {
      plank.setPosition(
        x + this.planksData[i].x,
        y + this.planksData[i].y,
        z + this.planksData[i].z,
      );
    });
  }

  addInstanceToScene() {
    this.planks.forEach((plank) => {
      plank.addInstanceToScene();
    });
  }

  applyForceToPlanks() {
    this.planks.forEach((plank) => {
      plank.applyForce();
    });
  }

  update() {
    if (!this.isInit) return;

    this.planks.forEach((plank) => {
      plank.update();
    });
  }
}
