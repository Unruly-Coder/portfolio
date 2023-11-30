import { GltfSource, SoundSource} from "./sources.types";



export const textures = {
  flashlightLight: {
    name: 'flashlightLight',
    type: 'texture',
    url: '/textures/flashlight.png',
  },
  lightRay: {
    name: 'lightRay',
    type: 'texture',
    url: '/textures/angryimg2.png',
  },
} as const 

export const gltfs: Record<string, GltfSource> = {}

export const sounds: Record<string, SoundSource> = {
  music: {
    name: 'music',
    type: 'sound',
    url: '/sounds/music.mp3',
  },
  engine: {
    name: 'engine',
    type: 'sound',
    url: '/sounds/engine.mp3',
  },
  impactwave: {
    name: 'impactwave',
    type: 'sound',
    url: '/sounds/impactwave.mp3',
  },

  powerload: {
    name: 'powerload',
    type: 'sound',
    url: '/sounds/powerload.ogg',
  },
  impactmetal: {
    name: 'impactmetal',
    type: 'sound',
    url: '/sounds/impactmetal.ogg',
  },
}

