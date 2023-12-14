import {ActiveElement} from "./ActiveElement";
import {Application} from "../../../Application";

export class Github extends ActiveElement {
    constructor(application: Application) {
      super(application, {text: 'GITHUB', url: 'https://github.com/Crazy-Ivan'});
    }
}