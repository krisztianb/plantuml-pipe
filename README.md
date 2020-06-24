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

Output:

First image (0.svg) | Second image (1.svg)
:------------------:|:--------------------:
![First image](http://www.plantuml.com/plantuml/svg/SoWkIImgAStDuN8ghQfIqBLJ2C_FJwbKi588oLV8p4lBpCiigTJJqrD8p4jHI4gjpCzBKUHoICrB0Me10000) | ![Second image](http://www.plantuml.com/plantuml/svg/SoWkIImgAStDuGhFpq-fLD2rKt0ghQfIi5Bmo2y7yWk0idcfHOfS3gbvAK1b0000)

## Options

The `PlantUmlPipe` constructor can receive an options object as a parameter. It has the following members:

-   **jarPath**

    A string specifying the path to the PlantUML jar file that is used to generate the diagrams.
    Default: `../vendor/plantuml.jar` pointing to the file that is installed with this module.

-   **outputFormat**

    A string specifying the output format of the generated diagrams.
    Possible values are: `latex | latex:nopreamble | pdf | png | svg | txt | utxt | vdx`. Default: `svg`

-   **delimiter**

    A string specifying the delimiter the PlantUML process should use so separate the image files in the output stream.
    You only need to set this value if the default value is used as text in your PlantUML code.
    But why would you do that, right? Default: `___PLANTUML_DIAGRAM_DELIMITER___`

-   **split**

    This option specifies if the PlantUmlPipe instance should automatically split the PlantUML output stream at the
    specified delimiter and emit one `data` event per generated image. You can set this option to `false` to deactivate
    this splitting and have full control over the output stream. Default: `true`

-   **includePath**

    A string specifying the path where the PlantUML process is going to look for files included in the PlantUML code.
    Default: `.` pointing to the folder from which the node process is started.
