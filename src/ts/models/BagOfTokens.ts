import EmbeddedCollection from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs"
import { CombatData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs"

export const endOfRound = "END_OF_ROUND";

/**
 * This class represent the Troika! bag of tokens initiative. 
 * It contains all the tokens of all the characters participating to the initiative and the end of turn token.
 */
export class BagOfTokens {
    private readonly fullBag: {[key: string]: number};
    private readonly rounds: string[][] = [];
    private stack: string[] = [];

    constructor(
        combatatants: EmbeddedCollection<typeof Combatant, CombatData>
    ) {
        this.fullBag = Array.from(combatatants.entries()).reduce((p, [id, data]) => {
            if(!!data.initiative) {
                return {
                    ...p,
                    [id]: data.initiative!
                }
            } else {
                return p
            }
        }, {[endOfRound]: 1});
    }

    createRoundAndFillStack(round: number) {
        while(round >= this.rounds.length) {
            this.stack = Object.entries(this.fullBag).reduce((p, [k, v]) => p.concat(Array(v).fill(k)), [] as string[])
            this.rounds.push([]);
        }
    }

    getActiveCombatant(round: number, turn: number): string {
        this.createRoundAndFillStack(round);
        while(turn >= this.rounds[round].length) {
            const nextIndex = Math.floor(Math.random() * this.stack.length);
            this.rounds[round].push(this.stack[nextIndex]);
            this.stack.splice(nextIndex, 1);
        }
        return this.rounds[round][turn];
    }

    allTokens(): string[] {
        return Object.keys(this.fullBag);
    }
}