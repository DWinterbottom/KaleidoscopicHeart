shaders = {}

shaders.fragment = `
precision mediump float;
varying vec2 vTextureCoordinates;
varying float vHue;
varying float vColourise;
uniform sampler2D uTexture;

void main(void)
{
    vec4 texColour = texture2D(uTexture, vTextureCoordinates);
    if (uColourise == 0.0)
    {
        gl_FragColor = texColour;
    }
    else
    {
        vec4 v4HSLA = GetHSL(texColour);
        fHueDistance = mod(0.5+(v4HSLA.x - vHue), 1.0) - 0.5;
        float fAdjustedHue = mod(fTexHue + (fHueDistance * vColourise), 1.0);
        v4HSLA.x = fAdjustedHue;
        gl_FragColor = FromHSL(v4HSLA);
    }
vec4 GetHSL(vec4 v4RGBA)
{
    float fMax = max(v4RGBA.x, v4RGBA.y, v4RGBA.z);
    float fMin = min(v4RGBA.x, v4RGBA.y, v4RGBA.z);
    
    float fTexLightness = 0.5*(fMax + fMin);
    
    
    float fChroma = fMax - fMin;
    
    float fTexSaturation = 0.0;
    
    if (fChroma < 0.005)
    {
        //Leave it.
    }
    else
    {
        fTexSaturation = fChroma / (1- abs(2*fTexLightness - 1));
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
    
    float fHueDistance = mod((vHue - fTexHue)+0.5, 1.0) - 0.5;
    
    return vec4(fTexHue, fTexSaturation, fTexLightness, v4RGBA.w);
}
vec4 FromHSL(vec4 v4HSLA)
{
    float fChroma = 0.0;
    if (v4HSLA.y < 0.005)
    {
        //Don't bother.
    }
    else 
    {
        fChroma = (1 - abs(2 * v4HSLA.z - 1)) * v4HSLA.y;
    }
    
    vec3 intermediates = vec3(0.0,0.0,0.0)
    float fSecondChroma = fChroma * (1 - abs(mod(v4HSLA.x * 6, 2.0) - 1));
    float fSection = v4HSLA.x * 6
    if (fSection < 1)
    {
        intermediates = vec3(fChroma, fSecondChroma, 0.0);
    }
    else if (fSection < 2)
    {
        intermediates = vec3(fSecondChroma, fChroma, 0.0);
    }
    else if (fSection < 3)
    {
        intermediates = vec3(0.0, fChroma, fSecondChroma);
    }
    else if (fSection < 4)
    {
        intermediates = vec3(0.0, fSecondChroma, fChroma);
    }
    else if (fSection < 5)
    {
        intermediates = vec3(fSecondChroma, 0.0, fChroma);
    }
    else
    {
        intermediates = vec3(fChroma, 0.0, fSecondChroma);
    }
    float fMin = v4HSLA.z - (0.5 * fChroma)
    return vec4(intermediates.x + fMin, intermediates.y + fMin, intermediates.z + fMin, v4HSLA.w)
}
}`


shaders.vertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTetureCoordinates;
attribute float aHue;
attribute float aColourise;
varying vec2 vTextureCoordinates
varying float vHue;
varying float vColourise;
uniform float uLayerHeight;
uniform mat4 uMVMatrix;

void main(void)
{
    gl_Position = uMVMatrix * vec4(aVertexPosition, uLayerHeight, 1.0);
    vTextureCoordinates = aTetureCoordinates;
    vHue = aHue;
    vColourise = aColourise;
}

