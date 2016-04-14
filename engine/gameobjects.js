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

function SceneGraphObjectPrototype(renderObjectPrototype, physicsObjectPrototype, behaviour){ 
    this.transform = Mat4Identity();
    this.children = [];
    this.Advance = AdvanceObject;
    this.NewFrame = NewFrameObject;
    Object.extend(this, renderObjectPrototype);
    Object.extend(this, physicsObjectPrototype);
    Object.extend(this, behaviour);
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
    this.GetRenderObjects = GetRenderObjects;
    this.vertices = vertices;
    this.vertexData = vertexData;
    this.RenderFunction = RenderFunction
    this.renderData = renderData;
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
            collisionData:this.collisionData,
        }
        renderObjects.push()
    }
}

function CollisionObjectPrototype(GetCollisionObjects, collisionData) {
    this.GetCollisionObject = GetCollisionObject;
    this.collisionData = collisionData;
}

function Behaviour(Init, OnAdvance, OnCollision, OnNewFrame) {
 this.Init = Init;
 this.OnAdvance = OnAdvance;
 this.OnCollision = OnCollision;
 this.OnNewFrame = OnNewFrame;
}