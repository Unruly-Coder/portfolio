import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Application } from '../../Application';

export class Box {
    
    instance!: THREE.Mesh;
    physicBody!: CANNON.Body;
    randomScaleX: number = Math.random() * 0.8 + 0.2;
    randomScaleY: number = Math.random() * 0.8 + 0.2;
    randomScaleZ: number = Math.random() * 0.8 + 0.2;
    mass: number = this.randomScaleX * this.randomScaleY * this.randomScaleZ;
    
    constructor(private application: Application) {
      this.createBoxObject3d();
      this.createBoxPhysicBody();
      
    }
    
    private createBoxObject3d() {
      const box = new THREE.BoxGeometry(1, 1, 1);
      const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
      });
      this.instance = new THREE.Mesh(box, boxMaterial);
      this.instance.scale.x = this.randomScaleX;
      this.instance.scale.y = this.randomScaleY;
      this.instance.scale.z = this.randomScaleZ;
    }
    
    private createBoxPhysicBody() {
      const box = new CANNON.Box(new CANNON.Vec3(
        0.5 * this.randomScaleX, 
        0.5 * this.randomScaleY, 
        0.5 * this.randomScaleZ));
      this.physicBody = new CANNON.Body({ mass: this.mass, shape: box });

    }
    
    update() {
      // @ts-ignore
      this.instance.position.x = this.physicBody.position.x;
      this.instance.position.y = this.physicBody.position.y;
      this.instance.position.z = this.physicBody.position.z;
      // @ts-ignore
      this.instance.quaternion.copy(this.physicBody.quaternion);
    }
}