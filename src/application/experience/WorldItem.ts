import {Object3D, Group} from "three";
import {Body} from "cannon-es";
import {Application} from "../Application";


export abstract class WorldItem {
  
  bodyObject3D: Group;
  bodyPhysical: Body;
  
  constructor(protected application: Application) {
    this.bodyObject3D = new Group();
    this.bodyPhysical = this.createPhysicalBody();
  }
  
  
  protected abstract createPhysicalBody(): Body 
  
  private createPhysicalBodyHelper() {
    
  }

  setPosition(x: number, y: number, z: number) {
    if(this.physicBody) {
      this.physicBody.position.set(x, y, z);
      
    }

    this.instance.position.set(x, y, z);
  }
  

}