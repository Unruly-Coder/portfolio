import { Clock } from "three";
import EventEmitter from "eventemitter3";

export class Time extends EventEmitter {
  private clock: Clock;
  private lastElapsedTime: number = 0;
  private deltaElapsedTime: number = 0;

  constructor() {
    super();
    this.clock = new Clock();
  }

  start() {
    this.tick();
  }

  getDeltaElapsedTime() {
    return this.deltaElapsedTime;
  }

  getElapsedTime() {
    return this.clock.getElapsedTime();
  }

  tick = () => {
    const elapsedTime = this.clock.getElapsedTime();
    this.deltaElapsedTime = elapsedTime - this.lastElapsedTime;
    this.emit("tick");
    this.lastElapsedTime = elapsedTime;
    requestAnimationFrame(this.tick);
  };
}
