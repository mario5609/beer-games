import ARBeerGame from "../components/ARBeerGame"

export default function BeerPong({ setScreen }) {

    return (

        <div className="page">

            <h1>AR Beer Pong</h1>

            <ARBeerGame />

            <button className="back" onClick={() => setScreen("games")}>
                BACK
            </button>

        </div>

    )

}