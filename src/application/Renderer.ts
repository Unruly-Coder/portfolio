import { Application } from "./Application";
import { Device } from "./utils/Device";
import { PCFSoftShadowMap, SRGBColorSpace, WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";

export class Renderer {
  readonly renderer: WebGLRenderer;
  private readonly effectComposer: EffectComposer;

  constructor(private application: Application) {
    this.renderer = new WebGLRenderer({
      canvas: document.querySelector("canvas#canvas")!,
      antialias: false,
      depth: true,
      alpha: true,
      stencil: true,
      powerPreference: "high-performance",
    });

    this.renderer.autoClear = false;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setSize(
      this.application.sizes.width,
      this.application.sizes.height,
    );
    this.renderer.setPixelRatio(this.application.sizes.allowedPixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.debug.checkShaderErrors = false;
    
    

    this.effectComposer = new EffectComposer(this.renderer);
    this.effectComposer.setSize(
      this.application.sizes.width,
      this.application.sizes.height,
    );
    this.effectComposer.setPixelRatio(this.application.sizes.allowedPixelRatio);

    const renderPass = new RenderPass(
      this.application.scene,
      this.application.camera.instance,
    );
    this.effectComposer.addPass(renderPass);
    
   if(!Device.isAndroid()) {
      const filmPass = new FilmPass(0.9);
      this.effectComposer.addPass(filmPass);
   }

    const outputPass = new OutputPass();
    this.effectComposer.addPass(outputPass);
    
  }

  resize() {
    this.renderer.setSize(
      this.application.sizes.width,
      this.application.sizes.height,
    );
    this.renderer.setPixelRatio(this.application.sizes.allowedPixelRatio);

    this.effectComposer.setSize(
      this.application.sizes.width,
      this.application.sizes.height,
    );
    this.effectComposer.setPixelRatio(this.application.sizes.allowedPixelRatio);
  }

  update() {
    this.effectComposer.render(this.application.time.getDeltaElapsedTime());
  }
}
