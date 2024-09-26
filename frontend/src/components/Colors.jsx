import React, { useContext, useEffect, useRef } from "react";
import { NoteContext } from "../context/NoteContext";
import colors from "../assets/colors.json";
import "../styles/Colors.css";
const Colors = () => {
  const { activeColor, setActiveColor } = useContext(NoteContext);
  const colorBtnRef = useRef();
  // const colors = ["aqua", "aliceblue", "red", "aquamarine", "beige"];

  const handleColor = (color) => {
    setActiveColor(color);
  };

  return (
    <div className="color-icons">
      {colors.map((color, index) => (
        <button
          ref={colorBtnRef}
          className={`colors ${activeColor == color ? "active" : ""}`}
          key={index}
          style={{ backgroundColor: `${color.colorBody}` }}
          onClick={() => handleColor(color)}
        ></button>
      ))}
    </div>
  );
};

export default Colors;
