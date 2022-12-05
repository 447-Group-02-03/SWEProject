import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blackjack from "./pages/Blackjack";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" index element={<Home />}></Route>
        <Route path="blackjack" element={<Blackjack />}></Route>
      </Routes>
    </BrowserRouter>
  );
}