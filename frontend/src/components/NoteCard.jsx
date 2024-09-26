import React, { useContext, useEffect, useRef, useState } from "react";
import { NoteContext } from "../context/NoteContext";
import api from "../api";
import { RiDeleteBin5Fill } from "react-icons/ri";
import "../styles/NoteCard.css";
const NoteCard = ({ note }) => {
  const { activeColor, setActiveColor, setNotes } = useContext(NoteContext);

  const mouseStartPos = useRef({ x: 0, y: 0 });
  const textAreaRef = useRef(null);
  const cardRef = useRef(null);
  const [noteColor, setNoteColor] = useState(JSON.parse(note.color));
  const [notePos, setNotePos] = useState(JSON.parse(note.position));
  const [body, setBody] = useState(note.description ? note.description : "");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const payload = {
    description: body,
    color: JSON.stringify(noteColor),
    position: JSON.stringify(notePos),
    id: note.id,
  };
  const autoGrow = () => {
    const { current } = textAreaRef;
    if (current) {
      current.style.height = "auto"; // reset the height
      current.style.height = current.scrollHeight + "px"; // set the new height
    }
  };

  useEffect(() => {
    // Adjust height when the note changes
    if (textAreaRef.current) {
      autoGrow();
    }
  }, [note]);

  const deleteBtn = async () => {
    try {
      const res = await api.delete(`/user/note/${note.id}`);
      setNotes((prevNotes) =>
        prevNotes.filter((oldNote) => oldNote.id !== note.id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
    // get mouse coordinate while mousedown on a note then store it
    mouseStartPos.current.x = event.clientX - cardRef.current.offsetLeft;
    mouseStartPos.current.y = event.clientY - cardRef.current.offsetTop;

    // while mousedown listen to mousemove and mouseup event
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = (event) => {
    // on mouseup remove both mousemove and mouseup even tlistner
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event) => {
    // while mouse moving get indicate the note's coordnate
    const offsetLeft = event.clientX - mouseStartPos.current.x;
    const offsetTop = event.clientY - mouseStartPos.current.y;

    //update notes offset(position)
    setNotePos({
      x: offsetLeft > 0 ? offsetLeft : 0,
      y: offsetTop > 0 ? offsetTop : 0,
    });
  };

  const changeColor = async () => {
    if (activeColor && noteColor.id !== activeColor.id) {
      try {
        const color = JSON.stringify(activeColor);
        // update payload color
        payload.color = color;
        const res = await api.put(`/user/note/${note.id}`, payload);
        const newColor = JSON.parse(res.data.color);
        setNoteColor(newColor);

        setNotes((prevNotes) => [
          res.data,
          ...prevNotes.filter((oldNote) => oldNote.id !== note.id),
        ]);
      } catch (error) {
        console.error(error);
      }
    }
    setActiveColor(null);
  };

  const updateBody = async (text) => {
    try {
      // update payload body
      payload.description = text;
      const res = await api.put(`/user/note/${note.id}`, payload);

      setBody(res.data.description);

      setNotes((prevNotes) => [
        res.data,
        ...prevNotes.filter((oldNote) => oldNote.id !== note.id),
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = async (event) => {
    const text = event.target.value;

    // updating body onChange
    setBody(text);
    setIsTyping(true);

    // first remove imeout if there is any
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // seting a new timeout
    setTypingTimeout(
      setTimeout(() => {
        setIsTyping(false);
        updateBody(text);
      }, 5000)
    );
  };

  useEffect(() => {
    // cleanup typingTimeout on Unmount
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, []);

  const handleSelectedNote = (e) => {
    // set zIndex to 100 when selected
    cardRef.current.style.zIndex = 100;

    // reset all other notes to zIndex 1
    Array.from(document.getElementsByClassName("note-container")).forEach(
      (element) => {
        if (element !== cardRef.current) {
          element.style.zIndex = 1;
        }
      }
    );
  };

  return (
    <div
      className="note-container"
      ref={cardRef}
      style={{
        left: `${notePos.x}px`,
        top: `${notePos.y}px`,
      }}
      onClick={handleSelectedNote}
    >
      <div
        className="note-header"
        style={{
          backgroundColor: noteColor.colorHeader,
          color: noteColor.colorText,
        }}
        onClick={handleSelectedNote}
        onDoubleClick={changeColor}
        onMouseDown={(e) => {
          handleMouseDown(e);
          handleSelectedNote();
        }}
        onMouseUp={() => {
          const initialPos = JSON.parse(note.position);
          if (initialPos.x !== notePos.x || initialPos.y !== notePos.y) {
            updateBody(body);
          }
        }}
      >
        <button className="delete-btn" onClick={() => deleteBtn()}>
          <RiDeleteBin5Fill size={24} />
        </button>
      </div>
      <textarea
        onClick={() => {
          setActiveColor(null);
        }}
        ref={textAreaRef}
        onInput={autoGrow}
        className="note-textarea"
        style={{ backgroundColor: noteColor.colorBody }}
        onChange={handleChange}
        value={body}
      ></textarea>
    </div>
  );
};

export default NoteCard;
