import { ApiMessage, MessageMap } from "./../types";
import * as CANNON from "cannon-es";
import { CannonCollideEvent } from "./types.js";

declare var self: DedicatedWorkerGlobalScope;

const physicWorld = new CANNON.World();
let defaultLinearDamping = 0;
let defaultAngularDamping = 0;
let defaultLinearFactor = [1, 1, 1];

const idBodyMap: Map<number, CANNON.Body> = new Map();

self.onmessage = ({ data }: MessageEvent<ApiMessage>) => {
  switch (data.operation) {
    case "init":
      init(data.payload);
      break;
    case "step":
      step(data.payload);
      break;
    case "addBody":
      addBody(data.payload);
      break;
    case "applyImpulse":
      applyImpulse(data.payload);
      break;
    case "applyForce":
      applyForce(data.payload);
      break;
    case "applyLocalForce":
      applyLocalForce(data.payload);
      break;
    case "applyLocalImpulse":
      applyLocalImpulse(data.payload);
      break;
    case "setBodyPosition":
      setBodyPosition(data.payload);
      break;
    case "setBodyCollisionResponse":
      setBodyCollisionResponse(data.payload);
      break;
  }
};

function init(data: MessageMap["init"]["payload"]) {
  physicWorld.gravity.set(data.gravity[0], data.gravity[1], data.gravity[2]);
  physicWorld.allowSleep = data.allowSleep;

  if (data.broadphase === "SAPBroadphase") {
    const broadphase = new CANNON.SAPBroadphase(physicWorld);
    broadphase.autoDetectAxis();
    physicWorld.broadphase = broadphase;
  }

  defaultLinearDamping = data.defaultLinearDamping ?? defaultLinearDamping;
  defaultAngularDamping = data.defaultAngularDamping ?? defaultAngularDamping;
  defaultLinearFactor = data.defaultLinearFactor ?? defaultLinearFactor;
}

function getBody(id: number) {
  const body = idBodyMap.get(id);
  if (!body) {
    throw new Error(`Body with uuid ${id} not found`);
  }

  return body;
}

