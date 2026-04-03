import { Canvas } from "@react-three/fiber"
import BeerPong from "./BeerPong"

export default function ARScene() {

    return (

        <Canvas camera={{ position: [0, 0, 5] }}>

            <ambientLight intensity={1} />

            <BeerPong />

        </Canvas>

    )

}
