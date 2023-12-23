import {
  Object3D,
  Vector3,
  Quaternion,
  BufferGeometry,
  Points,
  BufferAttribute,
  AdditiveBlending,
  ShaderMaterial,
} from "three";
import { resources } from "../../../resources/Resources";

import bubbleVertexShader from "./bubbleVertexShader.glsl";
import bubbleFragmentShader from "./bubbleFragmentShader.glsl";

import { Application } from "../../../Application";

export class BubbleEmitter {
  instance: Object3D = new Object3D();

  private readonly worldPosition = new Vector3();

  private readonly nrOfBubbles = 30;
  private readonly maxLifeTime = 0.46;
  private readonly maxEmitPerStep = 1;
  private readonly maxEmitInterval = 0.0001;

  private bubbles?: Points;
  private isEmitting: boolean = false;
  private lastEmitTime: number = 0;
  private bubblesAge: Float32Array = new Float32Array(this.nrOfBubbles).fill(0);
  private bubblesRandom: Float32Array = new Float32Array(this.nrOfBubbles).fill(
    0,
  );

  private material?: ShaderMaterial;

  private worldQuaternion = new Quaternion();
  private emitterDirectionVector = new Vector3(0, 0, 1);
  constructor(private application: Application) {}

  private getEmitterPosition() {
    return this.instance.getWorldPosition(this.worldPosition);
  }

  initBubbles() {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(this.nrOfBubbles * 3);
    const colors = new Float32Array(this.nrOfBubbles * 4);
    const sizes = new Float32Array(this.nrOfBubbles);
    const rotations = new Float32Array(this.nrOfBubbles);

    const emitterPosition = this.getEmitterPosition();

    for (let i = 0; i < this.nrOfBubbles; i++) {
      const positionIndex = i * 3;
      const colorIndex = i * 4;

      this.bubblesRandom[i] = Math.random();

      positions[positionIndex] = emitterPosition.x;
      positions[positionIndex + 1] = emitterPosition.y;
      positions[positionIndex + 2] = emitterPosition.z;

      colors[colorIndex] = this.bubblesRandom[i] * 0.7;
      colors[colorIndex + 1] = this.bubblesRandom[i] * 0.7;
      colors[colorIndex + 2] = this.bubblesRandom[i];
      colors[colorIndex + 3] = 0;

      sizes[i] = this.bubblesRandom[i] * 1.5;
      rotations[i] = this.bubblesRandom[i] * Math.PI * 2;
    }

    this.material = new ShaderMaterial({
      uniforms: {
        pointTexture: { value: resources.getTexture("engineBubbles") },
        uTime: { value: 0 },
      },
      vertexShader: bubbleVertexShader,
      fragmentShader: bubbleFragmentShader,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
      precision: "lowp",
    });

    this.bubbles = new Points(geometry, this.material);
    this.bubbles.frustumCulled = false;
    this.bubbles.geometry.setAttribute(
      "position",
      new BufferAttribute(positions, 3),
    );
    this.bubbles.geometry.setAttribute("color", new BufferAttribute(colors, 4));
    this.bubbles.geometry.setAttribute("size", new BufferAttribute(sizes, 1));
    this.bubbles.geometry.setAttribute(
      "rotation",
      new BufferAttribute(rotations, 1),
    );

    this.application.scene.add(this.bubbles);
  }

  startEmitting() {
    this.isEmitting = true;
  }

  stopEmitting() {
    this.isEmitting = false;
  }

  getEmitterDirection() {
    this.emitterDirectionVector.set(0, 0, 1);
    this.instance.getWorldQuaternion(this.worldQuaternion);
    this.emitterDirectionVector.applyQuaternion(this.worldQuaternion);
    return this.emitterDirectionVector;
  }

  private emitBubble(bubbleIndex: number, emitterPosition: Vector3) {
    if (!this.bubbles) return;

    this.bubblesAge[bubbleIndex] = 0;
    this.lastEmitTime = this.application.time.getElapsedTime();

    const positionIndex = bubbleIndex * 3;

    this.bubbles.geometry.attributes.position.array[positionIndex] =
      emitterPosition.x;
    this.bubbles.geometry.attributes.position.array[positionIndex + 1] =
      emitterPosition.y;
    this.bubbles.geometry.attributes.position.array[positionIndex + 2] =
      emitterPosition.z;
  }

  update() {
    if (this.bubbles && this.material) {
      this.material.uniforms.uTime.value =
        this.application.time.getElapsedTime();
      const emitterPosition = this.getEmitterPosition();
      const emitterDirection = this.getEmitterDirection();

      for (let i = 0; i < this.nrOfBubbles; i++) {
        let emitted = 0;

        const elapsedTime = this.application.time.getElapsedTime();
        const deltaTime = this.application.time.getDeltaElapsedTime();
        const particleAge = this.bubblesAge[i];
        const deltaLastEmit = elapsedTime - this.lastEmitTime;
        const isBubbleInactive = particleAge >= this.maxLifeTime;
        const emmitReachedLimit = emitted >= this.maxEmitPerStep;
        const intervalReached = deltaLastEmit > this.maxEmitInterval;
        const canEmit =
          isBubbleInactive &&
          this.isEmitting &&
          !emmitReachedLimit &&
          (this.lastEmitTime === 0 || intervalReached);

        if (canEmit) {
          this.emitBubble(i, emitterPosition);
          emitted++;
        }

        if (this.bubbles.geometry.attributes.color.array[i * 4] === 0) {
          return;
        }

        if (this.lastEmitTime === 0) {
          this.bubbles.geometry.attributes.color.setW(i, 0);
          this.bubbles.geometry.attributes.color.needsUpdate = true;
        } else {
          const positionIndex = i * 3;

          const speed = deltaTime * this.bubblesRandom[i] * 3;
          const v = Math.sin(this.bubblesRandom[i] * elapsedTime) * 0.1;
          const v2 = Math.cos(this.bubblesRandom[i] * elapsedTime) * 0.3;

          this.bubbles.geometry.attributes.position.array[positionIndex] -=
            (v + emitterDirection.x) * speed;
          this.bubbles.geometry.attributes.position.array[positionIndex + 1] -=
            (v2 + emitterDirection.y) * speed;
          this.bubbles.geometry.attributes.position.array[positionIndex + 2] -=
            (v + emitterDirection.z) * speed;
          this.bubbles.geometry.attributes.position.needsUpdate = true;

          const lifeFactor = Math.max(
            0,
            Math.min(
              1,
              this.maxLifeTime - this.bubblesAge[i] / this.maxLifeTime,
            ),
          );
          if (this.isEmitting) {
            this.bubbles.geometry.attributes.color.setW(i, lifeFactor * 0.15);
            this.bubbles.geometry.attributes.color.needsUpdate = true;
          } else {
            this.bubbles.geometry.attributes.color.array[i * 4 + 3] -=
              deltaTime * 0.2;
            this.bubbles.geometry.attributes.color.needsUpdate = true;
          }

          this.bubbles.geometry.attributes.size.array[i] =
            this.bubblesRandom[i] *
            3.5 *
            Math.pow(1 - lifeFactor, 2) *
            Math.sin(this.bubblesRandom[i]);
          this.bubbles.geometry.attributes.size.needsUpdate = true;
        }

        this.bubblesAge[i] += deltaTime;
        if (this.bubblesAge[i] > this.maxLifeTime) {
          this.bubblesAge[i] = this.maxLifeTime;
        }
      }
    }
  }
}
