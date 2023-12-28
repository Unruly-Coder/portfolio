import { Application } from "./Application";
import { PCFSoftShadowMap, SRGBColorSpace, WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";

import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";

export class Renderer {
  readonly renderer: WebGLRenderer;
  private readonly effectComposer: EffectComposer;

  constructor(private application: Application) {
    this.renderer = new WebGLRenderer({
      canvas: document.querySelector("canvas#canvas")!,
      antialias: false,
      depth: false,
      alpha: true,
      stencil: false,
      powerPreference: "high-performance",
    });

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

    // const smaaPass = new SMAAPass(this.application.sizes.width, this.application.sizes.height);
    // this.effectComposer.addPass(smaaPass);

    const filmPass = new FilmPass(0.9);
    this.effectComposer.addPass(filmPass);

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
