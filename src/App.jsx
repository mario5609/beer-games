import { useState } from "react"

import Home from "./ui/Home"
import Map from "./ui/Map"
import Leaderboard from "./ui/Leaderboard"
import Characters from "./ui/Characters"

import GameSelect from "./components/GameSelect"
import BeerPong from "./components/BeerPong"
import TreasureHunt from "./components/TreasureHunt"

function App() {

const [screen,setScreen] = useState("home")

if(screen === "home") return <Home setScreen={setScreen}/>
if(screen === "games") return <GameSelect setScreen={setScreen}/>
if(screen === "beerpong") return <BeerPong setScreen={setScreen}/>
if(screen === "treasure") return <TreasureHunt setScreen={setScreen}/>
if(screen === "map") return <Map setScreen={setScreen}/>
if(screen === "leaderboard") return <Leaderboard setScreen={setScreen}/>
if(screen === "characters") return <Characters setScreen={setScreen}/>

}

export default App