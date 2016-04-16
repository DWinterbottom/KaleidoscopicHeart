function TestAdvance(deltaT)
{
    if (!this.hasSpawnedFirstObject)
    {
        if(this.textures.test.isLoaded)
        {
            this.SpawnTestObject();
            this.hasSpawnedFirstObject = true;
        }
        return
    }
    if (this.spawnCooldown > 0)
    {
        this.spawnCooldown = this.spawnCooldown - deltaT
    }
    else if (game.keyInput.KeyPressed(113))//Q
    {
        this.SpawnTestObject();
        this.spawnCooldown = 200
    }
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
            textureInfo.renderPrototype = MakeStandardShaderRenderPrototype(textureInfo, 0.0, 0.0);//Different for other objects, probably.
        };
        img.src = "../"+textureInfo.imagePath;
    }
    this.spawnCooldown = 0;
    this.SpawnTestObject = SpawnTestObject;
    this.hasSpawnedFirstObject = false;
}

test = {
    Init:TestInit,
    Advance:TestAdvance,
    NewFrame:TestNewFrame
}

function TestObjectInit()
{
    this.scale = Mat4Scale(0.1);
    this.time = 0
    var moveAngle = Math.random() * Math.PI;
    this.direction = [Math.sin(moveAngle), Math.cos(moveAngle),0];
}

function TestObjectAdvance(deltaT)
{
    this.time += deltaT;
    var distance = this.time/5000;
    if (distance > 1.5)
    {
        console.log("Removing test object at "+window.performance.now())
        game.sceneGraph.RemoveChild(this.objectID);
    }
    else
    {
        var rotation = Rot2dMat(this.time/1000);
        var translation = [this.direction[0]*distance, this.direction[1]*distance, 0.0];
        this.transform = Mat4Multiply(Mat4Multiply(this.scale, rotation), Mat4Translate(translation));
    }
}

var testObjectBehaviour = Behaviour(TestObjectInit, TestObjectAdvance, EmptyFunction, EmptyFunction, EmptyFunction);

function SpawnTestObject()
{
    console.log("Spawning test object at "+window.performance.now())
    var hue = Math.random();
    var colourise = 0.5 + 0.5*Math.random();
    var testObjectPrototype = MakeSceneGraphObjectPrototype(MakeStandardShaderRenderPrototype(this.textures.test, hue, colourise), NoCollisionObject, testObjectBehaviour)
    var testObject = MakeSceneGraphObject(testObjectPrototype);
    game.sceneGraph.AddChild(testObject);
};