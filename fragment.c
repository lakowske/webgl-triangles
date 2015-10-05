precision mediump float;

uniform vec4 u_color;

void main() {

  // convert the rectangle from pixels to 0.0 to 1.0
  gl_FragColor = u_color;

}
