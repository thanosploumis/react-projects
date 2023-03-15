import React from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"
import "./styles.css";

export default function App() {
    const [start, setStart] = React.useState(false);

    const [dice, setDice] = React.useState(allNewDice())
    const [shakers, setShakers] = React.useState(false)
    const [rolls, setRolls] = React.useState(0)
    const [startTime, setStartTime] = React.useState(null)
    const [stopTime, setStopTime] = React.useState(null)
    const [bestRolls, setBestRolls] = React.useState(
        JSON.parse(localStorage.getItem("rolls")) || 0
    )
    const [bestTime, setBestTime] = React.useState(
        JSON.parse(localStorage.getItem("time")) || 0
    )
    
    let secondsPassed = 0;

    function startGame() {
        setStartTime(Date.now())
    }

    function startTimer() {
      if (startTime == null) setStartTime(Date.now())
    }

    function stopGame() {
        if (startTime != null && stopTime != null) {
            secondsPassed = (stopTime - startTime) / 1000;
        }
        if (secondsPassed < bestTime || bestTime == 0) {
            localStorage.setItem("time", secondsPassed);
            setBestTime(secondsPassed);
        }
        if (rolls < bestRolls || bestRolls === 0) {
            localStorage.setItem("rolls", rolls);
            setBestRolls(rolls);
        }
    }

    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setShakers(true)
            setStopTime(Date.now())
        }
    }, [dice])

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        if (start) {
            if(!shakers) {
                startTimer()
                setRolls(rolls + 1)
                setDice(oldDice => oldDice.map(die => {
                    return die.isHeld ? 
                        die :
                        generateNewDie()
                }))
            } else {
                setStartTime(null)
                setStopTime(null)
                setShakers(false)
                setDice(allNewDice())
                setRolls(0)
            }
        } else {
            setRolls(1)
            setStart(true)
            startGame()
        }
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))
    
    if (stopTime != null) {
        stopGame()
    }
    return (
        <main>
            {shakers && <Confetti />}
            <h1 className="title">Shakers</h1>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <div className="bottom-wrapper">
                {shakers && <h3 className="stats-text">{`Took you ${secondsPassed.toFixed(2)}s and ${rolls} rolls!`}</h3>}
                <button 
                    className="roll-dice" 
                    onClick={rollDice}
                >
                    {!start ? "Start Game" : shakers ? "New Game" : "Roll" }
                </button>
            </div>
            <div className="scoreboard">
                <div className="scores">
                    Rolls: <span>{rolls}</span>
                </div>
                <div className="scores">
                    Best Time: <span>{bestTime}</span>
                </div>
                {bestRolls !== 0 && (
                <div className="scores">
                Best: <span>{bestRolls}</span>
                </div>
                )}
            </div>
        </main>
    )
}