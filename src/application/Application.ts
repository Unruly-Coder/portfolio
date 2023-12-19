import {MouseControl} from "./controls/MouseControl";
import {Camera} from "./Camera";
import {Renderer} from "./Renderer";
import {Scene} from "three";
import {Sizes} from "./utils/Sizes";
import {Time} from "./utils/Time";
import * as dat from 'dat.gui';
import Stats from "stats.js";
import {Sound} from "./Sound";
import * as CANNON from "cannon-es";
import {Experience} from "./experience/Experience";
import {MobileControl} from "./controls/MobileControl";
import Tween from "@tweenjs/tween.js";

export class Application {

   mouseControl: MouseControl;
   mobileControl: MobileControl;
   scene: Scene;
   physicWorld: CANNON.World;
   sizes: Sizes;
   camera: Camera;
   renderer: Renderer;
   experience: Experience;
   time: Time;
   sound: Sound;
   debug?: dat.GUI;
   stats?: Stats;
   
  constructor() {
    if(location.hash === '#debug') {
      this.setDebug();
    }
    
    
    this.scene = new Scene();
    this.physicWorld = new CANNON.World();
    this.sizes = new Sizes();
    this.time = new Time();
    this.sound = new Sound(this);
    this.mouseControl = new MouseControl(this);
    this.mobileControl = new MobileControl(this);
    this.camera = new Camera(this);
    this.experience = new Experience(this);
    this.renderer = new Renderer(this);
   
    
    this.adjustFOV();

    
    this.time.on('tick', this.update);
    this.sizes.on('resize', this.resize);
  }
  
  private adjustFOV = () => {
    if(this.sizes.aspectRatio < 1) {
      this.camera.instance.fov = 80;
      this.camera.instance.updateProjectionMatrix();
    } else {
      this.camera.instance.fov = this.camera.defaultFOV;
      this.camera.instance.updateProjectionMatrix();
    
    }
  }
  
  setDebug() {
    this.stats = new Stats();
    this.stats.showPanel(0);
    
    
    document.body.appendChild(this.stats.dom);
    
    this.debug = new dat.GUI({ width: 280 });
    
    this.debug.domElement.onmouseenter = () => {
      this.mouseControl.disable();
    }
    this.debug.domElement.onmouseleave = () => {
      this.mouseControl.enable();
    }
    
    this.debug.close();
    
  }
  
  start() {
    this.time.start();
  }
  
  experienceStart(enableTouchInterface = false) {
    this.experience.start();

    if(enableTouchInterface) {
      this.mobileControl.enable();
    }
  }
  
  resize = ()  => {
    this.camera.resize();
    this.renderer.resize();
    this.adjustFOV();
  }
  
  update = () => {
    this.stats?.begin();
    
    this.mouseControl.updateRaycaster();
    this.experience.update();
    this.renderer.update();
    

    Tween.update();
    
    this.stats?.end();
  }
}