use serde::Serialize;

use super::{player::PlayerReference, phase::PhaseType, Game};


#[derive(Debug, Clone, Serialize, Default, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AvailableButtons{
    pub vote: bool,
    pub target: bool,
    pub day_target: bool,
}
impl AvailableButtons{
    pub fn from_player_target(game: &Game, actor_ref: PlayerReference, target_ref: PlayerReference)->Self{
        Self{
            vote: 
            actor_ref != target_ref &&
                game.phase_machine.current_state == PhaseType::Voting &&
                *actor_ref.chosen_vote(game) == None && 
                *actor_ref.alive(game) && *target_ref.alive(game),

            target: 
                actor_ref.role(game).can_night_target(game, actor_ref, target_ref) && 
                game.current_phase() == PhaseType::Night,

            day_target: 
                actor_ref.role(game).can_day_target(game, actor_ref, target_ref) &&
                game.current_phase().is_day(),
        }
    }
    pub fn from_player(game: &Game, actor_ref: PlayerReference)->Vec<Self>{
        let mut out = Vec::new();

        for target_ref in PlayerReference::all_players(game){
            out.push(Self::from_player_target(game, actor_ref, target_ref));
        }
        out
    }
}

