import * as THREE from "three";
import {Application} from "./Application";

export class Camera {
  
  readonly instance: THREE.PerspectiveCamera
  constructor(private application: Application) {
    this.instance = new THREE.PerspectiveCamera(75, this.application.sizes.aspectRatio, 0.1, 1000);
    this.instance.position.z = 7;
    
    this.setDebug()
  }

  resize() {
    this.instance.aspect = this.application.sizes.aspectRatio;
    this.instance.updateProjectionMatrix();
  }

  reset() {
    this.instance.position.z = 7;
    this.instance.rotation.x = 0;
    this.instance.rotation.y = 0;
    this.instance.rotation.z = 0;
    this.instance.fov = 75;
    this.instance.updateProjectionMatrix()
  }
  
  setDebug() {
    if(this.application.debug) {
      const folder = this.application.debug.addFolder('Camera')
      
        folder.open();
     
        folder
          .add(this.instance.position, 'z', 5, 15)
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