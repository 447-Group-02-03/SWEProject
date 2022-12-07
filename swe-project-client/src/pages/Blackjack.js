import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import { Button, Card, Nav} from "react-bootstrap";
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
  const [yourChips, setYourChips] = useState(400)
  const [betChips, setBetChips] = useState(100)
  const [backups, setBackups] = useState(0)
  const [backupMessage, setBackupMessage] = useState("")
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)

  useEffect(() => {
    function ValueRemainingCards(cards, goal){
      // Name: ValueRemainingCards
      // Description: Promise to return the probability
      // of picking a card from the deck that will still
      // result in having a deck under 21 in value
      // Return: Float Value between 0 and 1
      return new Promise((resolve) => {
        console.log("Calling ValueRemainingCards")
        let cardValues = []
        for(let i = 0; i < cards.length; i++){
          let value = cards[i][0]
          if(cards[i].length === 4){
            cardValues[i] = 10
          }
          else if(isNaN(value)){
            if(cards[i] === "A"){
              cardValues[i] = 1
            }
            else{
              cardValues[i] = 10
            }
          }
          else{
              cardValues[i] = parseInt(value)
          }
        }
        let acceptableCards = cardValues.filter((value) => {
          if(value <= goal){
            return true
          }
          else{
            return false
          }
        })
        resolve(acceptableCards.length / cards.length)
      })
    }

    function AIValueBuilder(id, currentDeck){
      // Name: AIValueBuilder
      // Description: Promise to return the newly
      // created hand as well as the new main deck,
      // without the cards picked for the hand
      // Return: Array of size 2, with the new
      // hand and the new main deck
      return new Promise(async (resolve) => {
        console.log("Calling AIValueBuilder")
        let value = await AcquireValue(playerDecks[id].cards)
        let newHand = playerDecks[id].cards
  
        if(difficulty === "easy"){
          while(value < 18){
            let newCard = await PopNewCard(currentDeck, newHand)
            newHand = [...newHand, newCard]
            value = await AcquireValue(newHand)
          }
        }
        else if(difficulty === "medium"){
          while(value < 16){
            let newCard = await PopNewCard(currentDeck, newHand)
            newHand = [...newHand, newCard]
            value = await AcquireValue(newHand)
          }
        }
        else{
          let goalDiff = 21 - value
          let potentialSuccess = await ValueRemainingCards(currentDeck, goalDiff)
          while(potentialSuccess > .4){
            let newCard = await PopNewCard(currentDeck, newHand)
            newHand = [...newHand, newCard]
            value = await AcquireValue(newHand)
            goalDiff = 21 - value
            currentDeck = currentDeck.filter((card) => {
              return !newHand.includes(card)
            })
            potentialSuccess = await ValueRemainingCards(currentDeck, goalDiff)
          }
        }
  
        currentDeck = currentDeck.filter((card) => {
          return !newHand.includes(card)
        })
        resolve([newHand, currentDeck])
      })
    }
  
    function PopNewCard(currentDeck, hand){
      // Name: PopNewCard
      // Description: Pop a single card from the
      // main deck
      // Return: String of a single card
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
      // Name: AcquireValue
      // Description: Determine the current value
      // of the hand that is passed in
      // Return: Integer of the deck value
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
      // Name: AddAICards
      // Description: Update each AI's hand
      // while reducing cards from the main 
      // deck
      // Return: None
      console.log("Calling AddAICards")
      const newPlayerDeck = []
      let newMainDeck = deck
      for(let i = 0; i < aiCount; i++){
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
  }, [round, deck, aiCount, playerDecks, difficulty])

  useEffect(() => {
    function HandleBackups(){
      return new Promise((resolve) => {
        const messages = ["",
                        "To stay in the game, you didn't go out at all the previous week to save money for the buy-in.",
                        "To stay in the game, you put all your savings from this pay period into the buy-in.",
                        "To stay in the game, you took a second mortgage out on your home, and put that into the buy-in.",
                        "To stay in the game, you sold your vehicle and put the profits into the buy-in.",
                        "To stay in the game, you have given up everything for the buy-in."
                        ]
        if(backups === messages.length){
          setGameOver(true)
          resolve()
        }
        resolve(messages[backups])
      })
    }
    
    async function AcknowledgeBackup(){
      let message = await HandleBackups()
      setBackupMessage(message)
      if(backups !== 0){
        setYourChips(1000)
      }
    }
    AcknowledgeBackup()
  }, [backups])

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
    // Name: HandleBuildDeck
    // Description: Update the deck useState to
    // contain the entire deck  
    // Return: None
    console.log("Calling HandleBuildDeck")
    let newDeck = await BuildDeck()
    await ShuffleDeck(newDeck)
    setDeck(newDeck)
  }

  function BuildDeck(){
    // Name: BuildDeck
    // Description: Build the deck by concatenating
    // each value to the actual suit it follows 
    // Return: Array of size 52, with each card
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
    // Name: ShuffleDeck
    // Description: Shuffles the deck array
    // Return: None
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
    // Name: Reset
    // Description: Resets all useStates that change with each
    // round in the game
    // Return: None
    return new Promise(async (resolve) => {
      console.log("Calling Reset")
      let results = await ResetDeck()
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
    // Name: ResetDeck
    // Description: Resets the main deck to hold all
    // all cards, while emptying all AI and Player hands
    // Return: Array of size 2, with the new main deck
    // and player decks
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
      resolve([newDeck, newPlayerDeck])
    })
  }

  async function UpdateHand(){
    // Name: UpdateHand
    // Description: Updates player hand and the main
    // deck useStates, by calling AddCardToHand
    // Return: None
    console.log("Calling UpdateHand")
    let newMainDeck = deck
    let results = await AddCardToHand(newMainDeck)
    setYourHand(results[0])
    setDeck(results[1])
    let newValue = await AcquirePlayerValue(results[0])
    setYourHandValue(newValue)
  }

  function AddCardToHand(currentDeck){
    // Name: AddCardToHand
    // Description: Adds a single card to the players
    // hand while removing that same card from the main deck
    // by calling PopNewPlayerCard
    // Return: Array of size 2, with the new players hand
    // and the new main deck
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
    // Name: PopNewPlayerCard
    // Description: Choose a single card from the main
    // deck and add it to the players hand
    // Return: String of a single card
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
    // Name: AcquirePlayerValue
    // Description: Acquire the value of a players hand
    // (aces are reduced from 11 to 1 if hand goes over
    // 21)
    // Return: Integer of the value of the players hand
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
    // Name: SetWinner
    // Description: Establish the winner and set
    // the chips accordingly by calling AcquireWinner()
    // Return: None
    let result = await AcquireWinner()
    if(result === "You Win!"){
      setYourChips(yourChips + betChips * aiCount)
    }
    else if(result === "You Tied!"){
      setYourChips(yourChips + betChips * aiCount)
    }
    else{
      if(yourChips === 0){
        setBackups(backups+1)
      }
    }
    setWinMessage(result)
  }

  function AcquireWinner(){
    // Name: AcquireWinner
    // Description: Compare values of each hand
    // to determine a winner
    // Return: String declaring the winner of the 
    //round
    return new Promise((resolve) => {
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
    // Name: ChangeBet
    // Description: Update the bet useState
    // for the player by calling HandleBetChange()
    // Return: None
    let results = await HandleBetChange(num)
    setBetChips(results[0])
    setYourChips(results[1])
  }

  function HandleBetChange(num){
    // Name: HandleBetChange
    // Description: Update players bet without
    // letting them exceed their chips
    // Return: Array of size 2 with the new betting
    // chips and your own chips
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
                  <Card.Title as={"h3"}>
                      <Link to="/">
                        <Button className="Home-Button-Body">Home</Button>
                      </Link>
                      <div>
                        Difficulty
                      </div>
                  </Card.Title>
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
  //https://pl.sterlingcdn.com/wp-content/uploads/sites/3/2018/07/blackjack-classic-background-1024x768.jpg

  if(gameWon){
    if(yourChips + betChips < 100000){
      return ( 
        <div>
          <Card className="GameOverScreen">
            <Link to="/">
              <Button size="lg">Return to the Home Screen</Button>
            </Link>
            <Card.Body>
              Congratulations! You may not have beat the game, but you denied it to have any power over you. Let this success
              mark another step in you taking back control of your own life!
            </Card.Body>
          </Card>
        </div>
      )
    }
    else{
      return (
        <div>
          <Card className="GameOverScreen">
            <Link to="/">
              <Button size="lg">Return to the Home Screen</Button>
            </Link>
            <Card.Body>
              You did it, you have somehow turned 500 chips into 100,000. But take time now to look back at what it cost, how
              much time was spent during the process? How much was lost for you to reach this point? Finally, was it worth it?
              Thankfully, aside from the time, very little was lost, but what you have gone through in this small game is 
              a simple display of an addiction that millions of people go through every day. Hopefully, this experience has 
              encouraged you to stray away from this addiction. Thank you for playing.
            </Card.Body>
          </Card>
        </div>
      )
    }
  }

  if(gameOver){
    return(
      <div>
        <Card className="GameOverScreen">
          <Link to="/">
            <Button size="lg">Return to the Home Screen</Button>
          </Link>
          <Card.Body>
            You have run out of chips, despite the numerous steps taken to continue playing. Consider this however, despite
            time, you have lost nothing. The same cannot be said for many people who suffer from gambling addictions every
            year. Hopefully, this experience has encouraged you to stray away from this addiction. Thank you for playing.
          </Card.Body>
        </Card>
      </div>
    )
  }

  if(playerDecks[0].hasOwnProperty("cards") && deck !== null){
    return (
      <div className="Blackjack">
        <header className="AppBody">
          <Card className="ImageOverlayStyle">
            <Card.Img src="https://pl.sterlingcdn.com/wp-content/uploads/sites/3/2018/07/blackjack-classic-background-1024x768.jpg"/>
            <Card.ImgOverlay>
              <button onClick={() => setGameWon(true)}>Quit</button>
              <h2>Round {round}</h2>
              <h3>{backupMessage !== "" && yourHand.length === 0 ? backupMessage : ""}</h3>
              <p>{winMessage === "" ? "" : winMessage}</p>
              <div>
                <p>Your Chips: {yourChips} +({betChips})</p>
                <p>Your Cards: {yourHandValue}</p>
                <div>
                  {yourHand.map((card, index) => {
                    return <img className="CardStyle" key={index} src={cards[card + '.png']} alt={card}></img>;
                  })
                  }
                </div>
                <p>Your Bet {betChips}</p>
                <button disabled={yourHand.length > 0} onClick={() => ChangeBet(1)}>Raise Bet</button>
                <button disabled={yourHand.length > 0} onClick={() => ChangeBet(0)}>Lower Bet</button>
              </div>
              <button disabled={winMessage !== ""} onClick={UpdateHand}>Hit</button>
              <button disabled={winMessage !== "" || yourHand.length === 0} onClick={SetWinner}>Stay</button>
              <button disabled={winMessage === ""} onClick={Reset}>Next Round</button>
              <div>
                {playerDecks.map((deck, index) => { 
                  return(
                    <div>
                    {index !== 0 ?
                    <p key={index}>Deck #{index} ({winMessage !== "" ? deck.value : "?"})</p> :
                    <p key={index}>House ({winMessage !== "" ? deck.value : "?"})</p>
                    }
                    
                    {deck.cards.map((card, index) => {
                      return (
                        index === 0 ? 
                        <img className="CardStyle" key={index} src={cards['BACK.png']} alt={card}></img> :
                        <img className="CardStyle" key={index} src={cards[card + '.png']} alt={card}></img>
                      )
                    })}
                  </div>
                  )
                })}
              </div>
              <p>Main Deck {deck.length}</p>
              {/* <div>
                {deck.map((card) => {
                  return <p>{card}</p>;
                })
                }
              </div> */}
            </Card.ImgOverlay>
          </Card>
        </header>
      </div>
    )
  }

  return (
      <div>
        <Link to="/">
          <Button>Home</Button>
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