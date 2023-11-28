varying vec4 vColor;

void main() {
    vec2 center = vec2(0.5); 
    float strength = distance(gl_PointCoord, center);
    strength =  1.0 - (strength * 2.0);
    
    
   
    vec4 mask = vec4(strength, strength, strength ,1) ;
    vec4 finalColor = vColor * mask;
    gl_FragColor = finalColor;
    #include <colorspace_fragment>
}