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
    if (game.debug)
    {
        console.log( name+" Vertex Shader Compilation Log: "+gl.getShaderInfoLog(vertexShader));
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (game.debug)
    {
        console.log( name+" Fragment Shader Compilation Log:"+gl.getShaderInfoLog(fragmentShader));
    }

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    var locations = {}
    for (var attrib in attribNames)
    {
        var attribName = attribNames[attrib];
        locations[attribName] = gl.getAttribLocation(shaderProgram, attribName);
        console.log(name+": Attribute '"+attribName+"' bound to location "+locations[attribName])
    }
    for (var uniform in uniformNames)
    {
        var uniformName = uniformNames[uniform];
        locations[uniformName] = gl.getUniformLocation(shaderProgram, uniformName);
        if (game.debug)
        {
            console.log(name+": Uniform '"+uniformName+"' bound to location "+locations[uniformName])
        }
    }
    this._programs[name] = [shaderProgram, locations];
    return [shaderProgram, locations];
}

function SetUpFrameBuffer(gl, width, height)
{
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      
      
      var depth = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
      
      var buffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
      
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      
      return [texture, depth, buffer];
    
}

function SetUpFrameBuffers(renderer, gl, width, height)
{
    renderer._textures = {};
    renderer._depths = {};
    renderer._buffers = {};
    
    for (var b in [true, false])
    { 
      b = [true,false][b]
      var tdb = SetUpFrameBuffer(gl, width, height);
      renderer._textures[b] = tdb[0];
      renderer._depths[b] = tdb[1];
      renderer._buffers[b] = tdb[2];
    }
    
    renderer._buffer = false;
    renderer.GetBuffer = function(){return this._buffers[this._buffer]}
}
var simpleQuad = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0]

function Renderer(gl){
    this.gl = gl;
    this.programName = null
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    SetUpFrameBuffers(this, gl, gl.drawingBufferWidth, gl.drawingBufferHeight)
    
    this._quadPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(simpleQuad), gl.STATIC_DRAW);
    
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
        
        this.gl.bindTexture(gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    this._programs = {}
    this.GetOrCreateProgram = GetOrCreateProgram;
    this.GetOrCreateProgram("_bufferToCanvas", shaders.bufferToCanvasVertex, shaders.bufferToCanvasFragment, shaders.bufferToCanvasAttributes, shaders.bufferToCanvasUniforms);
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
        if (targetBuffer == null)
        {
            targetBuffer = this.GetBuffer();
        }
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, targetBuffer)
        for (renderable in renderables)
        {
            renderables[renderable].RenderFunction(this);
        }
        
        this.gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.gl.bindTexture(gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

var stProgName = "standard";
function StandardShaderRenderObjectFunction(renderer){
    var standard;
    if (renderer.programName != stProgName)
    {
        standard = renderer.GetOrCreateProgram(stProgName, shaders.vertex, shaders.fragment, shaders.attributes, shaders.uniforms);
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
    if (!this.renderData.texture)
    {
        this.renderData.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.renderData.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.renderData.image);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    else
    {
        gl.bindTexture(gl.TEXTURE_2D, this.renderData.texture);
    }
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(locations["aVertexPosition"]);
    gl.vertexAttribPointer(locations["aVertexPosition"], 2, gl.FLOAT, false, 0, 0); //positionLoc, numComponents, type, false, stride, offset
    
    //Vertex Data
    var vertexDataBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexData), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(locations["aTextureCoordinates"]);
    gl.vertexAttribPointer(locations["aTextureCoordinates"], 2, gl.FLOAT, false, 4*4, 0*4); //positionLoc, numComponents, type, false, stride, offset
    gl.enableVertexAttribArray(locations["aHue"]);
    gl.vertexAttribPointer(locations["aHue"], 1, gl.FLOAT, false, 4*4, 2*4);//*4 'cause it's float32s.
    gl.enableVertexAttribArray(locations["aColourise"]);
    gl.vertexAttribPointer(locations["aColourise"], 1, gl.FLOAT, false, 4, 3*4);
    
    //Uniforms
    gl.uniformMatrix4fv(locations["uMVMatrix"], false, this.transform)
    var layerHeight = this.layerHeight | this.renderData.layerHeight | 0.0
    gl.uniform1f(locations["uLayerHeight"], false, layerHeight)
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length / 2);    //Planning to stick to convex polygons here, to make a lot of things easier.
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(locations["aVertexPosition"]);
    gl.vertexAttribPointer(locations["aVertexPosition"], 2, gl.FLOAT, false, 0, 0); //positionLoc, numComponents, type, false, stride, offset
    
    var texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTexturePositions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(locations["aTextureCoordinates"]);
    gl.vertexAttribPointer(locations["aTextureCoordinates"], 2, gl.FLOAT, false, 0, 0); //positionLoc, numComponents, type, false, stride, offset

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
}