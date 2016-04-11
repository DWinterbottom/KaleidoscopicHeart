shaders = {}

shaders.bgFragment = `
precision mediump float;
void main(void) {
gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`

shaders.ksFragment = `
precision mediump float;
varying vec3 vPointColour;
void main(void) {
gl_FragColor = vec4(vPointColour, 0.8);
}`


shaders.bgVertex = `
attribute vec2 aVertexPosition;
uniform float uLayerHeight;
uniform mat4 uMVMatrix;
void main(void) {
gl_Position = uMVMatrix * vec4(aVertexPosition, uLayerHeight, 1.0);
}`

shaders.ksVertex = `
attribute vec2 aVertexPosition;
attribute vec3 aVertexColour;
varying vec3 vPointColour;
uniform float uLayerHeight;
uniform mat4 uMVMatrix;
void main(void) {
gl_Position = uMVMatrix * vec4(aVertexPosition, uLayerHeight, 1.0);
vPointColour = aVertexColour;
}
`