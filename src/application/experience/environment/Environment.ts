import {Application} from "../../Application";
import * as THREE from "three";

export class Environment {
  
  private readonly fog: THREE.FogExp2;
  private readonly ambientLight: THREE.AmbientLight;
  private readonly hemisphereLight: THREE.HemisphereLight;
  
  private readonly colors = {
    background: 0x000000,
    fog: 0x395050,// 0x161F1F,
    ambientLight: 0x404040,
    hemisphereLight: 0xffffff,
    hemisphereGroundLight: 0x153232,
    directionalLight: 0xffffff,
  }
  constructor(private application: Application) {
    
    this.application.scene.background = new THREE.Color( this.colors.background );
    this.fog = new THREE.FogExp2( this.colors.fog, 0.05);//0.07);
    
    this.application.scene.fog = this.fog;

    this.ambientLight = new THREE.AmbientLight(this.colors.ambientLight, 0)
    this.application.scene.add(this.ambientLight);

    this.hemisphereLight = new THREE.HemisphereLight(this.colors.hemisphereLight, this.colors.hemisphereGroundLight, 0.01);
    this.application.scene.add(this.hemisphereLight);
    
    this.setDebug();
  }
  
  private setDebug() {
    if(this.application.debug) {
      const folder = this.application.debug.addFolder('Environment')
      
        folder.open();
        
        folder
          .add(this.fog, 'density', 0, 0.3)
          .name('fog density')
      
        folder
          .addColor(this.colors, 'fog')
          .name('fog color')
          .onChange(() => {
            this.fog.color.set(this.colors.fog)
          })
      
        folder
          .add(this.ambientLight, 'intensity', 0, 1)
          .name('amb intensity')
        
        folder
          .addColor(this.colors, 'ambientLight')
          .name('amb color')
          .onChange(() => {
            this.ambientLight.color.set(this.colors.ambientLight)
          })
      
        folder
          .add(this.hemisphereLight, 'intensity', 0, 1)
          .name('hem intensity')
      
        folder
          .addColor(this.colors, 'hemisphereLight')
          .name('hem sky color')
          .onChange(() => {
            this.hemisphereLight.color.set(this.colors.hemisphereLight)
          })
        
        folder
          .addColor(this.colors, 'hemisphereGroundLight')
          .name('hem ground color')
          .onChange(() => {
            this.hemisphereLight.groundColor.set(this.colors.hemisphereGroundLight)
          })
    }
    
  }
}