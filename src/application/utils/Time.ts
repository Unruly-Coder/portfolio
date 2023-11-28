import * as THREE from "three";
import EventEmitter from "eventemitter3";

export class Time extends EventEmitter {
  
  readonly clock: THREE.Clock;
  private lastElapsedTime: number = 0;
  
  deltaElapsedTime: number = 0;
  
  constructor() {
    super();
    this.clock = new THREE.Clock();
  }
  
  start() {
    this.tick();
  }

  tick() {
    const elapsedTime = this.clock.getElapsedTime();
    this.deltaElapsedTime = elapsedTime - this.lastElapsedTime;
    this.lastElapsedTime = elapsedTime;
    
    this.emit("tick");
    
    requestAnimationFrame(() => {
      this.tick();
    });
  }
}