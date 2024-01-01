export type Triplet = [x: number, y: number, z: number];
export type Quadruplet = [x: number, y: number, z: number, w: number];
type MessageShape<T extends string, K> = { operation: T; payload: K };
export type WithId<T> = { id: number } & T;

type ShapeType = "box" | "sphere";

interface ShapeBase {
  type: ShapeType;
  offset?: Triplet;
  orientation?: Quadruplet;
}

interface BoxShape extends ShapeBase {
  type: "box";
  halfExtents: Triplet;
}

interface SphereShape extends ShapeBase {
  type: "sphere";
  radius: number;
}

type Shape = BoxShape | SphereShape;

type InitData = {
  gravity: Triplet;
  broadphase: "SAPBroadphase" | "NaiveBroadphase";
  allowSleep: boolean;
  defaultLinearDamping?: number;
  defaultAngularDamping?: number;
  defaultLinearFactor?: Triplet;
};

type AddBodyData = {
  position?: Triplet;
  quaternion?: Quadruplet;
  shapes: Shape[];
  mass: number;
  allowSleep?: boolean;
  sleepSpeedLimit?: number;
  linearDamping?: number;
  angularDamping?: number;
  linearFactor?: Triplet;
};

type StepData = {
  deltaTime: number;
  transferBuffer: Float32Array;
};

export type MessageMap = {
  init: MessageShape<"init", InitData>;
  step: MessageShape<"step", StepData>;
  addBody: MessageShape<"addBody", AddBodyData>;
  applyImpulse: MessageShape<"applyImpulse", WithId<{ impulse: Triplet }>>;
  applyForce: MessageShape<"applyForce", WithId<{ force: Triplet }>>;
  applyLocalForce: MessageShape<"applyLocalForce", WithId<{ force: Triplet }>>;
  applyLocalImpulse: MessageShape<
    "applyLocalImpulse",
    WithId<{ impulse: Triplet }>
  >;
  setBodyPosition: MessageShape<
    "setBodyPosition",
    WithId<{ position: Triplet }>
  >;
  setBodyCollisionResponse: MessageShape<
    "setBodyCollisionResponse",
    WithId<{ isCollisionResponse: boolean }>
  >;
};

export type ApiMessage = MessageMap[keyof MessageMap];
