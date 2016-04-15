function AdvanceObject(deltaT)
{
    for (var child in this.children)
    {
        child.Advance(deltaT);
    }
    this.OnAdvance(deltaT);
}

function NewFrameObject()
{
    for (var child in this.children)
    {
        child.NewFrame();
    }
    this.OnNewFrame;
}

function MakeSceneGraphObjectPrototype(renderObjectPrototype, collisionObjectPrototype, behaviour)
{ 
    var proto = {
        Advance:AdvanceObject,
        NewFrame:NewFrameObject,
        AddReference:function(){
            this.reference += 1;
        },
        AddChild:function(child){
            this.children.push(child);
            child.AddReference();
        },
        RemoveReference:function(){
            this.reference -= 1;
            if (this.reference < 1)
            {
                for (var child in this.children){
                    child.RemoveReference();
                }
                this.OnDestroy();
            }
        },
        RemoveChild:function(objectID, search){
            var found = false;
            for (var child in this.children)
            {
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
        renderObjects.push.apply(renderObjects, child.GetRenderObjects());
    }
    for (var renderObject in renderObjects)
    {
        AddTransformationToObject(this.transform, renderObject)
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
        renderObjects.push()
    }
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
        collisionObjects.push.apply(collisionObjects, child.GetCollisionObjects());
    }
    for (var collisionObject in collisionObjects)
    {
        AddTransformationToObject(this.transform, collisionObject)
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
        renderObjects.push()
    }
};

function CollisionObjectPrototype(GetCollisionObjects, collisionData) {
    var proto = {
        GetCollisionObjects:GetCollisionObjects,
        collisionData:collisionData
    }
    return proto
};

function Behaviour(Init, OnAdvance, OnCollision, OnNewFrame) {
    var proto = {
        Init:Init,
        OnAdvance:OnAdvance,
        OnCollision:OnCollision,
        OnNewFrame:OnNewFrame
    };
    return proto;
};

function EmptyFunction(){}
var NoBehaviour = Behaviour(EmptyFunction, EmptyFunction, EmptyFunction, EmptyFunction);
var NoCollisionObject = CollisionObjectPrototype(StandardGetCollisionObjects, null);
var NoRenderObject = RenderObjectPrototype(StandardGetRenderObjects, null, null, null, null);
function InitOnlyBehaviour(Init) {return Behaviour(Init, EmptyFunction, EmptyFunction, EmptyFunction)};

function MakeSceneGraphRoot(){
    return MakeSceneGraphObject(
        MakeSceneGraphObjectPrototype( NoRenderObject, NoCollisionObject, 
            InitOnlyBehaviour(function(){this.transform = SquaringMat(game.renderer.gl.drawingBufferWidth, game.renderer.gl.drawingBufferHeight, true)})
        )
    );
}