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
        return this.transitionMap.get(symbol);
    }

    test(symbols: string) {
        let idx = 0;

        let machinePtr: State = this;

        if (symbols.length === 0) {
            [machinePtr] = machinePtr.getTransitionForSymbol(EPSILON) || [];

            return !!machinePtr && machinePtr.accepting;
        }

        while (idx < symbols.length) {
            let [transitionKey] = machinePtr.transitionMap.keys() || [];

            console.log("....while...started...", {
                transitionKey,
                symbol: symbols[idx],
                machinePtr
            });

            if (transitionKey === EPSILON) {
                console.log("transition..", transitionKey);

                // We make the transition but not consume the character
                [machinePtr] = machinePtr.getTransitionForSymbol(EPSILON);

                console.log("next epsilon transit state: ", { machinePtr });
                continue;
            }

            console.log("transitionKey is not epsilon", {
                transitionKey,
                symbol: symbols[idx]
            });

            console.log(
                "moving machinePtr to the next transit state on consuming: ",
                symbols[idx]
            );

            // we consume the character and move the idx, and machinePtr
            [machinePtr] =
                machinePtr.getTransitionForSymbol(symbols[idx]) || [];

            console.log(
                `next machine ptr... after consuming: ${symbols[idx]}`,
                {
                    machinePtr
                }
            );

            if (!machinePtr) return false;

            console.log("idx before incrementing...", idx);
            idx++;
        }

        console.log("out of while looop..........", {
            machinePtr,
            symbol: symbols[idx],
            idx
        });

        return machinePtr.accepting;
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
export function rep(fragment: NFA): NFA  {
   const startState = new State(); 
   const finalState = new State({accepting: true}); 

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
