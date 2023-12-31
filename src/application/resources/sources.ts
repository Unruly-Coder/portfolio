import { GltfSource, SoundSource, FontSource } from "./sources.types";
export const textures = {
  flashlightLight: {
    name: "flashlightLight",
    type: "texture",
    url: "/textures/flashlight.png",
  },
  lightRay: {
    name: "lightRay",
    type: "texture",
    url: "/textures/beam.png",
  },
  lightRay2: {
    name: "lightRay2",
    type: "texture",
    url: "/textures/beam2.png",
  },
  engineBubbles: {
    name: "engineBubbles",
    type: "texture",
    url: "/textures/light_01.png",
  },
  enter: {
    name: "enter",
    type: "texture",
    url: "/textures/enter.png",
  },
} as const;

export const gltfs: Record<string, GltfSource> = {
  map: {
    name: "map",
    type: "gltf",
    url: "/models/map.glb",
  },
  plank_1: {
    name: "plank_1",
    type: "gltf",
    url: "/models/plank_1.glb",
  },
  submarine: {
    name: "submarine",
    type: "gltf",
    url: "/models/submarine.glb",
  },
  character: {
    name: "character",
    type: "gltf",
    url: "/models/character.glb",
  },
};

export const sounds: Record<string, SoundSource> = {
  music: {
    name: "music",
    type: "sound",
    url: "/sounds/music.mp3",
  },
  engine: {
    name: "engine",
    type: "sound",
    url: "/sounds/engine.mp3",
  },
  impactwave: {
    name: "impactwave",
    type: "sound",
    url: "/sounds/impactwave.mp3",
  },

  powerload: {
    name: "powerload",
    type: "sound",
    url: "/sounds/powerload.mp3",
  },
  impactmetal: {
    name: "impactmetal",
    type: "sound",
    url: "/sounds/impactmetal.mp3",
  },
  bigimpact: {
    name: "bigimpact",
    type: "sound",
    url: "/sounds/bigimpact.mp3",
  },
};

export const fonts: Record<string, FontSource> = {
  optimerbold: {
    name: "optimerbold",
    type: "font",
    url: "/fonts/optimer_bold.typeface.json",
  },
};
