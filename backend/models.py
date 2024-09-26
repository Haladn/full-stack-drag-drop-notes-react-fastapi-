from database import Base
from datetime import datetime, timezone
from sqlalchemy import Integer,String,Column, ForeignKey, DateTime
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    id = Column(Integer,primary_key=True,index=True)
    email = Column(String,unique=True,nullable=False)
    hashed_password = Column(String,nullable=False)
    role = Column(String,default="customer")
    created_at = Column(DateTime,default=datetime.now(tz=timezone.utc))

    note = relationship("Note",back_populates="user")

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer,ForeignKey("users.id"))
    description = Column(String,nullable=True)
    position = Column(String,nullable=False)
    color = Column(String,nullable=False)
    created_at = Column(DateTime,default=datetime.now(tz=timezone.utc))

    user = relationship("User",back_populates="note")
