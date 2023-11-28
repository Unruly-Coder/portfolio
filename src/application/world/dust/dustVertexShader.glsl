uniform float uTime;
uniform float uVelocity;
uniform float uScale;

attribute float size;
varying vec4 vColor;


void main()
{
    float x = sin(position.x + uTime * 0.15);
    float y = cos(position.x + uTime * 0.15);
    float z = sin(position.x + uTime * 0.15);
    vec3 offset = vec3(x, y, z);

    vec3 animatedPosition = position + offset * uVelocity;

    vec4 modelPosition = modelMatrix * vec4(animatedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    gl_PointSize = size * uScale;
    gl_PointSize *= ( 1.0 / - viewPosition.z );
    
    vColor = color;
}