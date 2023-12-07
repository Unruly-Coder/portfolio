import {Mesh, MeshStandardMaterial} from "three";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {Application} from "../../Application";

export class Text {
  
  constructor(private application: Application) {
    const pawel = this.createText('PAWEL');
    const brod = this.createText('BROD');
    const not = this.createText('not');
    const so = this.createText('so');
    const creative = this.createText('crEAtiVe');
    const dev = this.createText('DeV');
    
    pawel.position.set(-8, 3.5, 5);
    brod.position.set(-5, 3.5, 5);
    not.position.set(-1, 0.65, 6);
    not.rotation.y = Math.PI * 0.1;
    so.position.set(3, 3, 1);
    creative.position.set(6, 3, 1);
    dev.position.set(10, 3, 1);
  }
  
  private createText(text: string) {
    const textGeometry = new TextGeometry( text, {
      font: this.application.resources.getFont('helvetiker'),
      size: 0.6,
      height: 0.01,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 3,
 
    } );

    const textMaterial = new MeshStandardMaterial({
      color: 'grey',
      metalness: 0,
      roughness: 1.5,
   
    
    });
    const textMesh = new Mesh(textGeometry, textMaterial);
    this.application.scene.add(textMesh);
    
    return textMesh
  }
}