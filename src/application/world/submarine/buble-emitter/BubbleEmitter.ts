import {Application} from "../../../Application";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  Mesh,
  ShaderMaterial,
  Vector3,
  Object3D,
  AdditiveBlending
} from "three";
import bubbleVertexShader from "./bubbleVertexShader.glsl";
import bubbleFragmentShader from "./bubbleFragmentShader.glsl";


export class BubbleEmitter {
  

  instance!: Object3D;
  private bubbles!: Points;
  private material!: ShaderMaterial;
  
  constructor(private application: Application) {
    this.createBubbleEmitter();
  }
  
  
  createBubbleEmitter() {
    const nrOfBubbles = 10;
    const geometry = new BufferGeometry();
    
    this.material = new ShaderMaterial({
      vertexShader: bubbleVertexShader,
      fragmentShader: bubbleFragmentShader,
      vertexColors: true,
      blending: AdditiveBlending,
      uniforms: {
        uGravity: { value: -8 },
        uLifeTime: { value: 5 },
        uTime: { value: 0 },
        uStartPosition: { value: new Vector3(0,0,0) },
        color: { value: new Vector3(0.5,0.5,0.5) },
        
      }
    })
    const positions = new Float32Array(nrOfBubbles * 3);
    const colors = new Float32Array(nrOfBubbles * 4);
    const randoms = new Float32Array(nrOfBubbles);
    
    for(let i = 0; i < nrOfBubbles; i++) {
      randoms[i] = Math.random();
      
      const positionIndex = i * 3;
      positions[positionIndex] = 0;
      positions[positionIndex+ 1] = 0;
      positions[positionIndex + 2] = 0;
      

      const colorIndex = i * 4;
      colors[colorIndex] = (randoms[i] * 52)/ 255;
      colors[colorIndex+1] = (randoms[i] * 201) / 255;
      colors[colorIndex+2] = (randoms[i] * 235) / 255;
      colors[colorIndex+3] = 0.2 + Math.random() * 0.2;
    }
    
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 4));
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('random', new Float32BufferAttribute(randoms, 1));
    
    this.bubbles = new Points(geometry, this.material);
    this.application.scene.add(this.bubbles);
    this.instance = new Object3D();
  }
  
  startEmit() {
    this.material.uniforms.uForce.value = 1;
  }
  
  stopEmit() {
    this.material.uniforms.uForce.value = 0;
  }
  
  update() {
    this.instance.getWorldPosition(this.material.uniforms.uStartPosition.value);
    this.material.uniforms.uTime.value = this.application.time.clock.getElapsedTime();
  }
}