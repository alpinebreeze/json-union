import * as parseArgs from "minimist";
import jsonUnion, { Options } from "../";

async function cli(args: string[]): Promise<void> {

    const argv = parseArgs(args, {
        alias: { o: "outfile", i: "ignoreParseErrors", d: "deepMerge", e: "encoding" },
        boolean: ["deepMerge", "ignoreParseErrors"],
        string: ["encoding", "outfile"],
    });

    const options: Options = {
        deepMerge: argv.deepMerge,
        encoding: argv.encoding,
        ignoreParseErrors: argv.ignoreParseErrors,
        outfile: argv.outfile,
    };

    let json: any;

    try {
        json = await jsonUnion(argv._, options);
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
        return;
    }

    if (!options.outfile) {
        process.stdout.write(JSON.stringify(json));
    }
}

export default cli;
