import { Transform, TransformCallback } from "stream";
import { DeepReadonly } from "ts-essentials";

/**
 * A transformation stream that doesn't forward empty chunks.
 */
export class DropEmptyChunksStream extends Transform {
    /**
     * The transformation logic of the stream.
     * @param chunk The data chunk to be transformed.
     * @param _encoding If the chunk is a string, then this is the encoding type.
     *                  If chunk is a buffer, then this is the special value 'buffer'.
     * @param callback A callback function (optionally with an error argument and data) to be called
     *                 after the supplied chunk has been processed.
     */
    public override _transform(
        chunk: DeepReadonly<Buffer> | string,
        _encoding: string,
        callback: TransformCallback,
    ): void {
        if (chunk.length > 0) {
            this.push(chunk);
        }

        callback();
    }
}
