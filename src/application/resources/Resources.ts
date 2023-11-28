
import { textures, gltfs, sounds } from "./sources";
import {TextureLoader, Texture, AudioLoader} from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { TextureSource } from "./sources.types";
import EventEmitter from "eventemitter3";

/**
 * This class is responsible for loading all the resources
 * and making them available to the rest of the application.
 * 
 * It is an EventEmitter, so you can listen to the 'loaded' event
 * to know when all resources are loaded.
 * 
 * Example:
 * 
 * const resources = new Resources();
 * resources.on('loaded', () => {
 *  // do something with the resources
 *  const texture = resources.getTexture('flashlightLight');
 *  const gltf = resources.getGltf('submarine');
 *  const audio = resources.getAudio('submarineSound');
 *  
 *  // ...
 *  
 *  });
 */
export class Resources extends EventEmitter {
  
  private readonly loaders: { 
    textureLoader : TextureLoader 
    gltfLoader: GLTFLoader
    audioLoader: AudioLoader
  }

  private textureItems: Record<keyof typeof textures, Texture> = {} as Record<keyof typeof textures, Texture>;
  private gltfItems: Record<keyof typeof gltfs, GLTF> = {} as Record<keyof typeof gltfs, GLTF>;
  private audioItems: Record<keyof typeof sounds, AudioBuffer> = {} as Record<keyof typeof sounds, AudioBuffer>;


  private readonly nrToLoad: number;
  private nrLoaded : number;
  
  constructor() {
    super();  
    
    this.loaders = {
      textureLoader: new TextureLoader(),
      gltfLoader: new GLTFLoader(),
      audioLoader: new AudioLoader(),
    }
    
    this.nrToLoad = Object.keys(textures).length;
    this.nrLoaded = 0
    
    this.load();
  }
  
  private load() {
    const prefix = './application/resources';
    const textureKeys = Object.keys(textures) as Array<keyof typeof textures>;
    
    textureKeys.forEach((key ) => {
      const source: TextureSource = textures[key];

      this.loaders.textureLoader.load(prefix + source.url, (texture) => {
        console.log(texture);
        this.textureItems[key] = texture;
        this.incrementLoaded();
      }, undefined, (err) => {
        console.log(err);
      })
    });
    
    const gltfKeys = Object.keys(gltfs) as Array<keyof typeof gltfs>;
    gltfKeys.forEach((key) => {
      const source = gltfs[key];
      this.loaders.gltfLoader.load(prefix + source.url, (gltf) => {
        this.gltfItems[key] = gltf;
        this.incrementLoaded();
      })
    });
    
    const soundKeys = Object.keys(sounds) as Array<keyof typeof sounds>;
    soundKeys.forEach((key) => {
      const source = sounds[key];
      this.loaders.audioLoader.load(prefix + source.url, (audio) => {
        this.audioItems[key] = audio;
        this.incrementLoaded();
      });
    });
  }
  
  private incrementLoaded() {
    this.nrLoaded++;
    
    console.log(`Loaded ${this.nrLoaded} of ${this.nrToLoad}`);
    if (this.nrLoaded === this.nrToLoad) {
      this.emit('loaded');
    }
  }

  getTexture<T extends keyof typeof textures>(key: T):  Texture {
    return this.textureItems[key];
  }
  
  getGltf<T extends keyof typeof gltfs>(key: T): GLTF {
    return this.gltfItems[key];
  }
  
  getAudio<T extends keyof typeof sounds>(key: T): AudioBuffer {
    return this.audioItems[key];
  }
}