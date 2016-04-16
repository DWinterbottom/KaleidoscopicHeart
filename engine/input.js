function KeyInput() {
    this.pressedThisFrame = {};
    this.OnKeyPress = function(event)
    {
        var key = event.charCode;
        game.keyInput.pressedThisFrame[key] = true;
    }
    this.KeyPressed = function(key){
        var pressed = this.pressedThisFrame[key] === true;
        return pressed;
    }
    this.NewFrame = function()
    {
        this.pressedThisFrame = {};
    };
    
    document.addEventListener('keypress', this.OnKeyPress);
}