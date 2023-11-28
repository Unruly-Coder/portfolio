import {
  Vector3,
  Mesh,
  Object3D,
} from "three";
import * as THREE from "three";
import {Application} from "../../Application";
import {Reflector} from "./Reflector";
import * as CANNON from "cannon-es";
import {min} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";


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

export class Submarine {

  instance!: Object3D;
  physicBody!: CANNON.Body;
  
  private readonly submarineRadius: number = 1;
  private readonly mass: number = 20;
  

  private readonly direction: Vector3;

  private forceStrength: number = 0;
  private force: CANNON.Vec3 = new CANNON.Vec3(0,0,0);

  


  private directionArrow!: THREE.ArrowHelper;
  private submarine!: Object3D;
  private bench!: Object3D;
  private reflector!: Reflector
  
  
  
  
  constructor(private application: Application) {
    this.direction = new Vector3(1,1,1).normalize();
    
    this.createSubmarineObject3d();
    this.createSubmarinePhysicBody();
  }
  
  private createSubmarineObject3d() {
    this.directionArrow = new THREE.ArrowHelper(this.direction, new Vector3(0,0,0), 2, 0xff0000);


    const geometry =   new THREE.SphereGeometry( this.submarineRadius, 16, 16, Math.PI, Math.PI * 2, Math.PI * 0.16, Math.PI * 0.66 );
    const material = new THREE.MeshStandardMaterial({
      color: 'yellow',
      transparent: false,
      opacity: 1,
      
      side: THREE.DoubleSide,
    });


    geometry.rotateX(Math.PI * 0.5);

    this.submarine = new Mesh(geometry, material);
    
    const submarinePointLight = new THREE.PointLight(0x7eeefc, 5);
    
    submarinePointLight.position.y = 0;
    submarinePointLight.position.z = 0;
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

    
    bubbleCone1.mesh.rotation.z = Math.PI * 0.75;
    bubbleCone2.mesh.rotation.z = Math.PI * 0.5;
    bubbleCone3.mesh.rotation.z = Math.PI * 0.25;
    
    bubbleCone1.mesh.position.x = Math.cos(Math.PI * 0.25) * 1.1 ;
    bubbleCone1.mesh.position.y = Math.sin(Math.PI * 0.25) * 1.1 ;
    
    bubbleCone2.mesh.position.x = Math.cos(0) * 1.1 ;
    bubbleCone2.mesh.position.y = Math.sin(0) * 1.1 ;
    
    bubbleCone3.mesh.position.x = Math.cos(Math.PI * 1.75) * 1.1;
    bubbleCone3.mesh.position.y = Math.sin(Math.PI * 1.75) * 1.1 ;
    
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
    

    this.instance = group;

    this.application.scene.add(this.instance);
  }
  
  private createSubmarinePhysicBody() {
    const shape = new CANNON.Sphere(this.submarineRadius * 1.1);
    this.physicBody = new CANNON.Body({
      mass: this.mass,
      position: new CANNON.Vec3(0, 0, 0),
      shape: shape
    });
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
    this.instance.position.x = Math.floor(this.physicBody.position.x * 100) / 100;
    this.instance.position.y = Math.floor(this.physicBody.position.y * 100) / 100;
    this.instance.position.z = Math.floor(this.physicBody.position.z* 100) / 100;
    
    
    const forceLength = this.force.length();
    const minAngle = Math.PI * 0.08;
    const maxAngle = -1 * minAngle;
    let targetRotationZ = 0;
    let targetRotationY = 0;
    
    if(forceLength > 0) {
      const angle = Math.atan2(this.direction.y, this.direction.x);
      if((angle > 0 && angle < Math.PI * 0.5) || (angle > -Math.PI && angle < -Math.PI * 0.5)) {
        targetRotationZ = minAngle;
      } else {
        targetRotationZ = maxAngle;
      }
      
      if((angle > 0 && angle < Math.PI * 0.5) || (angle <= 0 && angle > -Math.PI * 0.5)) {
        
        targetRotationY = minAngle;
      } else {
        targetRotationY = maxAngle;
      }
    } 
    const zSpeed= targetRotationZ !== 0 ? 0.03 : 0.01
    const ySpeed = targetRotationY !== 0 ? 0.02 : 0.04
    
    
    this.submarine.rotation.z += (targetRotationZ - this.submarine.rotation.z) * zSpeed;
    this.submarine.rotation.y += (targetRotationY - this.submarine.rotation.y) * ySpeed;
    
  }
  
  private adjustBenchRotation() {
    this.bench.rotation.z = Math.min(Math.max(-Math.PI / 5, Math.atan2(this.direction.y, Math.abs(this.direction.x))), Math.PI / 5);
    const targetX = this.direction.x > 0 ? 0 : Math.PI;
    this.bench.rotation.y += (targetX - this.bench.rotation.y) * 0.08;
  }
  
  update() {
    this.syncObject3d();
    this.physicBody.applyLocalForce(new CANNON.Vec3(this.force.x, this.force.y, this.force.z));
    
  }
  
  setDirection(direction: Vector3) {
    this.direction.copy(direction);
    this.reflector.setDirection(direction);

    this.adjustBenchRotation();
    this.adjustForce();
    this.directionArrow.setDirection(this.direction);
  }
  
  startEngine() {
    this.forceStrength = 23;
    this.adjustForce();
  }
  
  stopEngine() {
    this.forceStrength = 0;
    this.adjustForce();
  }
  
}