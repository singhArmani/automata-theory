import { expect } from "chai";
import {
    char,
    concatPair,
    digits,
    orPair,
    or,
    concat,
    plusOpt,
    plus,
    State,
    epsilon,
    optionalOpt,
    rep,
    repOpt
} from "../state";

import DFA from "../dfa";

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

    it("should match correctly: union machine: single pair", () => {
        const first = char("a");
        const second = char("b");

        const str = orPair(first, second);

        expect(str.test("a")).to.equal(true);
        expect(str.test("b")).to.equal(true);
        expect(str.test("c")).to.equal(false);
    });
    it("should match correctly: union machine: multiple pair", () => {
        const first = char("a");
        const second = char("b");
        const third = char("c");

        const str = or(first, second, third);

        expect(str.test("a")).to.equal(true);
        expect(str.test("b")).to.equal(true);
        expect(str.test("c")).to.equal(true);
    });

    it("should match correctly: repition machine using repOpt", () => {
        const repChar = repOpt(char("a"));

        expect(repChar.test("a")).to.equal(true);
        expect(repChar.test("")).to.equal(true);
        expect(repChar.test("aaaaaa")).to.equal(true);
    });
    it("should match correctly: repition machine using rep", () => {
        const repChar = rep(char("a"));

        expect(repChar.test("a")).to.equal(true);
        expect(repChar.test("")).to.equal(true);
        expect(repChar.test("aaaaaa")).to.equal(true);
    });

    it("should match correctly: digit character set", () => {
        expect(digits().test("0")).to.equal(true);
        expect(digits().test("5")).to.equal(true);
        expect(digits().test("9")).to.equal(true);
        expect(digits().test("a")).to.equal(false);
    });

    it("should match correctly: digit character set (optimize)", () => {
        expect(digits(3, 6).test("0")).to.equal(false);
        expect(digits(7, 9).test("5")).to.equal(false);
        expect(digits(1, 8).test("6")).to.equal(true);
        expect(digits(6).test("9")).to.equal(true);
    });

    it("should match correctly: plus operator", () => {
        const repChar = plus(char("a"));

        expect(repChar.test("a")).to.equal(true);
        expect(repChar.test("aaaaaa")).to.equal(true);
        expect(repChar.test("")).to.equal(false);
    });

    it("should match correctly: plus operator(optimize)", () => {
        const repChar = plusOpt(char("a"));

        expect(repChar.test("a")).to.equal(true);
        expect(repChar.test("aaaaaa")).to.equal(true);
        expect(repChar.test("")).to.equal(false);
    });

    it("should match correctly: optional optimize", () => {
        const repChar = optionalOpt(char("a"));

        expect(repChar.test("a")).to.equal(true);
        expect(repChar.test("aaaaaa")).to.equal(false);
        expect(repChar.test("")).to.equal(true);
    });

    it("should match correctly: complex machine /xy*|z/", () => {
        const regex = or(concat(char("x"), rep(char("y"))), char("z"));

        expect(regex.test("x")).to.equal(true);
        expect(regex.test("xy")).to.equal(true);
        expect(regex.test("z")).to.equal(true);
        expect(regex.test("za")).to.equal(false);
    });

    it("should match correctly: complex machine /a+[0-3]/", () => {
        const regex = concat(plus(char("a")), digits(0, 3));

        expect(regex.test("a")).to.equal(false);
        expect(regex.test("")).to.equal(false);
        expect(regex.test("aaa1")).to.equal(true);
        expect(regex.test("4")).to.equal(false);
        expect(regex.test("aa2")).to.equal(true);
    });

    it("should match correctly: complex machine /a+|[0-3]/", () => {
        const regex = or(plus(char("a")), digits(0, 3));

        expect(regex.test("a")).to.equal(true);
        expect(regex.test("")).to.equal(false);
        expect(regex.test("aaa1")).to.equal(false);
        expect(regex.test("aaa")).to.equal(true);
        expect(regex.test("4")).to.equal(false);
        expect(regex.test("aa2")).to.equal(false);
    });
});
