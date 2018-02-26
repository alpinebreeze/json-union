// setup mocks
const mockGlob = jest.fn((pattern, callback) => callback(undefined, ["test/match.json", "test/match2.json"]));
const mockFs = {
    readFile: jest.fn(),
    writeFile: jest.fn((filename, data, options, callback) => callback()),
};
const mockMkdirp = jest.fn((dir, callback) => callback());

jest.mock("fs", () => mockFs);
jest.mock("glob", () => mockGlob);
jest.mock("mkdirp", () => mockMkdirp);

import jsonUnion from "../";

beforeEach(() => {
    mockGlob.mockClear();
    mockFs.readFile = jest.fn().mockImplementationOnce(
        (filename: any, encoding: any, callback: any) =>
            callback(undefined, JSON.stringify({ obj: { foo: true, bar: false }, message: "my json object" })),
    ).mockImplementationOnce(
        (filename: any, encoding: any, callback: any) =>
            callback(undefined, JSON.stringify({ obj: { foo: false }, message2: "my other json object" })),
    ).mockImplementation(
        (filename: any, encoding: any, callback: any) =>
            callback(undefined, JSON.stringify({ message3: "my last json object" })),
    );
    mockFs.writeFile.mockClear();
    mockMkdirp.mockClear();
});

it("should return {} when an array with no patterns are passed", async () => {

    const mergedJson = await jsonUnion([]);
    expect(mergedJson).toEqual({});
});

it("should return correct json with string pattern", async () => {

    const json = await jsonUnion("dir/**/*.json");

    expect(json).toEqual({
        message: "my json object",
        message2: "my other json object",
        obj: { foo: false },
    });
});

it("should deep merge json files when deepMerge setting is provided", async () => {

    const json = await jsonUnion("dir/**/*.json", { deepMerge: true });

    expect(json).toEqual({
        message: "my json object",
        message2: "my other json object",
        obj: { foo: false, bar: false },
    });
});

it("should return correct json with string[] patterns", async () => {

    const json = await jsonUnion(["dir/**/*.json", "dir2/**/*.json"]);

    expect(json).toEqual({
        message: "my json object",
        message2: "my other json object",
        message3: "my last json object",
        obj: { foo: false },
    });
});

it("should call mkdir and writeFile when outfile is provided", async () => {

    const dir = "my/out";
    const outfile = dir + "/file.json";
    await jsonUnion([], { outfile });

    expect(mockMkdirp.mock.calls[0][0]).toBe(dir);
    expect(mockFs.writeFile.mock.calls[0][0]).toBe(outfile);
});

it("should throw error when invalid JSON is encountered", async () => {

    mockFs.readFile = jest.fn().mockImplementationOnce(
        (filename: any, encoding: any, callback: any) =>
            callback(undefined, "{message='invalid json'"),
    ).mockImplementationOnce(
        (filename: any, encoding: any, callback: any) =>
            callback(undefined, JSON.stringify({ message2: "my other json object" })),
    );

    try {
        await jsonUnion("dir/**/*.json");
    } catch (error) {
        expect(error).toBeDefined();
    }
});

it("should continue to parse JSON files even when one is invalid if ignoreParseErrors option is provided", async () => {

    mockFs.readFile = jest.fn().mockImplementationOnce(
        (filename: any, encoding: any, callback: any) =>
            callback(undefined, "{message='invalid json'"),
    ).mockImplementationOnce(
        (filename: any, encoding: any, callback: any) =>
            callback(undefined, JSON.stringify({ message2: "my other json object" })),
    );

    const json = await jsonUnion("dir/**/*.json", { ignoreParseErrors: true });

    expect(json).toEqual({ message2: "my other json object" });
});

it("should pass utf8 encoding to read and write file when options not set", async () => {

    const encoding = "utf8";
    await jsonUnion("dir/**/*.json", { outfile: "my/out/file.json" });
    expect((mockFs.readFile as jest.Mock<any>).mock.calls[0][1]).toBe(encoding);
    expect((mockFs.readFile as jest.Mock<any>).mock.calls[1][1]).toBe(encoding);
    expect((mockFs.writeFile as jest.Mock<any>).mock.calls[0][2]).toEqual({ encoding });
});

it("should pass ascii encoding to read and write file when options is set", async () => {

    const encoding = "ascii";
    await jsonUnion("dir/**/*.json", { encoding, outfile: "my/out/file.json" });
    expect((mockFs.readFile as jest.Mock<any>).mock.calls[0][1]).toBe(encoding);
    expect((mockFs.readFile as jest.Mock<any>).mock.calls[1][1]).toBe(encoding);
    expect((mockFs.writeFile as jest.Mock<any>).mock.calls[0][2]).toEqual({ encoding });
});
