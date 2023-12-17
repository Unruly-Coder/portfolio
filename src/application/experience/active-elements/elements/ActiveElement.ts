import {
  Mesh, MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  Vector3,
  IcosahedronGeometry, PlaneGeometry,
} from "three";
import {Application} from "../../../Application";
import { Tween,  Easing} from "@tweenjs/tween.js";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";

const rockGeometry = new IcosahedronGeometry( 0.5, 0);
const rockMaterial = new MeshLambertMaterial( { color: 0xffffff, fog: true,  });
const textMaterial = new MeshBasicMaterial( { color: 0xffffff, fog: true,  });
const enterGeometry = new PlaneGeometry( 1, 1, 1 );
const enterMaterial = new MeshBasicMaterial( { side: 2, transparent: true});

export abstract class ActiveElement { 
  instance: Object3D = new Object3D();
  private tween: Tween<Vector3> | undefined
  private textTween: Tween<Vector3> | undefined
  private enterTween: Tween<Vector3> | undefined
  private readonly rock: Mesh;
  private readonly text: Mesh;
  private readonly enter: Mesh;
  
  isActivated: boolean = false;
  isVisible: boolean = true;
  isFocused: boolean = false;
  constructor(protected application: Application, public link: { text: string, url: string}) {
    enterMaterial.map = this.application.resources.getTexture('enter');
    
    this.rock = new Mesh(rockGeometry, rockMaterial);
    this.text = this.createText(link.text);
    this.enter = this.createEnter();
    this.assembleObjects();
  }

  private assembleObjects() {
    
    this.instance.add(this.text);
    this.text.position.y = 0.8;
    this.text.scale.set(0,0,0);
    this.instance.add(this.enter);
    this.enter.position.y = -1.2;
    this.enter.scale.set(1,1,1);
    this.instance.add( this.rock );

  }

  private createText(text: string) {
    const textGeometry = new TextGeometry( text, {
      font: this.application.resources.getFont('helvetiker'),
      size: 0.35,
      height: 0.1,
      curveSegments: 6,
      bevelEnabled: false,
      bevelThickness: 2,
      bevelSize: 2,
      bevelOffset: 0,
      bevelSegments: 2,
    } );

    textGeometry.center();
    const textMesh = new Mesh(textGeometry, textMaterial);
    return textMesh
  }
  
  private createEnter() { 

    const enterMesh =  new Mesh( enterGeometry, enterMaterial );
    return enterMesh;
  }

  private get positionTween() {
    if(this.tween) {
      return this.tween;
    } else {
      this.tween = new Tween(this.instance.position);
      return this.tween;
    }
  }

  private get textScaleTween() {
    if(this.textTween) {
      return this.textTween;
    } else {
      this.textTween = new Tween(this.text.scale);
      return this.textTween;
    }
  }
  
  private get enterScaleTween() {
    if(this.enterTween) {
      return this.enterTween;
    } else {
      this.enterTween = new Tween(this.enter.scale);
      return this.enterTween;
    }
  }
  addInstanceToScene() {
    this.application.scene.add(this.instance);
  }

  setPosition(x: number, y: number, z: number) {
    this.instance.position.set(x, y, z);
  }
  
  setRotation(x: number, y: number, z: number) {
    this.instance.rotation.set(x, y, z);
  }
  
  hide() {
    this.isVisible = false;
    this.positionTween
      .stop()
      .to({z: -2}, 1000)
      .easing(Easing.Elastic.Out)
      .startFromCurrentValues();
  }
  
  show() {
    this.isVisible = true;
    this.positionTween
      .stop()
      .to({z: 0}, 1000)
      .easing(Easing.Elastic.Out)
      .startFromCurrentValues();
  }
  
  activate() {
    this.isActivated = true;

  }
  
  deactivate() {
    this.isActivated = false;

  }
  
  focus() { 
    this.isFocused = true;
    this.textScaleTween
      .stop()
      .to({x: 1.0, y: 1.0, z: 1.0}, 300)
      .easing(Easing.Quadratic.Out)
      .startFromCurrentValues();
    this.enterScaleTween
      .stop()
      .to({x: 1.0, y: 1.0, z: 1.0}, 300)
      .easing(Easing.Quadratic.Out)
      .startFromCurrentValues();
  } 
  
  unfocus() {
    this.isFocused = false;
    this.textScaleTween
      .stop()
      .to({x: 0.0, y: 0.0, z: 0.0}, 300)
      .easing(Easing.Quadratic.Out)
      .startFromCurrentValues();
    this.enterScaleTween
      .stop()
      .to({x: 0.0, y: 0.0, z: 0.0}, 300)
      .easing(Easing.Quadratic.Out)
      .startFromCurrentValues();
  }
  
  
  update() {
    this.text.lookAt(this.application.camera.instance.position);
    this.enter.lookAt(this.application.camera.instance.position);
    if(this.isActivated) {
     this.rock.rotation.y += 0.01;
     this.rock.rotation.z += 0.01;
   }
  }
}