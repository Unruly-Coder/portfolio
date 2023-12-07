import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Application } from '../../Application';

const box = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
  color: 0x404040,
});
export class Box {
    
    instance!: THREE.Mesh;
    physicBody!: CANNON.Body;

    mass: number;

    
    constructor(private x: number, private y: number, private z: number, private application: Application) {
      this.mass = x * y * z * 0.001;
      
      this.createBoxObject3d();
      this.createBoxPhysicBody();

      
      
    }
    
    private createBoxObject3d() {
      this.instance = new THREE.Mesh(box, boxMaterial);
      this.instance.scale.x = this.x;
      this.instance.scale.y = this.y;
      this.instance.scale.z = this.z;
    }
    
    private createBoxPhysicBody() {
      const box = new CANNON.Box(new CANNON.Vec3(
        0.5 * this.x, 
        0.5 * this.y, 
        0.5 * this.z));
      this.physicBody = new CANNON.Body({ mass: this.mass, shape: box });
    }
    
    setPosition(x: number, y: number, z: number) {
      this.instance.position.x = x;
      this.instance.position.y = y;
      this.instance.position.z = z;
      this.physicBody.position.x = x;
      this.physicBody.position.y = y;
      this.physicBody.position.z = z;
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