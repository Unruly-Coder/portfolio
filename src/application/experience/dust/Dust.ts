import {AdditiveBlending, BufferGeometry, Float32BufferAttribute, Points, ShaderMaterial, Vector3} from "three";
import dustVertexShader from "./dustVertexShader.glsl";
import dustFragmentShader from "./dustFragmentShader.glsl";
import {Application} from "../../Application";

export class Dust {

  private instance: Points
  private positions: Float32Array;
  private particlesMaterial: ShaderMaterial;
  constructor(private application: Application ,width: number, height: number, deep: number, nrOfParticles: number, size: number = 1) {
    const particlesGeometry = new BufferGeometry()
    this.positions = new Float32Array(nrOfParticles * 3);
    const colors = new Float32Array(nrOfParticles * 4);
    const sizes = new Float32Array(nrOfParticles);

    for(let i = 0; i < nrOfParticles; i++) {
      const y = Math.random() * height;
      const z = Math.random() * deep;
      const x = Math.random() * width;
      
      const colorIndex = i * 4;
      const randomShade = Math.random();
      colors[colorIndex] = (randomShade * 52)/ 255;
      colors[colorIndex+1] = (randomShade * 201) / 255;
      colors[colorIndex+2] = (randomShade * 235) / 255;
      colors[colorIndex+3] = 0.5 + Math.random() * 0.5;


      const index = i * 3;
      this.positions[index] = x;
      this.positions[index + 1] = y * -1;
      this.positions[index + 2] = z;
      
      sizes[i] = Math.max(1,(1 + Math.random())) * this.application.sizes.allowedPixelRatio;
    }
    
    particlesGeometry.setAttribute('position', new Float32BufferAttribute(new Float32Array(this.positions), 3));
    particlesGeometry.setAttribute('color', new Float32BufferAttribute(colors, 4));
    particlesGeometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));

    this.particlesMaterial = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uVelocity: { value: 0.4 },
        uScale: { value: size * 10.0 },
        uUseLight: { value: true },
        uLightPosition: { value: new Vector3(0,0,0) },
        uLightDirection: { value: new Vector3(1,0,0) },
      },
      vertexShader: dustVertexShader,
      fragmentShader: dustFragmentShader,
      transparent: false,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexColors: true,
      precision: 'lowp',
    })
    
    this.instance = new Points(particlesGeometry, this.particlesMaterial)
  }

  addInstanceToScene() {
    this.application.scene.add(this.instance);
  }
  
  setPosition(x: number, y: number, z: number) {
    this.instance.position.set(x, y, z);
  }
  
  update() {
    this.particlesMaterial.uniforms.uTime.value = this.application.time.getElapsedTime();
  }
}