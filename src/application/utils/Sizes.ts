import EventEmitter from "eventemitter3";

/**
 * This clas is responsible for keeping track of the window size
 * and emitting a 'resize' event when the window is resized.
 * 
 * Example:
 * 
 * const sizes = new Sizes();
 * sizes.on('resize', () => {
 * // do something with the new sizes
 * const width = sizes.width;
 * const height = sizes.height;
 * const aspectRatio = sizes.aspectRatio;
 * 
 * // ...
 * 
 * });
 */
export class Sizes extends EventEmitter {
   private _width: number;
   private _height: number;
   private _pixelRatio: number;
   
  constructor() {
    super();
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._pixelRatio = window.devicePixelRatio;
    
    window.addEventListener('resize', () => {
      this._width = window.innerWidth;
      this._height = window.innerHeight;
      this.emit('resize');
    });
  }
  
  get width() {
    return this._width;
  }
  
  get height() {
    return this._height;
  }
  
  get widthHalf() {
    return this._width / 2;
  }
  
  get heightHalf() {
    return this._height / 2;
  }
  
  get aspectRatio() {
    return this._width / this._height;
  }
  
  private get pixelRatio() {
    return this._pixelRatio;
  }
  
  get allowedPixelRatio() {
    return Math.min(this.pixelRatio, 2);
  }
  
}