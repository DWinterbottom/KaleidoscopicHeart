shaders = {}

shaders.fragment = `
precision mediump float;
varying vec2 vTextureCoordinates;
varying float vHue;
varying float vColourise;
uniform sampler2D uTexture;

lowp vec4 GetHSL(vec4 v4RGBA)
{
    precision lowp float;

    float fMax = max(v4RGBA.x, max(v4RGBA.y, v4RGBA.z));
    float fMin = min(v4RGBA.x, min(v4RGBA.y, v4RGBA.z));
    
    float fTexLightness = 0.5*(fMax + fMin);
    
    
    float fChroma = fMax - fMin;
    
    float fTexSaturation = 0.0;
    
    if (fChroma < 0.005)
    {
        //Leave it.
    }
    else
    {
        fTexSaturation = fChroma / (1.0- abs(2.0*fTexLightness - 1.0));
    }
    
    float fBaseHue = 0.0;
    if (fChroma < 0.005)
    {
        //Nothing needs doing.
    }
    else if (fMax == v4RGBA.x)
    {
        fBaseHue = (v4RGBA.y - v4RGBA.z) / fChroma;
    }
    else if (fMax == v4RGBA.y)
    {
        fBaseHue = 2.0 + ((v4RGBA.z - v4RGBA.x) / fChroma);
    }
    else if (fMax == v4RGBA.z)
    {
        fBaseHue = 4.0 + ((v4RGBA.x - v4RGBA.y) / fChroma);
    }
    
    float fTexHue = mod(fBaseHue / 6.0, 1.0);
    
    float fHueDistance = vHue - fTexHue;
    if (fHueDistance > 0.5)
    {
        fHueDistance = 1.0 - fHueDistance;
    }
    else if (fHueDistance < -0.5)
    {
        fHueDistance = fHueDistance + 1.0;
    }
    
    fTexHue = fTexHue + (fHueDistance * vColourise);
    
    vec4 ret = vec4(fTexHue, fTexSaturation, fTexLightness, v4RGBA.w);
    return ret;
}

lowp vec4 FromHSL(vec4 v4HSLA)
{
    
    precision lowp float;
    
    float fChroma = 0.0;
    if (v4HSLA.y < 0.005)
    {
        //Don't bother.
    }
    else 
    {
        fChroma = (1.0 - abs(2.0 * v4HSLA.z - 1.0)) * v4HSLA.y;
    }
    
    vec3 intermediates = vec3(0.0,0.0,0.0);
    float fSecondChroma = fChroma * (1.0 - abs(mod(v4HSLA.x * 6.0, 2.0) - 1.0));
    float fSection = v4HSLA.x * 6.0;
    if (fSection < 1.0)
    {
        intermediates = vec3(fChroma, fSecondChroma, 0.0);
    }
    else if (fSection < 2.0)
    {
        intermediates = vec3(fSecondChroma, fChroma, 0.0);
    }
    else if (fSection < 3.0)
    {
        intermediates = vec3(0.0, fChroma, fSecondChroma);
    }
    else if (fSection < 4.0)
    {
        intermediates = vec3(0.0, fSecondChroma, fChroma);
    }
    else if (fSection < 5.0)
    {
        intermediates = vec3(fSecondChroma, 0.0, fChroma);
    }
    else
    {
        intermediates = vec3(fChroma, 0.0, fSecondChroma);
    }
    float fMin = v4HSLA.z - (0.5 * fChroma);
    vec4 ret = vec4(intermediates.x + fMin, intermediates.y + fMin, intermediates.z + fMin, v4HSLA.w);
    return ret;
}

void main(void)
{
    vec4 texColour = texture2D(uTexture, vTextureCoordinates);
    if (vColourise == 0.0)
    {
        gl_FragColor = texColour;
    }
    else
    {
        vec4 v4HSLA = GetHSL(texColour);
        float fHueDistance = mod(0.5+(v4HSLA.x - vHue), 1.0) - 0.5;
        float fAdjustedHue = mod(v4HSLA.x + (fHueDistance * vColourise), 1.0);
        v4HSLA.x = fAdjustedHue;
        gl_FragColor = FromHSL(v4HSLA);
    }
}
`


shaders.vertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoordinates;
attribute float aHue;
attribute float aColourise;
varying vec2 vTextureCoordinates;
varying float vHue;
varying float vColourise;
uniform float uLayerHeight;
uniform mat4 uMVMatrix;

void main(void)
{
    gl_Position = uMVMatrix * vec4(aVertexPosition, uLayerHeight, 1.0);
    vTextureCoordinates = aTextureCoordinates;
    vHue = aHue;
    vColourise = aColourise;
}`

shaders.attributes = ["aVertexPosition", "aTextureCoordinates", "aHue", "aColourise"]

shaders.uniforms = ["uLayerHeight", "uMVMatrix", "uTexture"]

shaders.bufferToCanvasVertex = `
attribute vec2 aVertexPosition;
varying vec2 vTextureCoordinates;
void main(void)
{
    gl_Position = vec4(aVertexPosition, 0.0, 0.0);
    vTextureCoordinates = vec2((aVertexPosition.x + 1.0)*0.5, (aVertexPosition.y + 1.0)*0.5);
}
`

shaders.bufferToCanvasFragment = `
precision mediump float;
varying vec2 vTextureCoordinates;
uniform sampler2D uTexture;
void main(void)
{
    gl_FragColor = texture2D(uTexture, vTextureCoordinates);
}
`

shaders.bufferToCanvasUniforms = ["uTexture"]

shaders.bufferToCanvasAttributes = ["aVertexPosition"]

shaders.kaleidoscopeFanVertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoordinates;
varying vTextureCoordinates;
void main(void)
{
    gl_Position = uMVMatrix * vec4(aVertexPosition, 0.0, 0.0);
    vTextureCoordinates = aTextureCoordinates;
}
`

shaders.kaleidoscopeFanFragment = `
varying vTextureCoordinates;
uniform sampler2D uTexture;
void main(void)
{
    gl_FragColor = texture2D(uTexture, vTextureCoordinates);
}
`

shaders.kaleidoscopeFanUniforms = ["uTexture"]

shaders.kaleidoscopeFanAttributes = ["aVertexPosition", "aTextureCoordinates"]
