var game = {};
var maxFrameTime = 100;
var targetFrameTime = 35;

game.debug = true;

function Startup(gameName, canvasName)
{
    var canvas = document.getElementById(canvasName);
    var context = canvas.getContext("experimental-webgl2",{preserveDrawingBuffer: true}) ||
                canvas.getContext("webgl",{preserveDrawingBuffer: true}) ||
                canvas.getContext("experimental-webgl",{preserveDrawingBuffer: true}) ||
                canvas.getContext("moz-webgl", {preserveDrawingBuffer: true}) ||
                canvas.getContext("webkit-3d", {preserveDrawingBuffer: true}) ;
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
    game.StartGameLoop();
};

game.StartGameLoop = function(){
    game.previousTime = window.performance.now() - maxFrameTime;
    GameLoop();
};

function GameLoop()
{
    var thisTime = window.performance.now();
    var deltaT = Math.min(thisTime - game.previousTime, maxFrameTime);
    game.previousTime = thisTime;

    game.gameSpecific.Advance(deltaT);
    game.sceneGraph.Advance(deltaT);

    var collisionObjects = game.sceneGraph.GetCollisionObjects();
    game.collisionManager.HandleCollisions(collisionObjects);

    var renderObjects = game.sceneGraph.GetRenderObjects();
    game.renderer.RenderObjects(null, renderObjects);
    
    game.renderer.EndFrame();
    
    //Cleanup ready for new frame.
    game.sceneGraph.NewFrame();
    game.keyInput.NewFrame();
    if (game.gameSpecific.NewFrame())//Return true to quit.
    {
        //Any pre-quit code?
    }
    else
    {
      var timeTaken = window.performance.now() - game.previousTime;
      setTimeout(GameLoop, Math.max(targetFrameTime - timeTaken, 0))
    }
};


game.Init = function(){
    game.gameSpecific.Init();
};