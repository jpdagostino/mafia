
import React from "react";
import GAME_MANAGER from "../../index";
import { RoleListEntry, translateRoleListEntry } from "../../game/roleListState.d";
import "../../index.css";
import RolePicker from "../RolePicker";
import { StateListener } from "../../game/gameManager.d";
import translate from "../../game/lang";

interface ExcludedRolesState {
    excludedRoles: RoleListEntry[],
    roleListEntry: RoleListEntry
}

export default class LobbyExcludedRoles extends React.Component<{}, ExcludedRolesState> {
    listener: StateListener;

    constructor(props: {}){
        super(props);

        this.state = {
            excludedRoles: GAME_MANAGER.gameState.excludedRoles,
            roleListEntry: {type:"any"}
        }

        this.listener = () => {
            this.setState({
                excludedRoles: GAME_MANAGER.gameState.excludedRoles
            });
        };
    }
    componentDidMount() {
        GAME_MANAGER.addStateListener(this.listener);
    }
    componentWillUnmount() {
        GAME_MANAGER.removeStateListener(this.listener);
    }

    includeRole(role: RoleListEntry){
        let roles = [...this.state.excludedRoles];
        roles = roles.filter((value)=>value !== role);
        GAME_MANAGER.sendExcludedRolesPacket(roles);
    }
    excludeRole(){
        let roles = [...this.state.excludedRoles];
        roles.push(this.state.roleListEntry);
        GAME_MANAGER.sendExcludedRolesPacket(roles);
    }

    

    render(){return(<section>
        <button onClick={()=>{this.excludeRole()}}>{translate("menu.excludedRoles.exclude")}</button>
        <RolePicker
            roleListEntry={this.state.roleListEntry}
            onChange={(value: RoleListEntry) => {
                this.setState({
                    roleListEntry: value
                })
            }}
        />
        <div>
            {this.state.excludedRoles.map((value, i)=>{
                return <button key={i} onClick={()=>{this.includeRole(value)}}>
                    {translateRoleListEntry(value)}
                </button>
            })}
        </div>
    </section>)}
}