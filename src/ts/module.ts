import { BagOfTokens, endOfRound } from "./models/BagOfTokens";
import { TroikaError } from "./errors/TroikaError";
import { TroikaWarning } from "./errors/TroikaWarning";
import { valueOrError } from "./utils/value-utils";
import { CombatantData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";

const bags: { [key: string]: BagOfTokens} = {}

Hooks.once("init", () => {
    console.log("Troika! Numinous Initiative | Startup");
});

Hooks.on("error", (_callSite: string, error: Error) => {
    if(error instanceof TroikaError) {
        ui.notifications?.error((error as TroikaError).uiMsg);
    } else if(error instanceof TroikaWarning) {
        ui.notifications?.warn((error as TroikaWarning).uiMsg);
    }
})

/**
 * When creating a new combat, instantiates a new bag of tokens associated to it.

Hooks.on("createCombat", (_a: any, _b: any, combatId: string) => {
   console.log(`Troika! Numinous Initiative | Creating bag of tokens for combat ${combatId}`);
    throw new TroikaWarning("TEST TROIKA")
})
*/

Hooks.on("createCombatant", (combatantData: CombatantData) => {
    const actorId = valueOrError(() => combatantData.actorId, "Combatant has no reference actor");
    const combat = valueOrError(() => (game as Game).combats?.active, `There is no active combat!`);
    const combatant = valueOrError(() => combat?.getCombatantByActor(actorId), `There is no combatant for actor ${actorId}!`);
    const actor = valueOrError(() => (game as Game).actors?.get(actorId), `Cannot find Actor with id ${actorId}`)
    
    const rawActor = actor as unknown as any;
    const initiativeTokens = Number(rawActor["system"]["initiativeTokens"])
    let tokens: number | undefined = undefined
    if(!isNaN(initiativeTokens)) {
        if(initiativeTokens > 0) {
            tokens = initiativeTokens;
        } else {
            ui.notifications?.warn(`${actor.name} has no initiative tokens!`)
        }
    } else {
        ui.notifications?.error(`Wrong format in ${actor.name} initiative tokens. Found ${rawActor["system"]["initiativeTokens"]}, expected number.`)
    }

    if(!!tokens) {
        combat?.setInitiative(combatant.id!, tokens);
    } else {
        combat?.combatants.delete(combatant.id!, { modifySource: true })
    }
})

function initRound(combatId: string, round: number): string[] {
    const bag = valueOrError(() => bags[combatId], `No bag of tokens for combat ${combatId}`);
    const activeCombatant = bag.getActiveCombatant(round, 0);
    const nextCombatant = bag.getActiveCombatant(round, 1);
    if(activeCombatant == endOfRound) {
        return [];
    } else if (nextCombatant == endOfRound) {
        return [activeCombatant];
    } else {
        return [activeCombatant, nextCombatant];
    }
}

Hooks.on("combatStart", (combat: Combat) => {
    if(combat.isActive && !!combat.id) {
        bags[combat.id] = new BagOfTokens(combat.combatants);
        combat.turns = initRound(combat.id, 1).reduce((p, c) => {
            const combatant = combat.combatants.get(c)
            return !!combatant ? [...p, combatant] : p
        }, [] as Combatant[]);
    }
})

Hooks.on("combatRound", (combat: Combat) => {
    ui.notifications?.info("The End of Round token has been drawn and a new round starts!");
    if(combat.isActive && !!combat.id) {
        combat.turns = initRound(combat.id, combat.round + 1).reduce((p, c) => {
            const combatant = combat.combatants.get(c)
            return !!combatant ? [...p, combatant] : p
        }, [] as Combatant[]);
    }
})

Hooks.on("combatTurn", (combat: Combat) => {
    const combatId = valueOrError(() => combat.id, "Combat has no id");
    const bag = valueOrError(() => bags[combatId], `No bag of tokens for combat ${combatId}`);
    const turn = combat.turn ?? 0
    const nextCombatant = bag.getActiveCombatant(combat.round, turn + 2);
    console.log(`Round: ${combat.round} - turn: ${turn} - next: ${nextCombatant}`);
    if(nextCombatant !== endOfRound) {
        combat.turns = combat.turns.concat([combat.combatants.get(nextCombatant)!]);
    } 
})


Hooks.on("renderCombatTracker", () => {
    $(`a[data-control="rollAll"]`).css("visibility", "hidden"); 
    $(`a[data-control="rollNPC"]`).css("visibility", "hidden"); 
    $(`a[data-control="resetAll"]`).css("visibility", "hidden"); 
    const combat = (game as Game).combat;
    if(!!combat && combat.started) {
        const index = (combat.turn ?? 0) + 1;
        if(index < combat.turns.length) {
            $("li.actor.combatant").css("visibility", "visible");
            $("li.actor.combatant").last().css("visibility", "hidden");
        }
    }
})
