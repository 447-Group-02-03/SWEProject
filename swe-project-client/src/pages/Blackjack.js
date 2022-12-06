import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import '../css/Blackjack.css'

function Blackjack() {
  const [difficulty, setDifficulty] = useState(null)
  const [aiCount, setAICount] = useState(null)
  const [gameStart, setGameStart] = useState(null)
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState(null)
  const [playerDecks, setPlayerDeck] = useState([])

  // useEffect(() => {
  //   console.log("This is the deck: " + deck)
  // }, [deck])

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
      resolve(newDeck)
    })
  }

  async function AddAICards(id){
    console.log("Calling AddAICards")
    let newHand = await AIValueBuilder(id)
    console.log(newHand)
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
      let newHand = playerDecks[id].cards
      while(value < 24){
        let newCard = await PopNewCard()
        newHand = [...newHand, newCard]
        value = await AcquireValue(newHand)
        console.log(newHand)
        console.log(value)
      }
      let cardsToRemove = new Set(newHand)
      let newDeck = deck.filter((card) => {
        return !cardsToRemove.has(card)
      })
      setDeck(newDeck)
      console.log(newHand)
      console.log(value)
      console.log(deck)
      resolve(newHand)
    })
  }

  function PopNewCard(){
    return new Promise((resolve) => {
      let index = Math.floor(Math.random() * deck.length)
      let chosenCard = deck[index]
      resolve(chosenCard)
    })
  }

  function AcquireValue(array){
    return new Promise((resolve) => {
      let sum = 0
      let aces = array.filter((card) => {
        if(card[0] === 'A'){
          return true;
        }
        return false;
      }).length

      for(let i = 0; i < array.length; i++){
        let value = array[i][0]
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

      while(aces !== 0 || sum > 21){
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