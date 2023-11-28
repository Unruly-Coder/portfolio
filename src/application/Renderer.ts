import {Application} from "./Application";
import {PCFSoftShadowMap, SRGBColorSpace, Vector2, WebGLRenderer} from "three";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js'
import {DotScreenPass} from "three/examples/jsm/postprocessing/DotScreenPass";
import {RenderPixelatedPass} from "three/examples/jsm/postprocessing/RenderPixelatedPass";
import {OutputPass} from "three/examples/jsm/postprocessing/OutputPass";

export class Renderer {
  private readonly renderer: WebGLRenderer;
  private readonly effectComposer: EffectComposer;
  

  constructor(private application: Application) {
    this.renderer = new WebGLRenderer({
      antialias: true
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFSoftShadowMap
    this.renderer.setSize(this.application.sizes.width, this.application.sizes.height);
    this.renderer.setPixelRatio(this.application.sizes.allowedPixelRatio);
    this.renderer.setClearColor(0x000000, 1);
    
    this.effectComposer = new EffectComposer(this.renderer)
    this.effectComposer.setSize(this.application.sizes.width, this.application.sizes.height);
    this.effectComposer.setPixelRatio(this.application.sizes.allowedPixelRatio);
    
    const renderPass = new RenderPass(this.application.scene, this.application.camera.instance);
    this.effectComposer.addPass(renderPass);

    // const dotScreenPass = new DotScreenPass( new Vector2( 0, 0 ), 6.5, 4.8);
    // this.effectComposer.addPass(dotScreenPass);
    // const renderPixelatedPass = new RenderPixelatedPass( 3,this.application.scene, this.application.camera.instance );
    //
    //
    // this.effectComposer.addPass( renderPixelatedPass );
    // //
    // const outputPass = new OutputPass();
    // this.effectComposer.addPass( outputPass );

    
    document.body.appendChild(this.renderer.domElement);
  }
  
  resize() {
    this.renderer.setSize(this.application.sizes.width, this.application.sizes.height);
    this.renderer.setPixelRatio(this.application.sizes.pixelRatio);
    
    this.effectComposer.setSize(this.application.sizes.width, this.application.sizes.height);
    this.effectComposer.setPixelRatio(this.application.sizes.pixelRatio);
  }
  
  update() {
    //this.renderer.render(this.application.scene, this.application.camera.instance);
    this.effectComposer.render();
  }
}