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
      console.log(newDeck)
      resolve(newDeck)
    })
  }

  async function AddAICards(id){
    console.log("Calling AddAICards")
    let newHand = await AIValueBuilder(id)
    setPlayerDeck(playerDecks.map((deck) => {
      if(deck.id === id) {
        return {...deck, cards: newHand};
      }
      return deck;
    }))
  }

  function AIValueBuilder(id){
    return new Promise(async (resolve) => {
      let value = await AcquireValue(playerDecks[id].cards)
      console.log(value)
      let newHand = playerDecks[id].cards
      while(value < 24){
        console.log(newHand)
        newHand = [...newHand, "8-C"]
        value = await AcquireValue(newHand)
        console.log(value)
      }
      resolve(newHand)
    })
  }

  function PopNewCard(){

  }

  function AcquireValue(array){
    return new Promise((resolve) => {
      let sum = 0
      for(let i = 0; i < array.length; i++){
        let value = array[i][0]
        console.info(playerDecks)
        sum += parseInt(value)
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
        <p>Main Deck</p>
        <div>
          {deck.map((card) => {
            <p>{card}</p>
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