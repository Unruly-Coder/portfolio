
import './main.css';
import {Application} from "./application/Application";
import {Resources} from "./application/resources/Resources";

const resources = new Resources();
const exploreButton = document.getElementById('button');


setProgress(0);

function setProgress(progress: number) {
  document.body.style.setProperty('--progress', progress.toString());
}

function addBodyClass(className: string) {
  document.body.classList.add(className);
}
function explorationStartHandler(application:  Application) {
  addBodyClass('exploration-started');
  application.experienceStart();
  
}

function resourcesLoadedHandler() {
  const application = new Application(resources);
  application.start();
  addBodyClass('resources-loaded');
  
  exploreButton?.addEventListener('click', () => explorationStartHandler(application))
}

resources.on('loaded', resourcesLoadedHandler);
resources.on('progress', setProgress);




