import {Application} from "../Application";
import {Submarine} from "./submarine/Submarine";
import {Environment} from "./environment/Environment";
import {Room} from "./room/Room";
import {MouseControl} from "../controls/MouseControl";
import {Camera} from "../Camera";
import {Dust} from "./dust/Dust";
import * as THREE from "three";
import * as Cannon from "cannon-es";
import {Box} from "./box/Box";

export const WORLD_GRAVITY = 0;
export class World {
  
  environment: Environment;
  submarine: Submarine;
  room: Room;
  dust: Dust;
  cubes: Box[] = [];
  
  private mouseControl: MouseControl;
  private camera: Camera;
  
  private physicWorld!: Cannon.World;
  constructor(private application: Application) {
    this.mouseControl = application.mouseControl;
    this.camera = application.camera;
    
    this.setupPhysicsWorld();
    
    this.environment = new Environment(this.application);
    this.submarine = new Submarine(this.application);

    
    this.room = new Room(this.application);
    this.application.scene.add(this.room.instance);
    
    this.dust = new Dust(this.application,16,18,4, 1000);
    this.dust.instance.position.z = -1;
    this.dust.instance.position.y = 9;
    this.dust.instance.position.x = -8;
    this.application.scene.add(this.dust.instance);
    
    //generate many small boxes and add to the scene

    for (let i = 0; i < 30; i++) {
      const box = new Box(this.application);
      
        box.physicBody.position.x = Math.random() * 8 - 4;
        box.physicBody.position.y = Math.random() * 20 -  10;
        box.physicBody.position.z = Math.random() * 6 - 3;
        
        
        box.physicBody.quaternion.setFromEuler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        box.physicBody.angularVelocity.setZero();
     
        this.room.instance.add(box.instance);
        this.physicWorld.addBody(box.physicBody);
        this.cubes.push(box);
      
    }

    this.physicWorld.addBody(this.submarine.physicBody);
    this.room.physicBodies.forEach(physicBody => {
        this.physicWorld.addBody(physicBody);
    });

    this.physicWorld.bodies.forEach((body) => {
      body.linearDamping = 0.3;
      body.angularDamping = 0.1;
    });

    this.setupSubmarineControls();
  }
  
  setupPhysicsWorld() {
    this.physicWorld = new Cannon.World();
    this.physicWorld.gravity.set(0, WORLD_GRAVITY, 0);
    this.physicWorld.allowSleep = true;

    const broadphase = new Cannon.SAPBroadphase(this.physicWorld);
    broadphase.autoDetectAxis();

    this.physicWorld.broadphase = broadphase;
  }
  
  setupSubmarineControls() {
    this.mouseControl.on('leftDown', () => {
      this.submarine.startEngine();
    });
    
    this.mouseControl.on('leftUp', () => {
      this.submarine.stopEngine();
    });
  }
  
  update() {
    this.submarine.setDirection(
      this.mouseControl
        .getCastedPosition()
        .sub(this.submarine.instance.position)
        .normalize()
    );
    this.submarine.update();
    this.cubes.forEach(cube => {
        cube.update();
        
    });
    
    const targetCameraPositionY = this.submarine.instance.position.y;
    const targetCameraPositionX = this.submarine.instance.position.x;

    
    this.camera.instance.position.y += (targetCameraPositionY - this.camera.instance.position.y) * 0.1;
    this.camera.instance.position.x += (targetCameraPositionX - this.camera.instance.position.x) * 0.1;
    
    this.dust.update();
    
    this.physicWorld.bodies.forEach((body) => {
      if(body.type === Cannon.BODY_TYPES.DYNAMIC && body.velocity.length() != 0.0) {
        body.force.z = 0;
        body.velocity.z = 0;
      }
    });
    

    this.physicWorld.step(1/60,this.application.time.deltaElapsedTime, 3);
  }
}