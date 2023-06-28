
use rand::seq::SliceRandom;
use serde::Serialize;

use crate::game::chat::{ChatGroup, ChatMessage};
use crate::game::grave::GraveKiller;
use crate::game::phase::{PhaseType};
use crate::game::player::PlayerReference;
use crate::game::role::RoleState;
use crate::game::role_list::{FactionAlignment, Faction};
use crate::game::end_game_condition::EndGameCondition;
use crate::game::tag::Tag;
use crate::game::visit::Visit;
use crate::game::team::Team;
use crate::game::Game;
use super::jester::Jester;
use super::{Priority, RoleStateImpl};

pub(super) const DEFENSE: u8 = 1;
pub(super) const ROLEBLOCK_IMMUNE: bool = false;
pub(super) const CONTROL_IMMUNE: bool = false;
pub(super) const SUSPICIOUS: bool = false;
pub(super) const FACTION_ALIGNMENT: FactionAlignment = FactionAlignment::NeutralEvil;
pub(super) const MAXIMUM_COUNT: Option<u8> = None;
pub(super) const END_GAME_CONDITION: EndGameCondition = EndGameCondition::None;
pub(super) const TEAM: Option<Team> = None;

#[derive(Clone, Serialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct Executioner {
    target: ExecutionerTarget,
}
#[derive(Clone, Serialize, Debug, PartialEq, Eq)]
pub enum ExecutionerTarget{
    Target(PlayerReference),
    Won,
}
impl ExecutionerTarget {
    fn get_target(&self)->Option<PlayerReference>{
        if let Self::Target(p) = self {
            Some(*p)
        }else{
            None
        }
    }
}
impl Default for ExecutionerTarget {
    fn default() -> Self {
        Self::Won
    }
}

impl RoleStateImpl for Executioner {
    fn do_night_action(self, game: &mut Game, actor_ref: PlayerReference, priority: Priority) {
        match priority {
            Priority::TopPriority => {
                if ExecutionerTarget::Won == self.target {
                    actor_ref.try_night_kill(actor_ref, game, GraveKiller::Suicide, 3);
                }
            },
            _=>{}
        }
    
    }
    fn can_night_target(self, _game: &Game, _actor_ref: PlayerReference, _target_ref: PlayerReference) -> bool {
        false
    }
    fn do_day_action(self, _game: &mut Game, _actor_ref: PlayerReference, _target_ref: PlayerReference) {
        
    }
    fn can_day_target(self, _game: &Game, _actor_ref: PlayerReference, _target_ref: PlayerReference) -> bool {
        false
    }
    fn convert_targets_to_visits(self, _game: &Game, _actor_ref: PlayerReference, _target_refs: Vec<PlayerReference>) -> Vec<Visit> {
        vec![]
    }
    fn get_current_send_chat_groups(self, game: &Game, actor_ref: PlayerReference) -> Vec<ChatGroup> {
        crate::game::role::common_role::get_current_send_chat_groups(game, actor_ref, vec![])
    }
    fn get_current_recieve_chat_groups(self, game: &Game, actor_ref: PlayerReference) -> Vec<ChatGroup> {
        crate::game::role::common_role::get_current_recieve_chat_groups(game, actor_ref)
    }
    fn on_phase_start(self, _game: &mut Game, _actor_ref: PlayerReference, _phase: PhaseType){
    }
    fn on_role_creation(self, game: &mut Game, actor_ref: PlayerReference){
        crate::game::role::common_role::on_role_creation(game, actor_ref);
        if let Some(target) = PlayerReference::all_players(game)
            .into_iter()
            .filter(|p|
                p.role(game).faction_alignment().faction() == Faction::Town && 
                p.role(game).faction_alignment() != FactionAlignment::TownPower &&
                p.role(game).faction_alignment() != FactionAlignment::TownKilling
            ).collect::<Vec<PlayerReference>>()
            .choose(&mut rand::thread_rng())
        {
            actor_ref.push_player_tag(game, *target, Tag::ExecutionerTarget);
            actor_ref.set_role_state(game, RoleState::Executioner(Executioner{target: ExecutionerTarget::Target(*target)}));
        }else{
            actor_ref.set_role(game, RoleState::Jester(Jester::default()))
        };
    }
    fn on_any_death(self, game: &mut Game, actor_ref: PlayerReference, dead_player_ref: PlayerReference){
        if Some(dead_player_ref) == self.target.get_target() {
            if game.current_phase().phase() == PhaseType::Evening {
                game.add_message_to_chat_group(ChatGroup::All, ChatMessage::ExecutionerWon);
                actor_ref.set_role_state(game, RoleState::Executioner(Executioner { target: ExecutionerTarget::Won }));
            }else{
                actor_ref.set_role(game, RoleState::Jester(Jester::default()))
            }
        }
    }
}