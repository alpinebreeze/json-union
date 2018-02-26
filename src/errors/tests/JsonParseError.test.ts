import JsonParseError from "../JsonParseError";

it("should be instance of LibError", () => {

    const sut = new JsonParseError("filename.json");
    expect(sut).toBeInstanceOf(JsonParseError);
});

it("should have name LibError", () => {

    const sut = new JsonParseError("filename.json");
    expect(sut.name).toBe("JsonParseError");
});
