import {
  Vector3,
  Mesh,
  Object3D,
} from "three";
import * as THREE from "three";
import {Application} from "../../Application";
import {Reflector} from "./Reflector";
import * as CANNON from "cannon-es";
import {Bubbles} from "./Bubbles";
import EventEmitter from "eventemitter3";


const coneMaterial =new THREE.MeshBasicMaterial({
  color: new THREE.Color( 0x000000 ),
  transparent: false,
  fog:true,
});

const coneGeometry =  new THREE.CylinderGeometry(
  0.1,
  0.07,
  0.2,
  16,
  1,
  false,
  Math.PI,
  Math.PI * 2
);

export class Submarine extends EventEmitter {

  instance!: Object3D;
  physicBody!: CANNON.Body;
  
  readonly submarineRadius: number = 1;
  readonly mass: number = 20;
  readonly direction: Vector3;

  private readonly maxExtraPower = 190;
  private extraPower: number = 0;
  private isExtraPowerLoading: boolean = false;
  
  private forceStrength: number = 0;
  private force: CANNON.Vec3 = new CANNON.Vec3(0,0,0);
  
  private directionArrow!: THREE.ArrowHelper;
  private submarine!: Object3D;
  private bench!: Object3D;
  private reflector!: Reflector
  private bubbles!: Bubbles;
  
  private lastVelocity: number = 0;
  readonly initialPosition: Vector3 = new Vector3(4,3,0);
  
  constructor(private application: Application) {
    super();
    
    this.direction = new Vector3(1,1,1).normalize();
    
    this.createSubmarineObject3d();
    this.createSubmarinePhysicBody();
    this.createBubbles();
    //this.syncObject3d();
  }
  
