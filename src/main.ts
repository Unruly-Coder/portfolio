// import * as THREE from 'three';

// import {MouseControl} from "./controls/MouseControl";
// import {Submarine} from "./scene/submarine/Submarine";
// import {Vector3, Plane} from "three";
//
//
// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);  // Set the size of the canvas
//
// window.addEventListener('resize', () => {
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
// })
// document.body.appendChild(renderer.domElement);  // Add the canvas to the DOM so we can see it  
//
// const submarine = new Submarine();
//
//
// const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
// scene.add(ambientLight);
//
// // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
// // directionalLight.position.set(0, 1, 0);
// // scene.add(directionalLight);
//
// scene.add(submarine.getObject3D());
// scene.add(new THREE.AxesHelper(5));
// scene.add(new THREE.GridHelper(10, 10));
// scene.add(new THREE.AmbientLight(0xffffff, 0.1));
//
//
// scene.background = new THREE.Color( 0x000000 );
// scene.fog = new THREE.FogExp2( 0x161F1F, 0.09);
// // scene.add(new THREE.DirectionalLight(0xffffff, 0.5));
//
// // create an room box with 6 walls and add to the scene 
// const roomBox = new THREE.BoxGeometry(15, 20, 8);
// const roomBoxMaterial = new THREE.MeshPhongMaterial({
//   color: 0x404040,
//   side: THREE.BackSide
// });
// const room = new THREE.Mesh(roomBox, roomBoxMaterial);
// scene.add(room);  
//
//
//
//
// camera.position.z = 7;
// const mouse = new MouseControl(
//   new Plane(new Vector3(0,0,1), 0), 
//   camera
// );
// const plane = new Plane(new Vector3(0,0,1), 0);
// const raycaster = new THREE.Raycaster();
//
// mouse.onMouseDown((event) => {
//   if(event.button == 0) {
//     submarine.startEngine();
//   }
// })
//
// mouse.onMouseUp((event) => {
//   if(event.button == 0) {
//     submarine.stopEngine();
//   }
// })
//
// const tick = function () {
// 
//   mouse.updateRaycaster();
//   submarine.setDirection(mouse.getCastedPosition().clone().sub(submarine.position).normalize());
//   submarine.update();
//   camera.position.y = submarine.position.y;
//  
//   // const targetCameraRotationY = (-1 * mouse.getPercentagePosition().x + 0.5) * 0.6;
//   // const targetCameraRotationX = (-1 * mouse.getPercentagePosition().y + 0.5) * 0.6;
//   // camera.rotation.y += (targetCameraRotationY - camera.rotation.y) * 0.01;
//   // camera.rotation.x += (targetCameraRotationX - camera.rotation.x) * 0.01; 
//   //
//   renderer.render(scene, camera);
//
//   requestAnimationFrame(tick);
// };
//
//
//
// tick();

import './main.css';
import {Application} from "./application/Application";
import {Resources} from "./application/resources/Resources";

const resources = new Resources()
resources.on('loaded', () => {
  const application = new Application(resources);
  application.start();
});