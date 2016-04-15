function KeyInput() {
    this.pressedThisFrame = {};
    this.OnKeyPress = function(event)
    {
        var key = event.keyCode;
        this.pressedThisFrame[key] = true;
    }
    this.KeyPressed = function(key){
        return this.pressedThisFrame[key] == true;
    }
    this.NewFrame = function()
    {
        this.pressedThisFrame = {};
    };
    
    document.addEventListener('keypress', this.OnKeyPress);
}