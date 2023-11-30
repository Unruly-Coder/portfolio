import { Howler } from 'howler';
import {Application} from "./Application";

export class Sound {
  
  private isMuted = false;
  
  constructor(private application: Application) {
    this.init();
    this.toggleMute();
  }
  
  init() {
    this.sounds.music.loop(true);
    this.sounds.music.volume(0.2);
    this.sounds.music.play();

    this.sounds.engine.loop(true);
    this.sounds.engine.volume(0);
    this.sounds.engine.play();
    
    this.sounds.powerload.loop(true)
    this.sounds.powerload.volume(0);
    this.sounds.powerload.play();
    
    this.sounds.impactwave.loop(false)
    this.sounds.impactwave.volume(0.5);
    
    this.sounds.impactmetal.loop(false)
    this.sounds.impactmetal.volume(1);
    
    this.initMuteButton();
  }
  
  sounds = {
    music: this.application.resources.getAudio('music'),
    engine: this.application.resources.getAudio('engine'),
    impactwave: this.application.resources.getAudio('impactwave'),
    powerload: this.application.resources.getAudio('powerload'),
    impactmetal: this.application.resources.getAudio('impactmetal'),
  }
  
  initMuteButton() {
    const muteButton = document.getElementById('mute');
    
    if(muteButton) {
      muteButton.addEventListener('click', () => {
        this.toggleMute();
      })
    }
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
  }
}