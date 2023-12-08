import {BoxGeometry, Group, Mesh, MeshBasicMaterial} from "three";
import * as CANNON from "cannon-es";
import {Application} from "../../Application";
import {PlanksObstacle} from "./PlanksObstackle";

export class Obstacle {
  private instance: Group = new Group();
  private physicBody!: CANNON.Body;
  private physicalBodyHelper!: Mesh;

  private isPermanentBroken: boolean = false;
  private width: number = 4;
  private height: number = 0.1;
  private depth: number = 4;
  
  private planksObstacle: PlanksObstacle;
  
  
  constructor(protected application: Application) {
    
    this.createPhysicalBody();
    this.createPhysicalBodyHelper();
    this.setupCollisionSound();
    
    this.physicBody.addEventListener('collide', () => {
      if(this.isPermanentBroken) return;
      
      if(!this.physicBody.collisionResponse) {
        this.broke();
      }
    });

    this.planksObstacle = new PlanksObstacle(application);
  }
  addInstanceToScene() {
    this.application.scene.add(this.instance);
    //this.application.scene.add(this.physicalBodyHelper);
    this.planksObstacle.addInstanceToScene();
  }
  
  addBodyToPhysicalWorld() {
    this.application.physicWorld.addBody(this.physicBody);
    this.planksObstacle.addBodyToPhysicalWorld();
  }
  
  private createPhysicalBody() {
    const box = new CANNON.Box(new CANNON.Vec3(
      this.width / 2,
      this.height / 2,
      this.depth / 2));
    this.physicBody = new CANNON.Body({ mass: 0, shape: box });
  }
  
  private createPhysicalBodyHelper() {
    const box = new BoxGeometry(this.width, this.height, this.depth);
    const boxMaterial = new MeshBasicMaterial({
      color: 0x404040,
      wireframe: true,
    });
    this.physicalBodyHelper = new Mesh(box, boxMaterial);
  }
  
  private setupCollisionSound() {
    this.physicBody.addEventListener('collide', (event: { contact: {
        bi: any;
        getImpactVelocityAlongNormal: () => any; }; }) => {
      const impactVelocity = parseFloat(
        (event.contact.getImpactVelocityAlongNormal() * event.contact.bi.mass / 100)
          .toFixed(1)
      );


      if(impactVelocity > 0.1 && this.isActive) {
        this.application.sound.sounds.impactmetal.volume(Math.min(impactVelocity * 0.5, 1));
        this.application.sound.sounds.impactmetal.play();
      }
      
      if(!this.isActive && !this.isPermanentBroken) {
        this.application.sound.sounds.bigimpact.play();
      }
    });
  }
  
  setPosition(x: number, y: number, z: number) {
    this.instance.position.x = x;
    this.instance.position.y = y;
    this.instance.position.z = z;
    
    this.physicBody.position.x = x;
    this.physicBody.position.y = y;
    this.physicBody.position.z = z;
    
    this.physicalBodyHelper.position.x = x;
    this.physicalBodyHelper.position.y = y;
    this.physicalBodyHelper.position.z = z;
    
    this.planksObstacle.setPosition(x,y,z);
  }
  
  get isActive() {
    if(this.isPermanentBroken) return false;
    return this.physicBody.collisionResponse;
  }
  
  deactivate() {
    this.physicBody.collisionResponse = false;
  }
  
  activate() {
    if(this.isPermanentBroken) return;
    this.physicBody.collisionResponse = true;
  }
  
  broke() {
    this.isPermanentBroken = true;
    this.physicBody.collisionResponse = false;
    this.planksObstacle.applyForceToPlanks();
  }
  
  update() {
    this.planksObstacle.update();
  }
}

