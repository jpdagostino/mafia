use std::vec;

use serde::Serialize;

use crate::game::chat::ChatMessageVariant;
use crate::game::components::cult::Cult;
use crate::game::grave::{GraveKiller, GraveReference};
use crate::game::chat::ChatGroup;
use crate::game::phase::PhaseType;
use crate::game::player::PlayerReference;
use crate::game::role_list::Faction;
use crate::game::visit::Visit;
use crate::game::Game;
use super::zealot::Zealot;
use super::{Priority, RoleState, RoleStateImpl};


#[derive(Clone, Debug, Default, Serialize)]
pub struct Apostle;

pub(super) const FACTION: Faction = Faction::Cult;
pub(super) const MAXIMUM_COUNT: Option<u8> = Some(1);
pub(super) const DEFENSE: u8 = 0;

impl RoleStateImpl for Apostle {
    fn do_night_action(self, game: &mut Game, actor_ref: PlayerReference, priority: Priority) {
        if game.day_number() == 1 {return}

        let mut cult = game.cult().clone();
        match priority {
            Priority::Kill if !Cult::can_convert_tonight(game) && cult.ordered_cultists.len() == 1 => {

                let Some(visit) = actor_ref.night_visits(game).first() else {return};
                let target_ref = visit.target;
                
                target_ref.try_night_kill(
                    actor_ref, game, GraveKiller::Faction(Faction::Cult), 1, false
                );
            }
            Priority::Convert if Cult::can_convert_tonight(game) => {
                let Some(visit) = actor_ref.night_visits(game).first() else {return};
                let target_ref = visit.target;

                if target_ref.night_defense(game) > 0 {
                    actor_ref.push_night_message(game, ChatMessageVariant::YourConvertFailed);
                    return
                }

                target_ref.set_role(game, RoleState::Zealot(Zealot));

                cult.sacrifices_required = Some(Cult::SACRIFICES_NEEDED);
                game.set_cult(cult);
            }
            _ => {}
        }
    }
    fn can_select(self, game: &Game, actor_ref: PlayerReference, target_ref: PlayerReference) -> bool {

        let cult = game.cult().clone();
        let can_kill = cult.ordered_cultists.len() == 1 && !Cult::can_convert_tonight(game);
        let can_convert = Cult::can_convert_tonight(game);

        if !can_convert && !can_kill{return false}
        if game.day_number() == 1 {return false}

        crate::game::role::common_role::can_night_select(game, actor_ref, target_ref)
    }
    fn do_day_action(self, _game: &mut Game, _actor_ref: PlayerReference, _target_ref: PlayerReference) {
    }
    fn can_day_target(self, _game: &Game, _actor_ref: PlayerReference, _target_ref: PlayerReference) -> bool {
        false
    }
    fn convert_selection_to_visits(self, game: &Game, actor_ref: PlayerReference, target_refs: Vec<PlayerReference>) -> Vec<Visit> {
        crate::game::role::common_role::convert_selection_to_visits(game, actor_ref, target_refs, !Cult::can_convert_tonight(game))
    }
    fn get_current_send_chat_groups(self, game: &Game, actor_ref: PlayerReference) -> Vec<ChatGroup> {
        crate::game::role::common_role::get_current_send_chat_groups(game, actor_ref, vec![ChatGroup::Cult])
    }
    fn get_current_receive_chat_groups(self, game: &Game, actor_ref: PlayerReference) -> Vec<ChatGroup> {
        crate::game::role::common_role::get_current_receive_chat_groups(game, actor_ref)
    }
    fn get_won_game(self, game: &Game, actor_ref: PlayerReference) -> bool {
        crate::game::role::common_role::get_won_game(game, actor_ref)
    }
    fn on_phase_start(self, _game: &mut Game, _actor_ref: PlayerReference, _phase: PhaseType){
    }
    fn on_role_creation(self, _game: &mut Game, _actor_ref: PlayerReference){
    }
    fn on_any_death(self, _game: &mut Game, _actor_ref: PlayerReference, _dead_player_ref: PlayerReference){
    }
    fn on_grave_added(self, _game: &mut Game, _actor_ref: PlayerReference, _grave_ref: GraveReference){
    }
    fn on_game_ending(self, _game: &mut Game, _actor_ref: PlayerReference){
    }
}
