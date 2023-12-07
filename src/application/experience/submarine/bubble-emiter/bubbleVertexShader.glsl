uniform float uTime;

attribute float size;
attribute vec4 color;
attribute float rotation;

varying vec4 vColor;
varying vec2 vRotation;

void main() {
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    gl_PointSize = size * ( 200.0 / -viewPosition.z );

    vRotation = vec2(cos(rotation + uTime/5.0), sin(rotation * uTime/5.0));
    vColor = color;

}