// @ts-ignore: There are no type definitions for this module
import * as bsplit from "binary-split";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { EOL } from "os";
import * as split2 from "split2";
import { Readable, Writable } from "stream";
import { SkipEmptyChunksStream } from "./skip_empty_chunks_stream";

/**
 * Options for a PlantUmlPipe.
 */
export interface PlantUmlPipeOptions {
    /**
     * Output format for the generated diagrams.
     * @default svg
     */
    outputFormat: "latex" | "latex:nopreamble" | "pdf" | "png" | "svg" | "txt" | "utxt" | "vdx";

    /**
     * Possible path to the plantuml.jar file to be used to generate diagrams.
     * @default "../vendor/plantuml.jar"
     */
    jarPath?: string;

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
        const jarPath = options?.jarPath ?? "../vendor/plantuml.jar";
        const format = options?.outputFormat ?? "svg";
        const delimiter = options?.delimiter ?? "___PLANTUML_DIAGRAM_DELIMITER___";
        const split = options?.split ?? true;

        const taskArgs = [
            "-Djava.awt.headless=true",
            "-jar",
            jarPath,
            "-t" + format,
            "-pipe",
            "-pipedelimitor",
            delimiter,
        ];

        this.task = spawn("java", taskArgs);
        this.inputStream = this.task.stdin;

        if (split) {
            const splitter = format === "png" ? bsplit(delimiter + EOL) : split2(delimiter + EOL);

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
