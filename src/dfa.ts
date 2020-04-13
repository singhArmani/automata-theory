import { EPSILON } from "./state";
import NFA from "./nfa";

class DFA {
    _nfa: NFA;

    constructor(nfa: NFA) {
        this._nfa = nfa;
    }

    getAlphabet(): Set<string> {
        // Getting alphabets using nfa built in method
        const alphabets = this._nfa.getAlphabet();

        // Removing the epsilon alphabets from the set
        alphabets.delete(EPSILON);

        return alphabets;
    }
}

export default DFA;
