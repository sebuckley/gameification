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

  const [running, setRunning] = useState(false)

  return (


    <div className="min-h-screen flex flex-col">

      {!running && (

      <header className="bg-indigo-600 shadow">
        <nav className="max-w-4xl mx-auto flex gap-4 p-4">
          <NavItem to="/gameification" label="Home" end />
          <NavItem to="/gameification/people" label="People" />
          <NavItem to="/gameification/agenda" label="Agenda" />
          <NavItem to="/gameification/spinner" label="Spinner" />
          <NavItem to="/gameification/groups" label="Groups" />
          <NavItem to="/gameification/quiz" label="Quiz" />
        </nav>
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
