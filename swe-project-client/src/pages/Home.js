import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";

class Home extends Component {
  render() {
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
          </Card>
        </header>
      </div>
    );
  }
}

export default Home;
