import { useEffect, useRef } from "react";

export default function RemoteControl() {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8080");
  }, []);

  const send = (action, payload) => {
    socketRef.current?.send(JSON.stringify({ action, payload }));
  };

  return (
    <div className="p-6 text-center space-y-4">
      <h1 className="text-2xl font-bold">Presenter Remote</h1>

      <button onClick={() => send("PREV_SLIDE")}
        className="px-6 py-3 bg-gray-300 rounded text-lg">
        Previous
      </button>

      <button onClick={() => send("NEXT_SLIDE")}
        className="px-6 py-3 bg-indigo-600 text-white rounded text-lg">
        Next
      </button>

      <button onClick={() => send("RESET_TIMER")}
        className="px-6 py-3 bg-yellow-500 rounded text-lg">
        Reset Timer
      </button>
    </div>
  );
}
