import assert from "assert";
import * as fs from "fs";
import { Readable } from "stream";
import { PlantUmlPipe } from "../src/plantuml_pipe";

const toyStorySinglePlantUml = `@startuml
Buzz -> Woody : To infinity... and beyond!
@enduml`;

const toyStoryDoublePlantUml = `@startuml
Buzz -> Woody : To infinity... and beyond!
@enduml
@startuml
Woody -> Buzz : Howdy partner!
@enduml`;

describe("plantuml_pipe", () => {
    it("should create two SVG images", () => {
        const puml = new PlantUmlPipe();
        let fileNum = 1;

        Readable.from(toyStoryDoublePlantUml).pipe(puml.in);

        puml.out.on("data", (chunk: string) => {
            fs.writeFileSync(__dirname + `/${fileNum++}.svg`, chunk);
        });

        puml.out.on("close", () => {
            assert.strictEqual(fs.existsSync(__dirname + "/1.svg"), true);
            assert.strictEqual(fs.existsSync(__dirname + "/2.svg"), true);

            fs.unlinkSync(__dirname + "/1.svg");
            fs.unlinkSync(__dirname + "/2.svg");
        });
    });

    it("should create two PNG images using a custom delimiter", () => {
        const puml = new PlantUmlPipe({ outputFormat: "png", delimiter: "-----SNIP-----" });
        let fileNum = 1;

        Readable.from(toyStoryDoublePlantUml).pipe(puml.in);

        puml.out.on("data", (chunk: string) => {
            fs.writeFileSync(__dirname + `/${fileNum++}.png`, chunk);
        });

        puml.out.on("close", () => {
            assert.strictEqual(fs.existsSync(__dirname + "/1.png"), true);
            assert.strictEqual(fs.existsSync(__dirname + "/2.png"), true);

            fs.unlinkSync(__dirname + "/1.png");
            fs.unlinkSync(__dirname + "/2.png");
        });
    });

    it("should use the pixel cut off value", () => {
        const puml = new PlantUmlPipe({ outputFormat: "png", pixelCutOffValue: 64 });
        let fileNum = 1;

        Readable.from(toyStorySinglePlantUml).pipe(puml.in);

        puml.out.on("data", (chunk: string) => {
            fs.writeFileSync(__dirname + `/${fileNum++}-cutoff.png`, chunk);
        });

        puml.out.on("close", () => {
            assert.strictEqual(fs.existsSync(__dirname + "/1-cutoff.png"), true);

            fs.unlinkSync(__dirname + "/1-cutoff.png");

            // TODO: check if image is 64x64 pixels
        });
    });

    // it("should not create error images", () => {});

    // it("should fail with invalid JAR path", () => {});
});
