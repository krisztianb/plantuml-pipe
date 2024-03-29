[![NPM Version](https://badge.fury.io/js/plantuml-pipe.svg)](https://badge.fury.io/js/plantuml-pipe) [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=67UU75EUH4S8A)

# plantuml-pipe

<p align="center">
    <img src="https://github.com/krisztianb/plantuml-pipe/raw/master/images/plantuml-pipe.png" width="576px" alt="The PlantUmlPipe data flow" />
</p>

A PlantUmlPipe instance is a wrapper to a PlantUML JAVA process running in pipe mode.

The object has an input stream (`in`) into which the PlantUML code of multiple diagrams can be written and
an output streams (`out`) from which the generated diagrams can be read.

Instead of the streams you can also use the `process` method of the object which returns a promise with the generated diagram.

## Installation

This module can be installed using [npm](https://www.npmjs.com/package/plantuml-pipe):

```sh
$ npm install plantuml-pipe
```

**Note:** [JAVA](https://www.java.com/) and [Graphviz](https://graphviz.org/) must be installed on your system in
order to use this module. A corresponding test is run after installing this module.

This module includes type definitions for TypeScript.

## Usage (with streams)

The following TypeScript code creates two SVG image files using streams:

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

|                                                            First image (0.svg)                                                            |                                                  Second image (1.svg)                                                  |
| :---------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------: |
| ![First image](http://www.plantuml.com/plantuml/svg/SoWkIImgAStDuN8ghQfIqBLJ2C_FJwbKi588oLV8p4lBpCiigTJJqrD8p4jHI4gjpCzBKUHoICrB0Me10000) | ![Second image](http://www.plantuml.com/plantuml/svg/SoWkIImgAStDuGhFpq-fLD2rKt0ghQfIi5Bmo2y7yWk0idcfHOfS3gbvAK1b0000) |

## Usage (with promises)

The following TypeScript code creates the same two SVG image files using promises:

```typescript
import * as fs from "fs";
import { PlantUmlPipe } from "plantuml_pipe";

const puml = new PlantUmlPipe();

const buzzPlantUml = "@startuml\nBuzz -> Woody : To infinity... and beyond!\n@enduml";
const woodyPlantUml = "@startuml\nWoody -> Buzz : Howdy partner!\n@enduml";

puml.process(buzzPlantUml).then((imageData) => {
    fs.writeFileSync("./1.svg", imageData);
});

puml.process(woodyPlantUml).then((imageData) => {
    fs.writeFileSync("./2.svg", imageData);
});

puml.close();
```

## Options

The `PlantUmlPipe` constructor can receive an options object as a parameter. It has the following members:

| Name               | Description                                                                                  | Default                  |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------ |
| `jarPath`          | A string specifying the path to the PlantUML jar file that is used to generate the diagrams. | `../vendor/plantuml.jar` |
| `outputFormat`     | A string specifying the output format of the generated diagrams. Possible values are: `latex`, `latex:nopreamble`, `pdf`, `png`, `svg`, `txt`, `utxt` and `vdx`. | `svg` |
| `delimiter`        | A string specifying the delimiter the PlantUML process should use so separate the image files in the output stream. You only need to set this value if the default value is used as text in your PlantUML code. But why would you do that, right? | `___PLANTUML_DIAGRAM_DELIMITER___` |
| `split`            | This option specifies if the PlantUmlPipe instance should automatically split the PlantUML output stream at the specified delimiter and emit one `data` event per generated image. You can set this option to `false` to deactivate this splitting and have full control over the output stream. | `true` |
| `includePath`      | A string specifying the path where the PlantUML process is going to look for files included in the PlantUML code. | `.` |
| `pixelCutOffValue` | To prevent memory problems PlantUML limits the width and height of pixel (PNG) graphics to 4096. Use this option to set the `PLANTUML_LIMIT_SIZE` variable which overrides this value. |  |
| `noErrorImages`    | By default when the PlantUML process encounters an error (eg: because of an error in your PlantUML code), it still generates an image which contains an error message. You can set this option to `true` to disable error image generation. You can then implement an error handling yourself using the normal data event of PlantUMLPipe's output stream. For every error the data chunk of the event is going to start with the line `ERROR`. | `false` |
| `javaOptions`      | A string array of options that are passed to the JAVA process. If you are generating many big diagrams it might be necessary to increase the maximum heap size of the JAVA process. You can use this property to do so - look [here](https://plantuml.com/de/faq#e689668a91b8d065) for more information on this issue. |  |
| `plantUmlArgs`     | A string array of arguments that are passed to the PlantUML process as options. The PlantUML process has many options that you can set through the command line. Some of these options can be set directly using a property of the options argument you pass to the constructor of PlantUmlPipe - for example the `delimiter` property sets the `-pipedelimitor "xyz"` option. If there is no property for the option that you want to pass to the PlantUML process, you can use this property to do so. You can find the list of available PlantUML options [here](https://plantuml.com/de/command-line#6a26f548831e6a8c). |  |

## Bugs

Please report bugs [here](https://github.com/krisztianb/plantuml-pipe/issues). Thanks for your contribution!

## Donate

If you find this piece of software helpful, please consider a donation. Any amount is greatly appreciated.

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=67UU75EUH4S8A)
