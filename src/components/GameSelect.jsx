export default function GameSelect({ setScreen }) {

    return (

        <div className="page">

            <h1>Choose Game</h1>

            <button className="menu-btn" onClick={() => setScreen("beerpong")}>AR BEER PONG</button>

            <button className="menu-btn" onClick={() => setScreen("treasure")}>AR TREASURE HUNT</button>

            <button className="back" onClick={() => setScreen("home")}>BACK</button>

        </div>

    )

}