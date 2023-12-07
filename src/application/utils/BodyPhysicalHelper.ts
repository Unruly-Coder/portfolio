import * as CANNON from "cannon-es";
import * as THREE from "three";
import {BoxGeometry, Group, Mesh, MeshBasicMaterial} from "three";
import {or} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";

const box = new BoxGeometry(1, 1, 1);
const boxMaterial = new MeshBasicMaterial({
  color: 0x404040,
  wireframe: true,
});

export class BodyPhysicalHelper {
  
  bodyObject3D: Group;
  constructor(private body: CANNON.Body) {
    this.bodyObject3D = this.createPhysicalBodyHelper()
  }
  private createPhysicalBodyHelper(): Group {
    const group = new THREE.Group();
    

    this.body.shapes.forEach((shape, i) => {
      const offset  = this.body.shapeOffsets[i];
      const orientation = this.body.shapeOrientations[i];
      
      if(shape instanceof CANNON.Box) {
        const {halfExtents} = shape;
        const mesh = new THREE.Mesh(box, boxMaterial);
        
        mesh.scale.set(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        mesh.position.set(offset.x, offset.y, offset.z);
        mesh.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
        
        group.add(mesh);
      } else {
        throw new Error('Unknown shape');
      }
    });
    
    group.position.set(this.body.position.x, this.body.position.y, this.body.position.z);
    group.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
    
    return group;
  }
}