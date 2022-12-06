import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";

class Poker extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Card style={{ color: "#000", marginBottom: 15 }}>
            <Card.Body>
              <Card.Img src="http://media.tumblr.com/27aff89c6a6fdb579806b0b8c12fae8b/tumblr_inline_mmbsakbUCA1qz4rgp.gif" />
              <Card.Text>Sorry, the game is under development!</Card.Text>
              <Link to="/">
                <Button>Home</Button>
              </Link>
            </Card.Body>
          </Card>
        </header>
      </div>
    );
  }
}

export default Poker;
