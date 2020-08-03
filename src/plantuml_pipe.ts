import bsplit from "binary-split";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as fs from "fs";
import { EOL } from "os";
import * as path from "path";
import split2 from "split2";
import { Readable, Writable } from "stream";
import { DropEmptyChunksStream } from "./drop_empty_chunks_stream";

/**
 * Options for a PlantUmlPipe.
 */
export type PlantUmlPipeOptions = {
    /**
     * Possible path to the plantuml.jar file to be used to generate diagrams.
     * @default "../vendor/plantuml.jar"
     */
    jarPath?: string;

    /**
     * Output format for the generated diagrams.
     * @default "svg"
     */
    outputFormat?: "latex" | "latex:nopreamble" | "pdf" | "png" | "svg" | "txt" | "utxt" | "vdx";

    /**
     * Delimiter used in the output stream to separate diagrams.
     * @default "___PLANTUML_DIAGRAM_DELIMITER___"
     */
    delimiter?: string;

    /**
     * If true, the output streams sends each diagram in its own chunk of buffer.
     * @default true
     */
    split?: boolean;

    /**
     * The PlantUML include path where include files are looked for.
     * @default "."
     */
    includePath?: string;

    /**
     * Sets the PLANTUML_LIMIT_SIZE variable specifying the maximum width and height of pixel graphic output.
     */
    pixelCutOffValue?: number;

    /**
     * If true, in case of an error the data event is not going to contain an error image but only an error message.
     * @default false
     */
    noErrorImages?: boolean;

    /**
     * A collection of options that are passed to the JAVA process.
     */
    javaOptions?: string[];

    /**
     * A collection of arguments that are passed to the PlantUML process.
     */
    plantUmlArgs?: string[];
};

/**
 * Class that wraps a PlantUML diagram generator running in pipe mode.
 */
export class PlantUmlPipe {
    /**
     * Process object for the PlantUML JAVA process that is spawned.
     */
    private javaProcess: ChildProcessWithoutNullStreams;

    /**
     * Input stream of the object into which PlantUML code can be sent.
     */
    private inputStream: Writable;

    /**
     * Output stream of the object into which the diagrams are written.
     */
    private outputStream: Readable;

    /**
     * Creates a new PlantUML pipe.
     * @param userOptions Possible user defined options for the PlantUML generating pipe.
     */
    constructor(userOptions: PlantUmlPipeOptions = {}) {
        const options = this.addDefaultsToOptions(userOptions);

        if (!fs.existsSync(options.jarPath)) {
            throw new Error("File not found: " + options.jarPath);
        }

        const args = this.createArgsFromOptions(options);

        this.javaProcess = spawn("java", args);
        this.inputStream = this.javaProcess.stdin;

        if (options.split) {
            const splitter =
                options.outputFormat === "png" ? bsplit(options.delimiter + EOL) : split2(options.delimiter + EOL);

            // PlantUML pipe mode also adds the delimiter to the end of the last created image.
            // This results in the last buffer being empty. SkipEmptyChunksStream drops that buffer.
            this.outputStream = this.javaProcess.stdout.pipe(splitter).pipe(new DropEmptyChunksStream());
        } else {
            this.outputStream = this.javaProcess.stdout;
        }
    }

    /**
     * Adds default values for missing option properties.
     * @param options The options whos missing properties are extended with default values.
     * @returns The options object in which every property has a value.
     */
    private addDefaultsToOptions(options: PlantUmlPipeOptions): Required<PlantUmlPipeOptions> {
        return {
            jarPath: options.jarPath ?? path.join(__dirname, "../vendor/plantuml.jar"),
            outputFormat: options.outputFormat ?? "svg",
            delimiter: options.delimiter ?? "___PLANTUML_DIAGRAM_DELIMITER___",
            split: options.split ?? true,
            includePath: options.includePath ?? ".",
            pixelCutOffValue: options.pixelCutOffValue ?? 0,
            noErrorImages: options.noErrorImages ?? false,
            javaOptions: options.javaOptions ?? [],
            plantUmlArgs: options.plantUmlArgs ?? [],
        };
    }

    /**
     * Creates an array with command line arguments for the PlantUML JAVA process.
     * @param options The options from which the arguments are created.
     * @returns The command line arguments.
     */
    private createArgsFromOptions(options: Required<PlantUmlPipeOptions>): string[] {
        let args = ["-Djava.awt.headless=true", `-Dplantuml.include.path="${options.includePath}"`];

        if (options.pixelCutOffValue > 0) {
            args.push(`-DPLANTUML_LIMIT_SIZE=${options.pixelCutOffValue}`);
        }

        if (options.javaOptions.length > 0) {
            args = args.concat(options.javaOptions);
        }

        args.push("-jar");
        args.push(options.jarPath);

        args.push("-t" + options.outputFormat);

        args.push("-pipe");
        args.push("-pipedelimitor");
        args.push(options.delimiter);

        if (options.noErrorImages) {
            args.push("-pipeNoStderr");
        }

        if (options.plantUmlArgs.length > 0) {
            args = args.concat(options.plantUmlArgs);
        }

        return args;
    }

    /**
     * The input stream into which to write the PlantUML code of the diagrams.
     */
    get in(): Writable {
        return this.inputStream;
    }

    /**
     * The output stream from which to read the generated PlantUML diagram images.
     */
    get out(): Readable {
        return this.outputStream;
    }
}
