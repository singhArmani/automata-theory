import { expect } from "chai";
import { char, State } from "../state";

import "mocha";

describe("State class", () => {
    it("should initialise the state class", () => {
        const s1 = new State({});
        expect(s1.accepting).to.equal(false);
    });
    it("should return correct transition symbol", () => {
        const s1 = new State({});
        const s2 = new State({});

        s1.addTransitionForSymbol('a', s2);

        expect(s1.getTransitionForSymbol('a')).to.deep.equal([s2]);
    });
});

describe("Regex test", () => {
    it("should match 'a' and 'b'", () => {
        const a = char('a');

        expect(a.test('a')).to.equal(true); 
        expect(a.test('b')).to.equal(false); 
    });
});
