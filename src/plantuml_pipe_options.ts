import * as path from "path";

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
    javaOptions?: ReadonlyArray<string>;

    /**
     * A collection of arguments that are passed to the PlantUML process.
     */
    plantUmlArgs?: ReadonlyArray<string>;
};

/**
 * Adds default values for missing option properties.
 * @param options The options whos missing properties are extended with default values.
 * @returns The options object in which every property has a value.
 */
export function addDefaultsToOptions(options: Readonly<PlantUmlPipeOptions>): Required<PlantUmlPipeOptions> {
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
export function createArgsFromOptions(options: Readonly<Required<PlantUmlPipeOptions>>): string[] {
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
