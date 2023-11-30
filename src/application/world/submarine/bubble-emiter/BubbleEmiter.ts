import {
  Object3D,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  Quaternion,
  ArrowHelper,
  BufferGeometry,
  PointsMaterial, Points, BufferAttribute, AdditiveBlending
} from "three";
import {Application} from "../../../Application";

export class BubbleEmitter {

  instance!: Object3D;
  
  private readonly nrOfBubbles = 65;
  private readonly maxLifeTime = 0.6;
  private readonly maxEmitPerStep = 1;
  private readonly maxEmitInterval = 0.1;
  
  private bubbles?: Points;
  private isEmitting: boolean = false;
  private lastEmitTime: number = 0;
  private bubblesAge: Float32Array = new Float32Array(this.nrOfBubbles).fill(0);
  constructor(private application: Application) {
    this.initBubbleEmitter();
  }

  private initBubbleEmitter() {
    const boxSize = 0.3;

    const boxGeometry = new BoxGeometry( boxSize, boxSize, boxSize );
    const boxMaterial = new MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
    const box = new Mesh( boxGeometry, boxMaterial );
    box.position.set(boxSize/2 * -1, boxSize/2 * -1, boxSize/2 * -1);

    const arrowHelper = new ArrowHelper(
      new Vector3(0,0,-1),
      new Vector3(0,0,0), 0.5, 'red');
    box.add(arrowHelper);

    this.instance = box;
  }
  
  private getEmitterPosition() {
    const emitterPosition = this.instance.getWorldPosition(new Vector3());
    this.instance.getWorldPosition(emitterPosition);
    return emitterPosition;
  }

  initBubbles() {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(this.nrOfBubbles * 3);
    const colors = new Float32Array(this.nrOfBubbles * 4);

    const emitterPosition = this.getEmitterPosition()
    
    for(let i = 0; i < this.nrOfBubbles; i++) {
      const positionIndex = i * 3;
      const colorIndex = i * 4;
      
      positions[positionIndex] = emitterPosition.x;
      positions[positionIndex + 1] = emitterPosition.y;
      positions[positionIndex + 2] = emitterPosition.z;
      
      colors[colorIndex] = 1;
      colors[colorIndex + 1] = 1;
      colors[colorIndex + 2] = 1;
      colors[colorIndex + 3] = 0;
    }
    
    const material = new PointsMaterial({
      vertexColors: true,
      size: 0.4,
      transparent: true,
      opacity: 0.5,
      blending: AdditiveBlending,
      
    });
    
    this.bubbles = new Points(geometry, material);
    this.bubbles.frustumCulled = false;
    this.bubbles.geometry.setAttribute('position', new BufferAttribute(positions, 3));
    this.bubbles.geometry.setAttribute('color', new BufferAttribute(colors, 4));

    this.application.scene.add(this.bubbles);
  }

  startEmitting() {
    this.isEmitting = true;
  }

  stopEmitting() {
    this.isEmitting = false;
  }

  get emitterDirection() {
    const vector = new Vector3(0,0,1)
    const quaternion = new Quaternion();
    this.instance.getWorldQuaternion(quaternion)
    vector.applyQuaternion(quaternion)
    return vector.normalize();
  }

  private emitBubble(bubbleIndex: number) {
    if(!this.bubbles) return;
    
    this.bubblesAge[bubbleIndex] = 0;
    this.lastEmitTime = this.application.time.getElapsedTime();

    const positionIndex = bubbleIndex * 3;
    const emitterPosition = this.getEmitterPosition();
    this.bubbles.geometry.attributes.position.array[positionIndex] = emitterPosition.x;
    this.bubbles.geometry.attributes.position.array[positionIndex + 1] = emitterPosition.y;
    this.bubbles.geometry.attributes.position.array[positionIndex + 2] = emitterPosition.z;
  }

  update() {
    if(this.isEmitting) {
      this.instance.rotation.z += this.application.time.getDeltaElapsedTime() * 2;
    }

    if(this.bubbles) {
      for(let i = 0; i < this.nrOfBubbles; i++) {
        let emitted= 0;
        
        const elapsedTime = this.application.time.getElapsedTime();
        const deltaTime = this.application.time.getDeltaElapsedTime();
        const particleAge = this.bubblesAge[i];
        const deltaLastEmit = elapsedTime - this.lastEmitTime;
        const isBubbleInactive = particleAge > this.maxLifeTime;
        const emmitReachedLimit = emitted >= this.maxEmitPerStep;
        const intervalReached = deltaLastEmit > this.maxEmitInterval;
        const canEmit = 
          isBubbleInactive && 
          this.isEmitting && 
          !emmitReachedLimit && 
          (this.lastEmitTime === 0 || intervalReached);
        
        if(canEmit) {
          this.emitBubble(i);
          emitted++;
        }


        if(this.lastEmitTime === 0) {
          this.bubbles.geometry.attributes.color.setW(i,0);
          this.bubbles.geometry.attributes.color.needsUpdate = true;
        } else {
          const positionIndex = i * 3;
          const emitterPosition = this.getEmitterPosition();


          this.bubbles.geometry.attributes.position.array[positionIndex] -= this.emitterDirection.x * deltaTime * 2;
          this.bubbles.geometry.attributes.position.array[positionIndex + 1] -= this.emitterDirection.y * deltaTime * 2;
          this.bubbles.geometry.attributes.position.array[positionIndex + 2] -= this.emitterDirection.z * deltaTime * 2;
          this.bubbles.geometry.attributes.position.needsUpdate = true;


          const opacityFactor = Math.max(0, Math.min(1, this.maxLifeTime - this.bubblesAge[i] / this.maxLifeTime));
          this.bubbles.geometry.attributes.color.setW(i, opacityFactor);
          this.bubbles.geometry.attributes.color.needsUpdate = true;
        }
        
        this.bubblesAge[i] += deltaTime;
        if(this.bubblesAge[i] > this.maxLifeTime) {
          this.bubblesAge[i] = this.maxLifeTime;
        }
      }
    }
    
    
  }
}