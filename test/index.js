"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var fs = require("fs");
var path = require("path");
var plantuml_piper_1 = require("../dist/plantuml_pipe");

console.log("Cleaning up ...");
cleanUp();

console.log("Generating SVG output ...");
testSvg();

console.log("Generating PNG output ...");
testPng();

console.log("Generating cut-off PNG output ...");
testOptionPixelCutOffValue();

console.log("Generating error text file ...");
testOptionNoErrorImages();

// Delete the existing images in the directory
function cleanUp() {
    var directory = __dirname;

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        const filesToRemove = files.filter((path) => path.endsWith(".png") || path.endsWith(".svg"));

        for (const file of filesToRemove) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
            });
        }
    });
}

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

// Create PNG images using a different delimiter
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

// Test option: pixel cut off value
function testOptionPixelCutOffValue() {
    var puml = new plantuml_piper_1.PlantUmlPipe({ outputFormat: "png", pixelCutOffValue: 64 });
    var rstream = fs.createReadStream("./hello2.puml");
    var fileCounter = 0;

    rstream.pipe(puml.in);
    puml.out.on("data", function (chunk) {
        fs.writeFileSync("./" + fileCounter + "-cutoff.png", chunk);
        ++fileCounter;
    });
}

// Test option: no error images
function testOptionNoErrorImages() {
    var puml = new plantuml_piper_1.PlantUmlPipe({ noErrorImages: true });

    puml.in.write("@startuml\n");
    puml.in.write(".\n");
    puml.in.write("@enduml\n");
    puml.in.end();

    puml.out.on("data", function (chunk) {
        fs.writeFileSync("./error.svg", chunk);
    });
}
