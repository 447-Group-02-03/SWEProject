import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blackjack from "./pages/Blackjack";
import Poker from "./pages/Poker";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" index element={<Home />}></Route>
        <Route path="blackjack" element={<Blackjack />}></Route>
        <Route path="poker" element={<Poker />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
