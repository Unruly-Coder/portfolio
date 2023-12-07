import {Application} from "../../Application";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Room {

  private instance!: THREE.Group;
  private physicBodies!: CANNON.Body[];
  
  constructor(private application: Application) {
    this.createRoomObject3d();
    this.createRoomPhysicBody();
    this.setupCollisionSound();
  }
  
  private createRoomObject3d() {
    const room = this.application.resources.getGltf('room');
    this.application.scene.add(room.scene);
    this.instance = room.scene
  }
  
  private createRoomPhysicBody() {
    const modelOffset = 3 * 0.5;
    
   // const floor = new CANNON.Plane();
    const floor = new CANNON.Box(new CANNON.Vec3(12.4, 0.2, 6));
    const ceiling = new CANNON.Box(new CANNON.Vec3(15.5, 0.5, 6));
    const wallRight = new CANNON.Box(new CANNON.Vec3(0.5, 3.5 + 4.5, 6));
    const wallLeft = new CANNON.Box(new CANNON.Vec3(0.5, 3.5 + 4.5, 6));
    const floor2Right = new CANNON.Box(new CANNON.Vec3(6.4, 7.5, 6));
    const floor2Left = new CANNON.Box(new CANNON.Vec3(2, 7.5, 6));
    const floor3Right = new CANNON.Box(new CANNON.Vec3(1.5, 3, 6));
    const floor3Left = new CANNON.Box(new CANNON.Vec3(1.5, 3, 6));
  
    
    
     const floorBody = new CANNON.Body({ mass: 0, shape: floor });
     const ceilingBody= new CANNON.Body({ mass: 0, shape: ceiling });
     const wallLeftBody = new CANNON.Body({ mass: 0, shape: wallLeft });
     const wallRightBody = new CANNON.Body({ mass: 0, shape: wallRight });
     const floor2RightBody = new CANNON.Body({ mass: 0, shape: floor2Right });
     const floor2LeftBody = new CANNON.Body({ mass: 0, shape: floor2Left });
     const floor3RightBody = new CANNON.Body({ mass: 0, shape: floor3Right });
     const floor3LeftBody = new CANNON.Body({ mass: 0, shape: floor3Left });
     
     
    
   
      wallRightBody.position.set(-modelOffset + 30 , 3.5 - 4.5,  0);
      wallLeftBody.position.set(-modelOffset - 1, 3.5 - 4.5, 0);
      ceilingBody.position.set(-modelOffset + 15, 7.5, 0);
      floorBody.position.set(-modelOffset + 12.4, -0.1, 0);
      
      floor2RightBody.position.set(-modelOffset + 23, -16.5, 0);
      floor2LeftBody.position.set(-modelOffset + 1.4, -16.5, 0);

    floor3RightBody.position.set(13.5, -3 - 24, 0);
    floor3LeftBody.position.set(3.5, -3 - 24, 0);

    
    
    //floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
    
    
    
    // ceilingBody.quaternion.setFromEuler(Math.PI * 2, 0, 0)
    // wallLeftBody.quaternion.setFromEuler(Math.PI * 0.5, 0, 0)
    // wallRightBody.quaternion.setFromEuler(Math.PI * 0.5, 0, 0)
    
   this.physicBodies = [
     floorBody, ceilingBody, wallRightBody, wallLeftBody,
     floor2RightBody, floor2LeftBody,
     floor3RightBody, 
     floor3LeftBody
   ];
  }

  private setupCollisionSound() {
    this.physicBodies.forEach(physicBody => {
      physicBody.addEventListener('collide', (event: { contact: {
          bi: any;
          getImpactVelocityAlongNormal: () => any; }; }) => {
        const impactVelocity = parseFloat(
          (event.contact.getImpactVelocityAlongNormal() * event.contact.bi.mass / 100)
            .toFixed(1)
        );


        if(impactVelocity > 0.1) {
          this.application.sound.sounds.impactmetal.volume(Math.min(impactVelocity * 0.5, 1));
          this.application.sound.sounds.impactmetal.play();
        }
      });
    })
  }

  addInstanceToScene() {
    this.application.scene.add(this.instance);
  }

  addBodyToPhysicalWorld() {
    this.physicBodies.forEach(physicBody => {
      this.application.physicWorld.addBody(physicBody);
    });
  }


  
  
}