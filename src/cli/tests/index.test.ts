const mockJsonUnion = jest.fn();

jest.mock("../../", () => ({ default: mockJsonUnion }));

import cli from "../";

beforeEach(() => {
    mockJsonUnion.mockReset();
    mockJsonUnion.mockImplementation(() => Promise.resolve({}));
});

it("should pass glob patterns to jsonUnion", () => {

    const patterns = ["pattern1", "pattern2"];
    cli([...patterns, "-d"]);
    expect(mockJsonUnion.mock.calls[0][0]).toEqual(patterns);
});

it("should not include undefined options", () => {

    cli(["pattern1", "pattern2"]);
    expect(mockJsonUnion.mock.calls[0][1]).toEqual({
        deepMerge: false,
        ignoreParseErrors: false,
    });
});

it("should correctly set options", () => {

    const outfile = "my/out/file.json";
    const encoding = "ascii";
    cli(["pattern1", "pattern2", "--outfile", outfile, "--ignoreParseErrors", "--deepMerge", "--encoding", encoding]);
    expect(mockJsonUnion.mock.calls[0][1]).toEqual({
        deepMerge: true,
        encoding,
        ignoreParseErrors: true,
        outfile,
    });
});

it("should correctly set options when using alias", () => {

    const outfile = "my/out/file.json";
    const encoding = "ascii";
    cli(["pattern1", "pattern2", "-o", outfile, "-i", "-d", "-e", encoding]);
    expect(mockJsonUnion.mock.calls[0][1]).toEqual({
        deepMerge: true,
        encoding,
        ignoreParseErrors: true,
        outfile,
    });
});

it("should write to stdout when --outfile or -o is not set", async () => {

    process.stdout.write = jest.fn();
    await cli(["pattern1", "pattern2"]);
    expect(process.stdout.write).toBeCalledWith("{}");
});

it("should log errors to stderror", async () => {

    console.error = jest.fn();
    mockJsonUnion.mockImplementation(() => Promise.reject(new Error("test error")));
    await cli(["pattern1", "pattern2"]);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBe(1);
});
