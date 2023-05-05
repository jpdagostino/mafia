use serde::Serialize;

use crate::game::Game;

use super::Player;

pub type PlayerIndex = u8;
#[derive(Debug, PartialEq, Clone)]
pub struct PlayerReference {
    index: PlayerIndex
}
impl PlayerReference{
    pub fn new(game: &Game, index: PlayerIndex)->Result<PlayerReference, ()>{
        if !((index as usize) < game.players.len()) { return Err(());} 
        Ok(PlayerReference { index })
    }
    pub fn deref(&self, game: &Game)->&Player{
        &game.players[self.index as usize]
    }
    pub fn deref_mut(&self, game: &mut Game)->&mut Player{
        &mut game.players[self.index as usize]
    }
    pub fn index(&self)->&PlayerIndex{
        &self.index
    }

    pub fn ref_option_to_index(option: &Option<PlayerReference>)->Option<PlayerIndex>{
        if let Some(reference) = option {
            Some(reference.index().clone())
        }else{
            None
        }
    }
    pub fn ref_vec_to_index(ref_vec: &Vec<PlayerReference>)->Vec<PlayerIndex>{
        ref_vec.into_iter().map(|p|p.index().clone()).collect()
    }
    pub fn index_option_to_ref(game: &Game, index_option: &Option<PlayerIndex>)->Result<Option<PlayerReference>, ()>{
        match index_option{
            Some(index) => {
                match PlayerReference::new(game, *index){
                    Ok(player_ref) => Ok(Option::Some(player_ref)),
                    Err(_) => Err(()),
                }
            },
            None => Ok(None),
        }
    }
    pub fn index_vec_to_ref(game: &Game, index_vec: &Vec<PlayerIndex>)->Result<Vec<PlayerReference>, ()>{
        let mut out = Vec::new();
        for index in index_vec{
            out.push(match Self::new(game, *index){
                Ok(player_ref) => player_ref,
                Err(_) => {
                    return Err(());
                },
            });
        }
        Ok(out)
    }



    pub fn all_players(game: &Game)->Vec<PlayerReference>{
        let mut out = Vec::new();
        for player_index in 0..game.players.len(){
            out.push(PlayerReference::new(game, player_index as PlayerIndex).unwrap()); //TODO, unwrap here
        }
        out
    }
}
impl Serialize for PlayerReference{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: serde::Serializer{
        self.index.serialize(serializer)
    }
}
