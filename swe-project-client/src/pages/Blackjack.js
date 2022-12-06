import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import '../css/Blackjack.css'

function Blackjack() {
  const [difficulty, setDifficulty] = useState(null)
  const [aiCount, setAICount] = useState(null)
  const [gameStart, setGameStart] = useState(null)
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState(null)
  const [playerDecks, setPlayerDeck] = useState([])

  if(cards === null) {
    setCards(importAll(require.context('../cards', false)))
  }

  if(deck === null && gameStart === true){
    HandleBuildDeck()
  }

  if(aiCount !== null && aiCount !== playerDecks.length){
    setPlayerDeck([])
    for(let i = 0; i < aiCount; i++){
      setPlayerDeck((prev) => [...prev, {id: i, cards: []}])
    }
  }

  async function HandleBuildDeck(){
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
      let currentIndex = array.length,  randomIndex;

      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }
    setDeck(array);
    })
  }

  async function Reset(){
    let results = await ResetDeck()
    console.log(results[0])
    console.log(results[1])
    setDeck(results[0])
    setPlayerDeck(results[1])
  }

  function ResetDeck(){
    return new Promise(async (resolve) => {
      let newDeck = deck
      let newPlayerDeck = []
      for(let i = 0; i < playerDecks.length; i++){
        for(let j = 0; j < playerDecks[i].cards.length; j++){
          newDeck = [...newDeck, playerDecks[i].cards[j]]
        }
        newPlayerDeck[i] = {id: playerDecks[i].id, cards: []}
      }
      console.log(newDeck)
      console.log(newPlayerDeck)
      resolve([newDeck, newPlayerDeck])
    })
  }

  async function AddAICards(id){
    console.log("Calling AddAICards")
    const newPlayerDeck = []
    let newMainDeck = deck
    for(let i = 0; i < aiCount; i++){
      console.log(newMainDeck)
      let results = await AIValueBuilder(i, newMainDeck)
      newPlayerDeck[i] = {
        id: i,
        cards: results[0]
      }
      newMainDeck = results[1]
    }
    setPlayerDeck(newPlayerDeck)
    setDeck(newMainDeck)
  }

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

  if(gameStart === null || difficulty === null || aiCount === null){
    return (
      <div>
        <div>
          <p>Difficulty</p>
          <button className={difficulty === 'easy' ? "selected" : ""} onClick={()=>setDifficulty("easy")}>Easy</button>
          <button className={difficulty === 'medium' ? "selected" : ""} onClick={()=>setDifficulty("medium")}>Medium</button>
          <button className={difficulty === 'hard' ? "selected" : ""} onClick={()=>setDifficulty("hard")}>Hard</button>
        </div>
        <div>
          <p>Number of AI</p>
          <button className={aiCount === 1 ? "selected" : ""} onClick={()=>setAICount(1)}>1</button>
          <button className={aiCount === 2 ? "selected" : ""} onClick={()=>setAICount(2)}>2</button>
          <button className={aiCount === 3 ? "selected" : ""} onClick={()=>setAICount(3)}>3</button>
        </div>
        <button onClick={()=> aiCount !== null && difficulty !== null ? setGameStart(true) : null}>Start Game</button>
        <p>{playerDecks.length}</p>
      </div>
    )
  }

  if(playerDecks[0].hasOwnProperty("cards") && deck !== null){
    return (
      <div>
        <Link to="/">
          <button>Home</button>
        </Link>
        <h2>Game Starting</h2>
        <p>{playerDecks.length}</p>
        <button onClick={() => AddAICards(0)}>Hit</button>
        <button onClick={Reset}>Reset Deck</button>
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
        <button onClick={() => AddAICards(0)}>Hit</button>
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