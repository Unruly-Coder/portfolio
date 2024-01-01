import { Howler } from "howler";
import { Application } from "./Application";
import { resources } from "./resources/Resources";

export class Sound {
  private isMuted = false;
  private audioButton = document.getElementById("audio");

  constructor(private application: Application) {
    this.toggleMute();
  }

  init() {
    this.sounds.music.loop(true);
    this.sounds.music.volume(0.4);
    this.sounds.music.play();

    this.sounds.engine.loop(true);
    this.sounds.engine.volume(0);
    this.sounds.engine.play();

    this.sounds.powerload.loop(true);
    this.sounds.powerload.volume(0);
    this.sounds.powerload.play();

    this.sounds.impactwave.loop(false);
    this.sounds.impactwave.volume(0.5);

    this.sounds.impactmetal.loop(false);
    this.sounds.impactmetal.volume(1);

    this.sounds.bigimpact.loop(false);
    this.sounds.bigimpact.volume(0.5);

    this.initMuteButton();
    this.toggleMute();
  }

  sounds = {
    music: resources.getAudio("music"),
    engine: resources.getAudio("engine"),
    impactwave: resources.getAudio("impactwave"),
    powerload: resources.getAudio("powerload"),
    impactmetal: resources.getAudio("impactmetal"),
    bigimpact: resources.getAudio("bigimpact"),
  };

  initMuteButton() {
    if (this.audioButton) {
      this.audioButton.classList.add("visible");
      this.audioButton.addEventListener("pointerup", () => {
        this.toggleMute();
      });
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);

    if (this.audioButton) {
      if (this.isMuted) {
        this.audioButton.classList.add("muted");
      } else {
        this.audioButton.classList.remove("muted");
      }
    }
  }
}
