/// 2D GRAPHIC

precision highp float;

uniform sampler2D tex0;
uniform float wash; // Distortion amount (0-100)
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;
  
  // Calculate the normalized wash value (0.0-1.0)
  float normalizedWash = wash / 100.0;
  
  // Offset the input coordinate based on wash amount
  vec2 warpedCoord = uv;
  warpedCoord.x += normalizedWash * 0.05 * sin(uv.y * 10.0);
  warpedCoord.y += normalizedWash * 0.05 * sin(uv.x * 10.0);

  // Set the new color by looking up the warped coordinate
  gl_FragColor = texture2D(tex0, warpedCoord);
}



/// WEBGL

precision highp float;

uniform sampler2D tex0;
uniform float wash; // Distortion amount (0-100)
varying vec2 vTexCoord;

void main() {
  // Calculate the normalized wash value (0.0-1.0)
  float normalizedWash = wash / 100.0;
  
  // Offset the input coordinate based on wash amount
  vec2 warpedCoord = vTexCoord;
  warpedCoord.x += normalizedWash * 0.05 * sin(vTexCoord.y * 10.0);
  warpedCoord.y += normalizedWash * 0.05 * sin(vTexCoord.x * 10.0);

  // Set the new color by looking up the warped coordinate
  gl_FragColor = texture2D(tex0, warpedCoord);