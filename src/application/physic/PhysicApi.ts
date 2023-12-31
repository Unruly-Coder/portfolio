import { MessageMap } from "./types";
import { WorkerCollideEvent, WorkerMessage } from "./worker/types.js";
import { Quaternion, Vector3 } from "three";

export class PhysicApi {
  private worker: Worker;
  private bodies: Map<
    number,
    {
      collisionResponse: boolean;
      mass: number;
      position: Vector3;
      quaternion: Quaternion;
      velocity: Vector3;
    }
  > = new Map();

  private listeners: Map<
    number,
    Map<"collide", Array<(data: WorkerCollideEvent) => void>>
  > = new Map();
  constructor() {
    this.worker = new Worker(new URL("./worker/Worker.ts", import.meta.url), {
      type: "module",
    });

    this.worker.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
      switch (data.operation) {
        case "step":
          data.payload.forEach((bodyData) => {
            const body = this.bodies.get(bodyData.id);
            if (!body) {
              throw new Error(`Body with uuid ${bodyData.id} not found`);
            }

            body.position.set(
              bodyData.position[0],
              bodyData.position[1],
              bodyData.position[2],
            );
            body.quaternion.set(
              bodyData.quaternion[0],
              bodyData.quaternion[1],
              bodyData.quaternion[2],
              bodyData.quaternion[3],
            );
            body.velocity.set(
              bodyData.velocity[0],
              bodyData.velocity[1],
              bodyData.velocity[2],
            );
          });
          break;
        case "collide":
          const listeners = this.listeners.get(data.payload.bodyId);
          if (!listeners) return;
          const callback = listeners.get("collide");
          if (!callback) return;
          callback.forEach((callback) => callback(data.payload));
          break;
      }
    };
  }

  init(payload: MessageMap["init"]["payload"]) {
    this.worker.postMessage({ operation: "init", payload });
  }

  step(payload: MessageMap["step"]["payload"]) {
    this.worker.postMessage({ operation: "step", payload });
  }

  async addBody(payload: MessageMap["addBody"]["payload"]) {
    return new Promise<number>((resolve) => {
      const responseListener = ({ data }: MessageEvent<WorkerMessage>) => {
        if (data.operation === "addBody") {
          if (this.bodies.get(data.payload)) return;

          this.bodies.set(data.payload, {
            mass: payload.mass,
            collisionResponse: true,
            position: new Vector3(position[0], position[1], position[2]),
            quaternion: new Quaternion(
              quaternion[0],
              quaternion[1],
              quaternion[2],
              quaternion[3],
            ),
            velocity: new Vector3(0, 0, 0),
          });

          resolve(data.payload);
          this.worker.removeEventListener("message", responseListener);
        }
      };

      this.worker.addEventListener("message", responseListener);

      const quaternion = payload.quaternion ?? [0, 0, 0, 1];
      const position = payload.position ?? [0, 0, 0];

      this.worker.postMessage({ operation: "addBody", payload });
    });
  }

  applyImpulse(payload: MessageMap["applyImpulse"]["payload"]) {
    this.worker.postMessage({ operation: "applyImpulse", payload });
  }

  applyForce(payload: MessageMap["applyForce"]["payload"]) {
    this.worker.postMessage({ operation: "applyForce", payload });
  }

  applyLocalForce(payload: MessageMap["applyLocalForce"]["payload"]) {
    this.worker.postMessage({ operation: "applyLocalForce", payload });
  }

  applyLocalImpulse(payload: MessageMap["applyLocalImpulse"]["payload"]) {
    this.worker.postMessage({ operation: "applyLocalImpulse", payload });
  }

  setBodyPosition(id: number, x: number, y: number, z: number) {
    const body = this.getBodyData(id);
    body.position.set(x, y, z);

    this.worker.postMessage({
      operation: "setBodyPosition",
      payload: { id, position: [x, y, z] },
    });
  }

  setBodyCollisionResponse(id: number, isCollisionResponse: boolean) {
    const body = this.getBodyData(id);
    body.collisionResponse = isCollisionResponse;
    this.worker.postMessage({
      operation: "setBodyCollisionResponse",
      payload: { id, isCollisionResponse },
    });
  }

  getBodyData(id: number) {
    const data = this.bodies.get(id);
    if (!data) {
      throw new Error(`Body with id ${id} not found`);
    }

    return data;
  }

  addListener(
    id: number,
    event: "collide",
    callback: (data: WorkerCollideEvent) => void,
  ) {
    const listeners = this.listeners.get(id) ?? new Map();
    listeners.set(event, [...(listeners.get(event) ?? []), callback]);
    this.listeners.set(id, listeners);
  }
}
