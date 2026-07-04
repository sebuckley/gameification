import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import {
  House,
  Users,
  CalendarCheck,
  MessageCircle,
  Shuffle,
  Group,
  ListChecks,
  UserCog,
} from "lucide-react";
import usePeople from "./components/store/usePeopleStore";

import LandingPage from "./components/pages/LandingPage";
import PeoplePage from "./components/pages/PeoplePage";
import IceBreakerPage from "./components/pages/IceBreakerPage";
import SpinnerPage from "./components/pages/SpinnerPage";
import GroupsPage from "./components/pages/GroupsPage";
import QuizPage from "./components/pages/QuizPage";
import AgendaPage from "./components/pages/AgendaPage";
import UserDetailsPage from "./components/pages/UserDetailsPage";

export default function App() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [running, setRunning] = useState(false)
  const events = usePeople((s) => s.events);
  const currentEventId = usePeople((s) => s.currentEventId);
  const selectEvent = usePeople((s) => s.selectEvent);
  const createEvent = usePeople((s) => s.createEvent);

  useEffect(() => {
    if (!Array.isArray(events) || events.length === 0) {
      createEvent();
      return;
    }

    const exists = events.some((eventItem) => eventItem.id === currentEventId);
    if (!exists) {
      selectEvent(events[0].id);
    }
  }, [events, currentEventId, createEvent, selectEvent]);

  return (


    <div className="min-h-screen flex flex-col">

      {!running && (

<header className="bg-indigo-600 shadow">
  <div className="max-w-4xl mx-auto p-4">

    {/* MOBILE: Hamburger */}
    <div className="flex items-center justify-between md:hidden">
      <span className="text-white font-bold text-lg">Gameification</span>

      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="text-white focus:outline-none"
        t
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
        <NavItem to="/" label="Home" icon={House} end />
        <NavItem to="/people" label="People" icon={Users} />
        <NavItem to="/agenda" label="Agenda" icon={CalendarCheck} />
        <NavItem to="/icebreaker" label="Icebreaker" icon={MessageCircle} />
        <NavItem to="/spinner" label="Spinner" icon={Shuffle} />
        <NavItem to="/groups" label="Groups" icon={Group} />
        <NavItem to="/quiz" label="Quiz" icon={ListChecks} />
        <NavItem to="/user-details" label="User Details" icon={UserCog} />
      </nav>
    )}

    {/* DESKTOP MENU */}
    <nav className="hidden md:flex gap-4">
      <NavItem to="/" label="Home" icon={House} end />
      <NavItem to="/people" label="People" icon={Users} />
      <NavItem to="/agenda" label="Agenda" icon={CalendarCheck} />
      <NavItem to="/icebreaker" label="Icebreaker" icon={MessageCircle} />
      <NavItem to="/spinner" label="Spinner" icon={Shuffle} />
      <NavItem to="/groups" label="Groups" icon={Group} />
      <NavItem to="/quiz" label="Quiz" icon={ListChecks} />
      <NavItem to="/user-details" label="User Details" icon={UserCog} />
    </nav>
  </div>
</header>


      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/user-details" element={<UserDetailsPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/icebreaker" element={<IceBreakerPage running={ running } setRunning={ setRunning } />} />
          <Route path="/spinner" element={<SpinnerPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/quiz" element={<QuizPage running={ running } setRunning={ setRunning } />} />
        </Routes>
      </main>
    </div>
  );
}

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `px-3 py-2 rounded text-sm font-medium inline-flex items-center gap-2 ${
          isActive
            ? "bg-white text-indigo-600"
            : "text-white"
        }`
      }
    >
      {Icon ? <Icon size={16} /> : null}
      {label}
    </NavLink>
  );
}
