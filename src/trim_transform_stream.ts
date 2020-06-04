import { Transform, TransformCallback, TransformOptions } from "stream";

/**
 * A stream that removes empty buffer chunks.
 */
export class TrimTransformStream extends Transform {
    /**
     * Creates a new transform stream.
     * @param opts Transform stream options.
     */
    constructor(opts?: TransformOptions) {
        super(opts);
    }

    /**
     * The transformation logic of the stream.
     * @param chunk The data chunk to be transformed.
     * @param _encoding If the chunk is a string, then this is the encoding type.
     *                  If chunk is a buffer, then this is the special value 'buffer'
     * @param callback A callback function (optionally with an error argument and data) to be called
     *                 after the supplied chunk has been processed.
     */
    _transform(chunk: Buffer, _encoding: string, callback: TransformCallback): void {
        // PlantUML pipe mode also adds the delimiter to the end of the last created image.
        // This results in the last buffer being empty. Here we drop that buffer.
        if (chunk.length > 0) {
            this.push(chunk);
        }

        callback();
    }
}
