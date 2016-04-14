function GetOrCreateProgram(name, vertexSource, fragmentSource, attribNames, uniformNames)
{
    for (var programName in this._programs)
    {
        if (programName == name)
        {
            return this._programs[programName];
        }    
    }
    gl = this.gl
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    //console.log( gl.getShaderInfoLog(bgVertexShader));
    
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    //console.log( gl.getShaderInfoLog(bgFragmentShader));
    
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    var locations = {}
    for (var attribName in attribNames)
    {
        locations[attribName] = gl.getAttribLocation(shaderProgram, attribName);
    }
    for (var uniformName in uniformNames)
    {
        locations[uniformName] = gl.getUniformLocation(shaderProgram, uniformName);
    }
    this._programs[name] = [shaderProgram, locations];
    return [shaderProgram, locations];
}

var simpleQuad = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0]

function Renderer(gl){
    this.gl = gl;
    this.programName = null
    this._textures = {true: gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferWidth, 0, gl.RGBA, gl.UNSIGNED_BYTE, null),
                      false: gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferWidth, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)};
this._buffers = {true: gl.createFramebuffer(), false: gl.createFramebuffer()}
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._buffers[true]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._textures[true], 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._buffers[false]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._textures[false], 0);

    this._buffer = false;
    this.GetBuffer = function(){return this._buffers[this._buffer]}
    
    this._quadPositionBuffer = gl.createBuffer()
    gl.bindBuffer(context.ARRAY_BUFFER, this.quadPositionBuffer);
    gl.bufferData(context.ARRAY_BUFFER, new Float32Array(simpleQuad), context.STATIC_DRAW);
    
    this.EndFrame = function(){
        var drawBufferToCanvas = this._programs["_bufferToCanvas"];
        var program = drawBufferToCanvas[0];
        var locations = drawBufferToCanvas[1];
        
        this.programName = "_bufferToCanvas"
        this.gl.useProgram(program);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);//Draw to canvas.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._quadPositionBuffer);
        this.gl.enableVertexAttribArray(locations["aVertexPosition"]);
        this.gl.vertexAttribPointer(locations["aVertexPosition"], 2, this.gl.FLOAT, false, 0, 0); //positionLoc, numComponents, type, false, stride, offset
        
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._textures[this._buffer]);
        
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
        
        this._buffer = !this._buffer;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.GetBuffer());
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    this._programs = {}
    this.GetOrCreateProgram = GetOrCreateProgram;
    this.GetOrCreateProgram("_bufferToCanvas", shaders.bufferToCanvasVertex, shaders.bufferToCanvasFragment, shaders.bufferToCanvasUniforms, shaders.bufferToCanvasAttributes);
    this.GetProgram = function(name)
        {
            return this._programs[name];
        }
    this.SetProgram = function(name, program){
        if (this.programName != name)
        {
            this.programName = name;
            this.gl.useProgram(program);
        }
    }
    this.CreateTexture = function(img){
        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        return texture
    }
    this.RenderObjects = function(targetBuffer, renderables){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, targetBuffer)
        for (renderable in renderables)
        {
            renderable.RenderObject(this);
        }
    }
}

var stProgName = "standard";
function StandardShaderRenderObject(renderer){
    var standard;
    if (renderer.programName != stProgName)
    {
        standard = renderer.GetOrCreateProgram(stProgName, shaders.vertex, shaders.fragment, shaders.uniforms, shaders.attributes);
    }
    else
    {
        standard = renderer.GetProgram(stProgName);
    }
    renderer.SetProgram(stProgName, standard[0]);
    var locations = standard[1];
    var gl = renderer.gl;
    
    //shaders.uniforms = ["aVertexPosition", "aTextureCoordinates", "aHue", "aColourise"]

    //shaders.attributes = ["uLayerHeight", "uMVMatrix", "uTexture"]

    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.renderData.texture);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(context.ARRAY_BUFFER, new Float32Array(this.vertices), context.STATIC_DRAW);
    gl.enableVertexAttribArray(locations["aVertexPosition"]);
    gl.vertexAttribPointer(locations["aVertexPosition"], 2, gl.FLOAT, false, 0, 0); //positionLoc, numComponents, type, false, stride, offset
    
    var vertexDataBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
    gl.bufferData(context.ARRAY_BUFFER, new Float32Array(this.vertexData), context.STATIC_DRAW);
    gl.enableVertexAttribArray(locations["aTextureCoordinates"]);
    gl.vertexAttribPointer(locations["aTextureCoordinates"], 2, gl.FLOAT, false, 4, 0); //positionLoc, numComponents, type, false, stride, offset
    gl.enableVertexAttribArray(locations["aHue"]);
    gl.vertexAttribPointer(locations["aHue"], 1, gl.FLOAT, false, 4, 2);
    gl.enableVertexAttribArray(locations["aColourise"]);
    gl.vertexAttribPointer(locations["aColourise"], 1, gl.FLOAT, false, 4, 3);
    
    gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.vertices.length / 2);    //Planning to stick to convex polygons here, to make a lot of things easier.
}

var kfProgName = "fan";
function KaleidoscopeFanRenderFunction(renderer){
    var fan;
    if (renderer.programName != kfProgName)
    {
        fan = renderer.GetOrCreateProgram(kfProgName, shaders.kaleidoscopeFanVertex, shaders.kaleidoscopeFanFragment, shaders.kaleidoscopeFanUniforms, shaders.kaleidoscopeFanAttributes);
    }
    else
    {
        fan = renderer.GetProgram(kfProgName)
    }
    renderer.SetProgram(kfProgName, fan[0]);
    var locations = fan[1]   
    
    var texture = this.renderData.texture;
    var vertices = this.vertices;
    var vertexTexturePositions = this.vertexData;
    var gl = renderer.gl; 
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(context.ARRAY_BUFFER, new Float32Array(vertices), context.STATIC_DRAW);
    gl.enableVertexAttribArray(locations["aVertexPosition"]);
    gl.vertexAttribPointer(locations["aVertexPosition"], 2, gl.FLOAT, false, 0, 0); //positionLoc, numComponents, type, false, stride, offset
    
    var texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(context.ARRAY_BUFFER, new Float32Array(vertexTexturePositions), context.STATIC_DRAW);
    gl.enableVertexAttribArray(locations["aTextureCoordinates"]);
    gl.vertexAttribPointer(locations["aTextureCoordinates"], 2, gl.FLOAT, false, 0, 0); //positionLoc, numComponents, type, false, stride, offset

    gl.drawArrays(this.gl.TRIANGLE_FAN, 0, vertices.length / 2);
}