function addBody(data: MessageMap["addBody"]["payload"]) {
  const body = new CANNON.Body({
    mass: data.mass,
    allowSleep: data.allowSleep,
    sleepSpeedLimit: data.sleepSpeedLimit,
    position:
      data.position === undefined
        ? undefined
        : new CANNON.Vec3(data.position[0], data.position[1], data.position[2]),
    quaternion:
      data.quaternion === undefined
        ? undefined
        : new CANNON.Quaternion(
            data.quaternion[0],
            data.quaternion[1],
            data.quaternion[2],
            data.quaternion[3],
          ),
  });

  data.shapes.forEach((shapeData) => {
    switch (shapeData.type) {
      case "box": {
        const shape = new CANNON.Box(
          new CANNON.Vec3(
            shapeData.halfExtents[0],
            shapeData.halfExtents[1],
            shapeData.halfExtents[2],
          ),
        );
        const offset = new CANNON.Vec3(
          shapeData.offset ? shapeData.offset[0] : 0,
          shapeData.offset ? shapeData.offset[1] : 0,
          shapeData.offset ? shapeData.offset[2] : 0,
        );
        const orientation = new CANNON.Quaternion(
          shapeData.orientation ? shapeData.orientation[0] : 0,
          shapeData.orientation ? shapeData.orientation[1] : 0,
          shapeData.orientation ? shapeData.orientation[2] : 0,
          shapeData.orientation ? shapeData.orientation[3] : 1,
        );
        body.addShape(shape, offset, orientation);
        break;
      }
      case "sphere": {
        const shape = new CANNON.Sphere(shapeData.radius);
        const offset = new CANNON.Vec3(
          shapeData.offset ? shapeData.offset[0] : 0,
          shapeData.offset ? shapeData.offset[1] : 0,
          shapeData.offset ? shapeData.offset[2] : 0,
        );
        const orientation = new CANNON.Quaternion(
          shapeData.orientation ? shapeData.orientation[0] : 0,
          shapeData.orientation ? shapeData.orientation[1] : 0,
          shapeData.orientation ? shapeData.orientation[2] : 0,
          shapeData.orientation ? shapeData.orientation[3] : 1,
        );
        body.addShape(shape, offset, orientation);
        break;
      }
    }
  });

  body.linearDamping = data.linearDamping ?? defaultLinearDamping;
  body.angularDamping = data.angularDamping ?? defaultAngularDamping;

  if (data.linearFactor) {
    body.linearFactor.set(
      data.linearFactor[0],
      data.linearFactor[1],
      data.linearFactor[2],
    );
  } else {
    body.linearFactor.set(
      defaultLinearFactor[0],
      defaultLinearFactor[1],
      defaultLinearFactor[2],
    );
  }

  body.addEventListener(
    "collide",
    ({  body, target, contact }: CannonCollideEvent) => {
      const { ni, ri, rj, bi, bj, id } = contact;
      const contactPoint = bi.position.vadd(ri);
      const contactNormal = bi === body ? ni : ni.scale(-1);

      self.postMessage({
        operation: "collide",
        payload: {
          bodyId: body.id,
          targetId: target.id,
          collisionFilters: {
            bodyFilterGroup: body.collisionFilterGroup,
            bodyFilterMask: body.collisionFilterMask,
            targetFilterGroup: target.collisionFilterGroup,
            targetFilterMask: target.collisionFilterMask,
          },
          contact: {
            bi: bi.id,
            bj: bj.id,
            contactNormal: contactNormal.toArray(), // Normal of the contact, relative to the colliding body
            contactPoint: contactPoint.toArray(), // World position of the contact
            id,
            impactVelocity: contact.getImpactVelocityAlongNormal(),
            ni: ni.toArray(),
            ri: ri.toArray(),
            rj: rj.toArray(),
          },
        },
      });
    },
  );

  physicWorld.addBody(body);
  idBodyMap.set(body.id, body);

  self.postMessage({ operation: "addBody", payload: body.id });
}

function applyImpulse(data: MessageMap["applyImpulse"]["payload"]) {
  const body = getBody(data.id);
  body.applyImpulse(
    new CANNON.Vec3(data.impulse[0], data.impulse[1], data.impulse[2]),
  );
}

function applyForce(data: MessageMap["applyForce"]["payload"]) {
  const body = getBody(data.id);
  body.applyForce(new CANNON.Vec3(data.force[0], data.force[1], data.force[2]));
}

function applyLocalForce(data: MessageMap["applyLocalForce"]["payload"]) {
  const body = getBody(data.id);
  body.applyLocalForce(
    new CANNON.Vec3(data.force[0], data.force[1], data.force[2]),
  );
}

function applyLocalImpulse(data: MessageMap["applyLocalImpulse"]["payload"]) {
  const body = getBody(data.id);
  body.applyLocalImpulse(
    new CANNON.Vec3(data.impulse[0], data.impulse[1], data.impulse[2]),
  );
}

function setBodyPosition(data: MessageMap["setBodyPosition"]["payload"]) {
  const body = getBody(data.id);
  body.position.set(data.position[0], data.position[1], data.position[2]);
}

function setBodyCollisionResponse(
  data: MessageMap["setBodyCollisionResponse"]["payload"],
) {
  const body = getBody(data.id);
  body.collisionResponse = data.isCollisionResponse;
}

function step(elapsedTime: number) {
  physicWorld.step(1 / 60, elapsedTime, 3);

  self.postMessage({
    operation: "step",
    payload: physicWorld.bodies.map((body) => {
      return {
        id: body.id,
        position: [body.position.x, body.position.y, body.position.z],
        quaternion: [
          body.quaternion.x,
          body.quaternion.y,
          body.quaternion.z,
          body.quaternion.w,
        ],
        velocity: [body.velocity.x, body.velocity.y, body.velocity.z],
      };
    }),
  });
}
