use crate::game::{grave::GraveReference, player::PlayerReference, Game};


pub struct OnGraveAdded{
    grave: GraveReference,
}
impl OnGraveAdded{
    pub fn new(grave: GraveReference) -> Self{
        Self{grave}
    }
    pub fn invoke(self, game: &mut Game){
        for player in PlayerReference::all_players(game){
            player.on_grave_added(game, self.grave.clone())
        }

        game.on_grave_added(self.grave);
    }
}