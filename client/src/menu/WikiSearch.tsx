import React from "react";
import ROLES from "./../resources/roles.json";
import translate, { styleText } from "../game/lang";
import "./wikiSearch.css";
import { Role } from "../game/roleState.d";
import { FactionAlignment, getRoleListEntryFromFactionAlignment, translateRoleListEntry } from "../game/roleListState.d";

interface WikiSearchState {
    wikiSearch: string,
    openPage: WikiEntry | null,
}
type WikiEntry = {
    type: "role", role: Role
} | {
    type: "article", article: Article
}
export const ARTICLES = ["help", "roles_and_teams", "phases_and_timeline", "controls", "wills_and_notes", "visit"] as const;
export type Article = typeof ARTICLES[number];

export default class WikiSearch extends React.Component<{}, WikiSearchState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            wikiSearch: "",
            openPage: null,
        };
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    getGeneralPageFromSearch(search: string): Article[] {
        let out: Article[] = [];
        for(let i in ARTICLES){
            let article = ARTICLES[i];
            if(
                this.eitherContains(translate("menu.wiki.entries."+article+".title"), search)
            ){
                if(!out.includes(article as Article)){
                    out.push(article as Article);
                }
            }
        }
        for(let i in ARTICLES){
            let article = ARTICLES[i];
            if(
                this.eitherContains(translate("menu.wiki.entries."+article+".text"), search)
            ){
                if(!out.includes(article as Article)){
                    out.push(article as Article);
                }
            }
        }
        return out
    }
    renderGeneralWikiPage(article: string){
        return styleText(
`# ${translate("menu.wiki.entries."+article+".title")}
<br>

${translate("menu.wiki.entries."+article+".text")}
`, { clazz: "wiki-content-body" })
    }
    getRolesFromSearch(search: string): Role[] {
        search = search.toLowerCase();
        let out: Role[] = [];
        for(let role in ROLES){
            if(
                this.eitherContains(translate("role."+role+".name"), search)
            ){
                if(!out.includes(role as Role)){
                    out.push(role as Role);
                }
            }
        }
        for(let role in ROLES){
            if(
                this.eitherContains(translate("role."+role+".abilities"), search)
            ){
                if(!out.includes(role as Role)){
                    out.push(role as Role);
                }
            }
        }
        for(let role in ROLES){
            if(
                this.eitherContains(translate("role."+role+".attributes"), search)
            ){
                if(!out.includes(role as Role)){
                    out.push(role as Role);
                }
            }
        }
        return out;
    }
    renderRoleWikiPage(role: Role){
        let defenseString = "";
        switch(ROLES[role].defense){
            case 0:
                defenseString = translate("none");
                break;
            case 1:
                defenseString = translate("basic");
                break;
            case 2:
                defenseString = translate("powerful");
                break;
            case 3:
                defenseString = translate("invincible");
                break;
        }

        const roleData = ROLES[role as keyof typeof ROLES];

        return styleText(
`# ${translate("role."+role+".name")}
### ${translateRoleListEntry(getRoleListEntryFromFactionAlignment(roleData.factionAlignment as FactionAlignment))}
<br>

### ${translate("menu.wiki.abilities")} 
${translate("role."+role+".abilities")} 
### ${translate("menu.wiki.attributes")}
${translate("role."+role+".attributes")}

<br>

### ${roleData.maxCount === null ? '' : translate("menu.wiki.maxCount", roleData.maxCount)}
### ${translate("menu.wiki.suspicious", ROLES[role as keyof typeof ROLES].suspicious?"suspicious":"innocent")}
### ${translate("menu.wiki.defense", defenseString)}
`, { clazz: "wiki-content-body" })
    }
    
    renderWikiPageOrSearch(){
        if(this.state.openPage != null){
            if(this.state.openPage.type === "role"){
                return this.renderRoleWikiPage(this.state.openPage.role);
            }else if(this.state.openPage.type === "article"){
                return this.renderGeneralWikiPage(this.state.openPage.article);
            }
        }else{

            return this.getRolesFromSearch(this.state.wikiSearch).map((role)=>{
                return <button key={role} 
                    onClick={()=>{
                        this.setState({
                            wikiSearch: translate("role."+role+".name"),
                            openPage: {type: "role", role: role}
                        })
                    }}
                >{
                    styleText(translate("role."+role+".name"))
                }</button>
            }).concat(this.getGeneralPageFromSearch(this.state.wikiSearch).map((article)=>{
                return <button key={article} 
                    onClick={()=>{
                        this.setState({
                            wikiSearch: translate("menu.wiki.entries."+article+".title"),
                            openPage: {type: "article", article: article}
                        })
                    }}
                >{
                    styleText(translate("menu.wiki.entries."+article+".title"))
                }</button>
            }));
        }
    }

    eitherContains(string1: string, string2: string): boolean{
        return string1.toLowerCase().includes(string2.toLowerCase()) ||
        string2.toLowerCase().includes(string1.toLowerCase())
    }
    
    render() {
        return (<div className="wiki-search">
        <div className="wiki-search-bar">
            <input type="text" value={this.state.wikiSearch}
                onChange={(e)=>{this.setState({wikiSearch: e.target.value, openPage: null})}}
                placeholder={translate("menu.wiki.search.placeholder")}
            />
            {this.state.wikiSearch !== null && this.state.wikiSearch !== "" ? 
                <button onClick={() => {
                    this.setState({wikiSearch: "", openPage: null})
                }}>{translate("menu.wiki.search.clear")}</button> 
            : null}
        </div>
        <div className="wiki-results">
            {this.renderWikiPageOrSearch()}
        </div>
    </div>);}
}