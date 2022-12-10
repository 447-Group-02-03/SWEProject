import React, { useState } from "react";
import { Link, useNavigate, createSearchParams } from "react-router-dom";
import { Button, Card , InputGroup, Form } from "react-bootstrap";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from '../firebase-config';
import { collection, query, where, limit, addDoc, getDocs } from "firebase/firestore";

function Home() {
  const navigate = useNavigate()

  const [isAuth, setIsAuth] = useState(false)
  const [userChips, setUserChips] = useState(500)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginMessage, setLoginMessage] = useState("Login or Register to save your chips!")

  const playBlackjack = () => {
    navigate({
      pathname: "/blackjack",
      search: createSearchParams({
        chips: userChips,
        username: username,
        password: password
      }).toString()
    })
  }

  function fetchProfile(){
    return new Promise(async (resolve) => {
      let results = await fetchProfileHandler(username, password)
      let chips = 500
      let profile = results[0]
      let message = results[1]
      
      setIsAuth(profile === null ? false : true)
      setUserChips(profile === null ? chips : profile.chips)
      setLoginMessage(message)
      resolve()
    })
  }

  function registerProfile(){
    return new Promise(async (resolve) => {
      let profile = await registerProfileHandler()
      setLoginMessage("New Profile Created! Chips: " + profile.chips)
      setIsAuth(true)
    })
  }

  function fetchProfileHandler(username, password){
    return new Promise(async (resolve) => {
      if(username === "" || password === ""){
        resolve([null, "Please enter a username and password"])
      }
      let profilesRef = collection(db, 'profiles')
      let snapshot = query(profilesRef, where("username", "==", username), where("password", "==", password), limit(1))
      let profile = await getDocs(snapshot)
      let message = ""
      profile.forEach((doc) => {
        profile = doc.data()
      });
      if(profile.empty){
        profile = null
        message = "No Profile Found"
      }
      else {
        message = username + ": " + profile.chips + " Chips"
      }
      resolve([profile, message])
    })
  }

  function registerProfileHandler(){
    return new Promise(async (resolve) => {
      let profile = {
        username: username,
        password: password,
        chips: 500
      }
      await addDoc(collection(db, "profiles"), {
        username: username,
        password: password,
        chips: 500
      })
      resolve(profile)
    })
  }

  const handleUserChange = event => {
    setUsername(event.target.value);
  };

  const handlePassChange = event => {
    setPassword(event.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <Card style={{ color: "#000", marginBottom: 15 }}>
          <Card.Body>
            <Card.Title> Welcome to Card Stop!</Card.Title>
            <Card.Img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjJSOJive1GZiEC4jiMUMbrDUhsqKlh-6bdw&usqp=CAU" />
            <Card.Text>Select Game</Card.Text>
            {/* <Link to={{pathname: "/blackjack", state: [userChips]}}> */}
              <Button onClick={playBlackjack}>Blackjack</Button>
            {/* </Link> */}
            <div />
            <Link to="/poker">
              <Button>Poker</Button>
            </Link>
          </Card.Body>
          {
          isAuth === false ?
          <div>
            <Card.Text>{loginMessage}</Card.Text>
            <InputGroup className="mb-3" >
              <Form.Control
                placeholder="Username"
                aria-label="Username"
                aria-describedby="basic-addon1"
                id='Username'
                onChange={handleUserChange}
              />
              <Form.Control
                placeholder="Password"
                aria-label="Password"
                aria-describedby="basic-addon1"
                id='Password'
                onChange={handlePassChange}
              />
            </InputGroup> 
            <Button onClick={fetchProfile}>Login</Button> 
            <Button onClick={registerProfile}>Register</Button>
          </div> :
          <div>
            <Card.Text>{loginMessage}</Card.Text>
          </div>
        }
        </Card>
      </header>
    </div>
  );
}

export default Home;
