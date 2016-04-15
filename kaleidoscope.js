function KaleidoscopeAdvance(deltaT)
{
}

KaleidoscopeNewFrame()
{
}

function KaleidoscopeInit()
{
    this.textures = textures;
    //Load Textures
    for (var textureName in this.textures)
    {
        var textureInfo = this.textures[textureName];
        var img = new Image();
        img.onload = function(){
            textureInfo.isLoaded = true;
            textureInfo.image = img;
        };
        img.src = textureInfo.imagePath;
    }
}

kaleidoscope = {
    Init:KaleidoscopeInit,
    Advance:KaleidoscopeAdvance,
    NewFrame:KaleidoscopeNewFrame
}