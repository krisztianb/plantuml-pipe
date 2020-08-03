"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var plantuml_piper_1 = require("../dist/plantuml_pipe");

// When PlantUmlPipe wants to spawn a JAVA process and JAVA is not installed, node.js will emit an exception.
// Here we catch such exceptions and output them to the console.
process.on("uncaughtException", function (err) {
    console.error(err.message);
});

console.log("Testing installation of JAVA and Graphviz ...");
doTestDot();

/**
 * Creates a PlantUmlPipe with the "-testdot" argument to test the installation of JAVA and Graphviz DOT.
 */
function doTestDot() {
    var chunks = [];

    var puml = new plantuml_piper_1.PlantUmlPipe({ plantUmlArgs: ["-testdot"] });

    puml.out.on("data", function (chunk) {
        chunks.push(chunk);
    });

    puml.out.on("end", function () {
        var output = Buffer.concat(chunks).toString();
        var dotOkText = "Installation seems OK. File generation OK";
        var dotOk = output.indexOf(dotOkText) !== -1;

        console.log(output);

        if (dotOk) {
            console.log("[OK] Test successful. You are all set up to use plantuml-pipe.\n");
        } else {
            console.error(
                "[ERROR] Test failed. You need to install JAVA and Graphviz in order to use plantuml-pipe.\n",
            );
        }
    });
}
