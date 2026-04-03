import ARTreasureHunt from "../components/ARTreasureHunt"

export default function TreasureHunt({ setScreen }) {

    return (

        <div className="page">

            <h1>Treasure Hunt</h1>

            <ARTreasureHunt/>

            <button className="back" onClick={() => setScreen("games")}>
                BACK
            </button>

        </div>

    )

}