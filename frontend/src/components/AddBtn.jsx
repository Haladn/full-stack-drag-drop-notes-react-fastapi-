import React, { useEffect, useContext, useRef } from "react";
import api from "../api";
import colors from "../assets/colors.json";
import { NoteContext } from "../context/NoteContext";
import "../styles/AddBtn.css";
const AddBtn = () => {
  const { activeColor, setActiveColor, setNotes, notes } =
    useContext(NoteContext);
  const startingPos = useRef(10);
  const addBtn = async () => {
    const color = activeColor ? activeColor : colors[0];
    const payload = {
      position: JSON.stringify({
        x: startingPos.current,
        y: startingPos.current,
      }),
      color: JSON.stringify(color),
    };
    const res = await api.post("user/note", payload);
    setNotes((prevState) => [res.data, ...prevState]);
    setActiveColor(null);
    startingPos.current += 10;
  };
  return (
    <div className="add-icon">
      <button onClick={addBtn}>
        <div></div>
      </button>
    </div>
  );
};

export default AddBtn;
