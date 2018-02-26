export class LibError extends Error {
    constructor(message?: string, public innerError?: Error) {
        super(message);
        this.name = "LibError";
    }
}
