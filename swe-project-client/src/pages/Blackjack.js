import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import { Button, Card} from "react-bootstrap";
import '../css/Blackjack.css'
import "bootstrap/dist/css/bootstrap.min.css";

function Blackjack() {
  const [difficulty, setDifficulty] = useState(null)
  const [aiCount, setAICount] = useState(null)
  const [gameStart, setGameStart] = useState(null)
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState(null)
  const [playerDecks, setPlayerDeck] = useState([])
  const [round, setRound] = useState(0)
  const [yourHand, setYourHand] = useState([])
  const [yourHandValue, setYourHandValue] = useState(0)
  const [winMessage, setWinMessage] = useState("")
  const [yourChips, setYourChips] = useState(500)
  const [betChips, setBetChips] = useState(100)
  const [backups, setBackups] = useState(5)
  const [backupMessage, setBackupMessage] = useState("")

  useEffect(() => {
    function AIValueBuilder(id, currentDeck){
      return new Promise(async (resolve) => {
        console.log("Calling AIValueBuilder")
        let value = await AcquireValue(playerDecks[id].cards)
        let newHand = playerDecks[id].cards
  
        while(value < 16){
          let newCard = await PopNewCard(currentDeck, newHand)
          newHand = [...newHand, newCard]
          value = await AcquireValue(newHand)
          console.log(value)
        }
  
        currentDeck = currentDeck.filter((card) => {
          return !newHand.includes(card)
        })
        console.log(newHand)
        resolve([newHand, currentDeck])
      })
    }
  
    function PopNewCard(currentDeck, hand){
      return new Promise((resolve) => {
        console.log("Calling PopNewCard")
        let index = Math.floor(Math.random() * currentDeck.length)
        let chosenCard = currentDeck[index]
        while(hand.includes(chosenCard)){
          index++
          chosenCard = currentDeck[index]
          if(index >= currentDeck.length){
            index = 0
          }
        }
        resolve(chosenCard)
      })
    }
  
    function AcquireValue(array){
      return new Promise((resolve) => {
        console.log("Calling AcquireValue")
        let sum = 0
        let aces = array.filter((card) => {
          if(card[0] === 'A'){
            return true;
          }
          return false;
        }).length
  
        for(let i = 0; i < array.length; i++){
          let value = array[i][0]
          if(array[i].length === 4){
            value = 10
          }
          if(isNaN(value)){
            if(value === "A"){
              value = 11
            }
            else{
              value = 10
            }
          }
          sum += parseInt(value)
        }
        while(aces !== 0 && sum > 21){
          sum -= 10
          aces -= 1
        }
        
        resolve(sum)
    })
    }
    
    async function AddAICards(){
      console.log("Calling AddAICards")
      const newPlayerDeck = []
      let newMainDeck = deck
      for(let i = 0; i < aiCount; i++){
        console.log(newMainDeck)
        let results = await AIValueBuilder(i, newMainDeck)
        let points = await AcquireValue(results[0])
        newPlayerDeck[i] = {
          id: i,
          cards: results[0],
          value: points
        }
        newMainDeck = results[1]
      }
      setPlayerDeck(newPlayerDeck)
      setDeck(newMainDeck)
    }

    if(deck !== null && deck.length === 52 && round !== 0){
      AddAICards()
    }
  }, [round, deck, aiCount, playerDecks])

  if(cards === null) {
    setCards(importAll(require.context('../cards', false)))
  }

  if(deck === null && gameStart === true){
    HandleBuildDeck()
  }

  if(aiCount !== null && aiCount !== playerDecks.length){
    setPlayerDeck([])
    for(let i = 0; i < aiCount; i++){
      setPlayerDeck((prev) => [...prev, {id: i, cards: [], value: 0}])
    }
  }

  if(aiCount === playerDecks.length && gameStart && round === 0){
    setRound(round+1)
  }

  async function HandleBuildDeck(){
    console.log("Calling HandleBuildDeck")
    let newDeck = await BuildDeck()
    await ShuffleDeck(newDeck)
    setDeck(newDeck)
  }

  function BuildDeck(){
    return new Promise(async (resolve) => {
      let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
      let types = ["C", "D", "H", "S"];
      let newDeck = []
      for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            newDeck = [...newDeck, values[j] + "-" + types[i]];
        }
      }
      resolve(newDeck)
    })
  }

  function ShuffleDeck(array){
    return new Promise(async (resolve) => {
      console.log("Calling ShuffleDeck")
      let currentIndex = array.length,  randomIndex;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
    setDeck(array);
    })
  }

  function Reset(){
    return new Promise(async (resolve) => {
      console.log("Calling Reset")
      let results = await ResetDeck()
      console.log(results[0])
      console.log(results[1])
      setDeck(results[0])
      setPlayerDeck(results[1])
      setRound(round+1)
      setYourHand([])
      setYourHandValue(0)
      setWinMessage("")
      setBetChips(yourChips >= 100 ? 100 : yourChips)
      setYourChips(yourChips >= 100 ? yourChips - 100 : 0)
    })
  }

  function ResetDeck(){
    return new Promise((resolve) => {
      console.log("Calling ResetDeck")
      let newDeck = deck
      let newPlayerDeck = []
      for(let i = 0; i < playerDecks.length; i++){
        for(let j = 0; j < playerDecks[i].cards.length; j++){
          newDeck = [...newDeck, playerDecks[i].cards[j]]
        }
        newPlayerDeck[i] = {id: playerDecks[i].id, cards: [], value: 0}
      }
      for(let i = 0; i < yourHand.length; i++){
        newDeck = [...newDeck, yourHand[i]]
      }
      console.log(newDeck)
      console.log(yourHand)
      resolve([newDeck, newPlayerDeck])
    })
  }

  async function UpdateHand(){
    console.log("Calling UpdateHand")
    let newMainDeck = deck
    let results = await AddCardToHand(newMainDeck)
    setYourHand(results[0])
    setDeck(results[1])
    let newValue = await AcquirePlayerValue(results[0])
    setYourHandValue(newValue)
  }

  function AddCardToHand(currentDeck){
    return new Promise(async (resolve) => {
      console.log("Calling AddCardToHand")
      let newHand = yourHand
      let newCard = await PopNewPlayerCard(currentDeck, newHand)
      newHand = [...newHand, newCard]
      currentDeck = currentDeck.filter((card) => {
        return !newHand.includes(card)
      })
      resolve([newHand, currentDeck])
    })
  }

  function PopNewPlayerCard(currentDeck, hand){
    return new Promise((resolve) => {
      console.log("Calling PopNewPlayerCard")
      let index = Math.floor(Math.random() * currentDeck.length)
      let chosenCard = currentDeck[index]
      while(hand.includes(chosenCard)){
        index++
        chosenCard = currentDeck[index]
        if(index >= currentDeck.length){
          index = 0
        }
      }
      resolve(chosenCard)
    })
  }

  function AcquirePlayerValue(array){
    return new Promise((resolve) => {
      console.log("Calling AcquirePlayerValue")
      let sum = 0
      let aces = array.filter((card) => {
        if(card[0] === 'A'){
          return true;
        }
        return false;
      }).length

      for(let i = 0; i < array.length; i++){
        let value = array[i][0]
        if(array[i].length === 4){
          value = 10
        }
        if(isNaN(value)){
          if(value === "A"){
            value = 11
          }
          else{
            value = 10
          }
        }
        sum += parseInt(value)
      }
      while(aces !== 0 && sum > 21){
        sum -= 10
        aces -= 1
      }
      resolve(sum)
  })
  }

  async function SetWinner(){
    let result = await AcquireWinner()
    if(result === "You Win!"){
      setYourChips(yourChips + betChips * aiCount)
    }
    else if(result === "You Tied!"){
      setYourChips(yourChips + betChips * aiCount)
    }
    else{
      if(yourChips === 0){
        setBackups(backups-1)
      }
    }
    setWinMessage(result)
  }

  function AcquireWinner(){
    return new Promise((resolve) => {
      console.info(playerDecks)
      let result = "You Win!"
      if(yourHandValue > 21){
        result = "You Busted!"
      }
      for(let i = 0; i < playerDecks.length; i++){
        if(playerDecks[i].value > yourHandValue && playerDecks[i].value <= 21){
          resolve("You Lose!")
        }
      }
      for(let i = 0; i < playerDecks.length; i++){
        if(playerDecks[i].value === yourHandValue){
          result = "It's a Tie!"
        }
      }
      resolve(result)
    })
  }
  
  async function ChangeBet(num){
    let results = await HandleBetChange(num)
    setBetChips(results[0])
    setYourChips(results[1])
  }

  function HandleBetChange(num){
    return new Promise((resolve) => {
      let newBetChips = betChips
      let yourNewChips = yourChips
      console.log(newBetChips)
      if(num === 1){
        if(newBetChips <= yourNewChips){
          yourNewChips -= newBetChips
          newBetChips *= 2
        }
      }
      else{
        if(newBetChips / 2 >= 100){
          yourNewChips += (newBetChips / 2)
          newBetChips /= 2
        }
      }
      resolve([newBetChips, yourNewChips])
    })
  }

  if(gameStart === null || difficulty === null || aiCount === null){
    return (
      <div className="Blackjack">
        <header className="Body">
          <Card 
            style={{width: "25rem"}}
            bg={"light"}
            text={"light" === "light" ? "dark" : "white"}
            >
            <div>
              <Card.Body>
                <Card.Title as={"h3"}>Difficulty</Card.Title>
                <Button variant={difficulty === "easy" ? "success" : "secondary"} onClick={()=>setDifficulty("easy")}>Easy</Button>{" "}
                <Button variant={difficulty === "medium" ? "success" : "secondary"} onClick={()=>setDifficulty("medium")}>Medium</Button>{" "}
                <Button variant={difficulty === "hard" ? "success" : "secondary"} onClick={()=>setDifficulty("hard")}>Hard</Button>{" "}
              </Card.Body>
            </div>
            <div>
              <Card.Body>
                <Card.Title as={"h3"}>Number of AI</Card.Title>
                <Button variant={aiCount === 1 ? "success" : "secondary"} onClick={()=>setAICount(1)}>1</Button>{" "}
                <Button variant={aiCount === 2 ? "success" : "secondary"} onClick={()=>setAICount(2)}>2</Button>{" "}
                <Button variant={aiCount === 3 ? "success" : "secondary"} onClick={()=>setAICount(3)}>3</Button>{" "}
              </Card.Body>
            </div>
            <div>
              <Card.Body>
                <Button variant="primary" onClick={()=> aiCount !== null && difficulty !== null ? setGameStart(true) : null}>Start Game</Button>
              </Card.Body>
            </div>
            <Card.Footer>{playerDecks.length}</Card.Footer>
          </Card>
        </header>
      </div>
    )
  }

  if(playerDecks[0].hasOwnProperty("cards") && deck !== null){
    return (
      <div>
        <Link to="/">
          <button>Home</button>
        </Link>
        <h2>Round {round}</h2>
        <p>{winMessage === "" ? "" : winMessage}</p>
        <div>
          <p>Your Chips: {yourChips} + ({betChips})</p>
          <p>Your Cards: {yourHandValue}</p>
          <div>
            {yourHand.map((card) => {
              return <p>{card}</p>;
            })
            }
          </div>
          <p>Your Bet {betChips}</p>
          <button disabled={yourHand.length > 0} onClick={() => ChangeBet(1)}>Raise Bet</button>
          <button disabled={yourHand.length > 0} onClick={() => ChangeBet(0)}>Lower Bet</button>
        </div>
        <button disabled={winMessage !== ""} onClick={UpdateHand}>Hit</button>
        <button disabled={winMessage !== ""} onClick={SetWinner}>Stay</button>
        <button disabled={winMessage === ""} onClick={Reset}>Next Round</button>
        <div>
          {playerDecks.map((deck, index) => { 
            return(
              <div>
              <p key={index}>Deck #{index}</p>
              
              {deck.cards.map((card, index) => <li key={index}>{card}</li>)}
          </div>
          )}
          )
          }
        </div>
        <p>Main Deck {deck.length}</p>
        <div>
          {deck.map((card) => {
            return <p>{card}</p>;
          })
          }
        </div>
      </div>
    )
  }

  return (
      <div>
        <Link to="/">
          <button>Home</button>
        </Link>
        <h2>Blackjack</h2>
        <p>{playerDecks.length}</p>
        {/* <p>{AcquireValue(playerDecks[0].cards)}</p>
        {
          playerDecks[0].cards.map((card) =>
          <p>{card}</p>
          )
        } */}
        
      </div>
  );
}

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

export default Blackjack;