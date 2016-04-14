function AdvanceObject(deltaT)
{
    for (child in this.children)
    {
        child.Advance(deltaT);
    }
    this.Advance(deltaT);
}

function NewFrameObject()
{
    for (child in this.children)
    {
        child.NewFrame();
    }
    this.NewFrame;
}

function MakeSceneGraphObjectPrototype(renderObjectPrototype, physicsObjectPrototype, behaviour)
{ 
    var proto = {
        Advance:AdvanceObject,
        NewFrame:NewFrameObject
        AddReference:function(){
            this.reference += 1;
        },
        AddChild:function(child){
            this.children.push(child);
            child.AddReference();
        }
        RemoveReference:function(){
            this.reference -= 1;
            if (this.reference < 1)
            {
                for (var child in this.children){
                    child.RemoveReference();
                }
                this.OnDestroy();
            }
        }
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
            if (!found and search)
            {
                for (var child in this.children)
                {
                    child.RemoveChild(objectID, search);
                }
            }
        }
    };
    Object.assign(proto, renderObjectPrototype);
    Object.assign(proto, physicsObjectPrototype);
    Object.assign(proto, behaviour);
    return proto;
}

var _sceneGraphObjectID = 0;
function MakeSceneGraphObject(sceneGraphObjectPrototype)
{
    var sceneGraphObject = Object.create(
    sceneGraphObjectPrototype,
    {
        references:0,
        objectID:_sceneGraphObjectID,
        transform:Mat4Identity(),
        children:[]
    }
    )
    _sceneGraphObjectID = 0;
}

function AddTransformationToObject(childObject)
{
    childObject.transform = Mat4Multiply(renderObject.transform, this.transform);
}

function StandardGetRenderObjects()
{
    renderObjects = [];
    for (child in children)
    {
        renderObjects.push.apply(renderObjects, child.GetRenderObjects());
    }
    AddTransformationToObject.apply(this, renderObjects)
    
    if (this.RenderFunction != null)
    {
        var thisRenderObject =
        {
            transform:this.transform,
            vertices:this.vertices,
            vertexData:this.vertexData,
            RenderFunction:this.RenderFunction,
            renderData:this.renderData,
        }
        renderObjects.push()
    }
}

function RenderObjectPrototype(GetRenderObjects, vertices, vertexData, RenderFunction, renderData) {
    return 
    {
        GetRenderObjects:GetRenderObjects,
        vertices:vertices,
        vertexData:vertexData,
        RenderFunction:RenderFunction,
        renderData:renderData
    }
}

function StandardGetCollisionObjects()
{
    collisionObjects = [];
    for (child in children)
    {
        collisionObjects.push.apply(collisionObjects, child.GetCollisionObjects());
    }
    AddTransformationToObject.apply(this, collisionObjects)
    
    if (this.OnCollision != null)
    {
        var thisCollisionObject =
        {
            transform:this.transform,
            vertices:this.vertices,
            OnCollision:this.OnCollision,
            collisionData:this.collisionData
        }
        renderObjects.push()
    }
}

function CollisionObjectPrototype(GetCollisionObjects, collisionData) {
    return
    {
        GetCollisionObject:GetCollisionObject,
        collisionData:collisionData
    }
}

function Behaviour(Init, OnAdvance, OnCollision, OnNewFrame) {
    return
    {
        Init:Init,
        OnAdvance:OnAdvance,
        OnCollision:OnCollision,
        OnNewFrame:OnNewFrame
    }
}
