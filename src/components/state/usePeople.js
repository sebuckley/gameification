import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "people-app";

export function usePeople() {

  const chicColors = [
    "#D16C7A", "#6CA8D1", "#E3C26F", "#D18F6C",
    "#9B7ED1", "#6CD1A8", "#D16C6C", "#6CD1D1"
  ];

  const shiftHue = (hex) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const newR = (r + 25) % 255;
    const newG = (g + 25) % 255;
    const newB = (b + 25) % 255;

    return (
      "#" +
      newR.toString(16).padStart(2, "0") +
      newG.toString(16).padStart(2, "0") +
      newB.toString(16).padStart(2, "0")
    );
  };

  // LOAD ONCE — DO NOT PATCH AGAIN
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : { people: [], groupsHistory: [] };

      let used = [];

      const patchedPeople = parsed.people.map((p) => {
        const preferredName = p.preferredName || p.fullName || p.name || "";
        const fullName = p.fullName || p.name || preferredName;

        let color = p.color;
        if (!color) {
          const available = chicColors.filter(
            (c) => !used.includes(c.toLowerCase())
          );
          color = available.length > 0 ? available[0] : shiftHue("#6CA8D1");
        }

        used.push(color.toLowerCase());

        return {
          ...p,
          fullName,
          preferredName,
          color
        };
      });

      return {
        people: patchedPeople,
        groupsHistory: parsed.groupsHistory ?? []
      };
    } catch {
      return { people: [], groupsHistory: [] };
    }
  });

  // SAVE
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ADD PERSON
  const addPerson = useCallback((data) => {
    const { fullName, preferredName, color } = data;

    const newPerson = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      preferredName: preferredName.trim(),
      color,
      isPresenter: false,
      inSpinner: true,
      inGroups: true,
      answers: 0,
      history: []
    };

    setState((s) => ({
      ...s,
      people: [...s.people, newPerson],
    }));
  }, []);

  // UPDATE PERSON — THIS MUST NOT BE OVERWRITTEN
const updatePerson = (id, updates) => {
  setState((s) => {
    const newPeople = s.people.map((p) => {
      if (p.id !== id) return p;
      return { ...p, ...updates };
    });

    const newState = { ...s, people: newPeople };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return newState;
  });
};


  const addHistory = useCallback((id, entry) => {
    setState((s) => ({
      ...s,
      people: s.people.map((p) =>
        p.id === id
          ? { ...p, history: [entry, ...p.history].slice(0, 3) }
          : p
      ),
    }));
  }, []);

  const incrementAnswers = useCallback((id) => {
    setState((s) => ({
      ...s,
      people: s.people.map((p) =>
        p.id === id ? { ...p, answers: p.answers + 1 } : p
      ),
    }));
  }, []);

  const saveGroups = useCallback((groups) => {
    const entry = { timestamp: Date.now(), groups };
    setState((s) => ({
      ...s,
      groupsHistory: [entry, ...s.groupsHistory].slice(0, 3),
    }));
  }, []);

  return {
    ...state,
    addPerson,
    updatePerson,
    addHistory,
    incrementAnswers,
    saveGroups,
  };
}
