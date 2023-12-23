import { Plank } from "./Plank";
import { Application } from "../../Application";
import { resources } from "../../resources/Resources";

export class PlanksObstacle {
  private planks: Plank[] = [];

  private planksData: { x: number; y: number; z: number }[] = [];

  constructor(private application: Application) {
    this.createPlanks();
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
      const plank = new Plank(this.application, mesh);
      plank.setPosition(initPosition.x, initPosition.y, initPosition.z);
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

  addBodyToPhysicalWorld() {
    this.planks.forEach((plank) => {
      plank.addBodyToPhysicalWorld();
    });
  }

  applyForceToPlanks() {
    this.planks.forEach((plank) => {
      plank.applyForce();
    });
  }

  update() {
    this.planks.forEach((plank) => {
      plank.update();
    });
  }
}
