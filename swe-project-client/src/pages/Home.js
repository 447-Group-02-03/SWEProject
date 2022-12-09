import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card , InputGroup, Form } from "react-bootstrap";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { collection, doc, addDoc, getDoc } from "../firebase";

function Home() {
  const [isAuth, setIsAuth] = useState(false)
  const [userChips, setUserChips] = useState(500)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginMessage, setLoginMessage] = useState("Login or Register to save your chips!")

  function fetchProfile(){
    return new Promise(async (resolve) => {
      let results = await fetchProfileHandler(username, password)
      let chips = 500
      let profile = results[0]
      let message = results[1]
      if(isAuth !== false){
        chips = profile.chips
      }
      setIsAuth(profile)
      setUserChips(chips)
      setLoginMessage(message)
      resolve()
    })
  }

  function registerProfile(){
    return new Promise((resolve) => {

    })
  }

  function fetchProfileHandler(username, password){
    return new Promise(async (resolve) => {
      if(username === "" || password === ""){
        resolve([false, "Please enter a username and password"])
      }
      let queryResult = []
      await collection("profiles")
      .where("username", "==", username)
      .where("password", "==", password)
      .get().then(querySnapshot => {
        queryResult = querySnapshot.docs[0]
      })
      console.log(queryResult)
    })
  }

  function registerProfileHandler(){
    return new Promise((resolve) => {

    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <Card style={{ color: "#000", marginBottom: 15 }}>
          <Card.Body>
            <Card.Title> Welcome to Card Stop!</Card.Title>
            <Card.Img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjJSOJive1GZiEC4jiMUMbrDUhsqKlh-6bdw&usqp=CAU" />
            <Card.Text>Select Game</Card.Text>
            <Link to="/blackjack">
              <Button>Blackjack</Button>
            </Link>
            <div />
            <Link to="/poker">
              <Button>Poker</Button>
            </Link>
          </Card.Body>
          {
          isAuth === false ?
          <div>
            <InputGroup className="mb-3" >
              <Form.Control
                placeholder="Username"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
              <Form.Control
                placeholder="Password"
                aria-label="Password"
                aria-describedby="basic-addon1"
              />
            </InputGroup> 
            <Button onClick={fetchProfile}>Login</Button> 
            <Button onClick={registerProfile}>Register</Button>
          </div> :
          <div>

          </div>
        }
        </Card>
      </header>
    </div>
  );
}

export default Home;
