import bsplit from "binary-split";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { EOL } from "os";
import * as path from "path";
import split2 from "split2";
import { Readable, Writable } from "stream";
import { SkipEmptyChunksStream } from "./skip_empty_chunks_stream";

/**
 * Options for a PlantUmlPipe.
 */
export interface PlantUmlPipeOptions {
    /**
     * Possible path to the plantuml.jar file to be used to generate diagrams.
     * @default "../vendor/plantuml.jar"
     */
    jarPath?: string;

    /**
     * Output format for the generated diagrams.
     * @default svg
     */
    outputFormat: "latex" | "latex:nopreamble" | "pdf" | "png" | "svg" | "txt" | "utxt" | "vdx";

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
     * A collection of options that are passed to the JAVA process.
     */
    javaOptions?: string[];

    /**
     * A collection of arguments that are passed to the PlantUML process.
     */
    plantUmlArgs?: string[];
}

/**
 * Class that wraps a PlantUML diagram generator running in pipe mode.
 */
export class PlantUmlPipe {
    /**
     * Task object for the PlantUML process that is spawned.
     */
    private task: ChildProcessWithoutNullStreams;

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
     * @param options Options for the PlantUML generating pipe.
     */
    constructor(options?: PlantUmlPipeOptions) {
        const jarPath = options?.jarPath ?? path.join(__dirname, "../vendor/plantuml.jar");
        const outputFormat = options?.outputFormat ?? "svg";
        const delimiter = options?.delimiter ?? "___PLANTUML_DIAGRAM_DELIMITER___";
        const split = options?.split ?? true;
        const includePath = options?.includePath ?? ".";

        const taskArgs = [
            "-Djava.awt.headless=true",
            `-Dplantuml.include.path="${includePath}"`,
            ...(options?.javaOptions ?? []),
            "-jar",
            jarPath,
            "-t" + outputFormat,
            "-pipe",
            "-pipedelimitor",
            delimiter,
            ...(options?.plantUmlArgs ?? []),
        ];

        this.task = spawn("java", taskArgs);
        this.inputStream = this.task.stdin;

        if (split) {
            const splitter = outputFormat === "png" ? bsplit(delimiter + EOL) : split2(delimiter + EOL);

            // PlantUML pipe mode also adds the delimiter to the end of the last created image.
            // This results in the last buffer being empty. SkipEmptyChunksStream drops that buffer.
            this.outputStream = this.task.stdout.pipe(splitter).pipe(new SkipEmptyChunksStream());
        } else {
            this.outputStream = this.task.stdout;
        }
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
