import EventEmitter from "eventemitter3";
import {Vector2} from "three";
import {Application} from "../Application";

export class MobileControl extends EventEmitter {
  
  private driveButton = document.createElement('button');
  private powerMoveButton = document.createElement('button');
  private joystick = document.createElement('button');
  private isEnabled = false;
  
  private isJoystickActive = false;
  constructor(private application: Application) {
    super();
    this.initDriveButton();
    this.initPowerMoveButton();
    this.initJoystick();

    window.addEventListener('touchmove', ev => {
        ev.preventDefault();
      
    }, { passive: false });

    window.addEventListener('touchend', ev => {
      ev.preventDefault();
    }, { passive: false });
  }
  
  enable() {
    this.showButton(this.driveButton);
    this.showButton(this.powerMoveButton);
    this.showButton(this.joystick)
    this.isEnabled = true;
  }
  
  disable() {
    if(this.isEnabled) {
      this.hideButton(this.driveButton);
      this.hideButton(this.powerMoveButton);
      this.hideButton(this.joystick);
      this.isEnabled = false;
    }
  }
  
  hideButton(element: HTMLElement) {
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
  }
  
  showButton(element: HTMLElement) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'all';
  }
  
  initDriveButton() {
    this.driveButton.innerHTML = 'MOVE';
    this.driveButton.classList.add('drive-button', 'mobile-button');
    
    this.hideButton(this.driveButton);
    
    this.driveButton.addEventListener('touchstart', (event) => {
      event.preventDefault();
      this.driveButton.classList.add('pressed');
      this.emit('start-move');
    }, {passive: false});
    this.driveButton.addEventListener('touchend', (event) => {
      event.preventDefault();
      this.driveButton.classList.remove('pressed');
      this.emit('stop-move');
    }, {passive: false});
    document.body.appendChild(this.driveButton);
  }
  
  initPowerMoveButton() {
    this.powerMoveButton.innerHTML = 'POWER';
    this.powerMoveButton.classList.add('power-move-button', 'mobile-button');
    
    this.hideButton(this.powerMoveButton);
    
    this.powerMoveButton.addEventListener('touchstart', (event) => {
      event.preventDefault();
      this.powerMoveButton.classList.add('pressed');
      this.emit('start-power');
    }, false);
    this.powerMoveButton.addEventListener('touchend', (event) => {
      event.preventDefault();
      this.powerMoveButton.classList.remove('pressed');
      this.emit('stop-power');
    }, false);
    document.body.appendChild(this.powerMoveButton);
  }
  
  private setDirection(x: number, y: number) {
    const center = { x: 20+ 155/2, y: this.application.sizes.height - 155/2 - 20};
    
    const dx = x - center.x;
    const dy = y - center.y;

    const vector = new Vector2(dx, dy);
    vector.normalize();

    this.setJoystickStyleProperties(vector.x, vector.y)

    vector.y *= -1;
    this.emit('joystick-move', vector);
  }
  
  private setJoystickStyleProperties(x: number, y: number) {
    this.joystick.style.setProperty('--vX', x.toString());
    this.joystick.style.setProperty('--vY', y.toString());
  }
  
  initJoystick() {
    this.joystick.classList.add('joystick-button', 'mobile-button');
    
    
    this.hideButton(this.joystick);
    
    this.joystick.addEventListener('touchstart', (event) => {
      event.preventDefault();
      this.joystick.classList.add('pressed');
      this.isJoystickActive = true;
      

      this.setDirection(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
    }, false);
    
    this.joystick.addEventListener('touchmove', (event) => {
      event.preventDefault();
      if(this.isJoystickActive) {
        const touch = event.targetTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        
        this.setDirection(x, y);
      }
    });
    
    this.joystick.addEventListener('touchend', (event) => {
      event.preventDefault();
      this.joystick.classList.remove('pressed');
      this.isJoystickActive = false;
    });
    
    document.body.appendChild(this.joystick);
  }
  
  
}