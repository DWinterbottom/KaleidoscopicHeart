function AdvanceObject(deltaT)
{
    for (var child in this.children)
    {
        this.children[child].Advance(deltaT);
    }
    this.OnAdvance(deltaT);
}

function NewFrameObject()
{
    for (var child in this.children)
    {
        this.children[child].NewFrame();
    }
    this.OnNewFrame();
}

function MakeSceneGraphObjectPrototype(renderObjectPrototype, collisionObjectPrototype, behaviour)
{ 
    var proto = {
        Advance:AdvanceObject,
        NewFrame:NewFrameObject,
        AddReference:function(){
            this.references += 1;
        },
        AddChild:function(child){
            this.children.push(child);
            child.AddReference();
        },
        RemoveReference:function(){
            this.references -= 1;
            if (this.references < 1)
            {
                for (var child in this.children){
                    this.children[child].RemoveReference();
                }
                this.OnDestroy();
            }
        },
        RemoveChild:function(objectID, search){
            var found = false;
            for (var child in this.children)
            {
                child = this.children[child];
                if (child.objectID == objectID)
                {
                    child.RemoveReference();
                    var index = this.children.indexOf(child);
                    this.children.splice(index, 1);
                    found = true;
                }
            }
            if (!found & search)
            {
                for (var child in this.children)
                {
                    child.RemoveChild(objectID, search);
                }
            }
        }
    };
    Object.assign(proto, renderObjectPrototype);
    Object.assign(proto, collisionObjectPrototype);
    Object.assign(proto, behaviour);
    return proto;
}

var _sceneGraphObjectID = 0;
function MakeSceneGraphObject(sceneGraphObjectPrototype)
{
    var sceneGraphObject = Object.create(sceneGraphObjectPrototype);
    sceneGraphObject.references = 0;
    sceneGraphObject.objectID = _sceneGraphObjectID;
    sceneGraphObject.transform = Mat4Identity();
    sceneGraphObject.children = [];

    sceneGraphObject.Init();
    ++_sceneGraphObjectID;
    return sceneGraphObject;
}

function AddTransformationToObject(transform, childObject)
{
    childObject.transform = Mat4Multiply(childObject.transform, transform);
}

function StandardGetRenderObjects()
{
    renderObjects = [];
    for (var child in this.children)
    {
        renderObjects.push.apply(renderObjects, this.children[child].GetRenderObjects());
    }
    for (var renderObject in renderObjects)
    {
        AddTransformationToObject(this.transform, renderObjects[renderObject])
    }
    if (this.RenderFunction)
    {
        var thisRenderObject =
        {
            transform:this.transform,
            vertices:this.vertices,
            vertexData:this.vertexData,
            RenderFunction:this.RenderFunction,
            renderData:this.renderData,
            original:this
        }
        renderObjects.push(thisRenderObject);
    }
    return renderObjects;
}

function RenderObjectPrototype(GetRenderObjects, vertices, vertexData, RenderFunction, renderData) {
    var proto = {
        GetRenderObjects:GetRenderObjects,
        vertices:vertices,
        vertexData:vertexData,
        RenderFunction:RenderFunction,
        renderData:renderData
    };
    return proto;
};

function StandardGetCollisionObjects()
{
    collisionObjects = [];
    for (var child in this.children)
    {
        collisionObjects.push.apply(collisionObjects, this.children[child].GetCollisionObjects());
    }
    for (var collisionObject in collisionObjects)
    {
        AddTransformationToObject(this.transform, collisionObjects[collisionObject])
    }
    if (this.collisionData !== null)
    {
        var thisCollisionObject =
        {
            transform:this.transform,
            vertices:this.vertices,
            collisionData:this.collisionData,
            original:this
        }
        collisionObjects.push(thisCollisionObject);
    }
    return collisionObjects;
};

function CollisionObjectPrototype(GetCollisionObjects, collisionData) {
    var proto = {
        GetCollisionObjects:GetCollisionObjects,
        collisionData:collisionData
    }
    return proto
};

function Behaviour(Init, OnAdvance, OnCollision, OnNewFrame, OnDestroy) {
    var proto = {
        Init:Init,
        OnAdvance:OnAdvance,
        OnCollision:OnCollision,
        OnNewFrame:OnNewFrame,
        OnDestroy:OnDestroy,
    };
    return proto;
};

function EmptyFunction(){}
var NoBehaviour = Behaviour(EmptyFunction, EmptyFunction, EmptyFunction, EmptyFunction, EmptyFunction);
var NoCollisionObject = CollisionObjectPrototype(StandardGetCollisionObjects, null);
var NoRenderObject = RenderObjectPrototype(StandardGetRenderObjects, null, null, null, null);
function InitOnlyBehaviour(Init) {return Behaviour(Init, EmptyFunction, EmptyFunction, EmptyFunction, EmptyFunction)};

function MakeSceneGraphRoot(){
    return MakeSceneGraphObject(
        MakeSceneGraphObjectPrototype( NoRenderObject, NoCollisionObject, 
            InitOnlyBehaviour(function(){this.transform = SquaringMat(game.renderer.gl.drawingBufferWidth, game.renderer.gl.drawingBufferHeight, true)})
        )
    );
}

function MakeStandardShaderRenderPrototype(textureInfo, hue, colourise){
    var vertices = textureInfo.vertices;
    var vertexData = []
    var offset = 0;
    while (offset < textureInfo.textureCoordinates.length)
    {
        vertexData.push(textureInfo.textureCoordinates[offset]);
        vertexData.push(textureInfo.textureCoordinates[offset+1]);
        vertexData.push(hue);
        vertexData.push(colourise);
        offset += 2;
    }
    renderData = {image:textureInfo.image};
    return RenderObjectPrototype(StandardGetRenderObjects, vertices, vertexData, StandardShaderRenderObjectFunction, renderData)
}