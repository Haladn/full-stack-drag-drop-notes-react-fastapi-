from pydantic import BaseModel,EmailStr

class UserBase(BaseModel):
    email:EmailStr
    role:str|None = None

    class Config:
        from_attributes = True

class UserIn(UserBase):
    password:str

class UserOut(UserBase):
    id:int

class NoteBase(BaseModel):
    description:str|None = None
    position:str
    color:str

    class Config:
         from_attributes = True

class NoteIn(NoteBase):
    pass

class NoteOut(NoteBase):
    id:int
    # user_id:int

class Token(BaseModel):
    access_token:str
    token_type:str
