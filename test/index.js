"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var fs = require("fs");
var plantuml_piper_1 = require("../dist/plantuml_pipe");

testSvg();
testPng();

// Create SVG images
function testSvg() {
    var puml = new plantuml_piper_1.PlantUmlPipe();
    var rstream = fs.createReadStream("./hello2.puml");
    var fileCounter = 0;

    rstream.pipe(puml.in);
    puml.out.on("data", function (chunk) {
        fs.writeFileSync("./" + fileCounter + ".svg", chunk);
        ++fileCounter;
    });
}

// Crearte PNG images using a different delimiter
function testPng() {
    var puml = new plantuml_piper_1.PlantUmlPipe({ outputFormat: "png", delimiter: "-----SNIP-----" });
    var rstream = fs.createReadStream("./hello2.puml");
    var fileCounter = 0;

    rstream.pipe(puml.in);
    puml.out.on("data", function (chunk) {
        fs.writeFileSync("./" + fileCounter + ".png", chunk);
        ++fileCounter;
    });
}
