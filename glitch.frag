/// LARGER BLOCKS, RAINBOW, NOISE

precision highp float;

uniform sampler2D tex0;
uniform float wash;

varying vec2 vTexCoord;

// Random function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  // Calculate the normalized wash value
  float normalizedWash = wash / 100.0;
  
  // Original UV coordinates
  vec2 uv = vTexCoord;
  
  // Apply glitch effects based on wash intensity
  if (normalizedWash > 0.0) {
    // Block distortion
    float blockSize = mix(0.1, 0.02, normalizedWash);
    vec2 blockUv = floor(uv / blockSize) * blockSize;
    
    // Create time-independent pseudo-random value
    float offsetSeed = random(blockUv);
    
    // Horizontal RGB shift
    if (random(blockUv) < normalizedWash * 0.4) {
      float shiftAmount = normalizedWash * 0.03 * (offsetSeed - 0.5);
      
      // Split RGB channels
      float r = texture2D(tex0, uv + vec2(shiftAmount, 0.0)).r;
      float g = texture2D(tex0, uv).g;
      float b = texture2D(tex0, uv - vec2(shiftAmount, 0.0)).b;
      
      gl_FragColor = vec4(r, g, b, 1.0);
      return;
    }
    
    // Vertical line skipping/jumping
    if (random(uv + 0.1) < normalizedWash * 0.1) {
      float jumpOffset = (random(blockUv + 0.3) - 0.5) * normalizedWash;
      uv.y += jumpOffset;
    }
    
    // Pixel blocks/noise
    if (random(uv * 1.5) < normalizedWash * 0.03) {
      vec2 pixelUv = floor(uv * 100.0) / 100.0;
      float noiseValue = random(pixelUv);
      gl_FragColor = vec4(noiseValue, noiseValue, noiseValue, 1.0);
      return;
    }
  }
  
  // Default texture sample
  gl_FragColor = texture2D(tex0, uv);
}


/// GLITCH LINES

precision highp float;

uniform sampler2D tex0;
uniform float wash;
varying vec2 vTexCoord;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vTexCoord;
  float w = clamp((wash - 10.0) / 590.0, 0.0, 1.0); // normalized wash

  // Horizontal glitch stripes
  if (random(vec2(uv.y * 50.0, floor(w * 100.0))) < w * 0.4) {
    float glitchStrength = mix(0.01, 0.1, w);
    uv.x += (random(vec2(uv.y, w)) - 0.5) * glitchStrength;
  }

  // RGB shift flicker
  float flicker = step(0.95, fract(sin(wash * 0.123 + uv.y * 50.0) * 43758.5));
  if (flicker > 0.0) {
    float shift = mix(0.001, 0.01, w);
    float r = texture2D(tex0, uv + vec2(shift, 0.0)).r;
    float g = texture2D(tex0, uv).g;
    float b = texture2D(tex0, uv - vec2(shift, 0.0)).b;
    gl_FragColor = vec4(r, g, b, 1.0);
    return;
  }

  // Default sample
  gl_FragColor = texture2D(tex0, uv);
}
