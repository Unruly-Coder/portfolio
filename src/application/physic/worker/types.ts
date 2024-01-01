import { Body, ContactEquation } from "cannon-es";

type MessageShape<T extends string, K> = { operation: T; payload: K };

export type MessageWorkerMap = {
  step: MessageShape<"step", Float32Array>;
  addBody: MessageShape<"addBody", number>;
  collide: MessageShape<"collide", WorkerCollideEvent>;
};

export interface CannonCollideEvent {
  body: Body;
  contact: ContactEquation;
  target: Body;
  type: "collide";
}

export interface WorkerCollideEvent {
  bodyId: number;
  targetId: number;
  collisionFilters: {
    bodyFilterGroup: number;
    bodyFilterMask: number;
    targetFilterGroup: number;
    targetFilterMask: number;
  };
  contact: {
    bi: string;
    bj: string;
    /** Normal of the contact, relative to the colliding body */
    contactNormal: number[];
    /** Contact point in world space */
    contactPoint: number[];
    id: number;
    impactVelocity: number;
    ni: number[];
    ri: number[];
    rj: number[];
  };
}

export type WorkerMessage = MessageWorkerMap[keyof MessageWorkerMap];
