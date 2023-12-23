import { ActiveElement } from "./ActiveElement";

import { Application } from "../../../Application";

export class Linkedin extends ActiveElement {
  constructor(application: Application) {
    super(application, {
      text: "LINKEDIN",
      url: "https://www.linkedin.com/in/pawelbrod/",
    });
  }
}
