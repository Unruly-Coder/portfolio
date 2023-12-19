import {Group} from "three";
import {Submarine} from "./Submarine";
import {BubbleEmitter} from "./bubble-emiter/BubbleEmiter";
import {Application} from "../../Application";


export class Bubbles {
  
  readonly instance:Group = new Group();
  
  private bubbleEmitters: BubbleEmitter[] = [];
  private isBubbling: boolean = false;
  
  constructor(private application: Application, private submarine: Submarine) {
    this.crateBubbleEmitters();
  }
  private crateBubbleEmitters() {

    const sides: string[] = ["left", "right"];
    const verticalAngles: number[] = [0.25, 0.5, 0.75];
    const horizontalAngles: number[] = [0.25, 0.75];
    
      sides.forEach((side) => {
        verticalAngles.forEach((verticalAngle) => {
          horizontalAngles.forEach((horizontalAngle) => {
            const bubbleEmitter = new BubbleEmitter(this.application);
            bubbleEmitter.instance.position.setFromSphericalCoords(this.submarine.submarineRadius + 0.25, Math.PI * verticalAngle, Math.PI * (side === "right" ? horizontalAngle : horizontalAngle + 1));
            bubbleEmitter.instance.lookAt(0,0,0);
            this.bubbleEmitters.push(bubbleEmitter);
            
            this.instance.add(bubbleEmitter.instance);
            bubbleEmitter.initBubbles();
          })
        })
      })
  }
  
  startBubbling() {
    this.isBubbling = true;
  }
  
  stopBubbling() {
    this.isBubbling = false;
  }
  
  update() {
      this.bubbleEmitters.forEach((bubbleEmitter) => {
 
        if(this.isBubbling) {
          
          if(this.submarine.direction.dot(bubbleEmitter.getEmitterDirection()) > 0.05) {
            bubbleEmitter.startEmitting();
          } else {
            bubbleEmitter.stopEmitting();
          }
        } else {
          bubbleEmitter.stopEmitting();
        }
        bubbleEmitter.update();
      })
  }
}