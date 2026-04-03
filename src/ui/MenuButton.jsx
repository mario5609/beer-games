import MenuButton from "./MenuButton"

export default function Home({setScreen}){

return(

<div className="home">

<h1>Volfas AR Fest</h1>

<MenuButton label="PLAY GAME" onClick={()=>setScreen("games")} />
<MenuButton label="MAP" onClick={()=>setScreen("map")} />
<MenuButton label="LEADERBOARD" onClick={()=>setScreen("leaderboard")} />
<MenuButton label="CHARACTERS" onClick={()=>setScreen("characters")} />

</div>

)

}