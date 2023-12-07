uniform sampler2D pointTexture;

varying vec4 vColor;
varying vec2 vRotation;

void main() {
    vec2 coords = (gl_PointCoord - 0.5) * mat2(vRotation.x, vRotation.y, -vRotation.y, vRotation.x) + 0.5;
    coords = gl_PointCoord;
    
    if(vColor.a < 0.001) discard;
    
    gl_FragColor = vColor;
    gl_FragColor = gl_FragColor * texture2D( pointTexture, coords );

}