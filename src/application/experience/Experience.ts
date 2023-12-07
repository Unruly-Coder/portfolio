import * as Cannon from "cannon-es";
import {Application} from "../Application";
import {Submarine} from "./submarine/Submarine";
import {Environment} from "./environment/Environment";
import {Room} from "./room/Room";
import {MouseControl} from "../controls/MouseControl";
import {Camera} from "../Camera";
import {Dust} from "./dust/Dust";
import {Obstacle} from "./obstacle/Obstackle";

export const WORLD_GRAVITY = 0;
export class Experience {
  
  private environment: Environment;
  private submarine!: Submarine;
  private room!: Room;
  private dust!: Dust;
  private obstacle1!: Obstacle;
  
  private mouseControl: MouseControl;
  private camera: Camera;
  
  
  constructor(private application: Application) {
    this.setupPhysicsWorld();
    
    this.mouseControl = application.mouseControl;
    this.camera = application.camera;
    
    this.environment = new Environment(this.application);
    
    this.setupObstacles();
    this.setupSubmarine();
    this.setupMap();
    this.setupDust();
    

    //this has to be done after all object creation;
    this.adjustPhysicDamping();
  }
  
  private setupPhysicsWorld() {
    this.application.physicWorld.gravity.set(0, WORLD_GRAVITY, 0);
    this.application.physicWorld.allowSleep = true;

    const broadphase = new Cannon.SAPBroadphase(this.application.physicWorld);
    broadphase.autoDetectAxis();

    this.application.physicWorld.broadphase = broadphase;
  }
  
  private adjustPhysicDamping() {
    this.application.physicWorld.bodies.forEach((body) => {
      body.linearDamping = 0.3;
      body.angularDamping = 0.2;
    });
  }
  
  private setupObstacles() {
    this.obstacle1 = new Obstacle(this.application);
    this.obstacle1.setPosition(25.5, 0, 0);
    this.obstacle1.addInstanceToScene();
    this.obstacle1.addBodyToPhysicalWorld();
  }
  
  private setupSubmarine() {
    this.submarine = new Submarine(this.application);
    this.submarine.addInstanceToScene();
    this.submarine.addBodyToPhysicalWorld();
    
    //connect obstacles
    this.submarine.on('velocityChange', (velocity) => {
      if(velocity > 6) {
        this.obstacle1.deactivate();
      } else {
        this.obstacle1.activate();
      }
    });

    //setup submarine controls
    this.mouseControl.on('leftDown', () => {
      this.submarine.startEngine();
    });

    this.mouseControl.on('leftUp', () => {
      this.submarine.stopEngine();
    });

    this.mouseControl.on('rightDown', () => {
      this.submarine.startLoadingExtraPower();

      console.log('rightDown');
    });

    this.mouseControl.on('rightUp', () => {
      this.submarine.firePowerMove();
      console.log('rightUp');
    });
  }
  
  private setupMap() {
    this.room = new Room(this.application);
    this.room.addInstanceToScene();
    this.room.addBodyToPhysicalWorld();
  }
  
  private setupDust() {
    this.dust = new Dust(this.application,36,30,18, 2000, 2);
    this.dust.addInstanceToScene();
    this.dust.setPosition(-2, 7, -1);
  }
  
  private syncCameraWithSubmarine() {
    const targetCameraPositionY = this.submarine.instance.position.y;
    const targetCameraPositionX = this.submarine.instance.position.x;
    this.camera.instance.position.y += (targetCameraPositionY - this.camera.instance.position.y) * 0.08;
    this.camera.instance.position.x += (targetCameraPositionX - this.camera.instance.position.x) * 0.02;
  }
  
  private stepPhysics() {
    this.application.physicWorld.bodies.forEach((body) => {
      if(body.type === Cannon.BODY_TYPES.DYNAMIC && body.velocity.length() != 0.0) {
        body.force.z = 0;
        body.velocity.z = 0;
      }
    });
    
    this.application.physicWorld.step(1/60, this.application.time.getDeltaElapsedTime(), 3);
  }
  
  update() {
    this.stepPhysics();
    const submarineDirection = this.mouseControl
      .getCastedPosition()
      .sub(this.submarine.instance.position)
      .normalize();
    this.submarine.setDirection(submarineDirection);
    this.submarine.update();
    this.obstacle1.update();

    this.syncCameraWithSubmarine()
    this.dust.update();
    
  }
}