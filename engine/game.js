var game = {};
var maxFrameTime = 70;
var minFrameTime = 20;

game.debug = true;

function Startup(gameName, canvasName)
{
    var canvas = document.getElementById(canvasName);
    var context = canvas.getContext("experimental-webgl2") ||
                canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl") ||
                canvas.getContext("moz-webgl") ||
                canvas.getContext("webkit-3d") ;
    if (!context)
    {
        console.log("Could not get OpenGL context");
        return;
    }

    game.renderer = new Renderer(context);
    game.keyInput = new KeyInput();
    game.sceneGraph = MakeSceneGraphRoot();
    game.collisionManager = new CollisionManager();
    game.gameSpecific = window[gameName];
    
    game.Init();
    game.GameLoop();
};

game.GameLoop = function(){
    var previousTime = window.performance.now() - maxFrameTime;
    while(true)
    {
        var thisTime = window.performance.now();
        var deltaT = Math.min(thisTime - previousTime, maxFrameTime);
        if (deltaT < minFrameTime)
        {
            continue;
        }
        previousTime = thisTime;

        this.gameSpecific.Advance(deltaT);
        this.sceneGraph.Advance(deltaT);

        var collisionObjects = this.sceneGraph.GetCollisionObjects();
        this.collisionManager.HandleCollisions(collisionObjects);

        var renderObjects = this.sceneGraph.GetRenderObjects();
        this.renderer.RenderObjects(renderObjects, null);

        this.sceneGraph.NewFrame();
        this.keyInput.NewFrame();

        if (!this.gameSpecific.NewFrame())
        {
            break;
        }
    }
};

game.Init = function(){
    game.gameSpecific.Init();
};