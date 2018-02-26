import { LibError } from "../";

it("should be instance of LibError", () => {

    const sut = new LibError();
    expect(sut).toBeInstanceOf(LibError);
});

it("should have name LibError", () => {

    const sut = new LibError();
    expect(sut.name).toBe("LibError");
});
