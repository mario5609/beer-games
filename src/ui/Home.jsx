export default function Home({ setScreen }) {

    return (

        <div className="home">

            <h1 className="title">Volfas AR Fest</h1>

            <div className="menu">

                <button className="menu-btn" onClick={() => setScreen("games")}>PLAY GAME</button>

                <button className="menu-btn" onClick={() => setScreen("map")}>MAP</button>

                <button className="menu-btn" onClick={() => setScreen("leaderboard")}>LEADERBOARD</button>

                <button className="menu-btn" onClick={() => setScreen("characters")}>CHARACTERS</button>

            </div>

        </div>

    )

}