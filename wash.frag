precision highp float;
varying vec2 vTexCoord;
void main() {
  // Assign the coordinates to the color output of the shader
  gl_FragColor = vec4(vTexCoord.x, vTexCoord.y, 1.0, 1.0);
}