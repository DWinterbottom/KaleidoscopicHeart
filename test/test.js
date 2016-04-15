function TestAdvance(deltaT)
{
}

function TestNewFrame()
{
}

function TestInit()
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
        img.src = "../"+textureInfo.imagePath;
    }
}

test = {
    Init:TestInit,
    Advance:TestAdvance,
    NewFrame:TestNewFrame
}