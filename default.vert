// Standard vertex shader for p5.js filter shaders
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  // Convert the positions from pixels to 0.0 to 1.0
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  
  // Send the texture coordinates to the fragment shader
  vTexCoord = aTexCoord;
  
  // Send the vertex information on to the fragment shader
  gl_Position = positionVec4;
}