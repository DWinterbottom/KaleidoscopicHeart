function Rot2dMat(angle){
    return [Math.cos(angle), -Math.sin(angle),0,0,
            Math.sin(angle), Math.cos(angle),0,0,
            0,0,1,0,
            0,0,0,1]
};
function SquaringMat(width, height, expand = false){
    if (expand){
        if (width > height){
        var ratio = height/width;
        return [ ratio, 0, 0, 0,
                 0, 1, 0, 0,
                 0, 0, 1, 0,
                 0, 0, 0, 1]
        }
        else {
            var ratio = width/height;
            return [ 1, 0, 0, 0,
                     0, ratio, 0, 0,
                     0, 0, 1, 0,
                     0, 0, 0, 1]
        }
    } else {
        if (width > height){
        var ratio = width/height;
        return [ ratio, 0, 0, 0,
                 0, 1, 0, 0,
                 0, 0, 1, 0,
                 0, 0, 0, 1]
        }
        else {
            var ratio = height/width;
            return [ 1, 0, 0, 0,
                     0, ratio, 0, 0,
                     0, 0, 1, 0,
                     0, 0, 0, 1]
        }

        
    }
}
function Mat4Identity(){
                    return [1,0,0,0,
                    0,1,0,0,
                    0,0,1,0,
                    0,0,0,1] }

function Mat4Multiply(first, second){
    var ret = Mat4Identity()
    for (var i = 0; i < 4; i++)
    {
        for (var j = 0; j < 4; j++)
        {
            var total = 0;
            for (var k = 0; k < 4; k++)
            {
                total += first[i + k*4] * second[k + j*4]
            }
            ret[i + j*4] = total;
        }
    }
    return ret
}

function Translate(original, translation){
                    return [original[0],original[1],original[2],original[3]+translation[0],
                    original[4],original[5],original[6],original[7]+translation[1],
                    original[8],original[9],original[10],original[11]+translation[2],
                    original[12],original[13],original[14],original[15]] }

