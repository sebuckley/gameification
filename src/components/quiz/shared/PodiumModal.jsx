import React from "react";
import PersonBadge from "./PersonBadge";

export default function PodiumModal({ show, podium, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[420px] min-w-[500px] space-y-6 border text-center">

        <h3 className="text-2xl font-bold">Final Scores</h3>

        <div className="flex justify-center gap-4 items-end">

          {/* 2nd Place */}
          {podium[1] && (
            <div className="flex flex-col items-center space-y-2">
              <PersonBadge person={podium[1]} />
              <div className="font-semibold text-gray-700">2nd Place</div>
              <div className="text-sm text-gray-600">
                {podium[1].quizScore} pts
              </div>
            </div>
          )}

          {/* 1st Place */}
          {podium[0] && (
            <div className="flex flex-col items-center space-y-2 border-4 border-yellow-400 rounded-xl p-2">
              <PersonBadge person={podium[0]} />
              <div className="font-bold text-yellow-600 text-xl">
                1st Place
              </div>
              <div className="text-sm text-gray-600">
                {podium[0].quizScore} pts
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {podium[2] && (
            <div className="flex flex-col items-center space-y-2">
              <PersonBadge person={podium[2]} />
              <div className="font-semibold text-gray-700">3rd Place</div>
              <div className="text-sm text-gray-600">
                {podium[2].quizScore} pts
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
