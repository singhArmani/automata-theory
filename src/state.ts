/**
 * FA state class
 */

const EPSILON = "𝝴";

type options = {
    accepting?: boolean;
};

export class State {
    accepting: boolean;
    transitionMap: Map<string, Array<State>>;
    constructor({ accepting = false }: options = {}) {
        this.accepting = accepting;
        this.transitionMap = new Map<string, Array<State>>();
    }

    addTransitionForSymbol(symbol: string, state: State): void {
        this.transitionMap.set(symbol, [state]);
    }
    getTransitionForSymbol(symbol: string): Array<State> {
        return this.transitionMap.get(symbol);
    }

    test(symbol: string) {
        console.log({symbol})
        // Find the state and checks if its accepting state is true
        const state = this.getTransitionForSymbol(symbol); 

        // If no state is found, we return false
        return !!state &&  state[0].accepting;
    }
}

// Single character and epsilon-transition machine
// We are only maintaining two invariants of having only one input state,
// and only one output state
export class NFA {
    inState: State;
    outState: State;

    constructor(inState: State, outState: State) {
        this.inState = inState;
        this.outState = outState;
    }

    // Tests whether this NFA matched the string. Delagate to the input state.
    test(string: string) {
        return this.inState.test(string);
    }
}

// Factory function for creating a Single char machine: `a`
export function char(symbol: string): NFA {
    const inState = new State();
    const outState = new State();

    // This is one feature of single character machine.
    outState.accepting = true;
    inState.addTransitionForSymbol(symbol, outState);

    return new NFA(inState, outState);
}

// Epsilon NFA
export function epsilon(): NFA {
    return char(EPSILON);
}

/*
 * Concatination machine can be created by using single character and epsilon transition machine
 * as building blocks.
 * Concatination machine is built by concatenating two 
 * single character machines with epsilon transition between them.
 */
export function concatination(first: NFA, second: NFA): NFA {
    first.outState.accepting = false;
    second.outState.accepting = true;

    // Combining both first and second NFA's via epsilon transition.

    first.outState.addTransitionForSymbol(EPSILON, second.inState);

    return new NFA(first.inState, second.outState);
}

// Concatination factory 

export function concat(first: NFA, ...rest: Array<NFA>): NFA {
  
    for(let fragment of rest) {
      first  = concat(first, fragment);
    }

    return first; 
}
