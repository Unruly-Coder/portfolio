import * as THREE from "three";
import {Application} from "./Application";
import {Vector3} from "three";

export class Camera {
  
  readonly instance: THREE.PerspectiveCamera
  readonly defaultFOV: number = 50;
  private readonly z: number = 13;

  private frustum = new THREE.Frustum();
  private projectionMatrix = new THREE.Matrix4();
  constructor(private application: Application) {
    this.instance = new THREE.PerspectiveCamera(this.defaultFOV, this.application.sizes.aspectRatio, 0.1, 30);
    this.instance.position.z = this.z;
    this.instance.position.y = 3;
    this.instance.position.x = 0;
    
    this.setDebug()
  }

  resize() {
    this.instance.aspect = this.application.sizes.aspectRatio;
    this.instance.updateProjectionMatrix();
  }
  
  checkIfInFrustum(point: Vector3) {
    this.frustum.setFromProjectionMatrix( 
      this.projectionMatrix.multiplyMatrices(this.instance.projectionMatrix, this.instance.matrixWorldInverse)
    );
    return this.frustum.containsPoint(point);
  }

  reset() {
    this.instance.position.x = 0;
    this.instance.position.y = 3;
    this.instance.position.z = this.z;
    this.instance.rotation.x = 0;
    this.instance.rotation.y = 0;
    this.instance.rotation.z = 0;
    this.instance.fov = this.defaultFOV;
    this.instance.updateProjectionMatrix()
  }
  
  setDebug() {
    if(this.application.debug) {
      const folder = this.application.debug.addFolder('Camera')
      
        folder.open();
     
        folder
          .add(this.instance.position, 'z', 5, 25)
          .name('camera z')
        
        folder
          .add(this.instance.rotation, 'x', -Math.PI, Math.PI)
          .name('camera rotation x')
        
        folder
          .add(this.instance.rotation, 'y', -Math.PI, Math.PI)
          .name('camera rotation y')
        
        folder
          .add(this.instance.rotation, 'z', -Math.PI, Math.PI)
          .name('camera rotation z')
        
        folder
          .add(this.instance, 'fov', 0, 180)
          .name('camera fov')
          .onChange(() => {
            this.instance.updateProjectionMatrix()
          })

        folder
          .add({reset: () => this.reset()}, 'reset')
    }
  }
}