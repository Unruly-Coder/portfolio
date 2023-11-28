import {Resources} from "./resources/Resources";
import {MouseControl} from "./controls/MouseControl";
import {Camera} from "./Camera";
import {Renderer} from "./Renderer";
import {Scene} from "three";
import {Sizes} from "./utils/Sizes";
import {World} from "./world/World";
import {Time} from "./utils/Time";
import * as dat from 'dat.gui';
import Stats from "stats.js";

export class Application {
   mouseControl: MouseControl;
   scene: Scene;
   sizes: Sizes;
   camera: Camera;
   renderer: Renderer;
   world: World;
   time: Time;
   debug?: dat.GUI;
   stats?: Stats;

  
  constructor(public resources: Resources) {
    this.setDebug();
    
    
    this.scene = new Scene();
    this.sizes = new Sizes();
    this.time = new Time();
    this.mouseControl = new MouseControl(this);
    this.camera = new Camera(this);
    this.world = new World(this);
    this.renderer = new Renderer(this);
    

    
    this.time.on('tick', () => {
      this.update();
    });
    
    this.sizes.on('resize', () => {
        this.resize();
    });
    
  }
  
  setDebug() {
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
    
    
    this.debug = new dat.GUI({ width: 320 });
    this.debug.domElement.onmouseenter = () => {
      this.mouseControl.disable();
    }
    this.debug.domElement.onmouseleave = () => {
      this.mouseControl.enable();
    }
  }
  
  start() {
    this.time.start();
  }
  
  resize() {
    this.camera.resize();
    this.renderer.resize();
  }
  
  update() {
    this.stats?.begin();
    
    this.mouseControl.updateRaycaster();
    this.world.update()
    this.renderer.update();
    
    this.stats?.end();
  }
}