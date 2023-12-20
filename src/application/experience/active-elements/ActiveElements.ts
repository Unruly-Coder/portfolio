import {ActiveElement} from "./elements/ActiveElement";

import {Object3D} from "three";
import {Application} from "../../Application";
import {Github} from "./elements/Github";
import {Mail} from "./elements/Mail";
import {Linkedin} from "./elements/Linkedin";

export class ActiveElements {
  private activeElements: Map<Object3D, ActiveElement> = new Map<Object3D, ActiveElement>();
  private activeElementInstances: Object3D[] = [];
  private rangeData = { range: 0, distance: 0};
  private focusedElement: ActiveElement | undefined;
  
  constructor(
    private application: Application,
    private getRangeFactor: (element: Object3D, data: { range: number, distance: number}) => { range: number, distance: number},
    private getDistance2d: (element: Object3D) => number,
    )  {


    const linkedin = new Linkedin(application);
    linkedin.addInstanceToScene();
    linkedin.setPosition(8, -3, 0);


    const github = new Github(application);
    github.addInstanceToScene();
    github.setPosition(8, -6, 0);

    const mail = new Mail(application);
    mail.addInstanceToScene();
    mail.setPosition(8, -9, 0);
    
    this.activeElements.set(github.instance, github);
    this.activeElements.set(linkedin.instance, linkedin);
    this.activeElements.set(mail.instance, mail);
    
    this.activeElementInstances = Array.from(this.activeElements.keys());
    
    document.addEventListener('keydown', (event) => {
      if(event.key === 'Enter' && this.focusedElement) {
        const win =  window.open(this.focusedElement.link.url, '_blank');
        if(!win) {
          alert('Please allow popups for this website');
        }
      }
    });
  }
  
  update() {
    const threshold = 0.9;
    let range = -1;
    let focusedElementCandidate: ActiveElement | undefined;
    this.activeElementInstances.forEach((instance) => {
      const elementRange = this.getRangeFactor(instance, this.rangeData);
      const distance2d = this.getDistance2d(instance);
      const activeElement = this.activeElements.get(instance);
      
      if(!activeElement) return;
   
      if(elementRange.range > threshold && elementRange.range > range) {
        range = elementRange.range;
        focusedElementCandidate = activeElement;
      } 
      
      if(elementRange.range > threshold) {
        if(!activeElement.isActivated) {
          activeElement.activate();
        }
      } else {
        if(activeElement.isActivated) {
          activeElement.deactivate();
        }
      }

      if(distance2d < 2.5 && activeElement.isVisible) {
        activeElement.hide()
      } else if(distance2d > 2.5 && !activeElement.isVisible) {
        activeElement.show();
      }
      
      activeElement.update();
      
    })
    
    if(focusedElementCandidate && !focusedElementCandidate.isFocused) {
      if(this.focusedElement !== focusedElementCandidate) {
        this.focusedElement?.unfocus();
      }
      focusedElementCandidate.focus()
      this.focusedElement = focusedElementCandidate;
    }
    
    if(!focusedElementCandidate && this.focusedElement) {
      this.focusedElement.unfocus();
      this.focusedElement = undefined;
    }
  }
}