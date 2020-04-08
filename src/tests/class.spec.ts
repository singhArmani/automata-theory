import { expect } from "chai";
import { char, concatPair, concat, State, epsilon } from "../state";

import "mocha";

describe("State class", () => {
    it("should initialise the state class", () => {
        const s1 = new State({});
        expect(s1.accepting).to.equal(false);
    });
    it("should return correct transition symbol", () => {
        const s1 = new State({});
        const s2 = new State({});

        s1.addTransitionForSymbol("a", s2);

        expect(s1.getTransitionForSymbol("a")).to.deep.equal([s2]);
    });
});

describe("Regex test", () => {
    it("should match correctly: single character NFA", () => {
        const a = char("a");

        expect(a.test("a")).to.equal(true);
        expect(a.test("b")).to.equal(false);
    });

    it("should match correctly: epsilon transition", () => {
        const a = epsilon();

        expect(a.test("")).to.equal(true);
        expect(a.test("b")).to.equal(false);
    });

    it("should match correctly: concatination machine single pair", () => {
        const first = char("a");
        const second = char("b");

        const str = concatPair(first, second);

        expect(str.test("ab")).to.equal(true);
        expect(str.test("b")).to.equal(false);
    });
    it("should match correctly: concatination machine multiple pair", () => {
        const first = char("a");
        const second = char("b");
        const third = char("c");

        const str = concat(first, second, third);

        expect(str.test("ab")).to.equal(false);
        expect(str.test("b")).to.equal(false);
        expect(str.test("abc")).to.equal(true);
    });
});
