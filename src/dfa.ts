import { EPSILON, EPSILON_CLOSURE, State } from "./state";
import NFA from "./nfa";

class DFA {
    _nfa: NFA;

    _transitionTable: Map<string, {[key: string]: string}>;
    _acceptingStates: Set<string>;

    _startingState: string;

    constructor(nfa: NFA) {
        this._nfa = nfa;
    }

    // Getting alphabets used in the transition table (columns)
    getAlphabet(): Set<string> {
        // Getting alphabets using nfa built in method
        const alphabets = this._nfa.getAlphabet();

        // Removing the epsilon alphabets from the set
        alphabets.delete(EPSILON);

        return alphabets;
    }

    // Accepting states (calcutated during table built)
    getAcceptingStates(): Set<string> {
        if (!this._acceptingStates) {
        }

        return this._acceptingStates;
    }


    getStartingState(): string {
        if(!this._startingState) {
            this.getTransitionTable();
        }

        return this._startingState;
    }

    getTransitionTable() {
        if (this._transitionTable) return this._transitionTable;

        // Calculate from NFA transition table
        const nfaTable = this._nfa.getTransitionTable();

        this._acceptingStates = new Set();

        // Start state of DFA is E(S[nfa]);
        const startState = this._nfa.inState.getEpsilonClosure();

        // Init the worklist (states which should be in the DFA)
        const workList = [startState];

        this._startingState = startState.join(','); 

        const alphabets = this.getAlphabet();

        const nfaAcceptingStates = this._nfa._acceptingStates;

        const dfaTable = new Map();

        // Determin whether the combined DFA state is accepting
        const updateAcceptingStates = (states: Array<State>) => {
            for (const nfaAcceptingState of nfaAcceptingStates) {
                // If any of the states from NFA is accepting, DFA's state is accepting as well.
                if (states.includes(nfaAcceptingState)) {
                    this._acceptingStates.add(states.join(","));
                    break;
                }
            }
        };

        while (workList.length > 0) {
            const states = workList.shift();

            const dfaStateLabel = states.join(",");

            dfaTable.set(dfaStateLabel, {});

            for (const symbol of alphabets) {
                let onSymbol = [];

                // Determine whether combined state is accepting
                updateAcceptingStates(states);

                for (const state of states) {
                    const nfaStatesOnSymbol = nfaTable.get(state.number)[
                        symbol
                    ];

                    if (!nfaStatesOnSymbol) continue;

                    for (const nfaStateOnSymbol of nfaStatesOnSymbol) {
                        if (!nfaTable.get(nfaStateOnSymbol)) continue;

                        onSymbol.push(
                            ...nfaTable.get(nfaStateOnSymbol)[EPSILON_CLOSURE]
                        );
                    }
                }

                // This is to remove the duplicates. We use the set data structure
                const dfaStateOnSymbolSet = new Set(onSymbol);
                const dfaStateOnSymbol = [...dfaStateOnSymbolSet];

                if (dfaStateOnSymbol.length > 0) {
                    const dfaStateOnSymbolStr = dfaStateOnSymbol.join(",");

                    dfaTable.get(dfaStateLabel)[symbol] = dfaStateOnSymbolStr;

                    if (dfaTable.has(dfaStateOnSymbolStr)) {
                        workList.unshift(dfaStateOnSymbol);
                    }
                }
            }

            return (this._transitionTable = dfaTable);
        }
    }


    test(str: string): boolean {
        const table = this.getTransitionTable(); 

        let state = this.getStartingState(); 

        let i = 0; // string pointer

        while(str[i] != null) {
            state = table.get(state)[str[i++]];

            if(state == null) return false; 
        }

        // out of while loop. 
        return this.getAcceptingStates().has(state);
    }
}

export default DFA;
