import React, { useEffect } from "react";
import { createContext, useRef, useState } from "react";
import api from "../api";
import colors from "../assets/colors.json";

export const NoteContext = createContext();

const NoteContextProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [activeColor, setActiveColor] = useState(null);

  const contextData = {
    activeColor,
    setActiveColor,
    notes,
    setNotes,
  };

  return (
    <NoteContext.Provider value={contextData}>{children}</NoteContext.Provider>
  );
};

export default NoteContextProvider;
