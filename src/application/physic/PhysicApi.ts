import { MessageMap } from "./types";
import { WorkerCollideEvent, WorkerMessage } from "./worker/types.js";
import { Quaternion, Vector3 } from "three";

const TRANSFER_BUFFER_SIZE = 100;
const QUATERNION_SIZE = 4;
const VECTOR_SIZE = 3;
const BODY_SIZE = 1 + VECTOR_SIZE * 2 + QUATERNION_SIZE; //id + position + velocity + quaternion

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
  private transferBuffer: Float32Array = new Float32Array(
    1 + TRANSFER_BUFFER_SIZE * BODY_SIZE,
  );

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
          this.transferBuffer = data.payload;

          for (let i = 0; i < data.payload[0]; i++) {
            const id = data.payload[i * BODY_SIZE + 1];
            const body = this.bodies.get(id);
            if (!body) {
              throw new Error(`Body with uuid ${id} not found`);
            }

            const { position, quaternion, velocity } = body;

            position.set(
              data.payload[i * BODY_SIZE + 2],
              data.payload[i * BODY_SIZE + 3],
              data.payload[i * BODY_SIZE + 4],
            );
            quaternion.set(
              data.payload[i * BODY_SIZE + 5],
              data.payload[i * BODY_SIZE + 6],
              data.payload[i * BODY_SIZE + 7],
              data.payload[i * BODY_SIZE + 8],
            );
            velocity.set(
              data.payload[i * BODY_SIZE + 9],
              data.payload[i * BODY_SIZE + 10],
              data.payload[i * BODY_SIZE + 11],
            );
          }
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

  step(payload: number) {
    if (this.transferBuffer.buffer.byteLength === 0) return;
    this.worker.postMessage(
      {
        operation: "step",
        payload: { deltaTime: payload, transferBuffer: this.transferBuffer },
      },
      [this.transferBuffer.buffer],
    );
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
