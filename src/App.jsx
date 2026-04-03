import { useState } from "react";

// UI Components
import Home from "./ui/Home";
import Map from "./ui/Map";
import Leaderboard from "./ui/Leaderboard";
import Characters from "./ui/Characters";

// Game Components
import GameSelect from "./components/GameSelect";
import BeerPong from "./components/BeerPong";
import TreasureHunt from "./components/TreasureHunt";

function App() {

  const [screen, setScreen] = useState("home");

  switch (screen) {
    case "home":
      return <Home setScreen={setScreen} />;
    
    case "games":
      return <GameSelect setScreen={setScreen} />;
    
    case "beerpong":
      return <BeerPong setScreen={setScreen} />;
    
    case "treasure":
      return <TreasureHunt setScreen={setScreen} />;
    
    case "map":
      return <Map setScreen={setScreen} />;
    
    case "leaderboard":
      return <Leaderboard setScreen={setScreen} />;
    
    case "characters":
      return <Characters setScreen={setScreen} />;

    default:
      return <Home setScreen={setScreen} />;
  }
}

export default App;