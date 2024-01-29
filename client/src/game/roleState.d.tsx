import { PlayerIndex } from "./gameState.d"
import { Faction, RoleOutline } from "./roleListState.d"
import ROLES from "./../resources/roles.json";
import { Doomsayer } from "../menu/game/gameScreenContent/RoleSpecificMenus/LargeDoomsayerMenu";

export type RoleState = {
    role: "jailor",
    executionsRemaining: number,
    jailedTargetRef: number | null
} | {
    role: "mayor",
    revealed: boolean,
    public: boolean,
    journal: string
} | {
    role: "transporter"
} | {
    role: "sheriff"
} | {
    role: "lookout"
} | {
    role: "spy"
} | {
    role: "tracker"
} | {
    role: "seer"
} | {
    role: "psychic"
} | {
    role: "doctor",
    selfHealsRemaining: number,
} | {
    role: "bodyguard",
    selfShieldsRemaining: number,
} | {
    role: "vigilante",
    bulletsRemaining: number,
    willSuicide: boolean,
} | {
    role: "veteran"
    alertsRemaining: number,
} | {
    role: "escort"
} | {
    role: "medium",
    seancesRemaining: number,
    seancedTarget: PlayerIndex | null
} | {
    role: "retributionist"
} | {
    role: "godfather"
    backup: PlayerIndex | null
} | {
    role: "mafioso"
} | {
    role: "consort"
    roleblock: boolean,
    
    youWereRoleblockedMessage: boolean,
    youSurvivedAttackMessage: boolean,
    youWereProtectedMessage: boolean,
    youWereTransportedMessage: boolean,
    youWerePossessedMessage: boolean,
    yourTargetWasJailedMessage: boolean
} | {
    role: "blackmailer"
} | {
    role: "consigliere",
} | {
    role: "janitor"
    cleansRemaining: number,
    // cleanedRef
} | {
    role: "forger",
    fakeRole: Role,
    fakeWill: string,
    forgesRemaining: number,
    // forgedRef
} | {
    role: "witch"
} | {
    role: "jester"
} | {
    role: "executioner"
} | 
Doomsayer 
| {
    role: "politician"
} | {
    role: "arsonist"
} | {
    role: "werewolf"
    trackedPlayers: PlayerIndex[]
} | {
    role: "death",
    souls: number
} | {
    role: "vampire"
} | {
    role: "amnesiac"
    roleOutline: RoleOutline
}


export type Role = keyof typeof ROLES;
export function getFactionFromRole(role: Role): Faction {
    return ROLES[role].faction as Faction;
}