import assert from "assert";
import * as fs from "fs";
import sizeOf from "image-size";
import { EOL } from "os";
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

describe("PlantUmlPipe", function () {
    // eslint-disable-next-line @typescript-eslint/no-invalid-this -- See https://mochajs.org/#timeouts
    this.timeout(0);

    it("should create two SVG images", (done) => {
        const puml = new PlantUmlPipe();
        let fileNum = 1;

        Readable.from(toyStoryDoublePlantUml).pipe(puml.in);

        puml.out.on("data", (chunk: string) => {
            fs.writeFileSync(__dirname + `/${fileNum++}.svg`, chunk);
        });

        puml.out.on("close", () => {
            assert.strictEqual(fileNum, 3);
            assert.strictEqual(fs.existsSync(__dirname + "/1.svg"), true);
            assert.strictEqual(fs.existsSync(__dirname + "/2.svg"), true);

            fs.unlinkSync(__dirname + "/1.svg");
            fs.unlinkSync(__dirname + "/2.svg");
            done();
        });
    });

    it("should create two PNG images using a custom delimiter", (done) => {
        const puml = new PlantUmlPipe({ outputFormat: "png", delimiter: "-----SNIP-----" });
        let fileNum = 1;

        Readable.from(toyStoryDoublePlantUml).pipe(puml.in);

        puml.out.on("data", (chunk: string) => {
            fs.writeFileSync(__dirname + `/${fileNum++}.png`, chunk);
        });

        puml.out.on("close", () => {
            assert.strictEqual(fileNum, 3);
            assert.strictEqual(fs.existsSync(__dirname + "/1.png"), true);
            assert.strictEqual(fs.existsSync(__dirname + "/2.png"), true);

            fs.unlinkSync(__dirname + "/1.png");
            fs.unlinkSync(__dirname + "/2.png");
            done();
        });
    });

    it("should use the pixel cut off value", (done) => {
        const pixelCutOffValue = 64;
        const puml = new PlantUmlPipe({ outputFormat: "png", pixelCutOffValue });
        let fileNum = 1;

        Readable.from(toyStorySinglePlantUml).pipe(puml.in);

        puml.out.on("data", (chunk: string) => {
            fs.writeFileSync(__dirname + `/${fileNum++}.png`, chunk);
        });

        puml.out.on("close", () => {
            assert.strictEqual(fileNum, 2);
            assert.strictEqual(fs.existsSync(__dirname + "/1.png"), true);

            const dimension = sizeOf(__dirname + "/1.png");
            assert.strictEqual(dimension.width, pixelCutOffValue);
            assert.strictEqual(dimension.height, pixelCutOffValue);

            fs.unlinkSync(__dirname + "/1.png");
            done();
        });
    });

    it("should not create error images", (done) => {
        const puml = new PlantUmlPipe({ noErrorImages: true });
        const filePath = __dirname + `/error.svg`;

        puml.in.write("@startuml\n");
        puml.in.write(".\n");
        puml.in.write("@enduml\n");
        puml.in.end();

        puml.out.on("data", (chunk: string) => {
            fs.writeFileSync(filePath, chunk);
        });

        puml.out.on("close", () => {
            assert.strictEqual(fs.existsSync(filePath), true);

            const fileContent = fs.readFileSync(filePath).toString();
            assert.strictEqual(fileContent, `ERROR${EOL}1${EOL}Syntax Error?${EOL}`);

            fs.unlinkSync(filePath);
            done();
        });
    });

    it("should fail with invalid JAR path", () => {
        try {
            const puml = new PlantUmlPipe({ jarPath: "asdf.jar" });
            console.log(typeof puml); // just to satisfy linter and tsc
            throw new Error("Creating the PlantUmlPipe instance should have failed.");
        } catch (ex: unknown) {
            assert.strictEqual(ex instanceof Error, true);
            if (ex instanceof Error) {
                assert.strictEqual(ex.message.startsWith("plantuml JAR file not found:"), true);
            }
        }
    });
});
