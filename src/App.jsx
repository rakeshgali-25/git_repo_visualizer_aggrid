import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./screens/Home";
import RepoGrid from "./components/RepoGrid";
// import Screen2 from "./screens/Screen2";
import "./App.css"; // optional global styles

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        {/* <nav className="main-nav">
          <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/repos" className={({isActive}) => isActive ? "active" : ""}>Repos</NavLink>
          <NavLink to="/screen2" className={({isActive}) => isActive ? "active" : ""}>Screen 2</NavLink>
        </nav> */}

        <main style={{ padding: 16 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/repos" element={<RepoGrid />} />
            {/* <Route path="/screen2" element={<Screen2 />} /> */}
            {/* Add more routes here as you add screens */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
