import {Application} from "./Application";
import {PCFSoftShadowMap, SRGBColorSpace, Vector2, WebGLRenderer, ACESFilmicToneMapping} from "three";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js'
import {DotScreenPass} from "three/examples/jsm/postprocessing/DotScreenPass";
import {RenderPixelatedPass} from "three/examples/jsm/postprocessing/RenderPixelatedPass";
import {OutputPass} from "three/examples/jsm/postprocessing/OutputPass";
import {GlitchPass} from "three/examples/jsm/postprocessing/GlitchPass";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {RGBShiftShader} from "three/examples/jsm/shaders/RGBShiftShader";
import {GammaCorrectionShader} from "three/examples/jsm/shaders/GammaCorrectionShader";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {BokehPass} from "three/examples/jsm/postprocessing/BokehPass";
import {FilmPass} from "three/examples/jsm/postprocessing/FilmPass";
import {SMAAPass} from "three/examples/jsm/postprocessing/SMAAPass";

export class Renderer {
  private readonly renderer: WebGLRenderer;
  private readonly effectComposer: EffectComposer;
  

  constructor(private application: Application) {
    this.renderer = new WebGLRenderer({
      canvas: document.querySelector('canvas#canvas')!,
      antialias: false,
      powerPreference: 'high-performance'

    });

    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.shadowMap.enabled = false
    this.renderer.shadowMap.type = PCFSoftShadowMap
    this.renderer.setSize(this.application.sizes.width, this.application.sizes.height);
    this.renderer.setPixelRatio(this.application.sizes.allowedPixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    
    this.effectComposer = new EffectComposer(this.renderer)
    this.effectComposer.setSize(this.application.sizes.width, this.application.sizes.height);
    this.effectComposer.setPixelRatio(this.application.sizes.allowedPixelRatio);
    
    const renderPass = new RenderPass(this.application.scene, this.application.camera.instance);
    this.effectComposer.addPass(renderPass);


    
   // film pass
    const filmPass = new FilmPass(
      0.5,   // noise intensity
    );

    this.effectComposer.addPass(filmPass);

    
    
    // const dotScreenPass = new DotScreenPass( new Vector2( 0, 0 ), 6.5, 4.8);
    // this.effectComposer.addPass(dotScreenPass);
    // 
    // const renderPixelatedPass = new RenderPixelatedPass( 3,this.application.scene, this.application.camera.instance );
    // renderPixelatedPass.renderToScreen = true;
    // renderPixelatedPass.normalEdgeStrength = 0;
    // this.effectComposer.addPass( renderPixelatedPass );
    //
    // const glitchPass = new GlitchPass();
    // this.effectComposer.addPass( glitchPass );
    //
    // const rgbShiftPass = new ShaderPass(RGBShiftShader)
    // this.effectComposer.addPass(rgbShiftPass)
    //
    // const unrealBloomPass = new UnrealBloomPass(
    //   new Vector2(this.application.sizes.width, this.application.sizes.height),
    //   0.3, 0.4, 0.6);
    // this.effectComposer.addPass(unrealBloomPass); 



    
    // const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
    // this.effectComposer.addPass(gammaCorrectionPass)



    const outputPass = new OutputPass();
    this.effectComposer.addPass( outputPass );
    
    const smaaPass = new SMAAPass(this.application.sizes.width, this.application.sizes.height);
    this.effectComposer.addPass(smaaPass);
    
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