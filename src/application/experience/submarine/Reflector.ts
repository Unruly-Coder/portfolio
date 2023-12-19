import {Application} from "../../Application";
import {resources} from "../../resources/Resources";
import * as THREE from "three";

export class Reflector {
  
  instance: THREE.Group = new THREE.Group();
  private direction: THREE.Vector3 = new THREE.Vector3(0,-1,0);
  private lampWorldDirection: THREE.Vector3 = new THREE.Vector3(0,-1,0);
  private lampWorldPosition: THREE.Vector3 = new THREE.Vector3(0,0,0);
  private lightedObjectPosition = new THREE.Vector3(0,0,0);
  private colors = { spotlightColor: 0x7eeefc };
  private spotLight!: THREE.SpotLight;
  private cone!: THREE.Mesh;

  private lastTargetLightBeamRotation = 0;
  
  
  constructor(private application: Application, private offsetY: number = 0) {
    this.createReflector();
    this.setDebug();
  }
  
  createReflector() {
    const lampGeometry = new THREE.SphereGeometry( 0.15, 8, 8, Math.PI, Math.PI * 2, 0, Math.PI * 0.5 );
    const lampMaterial = new THREE.MeshLambertMaterial({
      color: 'black',
    });
    const lampMesh = new THREE.Mesh(lampGeometry, lampMaterial);
    
    const coneHeight = 11;
    const angle = Math.PI / 4;
  const coneGeometry =  new THREE.CylinderGeometry(
      0.1,
    coneHeight * Math.tan(angle) * 0.55,
      coneHeight,
      128,
      1,
      true,
      Math.PI/2,
      Math.PI);
  
    const coneMaterial =new THREE.MeshBasicMaterial({
      color: new THREE.Color( 0x7eeefc ),
      transparent: true,
      opacity: 0.1,
      fog:true,
      map: resources.getTexture('lightRay'),
      alphaMap: resources.getTexture('lightRay'),
      
    });
    
    
   const cone = new THREE.Mesh(
      coneGeometry,
      coneMaterial
      );
   cone.position.y = -1 * coneHeight / 2;
   cone.rotation.y = Math.PI ;
    
    
    
    const spotLight = new THREE.SpotLight( this.colors.spotlightColor, 100 , 15);//0x7eeefc
    spotLight.penumbra = 1;

    spotLight.position.y = 0;
    spotLight.position.z = 0;
    spotLight.position.x = 0;

    spotLight.target.position.y = -2;
    spotLight.target.position.z = 0;
    spotLight.target.position.x = 0;

    spotLight.angle = angle;
    spotLight.map = resources.getTexture('flashlightLight');
    
    this.spotLight = spotLight;

    
    this.instance.add(spotLight);
    this.instance.add(spotLight.target);
    this.instance.add(cone);
    this.instance.add(lampMesh);
    this.instance.position.y = this.offsetY;
    

    this.cone = cone;
  }

  private adjustLampDirection() {
    const bottomThreshold = -Math.PI / 3;
    const topThreshold = Math.PI / 5;
    
    const directionAngle = Math.atan2(this.direction.y, Math.abs(this.direction.x));

  
    if(directionAngle > bottomThreshold && directionAngle < topThreshold) {
      this.lampWorldDirection.x = Math.cos(directionAngle);
      this.lampWorldDirection.y = Math.sin(directionAngle);
    } 
        if(this.direction.x <= 0 && this.lampWorldDirection.x > 0) {
          this.lampWorldDirection.x *= -1;
        } else if(this.direction.x > 0 && this.lampWorldDirection.x < 0) {
          this.lampWorldDirection.x *= -1;
        }
        
    this.lampWorldDirection.normalize();

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
  }
  
  getRangeFactor(objectPosition: THREE.Object3D, dataObject: { range: number, distance: number}) {
    const lampWorldPosition = this.instance.getWorldPosition(this.lampWorldPosition);
    const lampToObject = objectPosition
      .getWorldPosition(this.lightedObjectPosition)
      .sub(lampWorldPosition)
      
    const distance = lampToObject.length();
    lampToObject.normalize();
    
    dataObject.distance = distance;
    dataObject.range = lampToObject.dot(this.lampWorldDirection);
    return dataObject;
  }
  
  private adjustLampRotation() {
    const threshold = 0.001;
    const lampRadius = Math.abs(this.offsetY)

    
    this.instance.rotation.z = Math.min(Math.max(-Math.PI / 3, Math.atan2(this.direction.y, Math.abs(this.direction.x))), Math.PI / 5) + Math.PI / 2;
    
    const targetY = this.direction.x > 0 ? 0 : Math.PI;
    const rotationYDifference = Math.abs(targetY - this.instance.rotation.y);
    if(rotationYDifference < threshold) {
      this.instance.rotation.y = targetY;
    } else {
      this.instance.rotation.y += (targetY - this.instance.rotation.y) * 0.08;
    }
    
    const angle = Math.atan2(this.direction.y, this.direction.x);
    const horizontalAngle= Math.abs(Math.atan2(this.direction.y, this.direction.x));

    const lampOnTopSide = angle > 0;
    const lampOnRightSide = horizontalAngle < Math.PI / 2;
    
    const rightSideX =  Math.sin(Math.PI * 0.25) * lampRadius;
    const leftSideX = Math.sin(Math.PI * 0.75) * -lampRadius;

    const targetX = lampOnRightSide ? rightSideX : leftSideX;
    this.instance.position.x += (targetX - this.instance.position.x) * 0.08;

    const difference = Math.abs(this.instance.position.x - targetX);
    const percentage = difference / (rightSideX - leftSideX);

    this.instance.position.z = Math.sin(Math.PI * percentage) * lampRadius * -1;
    

    

    const targetBeamRotation = lampOnRightSide ? Math.PI : lampOnTopSide ? Math.PI *2 : 0;
    const rotationDifference = Math.abs(targetBeamRotation - this.cone.rotation.y);

    if(rotationDifference < 0.001) {
      this.cone.rotation.y = targetBeamRotation;
    } else {
      this.cone.rotation.y += (targetBeamRotation - this.cone.rotation.y) * 0.08;
    }

    // Handle special cases for 360-degree beam light rotation
    if(this.lastTargetLightBeamRotation == 0 && targetBeamRotation == Math.PI * 2) {
      this.cone.rotation.y = 2 * Math.PI;
    } else if(this.lastTargetLightBeamRotation == Math.PI * 2 && targetBeamRotation == 0) {
      this.cone.rotation.y = 0;
    }
    
    this.lastTargetLightBeamRotation = targetBeamRotation;

    this.cone.rotation.y += Math.sin(this.application.time.getElapsedTime()* 0.3) * 0.009;
  }
  
  update() {
    this.adjustLampRotation();
    this.adjustLampDirection();
  }
  

}