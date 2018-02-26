import * as extend from "extend";
import * as fs from "fs";
import * as glob from "glob";
import * as mkdirp from "mkdirp";
import * as path from "path";
import JsonParseError from "./errors/JsonParseError";

function find(pattern: string): Promise<string[]> {

    return new Promise((resolve, reject) => {

        glob(pattern, (err, matches) => {

            if (err) { return reject(err); }
            return resolve(matches);
        });
    });
}

function readFile(filename: string, encoding: string): Promise<any> {

    return new Promise((resolve, reject) => {

        fs.readFile(filename, encoding, (error, data) => {

            if (error) { return reject(error); }

            try {
                return resolve(JSON.parse(data));
            } catch (parseError) {
                return reject(new JsonParseError(filename, "There was a problem parsing a JSON file", parseError));
            }
        });
    });
}

function mkdir(dir: string): Promise<void> {

    return new Promise<void>((resolve, reject) => {

        mkdirp(dir, (error, made) => {

            if (error) { return reject(error); }
            return resolve();
        });
    });
}

function writeFile(filename: string, encoding: string, data: any): Promise<void> {

    return new Promise<void>((resolve, reject) => {

        fs.writeFile(filename, JSON.stringify(data), { encoding }, (err) => {

            if (err) { return reject(err); }
            return resolve();
        });
    });
}

/** jsonUnion options */
export interface Options {

    /** the directory and filename of where the merged JSON file should be saved */
    outfile?: string;

    /** ignores any errors that are raised from parsing the JSON file  */
    ignoreParseErrors?: boolean;

    /** merges JSON files recursively */
    deepMerge?: boolean;

    /** encoding used to read and write files */
    encoding?: string;
}

const defaultOptions: Options = {
    deepMerge: false,
    encoding: "utf8",
    ignoreParseErrors: false,
    outfile: undefined,
};

/**
 * Performs merging of JSON files that match the provided glob patterns
 * @param  {(string|string[])} patterns a string or string array of glob patterns to match against
 * @param  {Options} [options] jsonUnion options
 * @returns {Promise<Object>} a promise to the merged JSON object
 */
async function jsonUnion(patterns: string | string[], options?: Options): Promise<any> {

    if (typeof patterns === "string") {
        patterns = [patterns];
    }

    const settings: Options = extend({}, defaultOptions, options || {});
    const mergedJson = {};

    for (const pattern of patterns) {
        const filenames = await find(pattern);

        for (const filename of filenames) {

            let json: any;

            try {
                json = await readFile(filename, settings.encoding as string);
            } catch (error) {
                if (error instanceof JsonParseError && settings.ignoreParseErrors) {
                    continue;
                }

                throw error;
            }

            if (settings.deepMerge) {
                extend(true, mergedJson, json);
            } else {
                extend(mergedJson, json);
            }
        }
    }

    if (settings.outfile) {
        const dir = path.dirname(settings.outfile);
        await mkdir(dir);
        await writeFile(settings.outfile, settings.encoding as string, mergedJson);
    }

    return mergedJson;
}

export default jsonUnion;
