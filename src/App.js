import { useEffect } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import usePeople from "./components/store/usePeopleStore";

import PeoplePage from "./components/pages/PeoplePage";
import SpinnerPage from "./components/pages/SpinnerPage";
import GroupsPage from "./components/pages/GroupsPage";
import QuizPage from "./components/pages/QuizPage";
import AgendaPage from "./components/pages/AgendaPage";

export default function App() {


  return (
    <div className="min-h-screen flex flex-col">
<header className="bg-indigo-600 shadow">
  <nav className="max-w-4xl mx-auto flex gap-4 p-4">
    <NavItem to="/" label="People" />
    <NavItem to="/agenda" label="Agenda" />
    <NavItem to="/spinner" label="Spinner" />
    <NavItem to="/groups" label="Groups" />
    <NavItem to="/quiz" label="Quiz" />
  </nav>
</header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<PeoplePage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/spinner" element={<SpinnerPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/quiz" element={<QuizPage />} />
        </Routes>
      </main>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
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
