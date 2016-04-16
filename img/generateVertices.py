import os
import json

def pointFromLine(line):
    s = line.strip().split(',')
    return (float(s[0]), float(s[1]))

verticesForFiles = {}

errors = []
textFiles = [f for f in os.listdir(os.path.dirname(__file__)) if f.endswith(".txt")]
for fileName in textFiles:
    name = os.path.basename(fileName).split('.')[0]
    try:
        with open(fileName) as textFile:
            vertices = []
            #First line is the size.
            sizeLine = textFile.readline()
            size = pointFromLine(sizeLine)
            errors += ["Texture Size = "+`size`]
            #BlankLine.
            textFile.readline()
            #List of verices.
            for line in textFile.readlines():
                point = pointFromLine(line)
                errors += ["Point: "+`point`]
                vertex = (point[0]/(size[0]-1), 1 - (point[1]/(size[1]-1)))#Invert y axis.
                errors += ["Raw Vertex: "+`vertex`]
                vertices.append(vertex)
        verticesForFiles[name] = vertices
    except BaseException as error:
        errors += ["Error processing file "+fileName+": "+str(error)]

def chain(items):
    ret = []
    for item in items:
        ret.extend(item)
    return ret

textureData = {}
for name in verticesForFiles:
    textureData[name] = {
        "isLoaded":False,
        "imagePath":"./img/{}.png".format(name),
        "vertices":chain([((2 * vertex[0]) -1, (2 * vertex[1]) - 1) for vertex in verticesForFiles[name]]),
        "textureCoordinates":chain(verticesForFiles[name])
    }

with open("textures.js", 'w') as textureFile:
    textureFile.write("textures = {};".format(json.dumps(textureData)))
    
with open("errors.log",'w') as errorFile:
    for error in errors:
        print error
        errorFile.write(error+"\n")