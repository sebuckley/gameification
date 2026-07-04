import { NavLink } from "react-router-dom";
import {
  Users,
  MessageCircle,
  Shuffle,
  Group,
  ListChecks,
  CalendarCheck,
  UserCog
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to Gameification
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Run sessions end-to-end with participant management, structured agendas,
          interactive icebreakers, random selection, group generation, and flexible quiz modes.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* People Manager */}
        <NavLink
          to="/people"
          className="border rounded-xl shadow p-6 bg-white space-y-3 hover:shadow-lg transition-shadow block"
        >
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">People Manager</h2>
          </div>
          <p className="text-gray-600">
            Add participants, assign colours, track answers, manage presenters,
            and import/export your full roster with ease.
          </p>
        </NavLink>

        {/* User Details */}
        <NavLink
          to="/user-details"
          className="border rounded-xl shadow p-6 bg-white space-y-3 hover:shadow-lg transition-shadow block"
        >
          <div className="flex items-center gap-3">
            <UserCog className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
          </div>
          <p className="text-gray-600">
            Capture your profile and role so the app can support future login and
            role-shaped agenda experiences.
          </p>
        </NavLink>

        {/* Agenda Planner */}
        <NavLink
          to="/agenda"
          className="border rounded-xl shadow p-6 bg-white space-y-3 hover:shadow-lg transition-shadow block"
        >
          <div className="flex items-center gap-3">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Agenda Planner</h2>
          </div>
          <p className="text-gray-600">
            Create structured agendas, reorder sessions with drag‑and‑drop,
            assign presenters, and export your full schedule.
          </p>
        </NavLink>

        {/* Icebreaker */}
        <NavLink
          to="/icebreaker"
          className="border rounded-xl shadow p-6 bg-white space-y-3 hover:shadow-lg transition-shadow block"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Ice Breaker</h2>
          </div>
          <p className="text-gray-600">
            Run fullscreen, one-person-at-a-time icebreakers with simple, random,
            choice, reveal, and performance prompt sets.
          </p>
        </NavLink>

        {/* Spinner Wheel */}
        <NavLink
          to="/spinner"
          className="border rounded-xl shadow p-6 bg-white space-y-3 hover:shadow-lg transition-shadow block"
        >
          <div className="flex items-center gap-3">
            <Shuffle className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Random Spinner</h2>
          </div>
          <p className="text-gray-600">
            Pick people at random for questions, challenges, or turns with
            history tracking and quick controls for fairness.
          </p>
        </NavLink>

        {/* Groups Generator */}
        <NavLink
          to="/groups"
          className="border rounded-xl shadow p-6 bg-white space-y-3 hover:shadow-lg transition-shadow block"
        >
          <div className="flex items-center gap-3">
            <Group className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Group Generator</h2>
          </div>
          <p className="text-gray-600">
            Automatically create random groups, save group history, and generate
            new mixes with one click.
          </p>
        </NavLink>

        {/* Quiz System */}
        <NavLink
          to="/quiz"
          className="border rounded-xl shadow p-6 bg-white space-y-3 hover:shadow-lg transition-shadow block"
        >
          <div className="flex items-center gap-3">
            <ListChecks className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Quiz Builder</h2>
          </div>
          <p className="text-gray-600">
            Build quizzes, import or reorder question sets, and run them in
            standard, points, or game-show style with live scoring.
          </p>
        </NavLink>
      </div>

      {/* CTA */}
      <div className="text-center">
        <NavLink
          to="/people"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 text-lg inline-block"
        >
          Enter the App
        </NavLink>
      </div>
    </div>
  );
}
