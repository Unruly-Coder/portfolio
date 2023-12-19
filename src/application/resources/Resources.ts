
import {textures, gltfs, sounds, fonts} from "./sources";
import {TextureLoader, Texture} from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { FontLoader, Font} from "three/examples/jsm/loaders/FontLoader";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Howl } from "howler";
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
class Resources extends EventEmitter {
  
  private readonly loaders: { 
    textureLoader : TextureLoader 
    gltfLoader: GLTFLoader
    fontLoader: FontLoader
  }

  private textureItems: Record<keyof typeof textures, Texture> = {} as Record<keyof typeof textures, Texture>;
  private gltfItems: Record<keyof typeof gltfs, GLTF> = {} as Record<keyof typeof gltfs, GLTF>;
  private audioItems: Record<keyof typeof sounds, Howl> = {} as Record<keyof typeof sounds, Howl>;
  private fontItems: Record<keyof typeof fonts, Font> = {} as Record<keyof typeof fonts, Font>;


  private readonly nrToLoad: number;
  private nrLoaded : number;
  
  constructor() {
    super();  
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( '/libs/draco/' );
    const gtlfLoader = new GLTFLoader();
    gtlfLoader.setDRACOLoader(dracoLoader);
    
    this.loaders = {
      textureLoader: new TextureLoader(),
      gltfLoader: gtlfLoader,
      fontLoader: new FontLoader(),
    }
    
    this.nrToLoad = Object.keys(textures).length + Object.keys(gltfs).length + Object.keys(sounds).length + Object.keys(fonts).length;
    this.nrLoaded = 0
    
    this.load();
  }
  
  private load() {
    const prefix = '';
    
    const textureKeys = Object.keys(textures) as Array<keyof typeof textures>;
    
    textureKeys.forEach((key ) => {
      const source: TextureSource = textures[key];
      
      this.loaders.textureLoader.load(prefix + source.url, (texture) => {
        this.textureItems[key] = texture;
        this.incrementLoaded();
      }, undefined, 
        (error) => {
        console.log(error, key);
      })
    });
    
    
    const gltfKeys = Object.keys(gltfs) as Array<keyof typeof gltfs>;
    gltfKeys.forEach((key) => {
      const source = gltfs[key];
      this.loaders.gltfLoader.load(prefix + source.url, (gltf) => {
        this.gltfItems[key] = gltf;
        this.incrementLoaded();
      }, undefined,
        (error) => {
          console.log(error, key);
        })
    });
    
    const soundKeys = Object.keys(sounds) as Array<keyof typeof sounds>;
    soundKeys.forEach((key) => {
      const source = sounds[key];
      this.audioItems[key] = new Howl({
        src: [prefix + source.url],
        preload: true,
        
        onload: () => {
          this.incrementLoaded();
        },
        onloaderror: (id, error) => {
          console.log(error, key);
        }
      })
    });
    
    const fontKeys = Object.keys(fonts) as Array<keyof typeof fonts>;
    fontKeys.forEach((key) => {
      const source = fonts[key];
      this.loaders.fontLoader.load(prefix + source.url, (font) => {
        this.fontItems[key] = font;
        this.incrementLoaded();
      }, undefined,
        (error) => {
          console.log(error, key);
        })
    });
  }
  
  private incrementLoaded() {
    this.nrLoaded++;
    
    this.emit('progress', this.percentLoaded);
    
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
  
  getAudio<T extends keyof typeof sounds>(key: T): Howl {
    return this.audioItems[key];
  }
  
  getFont<T extends keyof typeof fonts>(key: T): Font {
    return this.fontItems[key];
  }
  
  get percentLoaded() {
    return this.nrLoaded / this.nrToLoad;
  }
}

export const resources = new Resources();