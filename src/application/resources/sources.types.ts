export type SourceType = 'texture' | 'sound' | 'gltf';

interface BaseSource {
  name: string;
  type: SourceType;
}

export interface TextureSource extends BaseSource {
  type: 'texture';
  url: string;
}

export interface SoundSource extends BaseSource {
  type: 'sound';
  url: string;
}

export interface GltfSource extends BaseSource {
  type: 'gltf';
  url: string;
}

export type Source = TextureSource | SoundSource | GltfSource;