  private createSubmarineObject3d() {
    this.directionArrow = new THREE.ArrowHelper(this.direction, new Vector3(0,0,0), 2, 0xff0000);


    const geometry =   new THREE.SphereGeometry( this.submarineRadius, 16, 16, Math.PI, Math.PI * 2, Math.PI * 0.15, Math.PI * 0.66 );
    const material = new THREE.MeshStandardMaterial({
      color: 'yellow',
      transparent: false,
      opacity: 1,
      
      side: THREE.DoubleSide,
    });


    geometry.rotateX(Math.PI * 0.5);

    this.submarine = new Mesh(geometry, material);
    
    const submarinePointLight = new THREE.PointLight(0x7eeefc, 1.5);
    
    submarinePointLight.position.y = 0;
    submarinePointLight.position.z = -1.5;
    submarinePointLight.shadow.mapSize.width = 64;
    submarinePointLight.shadow.mapSize.height = 64;
    
    this.submarine.add(submarinePointLight);

    
    const boxGeometry = new THREE.BoxGeometry(1.4, 0.1, 0.5);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: "black",
      opacity: 1,
      
    });
    this.bench = new THREE.Mesh(boxGeometry, boxMaterial);
    this.bench.position.y = -0.3;

    this.reflector = new Reflector(this.application, -1);
    
    
    

    this.submarine.add(this.bench);
    this.submarine.add(this.reflector.instance);
    
    const bubbleCone1 = this.createBubbleCone();
    const bubbleCone2 = this.createBubbleCone();
    const bubbleCone3 = this.createBubbleCone();

    
    bubbleCone1.mesh.position.x = Math.cos(Math.PI * 0.25) * this.submarineRadius * 1.1;
    bubbleCone1.mesh.position.y = Math.sin(Math.PI * 0.25) * this.submarineRadius * 1.1;
    
    bubbleCone2.mesh.position.x = Math.cos(0) * this.submarineRadius * 1.1;
    bubbleCone2.mesh.position.y = Math.sin(0) * this.submarineRadius * 1.1;
    
    bubbleCone3.mesh.position.x = Math.cos(Math.PI * 1.75) * this.submarineRadius * 1.1;
    bubbleCone3.mesh.position.y = Math.sin(Math.PI * 1.75) * this.submarineRadius * 1.1;

    bubbleCone1.mesh.rotation.z = Math.PI * 0.75;
    bubbleCone2.mesh.rotation.z = Math.PI * 0.5;
    bubbleCone3.mesh.rotation.z = Math.PI * 0.25;
    
    const rightBubbleConeGroup1 = new THREE.Group();
    rightBubbleConeGroup1.add(bubbleCone1.mesh);
    rightBubbleConeGroup1.add(bubbleCone2.mesh);
    rightBubbleConeGroup1.add(bubbleCone3.mesh);

    const rightBubbleConeGroup2 = rightBubbleConeGroup1.clone();
    
    rightBubbleConeGroup1.rotation.y = Math.PI * -0.25;
    rightBubbleConeGroup2.rotation.y = Math.PI * 0.25;
    
    const leftBubbleConeGroup1 = rightBubbleConeGroup1.clone();
    const leftBubbleConeGroup2 = rightBubbleConeGroup2.clone();
    
    leftBubbleConeGroup1.rotation.y = Math.PI * 1.25;
    leftBubbleConeGroup2.rotation.y = Math.PI * -1.25;
    
    
    this.submarine.add(rightBubbleConeGroup1);
    this.submarine.add(rightBubbleConeGroup2);
    this.submarine.add(leftBubbleConeGroup1);
    this.submarine.add(leftBubbleConeGroup2);
    

    const group = new THREE.Group();

    // group.add(this.directionArrow);
    group.add(this.submarine);
    group.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
    
    this.instance = group;
    
  }
  
  private createSubmarinePhysicBody() {
    const shape = new CANNON.Sphere(this.submarineRadius + 0.1);
    this.physicBody = new CANNON.Body({
      mass: this.mass,
      position: new CANNON.Vec3(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z),
      shape: shape
    });
  }
  
  
  private createBubbles() {
    this.bubbles = new Bubbles(this.application, this);
    this.submarine.add(this.bubbles.instance);
  }
  
  private createBubbleCone() {
    const mesh = new Mesh(coneGeometry, coneMaterial);
    return { mesh };
  }
  
  private adjustForce() {
     this.force.set(this.direction.x, this.direction.y, this.direction.z)
      this.force = this.force.scale(this.forceStrength);
    
    // this.direction.clone().multiplyScalar(this.forceValue);
  }
  
  private syncObject3d() {
    
    //not sure why but this is needed to make the submarine move smoothly
    //cannon js is not precise enough for some reason;
    const targetX = this.physicBody.position.x;
    const targetY = this.physicBody.position.y;
    const targetZ = this.physicBody.position.z;
    
    this.instance.position.x += (targetX - this.instance.position.x) * 0.35;
    this.instance.position.y += (targetY - this.instance.position.y) * 0.35;
    this.instance.position.z += (targetZ - this.instance.position.z) * 0.35;

    
    const forceLength = this.force.length();
    const minAngle = Math.PI * 0.08;
    const maxAngle = -1 * minAngle;
    let targetRotationZ = 0;
    // let targetRotationY = 0;
    
    if(forceLength > 0) {
      const angle = Math.atan2(this.direction.y, this.direction.x);
      if((angle > 0 && angle < Math.PI * 0.5) || (angle > -Math.PI && angle < -Math.PI * 0.5)) {
        targetRotationZ = minAngle;
      } else {
        targetRotationZ = maxAngle;
      }
      
      // if((angle > 0 && angle < Math.PI * 0.5) || (angle <= 0 && angle > -Math.PI * 0.5)) {
      //  
      //   targetRotationY = minAngle * 0.5;
      // } else {
      //   targetRotationY = maxAngle * 0.5;
      // }
    } 
    const zSpeed= targetRotationZ !== 0 ? 0.03 : 0.01
    // const ySpeed = targetRotationY !== 0 ? 0.02 : 0.04
    
    if(targetRotationZ === 0 && Math.abs(this.submarine.rotation.z) < 0.01 ) {
      this.submarine.rotation.z = 0;
    } else {
      this.submarine.rotation.z += (targetRotationZ - this.submarine.rotation.z) * this.application.time.getDeltaElapsedTime();// * zSpeed;
    }

    // this.submarine.rotation.y += (targetRotationY - this.submarine.rotation.y) * ySpeed;
    
  }
  
  private adjustBenchRotation() {
    this.bench.rotation.z = Math.min(Math.max(-Math.PI / 5, Math.atan2(this.direction.y, Math.abs(this.direction.x))), Math.PI / 5);
    const targetX = this.direction.x > 0 ? 0 : Math.PI;
    this.bench.rotation.y += (targetX - this.bench.rotation.y) * 0.08;
  }
  
  setDirection(direction: Vector3) {
    this.direction.copy(direction);
    this.reflector.setDirection(direction);

    
    this.adjustForce();
    this.directionArrow.setDirection(this.direction);
  }
  
  startEngine() {
    this.forceStrength = 23;
    this.adjustForce();
    this.bubbles.startBubbling()
    
    this.application.sound.sounds.engine.fade(this.application.sound.sounds.engine.volume(), 1, 1000);
  }
  
  stopEngine() {
    this.forceStrength = 0;
    this.adjustForce();
    this.bubbles.stopBubbling()
    this.application.sound.sounds.engine.fade(this.application.sound.sounds.engine.volume(), 0, 1000);
    
  }
  
  private loadExtraPower() {

    
    if(this.isExtraPowerLoading && this.extraPower < this.maxExtraPower) {
      this.extraPower += this.application.time.getDeltaElapsedTime() * 100;
    }

    this.physicBody.applyLocalImpulse(new CANNON.Vec3(
      Math.sin(this.application.time.getElapsedTime() * 31) * this.extraPower / 10,
      Math.cos(this.application.time.getElapsedTime() * 29) * this.extraPower / 10,
      0));
  }
  
  startLoadingExtraPower() {
    this.isExtraPowerLoading = true;
    
    const powerloadSound = this.application.sound.sounds.powerload;
    powerloadSound.fade(powerloadSound.volume(), 0.1, 1500);
  }
  
  firePowerMove() {
    const impulse = new CANNON.Vec3(this.direction.x, this.direction.y, this.direction.z).scale(this.extraPower);
    this.physicBody.applyLocalImpulse(impulse);

    const powerloadSound = this.application.sound.sounds.powerload;
    powerloadSound.fade(powerloadSound.volume(), 0, 100);
    
    const impactwaveSound = this.application.sound.sounds.impactwave;
    
    const volume = Math.max(
      Math.min(
              parseFloat((this.extraPower / this.maxExtraPower).toFixed(1))
              , 1) * 0.7
            , 0.1);
    impactwaveSound.volume(volume)
    impactwaveSound.play();
    
    this.extraPower = 0;
    this.isExtraPowerLoading = false;
  }

  addInstanceToScene() {
    this.application.scene.add(this.instance);
  }

  addBodyToPhysicalWorld() {
    this.application.physicWorld.addBody(this.physicBody);
  }

  update() {
    this.adjustBenchRotation();
    this.reflector.update();
    
    if(this.isExtraPowerLoading) {
      this.loadExtraPower();
    }
    
    if(this.forceStrength > 0) {
      this.physicBody.applyLocalForce(new CANNON.Vec3(this.force.x, this.force.y, this.force.z));
    }
    
    const currentVelocity = this.physicBody.velocity.length();
    if(this.lastVelocity !==  currentVelocity) {
      this.emit('velocityChange', currentVelocity);
      this.lastVelocity = this.physicBody.velocity.length();
    }
    
    this.bubbles.update();
    this.syncObject3d();
  }
}