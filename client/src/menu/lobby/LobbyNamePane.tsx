import React, { useEffect } from "react";
import { ReactElement } from "react";
import GAME_MANAGER from "../..";
import translate from "../../game/lang";
import { StateEventType, StateListener } from "../../game/gameManager.d";
import Icon from "../../components/Icon";



export default function LobbyNamePane(): ReactElement {


    let spectatorDependency = 
        GAME_MANAGER.state.stateType === "lobby" &&
        GAME_MANAGER.state.myId !== null &&
        GAME_MANAGER.state.players.get(GAME_MANAGER.state.myId)?.clientType.type === "spectator";

    const [isSpectator, setIsSpectator] = React.useState(spectatorDependency);

    useEffect(()=>{
        setIsSpectator(GAME_MANAGER.state.stateType === "lobby" &&
        GAME_MANAGER.state.myId !== null &&
        GAME_MANAGER.state.players.get(GAME_MANAGER.state.myId)?.clientType.type === "spectator");
        const listener: StateListener = (type?: StateEventType) => {
            switch (type) {
                case "lobbyClients":
                    if(GAME_MANAGER.state.stateType === "lobby" && GAME_MANAGER.state.myId !== null){
                        setIsSpectator(GAME_MANAGER.state.players.get(GAME_MANAGER.state.myId)?.clientType.type === "spectator");
                    }
                    break;
            }
        }

        GAME_MANAGER.addStateListener(listener);
        return ()=>{GAME_MANAGER.removeStateListener(listener);}
    }, [setIsSpectator]);



    return <section className="player-list-menu-colors selector-section">
        {!isSpectator && <NameSelector/>}
        {isSpectator && <button
            onClick={()=>{GAME_MANAGER.sendSetSpectatorPacket(false)}}
        ><Icon>sports_esports</Icon> {translate("switchToPlayer")}</button>}
    </section>
}

function NameSelector(): ReactElement {

    const [enteredName, setEnteredName] = React.useState("");

    return <>
        <div className="lobby-name">
            <section><h2>{GAME_MANAGER.getMyName() ?? ""}</h2></section>
            <button
                onClick={()=>{GAME_MANAGER.sendSetSpectatorPacket(true)}}
            ><Icon>visibility</Icon> {translate("switchToSpectator")}</button>
        </div>
        <div className="name-box">
            <input type="text" value={enteredName}
                onChange={(e)=>{setEnteredName(e.target.value)}}
                placeholder={translate("menu.lobby.field.namePlaceholder")}
                onKeyUp={(e)=>{
                    if(e.key === 'Enter')
                        GAME_MANAGER.sendSetNamePacket(enteredName);
                }}
            />
            <button onClick={()=>{
                GAME_MANAGER.sendSetNamePacket(enteredName)
            }}>{translate("menu.lobby.button.setName")}</button>
        </div>
    </>
}