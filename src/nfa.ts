import { State, EPSILON, EPSILON_CLOSURE } from './state';

// We are only maintaining two invariants of having only one input state,
// and only one output state
class NFA {
    inState: State;
    outState: State;

    _transitionTable: Map<string, { [key: string]: Array<number> }>;

    _acceptingStates: Set<State>;

    _alphabet: Set<string>;

    constructor(inState: State, outState: State) {
        this.inState = inState;
        this.outState = outState;
    }

    // Tests whether this NFA matched the string. Delagate to the input state.
    test(string: string) {
        return this.inState.test(string);
    }

    /*
     * Returns transition table
     */
    getTransitionTable() {
        // We check if we have already calcutated the transition table or not. If not
        // then we calcutate it once and cache it in one of the member (_transitionTable) of the NFA class
        if (!this._transitionTable) {
            this._transitionTable = new Map();

            this._acceptingStates = new Set();

            const symbols = new Set();
            const visited = new Set<State>();

            const visitState = (state: State): void => {
                if (visited.has(state)) return;

                visited.add(state);

                // Labelling state with number (We use size of the set)
                state.number = visited.size;

                if (state.accepting) this._acceptingStates.add(state);

                this._transitionTable.set(`${state.number}`, {});

                for (const [symbol, transitions] of state.getTransitionMap()) {
                    let combinedState = [];
                    symbols.add(symbol);

                    for (const nextState of transitions) {
                        visitState(nextState);
                        combinedState.push(nextState.number);
                    }
                    this._transitionTable.get(state.number.toString())[
                        symbol
                    ] = combinedState;
                }
            };

            visitState(this.inState);

            // Let's remove the epsilon transition and add epsilon closure column into the table
            // Here we will use our getEpsilonClosure method defined on the state
            // and our visited set
            for (const state of visited) {
                const stateLabel = state.number.toString();
                // Deleting the epsilon transition from the table
                delete this._transitionTable.get(stateLabel)[EPSILON];

                const epsilonClosure = state.getEpsilonClosure();

                // Adding
                this._transitionTable.get(stateLabel)[
                    EPSILON_CLOSURE
                ] = epsilonClosure.map(s => s.number);
            }
        }

        return this._transitionTable;
    }

    getAlphabet(): Set<string> {
        if (!this._alphabet) {
            this._alphabet = new Set();

            const visited = new Set(); // TO keep tract of visited state;

            const visitState = state => {
                if (visited.has(state)) return;

                visited.add(state);

                for (const [
                    symbol,
                    symbolTransitions
                ] of state.getTransitionMap()) {
                    this._alphabet.add(symbol);

                    for (const nextState of state.getTransitionForSymbol(
                        symbol
                    )) {
                        visitState(nextState);
                    }
                }
            };

            visitState(this.inState);
        }

        return this._alphabet;
    }
}

export default NFA; 
