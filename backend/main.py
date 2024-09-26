from fastapi import FastAPI,Depends,status,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import Base,engine
from models import User, Note
from sqlalchemy.orm import Session
import auth
from dependencies import get_db
from schemas import NoteIn,NoteOut,UserOut


# create database from python objects
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    # "http//localhost:5173/"
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)


@app.post("/user/note",response_model=NoteOut)
async def user_create_note(note:NoteIn,current_user:UserOut=Depends(auth.get_current_user),db:Session=Depends(get_db)):
    note_model = Note(
        user_id = current_user.id,
        description = note.description,
        position = note.position,
        color = note.color,
    )

    db.add(note_model)
    db.commit()
    db.refresh(note_model)
    return note_model

@app.get("/user/notes",response_model=list[NoteOut])
async def users_notes(current_user:UserOut = Depends(auth.get_current_user),db:Session=Depends(get_db)):
    user_notes = db.query(Note).filter(Note.user_id == current_user.id).all()
    return user_notes

@app.delete("/user/note/{note_id}")
async def user_delete_note(note_id:int,current_user:UserOut=Depends(auth.get_current_user),db:Session=Depends(get_db)):
    
    note_to_delete = db.query(Note).filter(Note.id == note_id).first()

    if note_to_delete is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"Note with ID {note_id} does not exist.")
    
    db.delete(note_to_delete)
    db.commit()

    return {"meassage":"Note deleted successfully."}

@app.put("/user/note/{note_id}",response_model=NoteOut)
async def user_update_note(note_id:int,note:NoteOut,current_user:UserOut=Depends(auth.get_current_user),db:Session=Depends(get_db)):
    
    to_update = db.query(Note).filter(Note.id == note_id).first()
    
    if to_update is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"Note does not exist.")
    
    to_update.description = note.description
    to_update.position = note.position
    to_update.color = note.color

    db.commit()
    db.refresh(to_update)

    return to_update


