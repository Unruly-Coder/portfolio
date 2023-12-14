import {ActiveElement} from "./ActiveElement";
import {Application} from "../../../Application";


export class Mail extends ActiveElement {
  constructor(application: Application) {
    super(application, {text: 'MAIL', url: 'mailto:pawel.brod@gmail.com'});
  }
}