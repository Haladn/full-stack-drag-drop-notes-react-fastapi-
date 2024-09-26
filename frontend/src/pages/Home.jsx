import React, { useEffect, useContext, useState } from "react";
import AddBtn from "../components/AddBtn";
import Colors from "../components/Colors";
import NoteCard from "../components/NoteCard";
import { NoteContext } from "../context/NoteContext";
import api from "../api";

import "../styles/Home.css";

function Home() {
  const { notes, setNotes } = useContext(NoteContext);

  const getNotes = async () => {
    try {
      const res = await api.get("/user/notes");
      setNotes(res.data);
    } catch (error) {
      console.error("Error fetching notes: ", error);
    }
  };

  useEffect(() => {
    getNotes();
  }, []);
  return (
    <div className="home-container">
      <div>
        {notes.map((note) => (
          <NoteCard note={note} key={note.id} />
        ))}
      </div>

      <div className="home-icons">
        <AddBtn />
        <Colors />
      </div>
    </div>
  );
}

export default Home;
