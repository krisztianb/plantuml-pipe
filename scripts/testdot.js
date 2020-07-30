"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

process.on("uncaughtException", function (err) {
    console.error(err.message);
});

var plantuml_piper_1 = require("../dist/plantuml_pipe");

console.log("Testing installation of JAVA and Graphviz ...");
doTestDot();

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
