export default function Characters({ setScreen }) {

    return (

        <div className="page">

            <h1>Select Character</h1>

            <div className="characters">

                <div className="char">🍺</div>
                <div className="char">👑</div>
                <div className="char">🛢</div>
                <div className="char">🍻</div>

            </div>

            <button className="back" onClick={() => setScreen("home")}>BACK</button>

        </div>

    )

}