import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import usePeople from "./components/store/usePeopleStore";

import LandingPage from "./components/pages/LandingPage";
import PeoplePage from "./components/pages/PeoplePage";
import SpinnerPage from "./components/pages/SpinnerPage";
import GroupsPage from "./components/pages/GroupsPage";
import QuizPage from "./components/pages/QuizPage";
import AgendaPage from "./components/pages/AgendaPage";

export default function App() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [running, setRunning] = useState(false)

  return (


    <div className="min-h-screen flex flex-col">

      {!running && (

<header className="bg-indigo-600 shadow">
  <div className="max-w-4xl mx-auto p-4">

    {/* MOBILE: Hamburger */}
    <div className="flex items-center justify-between md:hidden">
      <span className="text-white font-bold text-lg">Menu</span>

      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="text-white focus:outline-none"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

    {/* MOBILE COLLAPSIBLE MENU */}
    {menuOpen && (
      <nav className="flex flex-col gap-2 mt-4 md:hidden">
        <NavItem to="/gameification" label="Home" end />
        <NavItem to="/gameification/people" label="People" />
        <NavItem to="/gameification/agenda" label="Agenda" />
        <NavItem to="/gameification/spinner" label="Spinner" />
        <NavItem to="/gameification/groups" label="Groups" />
        <NavItem to="/gameification/quiz" label="Quiz" />
      </nav>
    )}

    {/* DESKTOP MENU */}
    <nav className="hidden md:flex gap-4">
      <NavItem to="/gameification" label="Home" end />
      <NavItem to="/gameification/people" label="People" />
      <NavItem to="/gameification/agenda" label="Agenda" />
      <NavItem to="/gameification/spinner" label="Spinner" />
      <NavItem to="/gameification/groups" label="Groups" />
      <NavItem to="/gameification/quiz" label="Quiz" />
    </nav>
  </div>
</header>


      )}

      <main className="flex-1">
        <Routes>
          <Route path="/gameification/" element={<LandingPage />} />
          <Route path="/gameification/people" element={<PeoplePage />} />
          <Route path="/gameification/agenda" element={<AgendaPage />} />
          <Route path="/gameification/spinner" element={<SpinnerPage />} />
          <Route path="/gameification/groups" element={<GroupsPage />} />
          <Route path="/gameification/quiz" element={<QuizPage running={ running } setRunning={ setRunning } />} />
        </Routes>
      </main>
    </div>
  );
}

function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `px-3 py-2 rounded text-sm font-medium ${
          isActive
            ? "bg-white text-indigo-600"
            : "text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
