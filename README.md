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

![Buzz to Woody](data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb250ZW50U2NyaXB0VHlwZT0iYXBwbGljYXRpb24vZWNtYXNjcmlwdCIgY29udGVudFN0eWxlVHlwZT0idGV4dC9jc3MiIGhlaWdodD0iMTMxcHgiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHN0eWxlPSJ3aWR0aDoyMzRweDtoZWlnaHQ6MTMxcHg7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyMzQgMTMxIiB3aWR0aD0iMjM0cHgiIHpvb21BbmRQYW49Im1hZ25pZnkiPjxkZWZzPjxmaWx0ZXIgaGVpZ2h0PSIzMDAlIiBpZD0iZjFvdDJsbDM3azQxcnIiIHdpZHRoPSIzMDAlIiB4PSItMSIgeT0iLTEiPjxmZUdhdXNzaWFuQmx1ciByZXN1bHQ9ImJsdXJPdXQiIHN0ZERldmlhdGlvbj0iMi4wIi8+PGZlQ29sb3JNYXRyaXggaW49ImJsdXJPdXQiIHJlc3VsdD0iYmx1ck91dDIiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAuNCAwIi8+PGZlT2Zmc2V0IGR4PSI0LjAiIGR5PSI0LjAiIGluPSJibHVyT3V0MiIgcmVzdWx0PSJibHVyT3V0MyIvPjxmZUJsZW5kIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImJsdXJPdXQzIiBtb2RlPSJub3JtYWwiLz48L2ZpbHRlcj48L2RlZnM+PGc+PGxpbmUgc3R5bGU9InN0cm9rZTogI0E4MDAzNjsgc3Ryb2tlLXdpZHRoOiAxLjA7IHN0cm9rZS1kYXNoYXJyYXk6IDUuMCw1LjA7IiB4MT0iMzEiIHgyPSIzMSIgeTE9IjM5LjYwOTQiIHkyPSI4OS45NjA5Ii8+PGxpbmUgc3R5bGU9InN0cm9rZTogI0E4MDAzNjsgc3Ryb2tlLXdpZHRoOiAxLjA7IHN0cm9rZS1kYXNoYXJyYXk6IDUuMCw1LjA7IiB4MT0iMTk2LjUiIHgyPSIxOTYuNSIgeTE9IjM5LjYwOTQiIHkyPSI4OS45NjA5Ii8+PHJlY3QgZmlsbD0iI0ZFRkVDRSIgZmlsdGVyPSJ1cmwoI2Yxb3QybGwzN2s0MXJyKSIgaGVpZ2h0PSIzMS42MDk0IiBzdHlsZT0ic3Ryb2tlOiAjQTgwMDM2OyBzdHJva2Utd2lkdGg6IDEuNTsiIHdpZHRoPSI0MyIgeD0iOCIgeT0iMyIvPjx0ZXh0IGZpbGw9IiMwMDAwMDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBsZW5ndGhBZGp1c3Q9InNwYWNpbmdBbmRHbHlwaHMiIHRleHRMZW5ndGg9IjI5IiB4PSIxNSIgeT0iMjQuNTMzMiI+QnV6ejwvdGV4dD48cmVjdCBmaWxsPSIjRkVGRUNFIiBmaWx0ZXI9InVybCgjZjFvdDJsbDM3azQxcnIpIiBoZWlnaHQ9IjMxLjYwOTQiIHN0eWxlPSJzdHJva2U6ICNBODAwMzY7IHN0cm9rZS13aWR0aDogMS41OyIgd2lkdGg9IjQzIiB4PSI4IiB5PSI4OC45NjA5Ii8+PHRleHQgZmlsbD0iIzAwMDAwMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGxlbmd0aEFkanVzdD0ic3BhY2luZ0FuZEdseXBocyIgdGV4dExlbmd0aD0iMjkiIHg9IjE1IiB5PSIxMTAuNDk0MSI+QnV6ejwvdGV4dD48cmVjdCBmaWxsPSIjRkVGRUNFIiBmaWx0ZXI9InVybCgjZjFvdDJsbDM3azQxcnIpIiBoZWlnaHQ9IjMxLjYwOTQiIHN0eWxlPSJzdHJva2U6ICNBODAwMzY7IHN0cm9rZS13aWR0aDogMS41OyIgd2lkdGg9IjU4IiB4PSIxNjUuNSIgeT0iMyIvPjx0ZXh0IGZpbGw9IiMwMDAwMDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBsZW5ndGhBZGp1c3Q9InNwYWNpbmdBbmRHbHlwaHMiIHRleHRMZW5ndGg9IjQ0IiB4PSIxNzIuNSIgeT0iMjQuNTMzMiI+V29vZHk8L3RleHQ+PHJlY3QgZmlsbD0iI0ZFRkVDRSIgZmlsdGVyPSJ1cmwoI2Yxb3QybGwzN2s0MXJyKSIgaGVpZ2h0PSIzMS42MDk0IiBzdHlsZT0ic3Ryb2tlOiAjQTgwMDM2OyBzdHJva2Utd2lkdGg6IDEuNTsiIHdpZHRoPSI1OCIgeD0iMTY1LjUiIHk9Ijg4Ljk2MDkiLz48dGV4dCBmaWxsPSIjMDAwMDAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgbGVuZ3RoQWRqdXN0PSJzcGFjaW5nQW5kR2x5cGhzIiB0ZXh0TGVuZ3RoPSI0NCIgeD0iMTcyLjUiIHk9IjExMC40OTQxIj5Xb29keTwvdGV4dD48cG9seWdvbiBmaWxsPSIjQTgwMDM2IiBwb2ludHM9IjE4NC41LDY3Ljk2MDksMTk0LjUsNzEuOTYwOSwxODQuNSw3NS45NjA5LDE4OC41LDcxLjk2MDkiIHN0eWxlPSJzdHJva2U6ICNBODAwMzY7IHN0cm9rZS13aWR0aDogMS4wOyIvPjxsaW5lIHN0eWxlPSJzdHJva2U6ICNBODAwMzY7IHN0cm9rZS13aWR0aDogMS4wOyIgeDE9IjMxLjUiIHgyPSIxOTAuNSIgeTE9IjcxLjk2MDkiIHkyPSI3MS45NjA5Ii8+PHRleHQgZmlsbD0iIzAwMDAwMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGxlbmd0aEFkanVzdD0ic3BhY2luZ0FuZEdseXBocyIgdGV4dExlbmd0aD0iMTQxIiB4PSIzOC41IiB5PSI2Ny4xMDQ1Ij5UbyBpbmZpbml0eS4uLiBhbmQgYmV5b25kITwvdGV4dD48IS0tTUQ1PVtiODRhN2NlMjEwZGFmZjU5MjgxYTE5NWEyYzQ1MWEwNV0KQHN0YXJ0dW1sDQpCdXp6IC0+IFdvb2R5IDogVG8gaW5maW5pdHkuLi4gYW5kIGJleW9uZCENCkBlbmR1bWwNCgpQbGFudFVNTCB2ZXJzaW9uIDEuMjAyMC4xMShTYXQgTWF5IDMwIDEyOjEzOjQzIENFU1QgMjAyMCkKKEdQTCBzb3VyY2UgZGlzdHJpYnV0aW9uKQpKYXZhIFJ1bnRpbWU6IEphdmEoVE0pIFNFIFJ1bnRpbWUgRW52aXJvbm1lbnQKSlZNOiBKYXZhIEhvdFNwb3QoVE0pIENsaWVudCBWTQpEZWZhdWx0IEVuY29kaW5nOiBDcDEyNTIKTGFuZ3VhZ2U6IGRlCkNvdW50cnk6IEFUCi0tPjwvZz48L3N2Zz4=)

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
