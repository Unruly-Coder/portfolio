uniform float uTime;
uniform float uGravity;
uniform float uScale;
uniform float uLifeTime;
uniform vec3 uStartPosition;

attribute float size;
attribute float random;


void main()
{

    float time = mod(uTime + random * uLifeTime, uLifeTime);
    vec3 gravity = vec3(0, time * uGravity * -0.1, 0);
   
    vec3 animatedPosition = position + gravity;
    
    if(time < 1.0){
        animatedPosition =+ uStartPosition;
    }
    
    vec4 modelPosition = modelMatrix * vec4(animatedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    gl_PointSize = 100.0;
    gl_PointSize *= ( 1.0 / - viewPosition.z );
    
}