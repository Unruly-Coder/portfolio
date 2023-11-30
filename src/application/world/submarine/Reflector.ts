import {Application} from "../../Application";
import * as THREE from "three";

export class Reflector {
  
  instance!: THREE.Group;
  private direction: THREE.Vector3 = new THREE.Vector3(0,-1,0).normalize()
  private colors = { spotlightColor: 0x7eeefc };
  private spotLight!: THREE.SpotLight;
  
  constructor(private application: Application, private offsetY: number = 0) {
    this.createReflector();
    this.setDebug();
  }
  
  createReflector() {
    const lampGeometry = new THREE.SphereGeometry( 0.15, 8, 8, Math.PI, Math.PI * 2, 0, Math.PI * 0.5 );
    const lampMaterial = new THREE.MeshStandardMaterial({
      color: 'black',
    });
    const lampMesh = new THREE.Mesh(lampGeometry, lampMaterial);
    
  const coneGeometry =  new THREE.CylinderGeometry(
      0.1,
      3.95,
      8,
      32,
      1,
      true,
      Math.PI,
      Math.PI * 2);
  
  const coneMaterial =new THREE.MeshBasicMaterial({
    color: new THREE.Color( 0x7eeefc ),
    transparent: true,
    opacity: 0.3,
  
    fog:true,
    // alphaMap: this.application.resources.getTexture('lightRay'),
    
    
  });
  
  const cone = new THREE.Mesh(
    coneGeometry,
    coneMaterial
    );
    cone.position.y = -4.0;
    cone.rotation.y = Math.PI * 2;
    
    
    
    const spotLight = new THREE.SpotLight( this.colors.spotlightColor, 6000 );//0x7eeefc
    spotLight.penumbra = 0.5;

    spotLight.position.y = 0;
    spotLight.position.z = 0;
    spotLight.position.x = 0;

    spotLight.target.position.y = -2;
    spotLight.target.position.z = 0;
    spotLight.target.position.x = 0;

    spotLight.angle = Math.PI / 6;
    spotLight.map = this.application.resources.getTexture('flashlightLight');

    
    this.spotLight = spotLight;



    const lamp = new THREE.Group();

    lamp.add(spotLight);
    lamp.add(spotLight.target);
    lamp.add(cone);
    lamp.add(lampMesh);
    lamp.position.y = this.offsetY;
    this.instance = lamp;
  }
  
  private setDebug() {
    if(this.application.debug) {
      const folder = this.application.debug.addFolder('Reflector')
      
        folder.open();
        
        folder
          .add(this.spotLight, 'intensity', 0, 20000)
          .name('light intensity')
        
        folder.addColor(this.colors, 'spotlightColor')
          .name('light color')
          .onChange(() => {
            this.spotLight.color.set(this.colors.spotlightColor)
          })
      
          
    }
  }
  
  setDirection(direction: THREE.Vector3) {
    this.direction.copy(direction);
    this.adjustLampRotation();
  }

  private adjustLampRotation() {
    const lampRadius = Math.abs(this.offsetY)

    this.instance.rotation.z = Math.min(Math.max(-Math.PI / 3, Math.atan2(this.direction.y, Math.abs(this.direction.x))), Math.PI / 5) + Math.PI / 2;
    const targetY = this.direction.x > 0 ? 0 : Math.PI;
    this.instance.rotation.y += (targetY - this.instance.rotation.y) * 0.08;

    const horizontalAngle= Math.abs(Math.atan2(this.direction.y, this.direction.x));

    const lampOnRightSide = horizontalAngle < Math.PI / 2;
    const rightSideX =  Math.sin(Math.PI * 0.25) * lampRadius;
    const leftSideX = Math.sin(Math.PI * 0.75) * -lampRadius;

    const targetX = lampOnRightSide ? rightSideX : leftSideX;
    this.instance.position.x += (targetX - this.instance.position.x) * 0.08;

    const difference = Math.abs(this.instance.position.x - targetX);
    const percentage = difference / (rightSideX - leftSideX);

    this.instance.position.z = Math.sin(Math.PI * percentage) * lampRadius * -1
  }
  

}