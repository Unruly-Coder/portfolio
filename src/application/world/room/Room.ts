import {Application} from "../../Application";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Room {

  instance!: THREE.Mesh;
  physicBodies!: CANNON.Body[];
  
  constructor(private application: Application) {
    this.createRoomObject3d();
    this.createRoomPhysicBody()
  }
  
  private createRoomObject3d() {
    const roomBox = new THREE.BoxGeometry(15, 20, 12);
    const roomBoxMaterial = new THREE.MeshStandardMaterial({
      color: 0x404040,
      side: THREE.BackSide
    });
    this.instance = new THREE.Mesh(roomBox, roomBoxMaterial);
  }
  
  private createRoomPhysicBody() {
    const floor = new CANNON.Plane();
    const ceiling = new CANNON.Box(new CANNON.Vec3(7.5, 0.5, 6));
    const wallRight = new CANNON.Box(new CANNON.Vec3(0.5, 10, 6));
    const wallLeft = new CANNON.Box(new CANNON.Vec3(0.5, 10, 6));

      const floorBody = new CANNON.Body({ mass: 0, shape: floor });
     const ceilingBody = new CANNON.Body({ mass: 0, shape: ceiling });
     const wallLeftBody = new CANNON.Body({ mass: 0, shape: wallLeft });
     const wallRightBody = new CANNON.Body({ mass: 0, shape: wallRight });
    
   
      wallRightBody.position.set(8, 0,  0);
      wallLeftBody.position.set(-8, 0, 0);
      ceilingBody.position.set(0, 10.5, 0);


    
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
    floorBody.position.set(0, -10, 0);
    
    
    // ceilingBody.quaternion.setFromEuler(Math.PI * 2, 0, 0)
    // wallLeftBody.quaternion.setFromEuler(Math.PI * 0.5, 0, 0)
    // wallRightBody.quaternion.setFromEuler(Math.PI * 0.5, 0, 0)
    
   this.physicBodies = [floorBody, ceilingBody, wallRightBody, wallLeftBody]; // , ceilingBody, wallLeftBody, wallRightBody];
  }
  
  
}