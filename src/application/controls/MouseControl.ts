import { Plane, Raycaster, Vector2, Vector3 } from "three";
import { Application } from "../Application";
import EventEmitter from "eventemitter3";

const MOUSE_RIGHT = 2;
const MOUSE_LEFT = 0;
const MOUSE_MIDDLE = 1;

export class MouseControl extends EventEmitter {
  private readonly screenPosition: Vector2;
  private readonly scrollDelta: Vector2;
  private readonly raycaster: Raycaster;
  private readonly castPosition: Vector3;
  private readonly castPlane: Plane;
  private readonly percentagePosition: Vector2;

  private isEnabled: boolean = true;
  private button: number = -1;

  constructor(private application: Application) {
    super();
    this.screenPosition = new Vector2();
    this.scrollDelta = new Vector2();
    this.castPosition = new Vector3();
    this.raycaster = new Raycaster();
    this.percentagePosition = new Vector2();
    this.castPlane = new Plane(new Vector3(0, 0, 1), 0);

    document.addEventListener("mousemove", (event) => {
      window.requestAnimationFrame(() => {
        this.screenPosition.x = event.clientX;
        this.screenPosition.y = event.clientY;

        this.emit("move", event);
      });
    });

    document.addEventListener("mousedown", (event) => {
      if (!this.isEnabled) {
        return;
      }

      this.button = event.button;

      if (this.button === MOUSE_LEFT) {
        this.emit("leftDown", event);
      } else if (this.button === MOUSE_RIGHT) {
        this.emit("rightDown", event);
      } else if (this.button === MOUSE_MIDDLE) {
        this.emit("middleDown", event);
      }
    });

    document.addEventListener("mouseup", (event) => {
      if (this.button === MOUSE_LEFT) {
        this.emit("leftUp", event);
      } else if (this.button === MOUSE_RIGHT) {
        this.emit("rightUp", event);
      } else if (this.button === MOUSE_MIDDLE) {
        this.emit("middleUp", event);
      }

      this.button = -1;
    });

    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    document.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();

        this.scrollDelta.x = event.deltaX;
        this.scrollDelta.y = event.deltaY;

        if (event.deltaX == 1 || event.deltaX == -1) {
          this.scrollDelta.x = 0;
        }

        if (event.deltaY == 1 || event.deltaY == -1) {
          this.scrollDelta.y = 0;
        }
      },
      { passive: false },
    );
  }

  updateRaycaster() {
    this.raycaster.setFromCamera(
      this.getNDCPosition(),
      this.application.camera.instance,
    );
  }

  getPercentagePosition(): Vector2 {
    this.percentagePosition.set(
      this.screenPosition.x / window.innerWidth,
      1 - this.screenPosition.y / window.innerHeight,
    );
    return this.percentagePosition;
  }

  getNDCPosition(): Vector2 {
    return this.getPercentagePosition().multiplyScalar(2).subScalar(1);
  }

  getCastedPosition(): Vector3 {
    this.raycaster.ray.intersectPlane(this.castPlane, this.castPosition);
    return this.castPosition;
  }

  isLeftButtonPressed(): boolean {
    return this.button === MOUSE_LEFT;
  }

  isRightButtonPressed(): boolean {
    return this.button === MOUSE_RIGHT;
  }

  isMiddleButtonPressed(): boolean {
    return this.button === MOUSE_MIDDLE;
  }

  getScrollDelta(): Vector2 {
    return this.scrollDelta;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}
