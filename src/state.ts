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
        // Getting prevStates
        let prevStates = this.getTransitionForSymbol(symbol) || [];
        this.transitionMap.set(symbol, [state, ...prevStates]);
    }

    // {a: [s]}
    getTransitionForSymbol(symbol: string): Array<State> {
        return this.transitionMap.get(symbol) || [];
    }

    test(symbols: string, visited = new Set()): boolean {
        // 1. Using graph traversal technique

        // If we have had previously made a epsilon transition to this state,
        // and visiting this state again, it means we may be in an infinite loop
        // and couldn't reach the accepting state. So, we return false.
        if (visited.has(this)) {
            return false;
        }

        // Adding this epsilon transition to the set
        visited.add(this);

        // If we have consumed all the sybmols in the string, and
        // reached to the end.
        if (symbols.length == 0) {
            // We check if it's accepting state
            if (this.accepting) return true;

            // If string is empty, we shouldn't give up. We can still reach to an accepting state
            // 1. if this current state has 1-many epsilon transtions.
            // 2. Or, following all the epsilon transition chain. 𝝴 -> o -> 𝝴 -> o -> ...
            for (const nextState of this.getTransitionForSymbol(EPSILON)) {
                if (nextState.test("", visited)) return true;
            }
            return false;
        }

        // Otherwise, handle the case when string is not empty,
        const firstSymbol = symbols[0];
        const rest = symbols.slice(1);

        /* We see if we have any transition from this state on the current symbol. 
           If yes, the symbol is consumed and recursive analysis for the string is executed. 
        */
        const symbolTransitions = this.getTransitionForSymbol(firstSymbol);

        // Checking if we can match current symbol and rest of the string recursively
        for (const nextState of symbolTransitions) {
            if (nextState.test(rest)) return true;
        }


        // If we don't have any transition from this symbol, we again still need to check for any 
        // epsilon transition, and see if we can reach to the accepting state. 

        for (const nextState of this.getTransitionForSymbol(EPSILON)) {
           if(nextState.test(symbols, visited)) return true;  
        }

        return false; 
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

// Epsilon NFA machine
export function epsilon(): NFA {
    return char(EPSILON);
}

/*
 * Concatination machine can be created by using single character and epsilon transition machine
 * as building blocks.
 * Concatination machine is built by concatenating two
 * single character machines with epsilon transition between them.
 */
export function concatPair(first: NFA, second: NFA): NFA {
    first.outState.accepting = false;
    second.outState.accepting = true;

    // Combining both first and second NFA's via epsilon transition.

    first.outState.addTransitionForSymbol(EPSILON, second.inState);

    return new NFA(first.inState, second.outState);
}

// Concatination factory
export function concat(first: NFA, ...rest: Array<NFA>): NFA {
    for (let fragment of rest) {
        first = concatPair(first, fragment);
    }

    return first;
}

// Union factory: single pari a|b
export function orPair(first: NFA, second: NFA): NFA {
    const startState = new State();
    const finalState = new State({ accepting: true });

    first.outState.accepting = false;
    second.outState.accepting = false;

    // Adding the entry epsilon transitions: can have two possibilies here.. either to 'a' or 'b'
    startState.addTransitionForSymbol(EPSILON, first.inState);
    startState.addTransitionForSymbol(EPSILON, second.inState);

    // Adding the exit epsilon transitions: can have two possibilies here.. either from 'a' or 'b'
    first.outState.addTransitionForSymbol(EPSILON, finalState);
    second.outState.addTransitionForSymbol(EPSILON, finalState);

    return new NFA(startState, finalState);
}

// Union factory : `a|b|c`
export function or(first: NFA, ...rest: Array<NFA>) {
    for (let fragment of rest) {
        first = orPair(first, fragment);
    }

    return first;
}

// Repition factory aka "Kleeene closure" : `a*`
// Fragment is a black box NFA machine.
export function rep(fragment: NFA): NFA {
    const startState = new State();
    const finalState = new State({ accepting: true });

    // Setting up the first non-epsilon transition (entering into the machine)
    startState.addTransitionForSymbol(EPSILON, fragment.inState);
    fragment.outState.accepting = false;

    // Setting up lower (0 times) case
    startState.addTransitionForSymbol(EPSILON, finalState);

    // Setting up epsilon transition on fragment to the final state
    fragment.outState.addTransitionForSymbol(EPSILON, finalState);

    // Finally, setting up the back transition to repeat the machine multiple times
    finalState.addTransitionForSymbol(EPSILON, fragment.inState);

    return new NFA(startState, finalState);
}

// Repition factory for "+" operator: Repeting one or more times.
// A+ === AA*
export function plus(fragment: NFA): NFA {
    return concat(fragment, rep(fragment));
}

// Optional machine "?": repeating 0 or 1 time
export function optional(fragment: NFA): NFA {
    return orPair(fragment, epsilon());
}

// Character class for digits \d: [0-9] === 0|1|2|3|....|9
export function digits(): NFA {
    let nfa = char("0");

    for (let i = 1; i < 10; i++) {
        nfa = orPair(nfa, char(i.toString()));
    }

    return nfa;
}
