from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = "sqlite:///./notes.db"

# create engine to connect to the database
engine = create_engine(DATABASE_URL,connect_args={"check_same_thread":False})

# create Base model to inherit from it
Base = declarative_base()

# sesson to comunicate with the data base
SessionLocal = sessionmaker(bind = engine, autoflush=False,autocommit = False)
