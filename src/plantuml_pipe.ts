import bsplit from "binary-split";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as fs from "fs";
import { EOL } from "os";
import split2 from "split2";
import { Readable, Writable } from "stream";
import { DropEmptyChunksStream } from "./drop_empty_chunks_stream";
import { addDefaultsToOptions, createArgsFromOptions, PlantUmlPipeOptions } from "./plantuml_pipe_options";

/**
 * Class that wraps a PlantUML diagram generator running in pipe mode.
 */
export class PlantUmlPipe {
    /**
     * Process object for the PlantUML JAVA process that is spawned.
     */
    private readonly javaProcess: ChildProcessWithoutNullStreams;

    /**
     * Input stream of the object into which PlantUML code can be sent.
     */
    private readonly inputStream: Writable;

    /**
     * Output stream of the object into which the diagrams are written.
     */
    private readonly outputStream: Readable;

    /**
     * Collection of promise resolver functions used for the "process" method that returns a promise.
     */
    private readonly resolvers = new Array<(imageData: string | Readonly<Buffer>) => void>();

    /**
     * Creates a new PlantUML pipe.
     * @param userOptions Possible user defined options for the PlantUML generating pipe.
     */
    public constructor(userOptions: Readonly<PlantUmlPipeOptions> = {}) {
        const options = addDefaultsToOptions(userOptions);

        if (!fs.existsSync(options.jarPath)) {
            throw new Error("plantuml JAR file not found: " + options.jarPath);
        }

        const args = createArgsFromOptions(options);

        this.javaProcess = spawn("java", args);
        this.inputStream = this.javaProcess.stdin;

        if (options.split) {
            const splitter =
                options.outputFormat === "png" ? bsplit(options.delimiter + EOL) : split2(options.delimiter + EOL);

            // PlantUML pipe mode also adds the delimiter to the end of the last created image.
            // This results in the last buffer being empty. DropEmptyChunksStream drops that buffer.
            this.outputStream = this.javaProcess.stdout.pipe(splitter).pipe(new DropEmptyChunksStream());
        } else {
            this.outputStream = this.javaProcess.stdout;
        }
    }

    /**
     * @returns The input stream into which to write the PlantUML code of the diagrams.
     */
    public get in(): Writable {
        return this.inputStream;
    }

    /**
     * @returns The output stream from which to read the generated PlantUML diagram images.
     */
    public get out(): Readable {
        return this.outputStream;
    }

    /**
     * Closes the input stream of the PlantUML diagram generator.
     */
    public close(): void {
        this.inputStream.end();
    }

    /**
     * Resolves the currently first promise in the queue by calling its corresponding resolve function.
     * @param imageData The gnerated image data that is passed to the resolve function of the promise.
     */
    private readonly resolvePromise = (imageData: string | Readonly<Buffer>): void => {
        const resolver = this.resolvers.shift();

        if (resolver) {
            resolver(imageData);
        }
    };

    /**
     * Generates a PlantUML diagram image from the given PlantUML code.
     * @param plantUml The PlantUML code.
     * @returns A promise with the data of the generated PlantUML diagram image.
     */
    public async process<T extends string | Readonly<Buffer>>(plantUml: string): Promise<T>;
    public async process(plantUml: string): Promise<string | Readonly<Buffer>> {
        let resolver: ((imageData: string | Readonly<Buffer>) => void) | undefined;

        const promise = new Promise<string | Readonly<Buffer>>((resolve) => {
            resolver = resolve;
        });

        if (resolver) {
            this.resolvers.push(resolver);
        }

        if (!this.outputStream.listeners("data").includes(this.resolvePromise)) {
            this.outputStream.on("data", this.resolvePromise);
        }

        this.inputStream.write(plantUml.endsWith("\n") ? plantUml : plantUml + "\n");

        return promise;
    }
}
