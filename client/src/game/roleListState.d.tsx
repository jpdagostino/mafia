
import translate from "./lang";
import { Role, getFactionFromRole } from "./roleState.d";
import ROLES from "../resources/roles.json";

export const FACTIONS = ["town", "mafia", "cult", "neutral", "fiends"] as const;
export type Faction = typeof FACTIONS[number]
export function getRoleOutlineFromFaction(faction: Faction): RoleOutline {
    return {
        type: "roleOutlineOptions",
        options: [{
            type: "faction",
            faction: faction
        }]
    }
}

export type RoleList = RoleOutline[];
export function getRolesFromRoleList(roleList: RoleList): Role[] {

    let set = new Set<Role>();
    for(let roleOutline of roleList){
        for(let role of getRolesFromOutline(roleOutline)){
            set.add(role);
        }
    }

    return Array.from(set);
}
export function getRolesFromRoleListRemoveExclusionsAddConversions(roleList: RoleList, excludedRoles: Role[]): Role[] {
    let out = [];

    let roles = getRolesFromRoleList(roleList);
    roles = roles.filter((role) => {
        return !excludedRoles.includes(role);
    });

    
    for(let role of roles){
        switch (role) {
            case "wildcard":
            case "trueWildcard":
                getRolesComplement(excludedRoles).forEach((role) => {
                    out.push(role);
                });
                break;
            case "mafiaWildcard":
                getRolesComplement(excludedRoles)
                    .filter((role)=>getFactionFromRole(role)==="mafia")
                    .filter((role)=>role!=="godfather" && role!=="mafioso")
                    .forEach((role) => {
                        out.push(role);
                    }
                );
                break;
            case "fiendsWildcard":
                getRolesComplement(excludedRoles)
                    .filter((role)=>getFactionFromRole(role)==="fiends")
                    .forEach((role) => {
                        out.push(role);
                    }
                );
                break;
        }
    }

    for(let role of roles){
        out.push(role);
        for(let converted of ROLES[role].canBeConvertedTo){
            out.push(converted);
        }
    }

    return out as Role[];
}
export function getRolesComplement(roleList: Role[]): Role[] {
    let roles = Object.keys(ROLES) as Role[];
    return roles.filter((role) => {
        return !roleList.includes(role);
    });
}



export const ROLE_SETS = [
    "townInvestigative", "townProtective","townKilling","townSupport", 
    "mafiaSupport",
    "neutralEvil"
] as const;
export type RoleSet = typeof ROLE_SETS[number];
export function getRolesFromRoleSet(roleSet: RoleSet): Role[] {
    switch(roleSet){
        case "townSupport":
            return ["medium", "retributionist", "transporter", "escort", "mayor", "journalist"];
        case "townKilling":
            return ["vigilante", "veteran", "deputy", "marksman"];
        case "townProtective":
            return ["bodyguard", "cop", "doctor", "bouncer", "engineer"];
        case "townInvestigative":
            return [
                "psychic", "lookout", "detective",
                "spy", "tracker", "philosopher",
                "snoop", "auditor", "gossip"
            ];
        case "mafiaSupport":
            return [
                "blackmailer", "informant", "hypnotist", "consort",
                "forger", "framer", "mortician", 
                "witch", "necromancer"
            ];
        case "neutralEvil":
            return ["jester", "provocateur", "politician", "doomsayer", "minion", "scarecrow"];
    }
}


export type RoleOutlineType = RoleOutline["type"];
export type RoleOutline = ({
    type: "any",
} | {
    type: "roleOutlineOptions",
    options: RoleOutlineOption[],
});


export type RoleOutlineOptionType = RoleOutlineOption["type"];
export type RoleOutlineOption = ({
    type: "roleSet",
    roleSet: RoleSet,
} | {
    type: "role",
    role: Role,
} | {
    type: "faction",
    faction: Faction,
});




export function translateRoleOutline(roleOutline: RoleOutline): string {
    switch(roleOutline.type){
        case "any":
            return translate("any");
        case "roleOutlineOptions":
            return roleOutline.options.map(translateRoleOutlineOption).join(" "+translate("union")+" ");
    }
}
export function translateRoleOutlineOption(roleOutlineOption: RoleOutlineOption): string {
    switch(roleOutlineOption.type){
        case "roleSet":
            return translate(roleOutlineOption.roleSet);
        case "role":
            return translate("role."+roleOutlineOption.role+".name");
        case "faction":
            return translate(roleOutlineOption.faction);
    }
}
export function getRolesFromOutline(roleOutline: RoleOutline): Role[] {
    switch(roleOutline.type){
        case "any":
            return Object.keys(ROLES) as Role[];
        case "roleOutlineOptions":
            return roleOutline.options.flatMap((option) => getRolesFromOutlineOption(option));
    }
}
export function getRolesFromOutlineOption(roleOutlineOption: RoleOutlineOption): Role[] {
    switch(roleOutlineOption.type){
        case "roleSet":
            return getRolesFromRoleSet(roleOutlineOption.roleSet);
        case "role":
            return [roleOutlineOption.role];
        case "faction":
            return Object.keys(ROLES).filter((role) => {
                return ROLES[role as Role].faction === roleOutlineOption.faction;
            }) as Role[];
    }
}

export function simplifyRoleOutline(roleOutline: RoleOutline): RoleOutline {

    if(roleOutline.type === "any") return roleOutline;

    let newOptions = [...roleOutline.options];

    for(let optionA of roleOutline.options){
        for(let optionB of roleOutline.options){
            if(outlineOptionIsSubset(optionA, optionB) && optionA !== optionB){
                newOptions = newOptions.filter((option) => option !== optionA);
            }
        }
    }

    newOptions = newOptions.sort(outlineOptionCompare);
    return {type: "roleOutlineOptions", options: newOptions};
    
    
}
function outlineOptionIsSubset(optionA: RoleOutlineOption, optionB: RoleOutlineOption): boolean {
    let rolesA = getRolesFromOutlineOption(optionA);
    let rolesB = getRolesFromOutlineOption(optionB);
    return rolesA.every((role) => rolesB.includes(role));
}
function outlineOptionCompare(optionA: RoleOutlineOption, optionB: RoleOutlineOption): number {
    let rolesA = getRolesFromOutlineOption(optionA);
    let rolesB = getRolesFromOutlineOption(optionB);
    return rolesB.length - rolesA.length;
}

export function getAllRoles(): Role[] {
    return Object.keys(ROLES) as Role[];
}