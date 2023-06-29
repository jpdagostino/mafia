
import React from "react";
import GAME_MANAGER from "../../index";
import { RoleListEntry, translateRoleListEntry } from "../../game/roleListState.d";
import "../../index.css";
import { StateListener } from "../../game/gameManager.d";
import translate from "../../game/lang";
import RolePicker from "../../components/RolePicker";
import StyledText from "../../components/StyledText";

interface ExcludedRolesState {
    excludedRoles: RoleListEntry[],
    roleListEntry: RoleListEntry,
    host: boolean
}

export default class LobbyExcludedRoles extends React.Component<{}, ExcludedRolesState> {
    listener: StateListener;

    constructor(props: {}){
        super(props);

        this.state = {
            excludedRoles: GAME_MANAGER.gameState.excludedRoles,
            roleListEntry: {type:"any"},
            host: GAME_MANAGER.gameState.host
        }

        this.listener = () => {
            this.setState({
                excludedRoles: GAME_MANAGER.gameState.excludedRoles,
                host: GAME_MANAGER.gameState.host
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

    

    render(){return(<section className="excluded-roles">
        <header>
            <h2>{translate("menu.lobby.excludedRoles")}</h2>
        </header>
        <div>
            <RolePicker
                disabled={!this.state.host}
                roleListEntry={this.state.roleListEntry}
                onChange={(value: RoleListEntry) => {
                    this.setState({
                        roleListEntry: value
                    })
                }}
            />
            <button 
                disabled={!this.state.host}
                onClick={()=>{this.excludeRole()}}
            >{translate("menu.excludedRoles.exclude")}</button>
        </div>
        <div>
            {this.state.excludedRoles.map((value, i)=>{
                return <button key={i} 
                    disabled={!this.state.host}
                    onClick={()=>{this.includeRole(value)}}
                >
                    <StyledText>
                        {translateRoleListEntry(value) ?? ""}
                    </StyledText>
                </button>
            })}
        </div>
    </section>)}
}
