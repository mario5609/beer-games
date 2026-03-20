export default function Leaderboard({setScreen}){

return(

<div className="page">

<h1>Leaderboard</h1>

<p>Top players will appear here.</p>

<button className="back" onClick={()=>setScreen("home")}>BACK</button>

</div>

)

}