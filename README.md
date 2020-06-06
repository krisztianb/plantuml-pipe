# plantuml-pipe

A PlantUmlPipe instance is a wrapper to a PlantUML JAVA process running in pipe mode.
The object has an input stream (`in`) into which the PlantUML code for one or multiple diagrams can be written
and an output stream (`out`) from which the generated diagrams can be read.

## Usage

The following code creates two SVG image files:

```typescript
import * as fs from "fs";
import { PlantUmlPipe } from "plantuml_pipe";

const puml = new PlantUmlPipe();

let fileCounter = 0;
puml.out.on("data", (chunk: string) => {
    fs.writeFileSync("./" + fileCounter + ".svg", chunk);
    ++fileCounter;
});

puml.in.write("@startuml\n");
puml.in.write("Buzz -> Woody : To infinity... and beyond!\n");
puml.in.write("@enduml\n");
puml.in.write("@startuml\n");
puml.in.write("Woody -> Buzz : Howdy partner!\n");
puml.in.write("@enduml\n");
puml.in.end();
```

## Options

The `PlantUmlPipe` constructor can receive an options object as a parameter. It has the following members:

-   **outputFormat**

    A string specifying the output format of the generated diagrams.
    Possible values are: `latex | latex:nopreamble | pdf | png | svg | txt | utxt | vdx`. Default: `svg`

-   **jarPath**

    A string specifying the path to the PlantUML jar file that is used to generate the diagrams.
    Default: `../vendor/plantuml.jar`

-   **delimiter**

    A string specifying the delimiter the PlantUML process should use so separate the image files in the output stream.
    You only need to set this value if the default value is used as text in your PlantUML code.
    But why would you do that, right? Default: `___PLANTUML_DIAGRAM_DELIMITER___`

-   **split**

    This option specifies if the PlantUmlPipe instance should automatically split the PlantUML output stream at the
    specified delimiter and emit one `data` event per generated image. You can set this option to `false` to deactivate
    this splitting and have full control over the output stream. Default: `true`
