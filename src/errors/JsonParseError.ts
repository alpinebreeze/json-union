import { LibError } from "./";

export default class JsonParseError extends LibError {
    constructor(public filename: string, message?: string, public innerError?: Error) {
        super(message, innerError);
        this.name = "JsonParseError";
    }
}
