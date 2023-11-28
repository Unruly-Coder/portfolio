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

export const sounds: Record<string, SoundSource> = {}

