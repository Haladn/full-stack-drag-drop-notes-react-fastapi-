
from models import User,Note
from schemas import UserIn,UserOut,NoteIn,NoteOut,Token
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from fastapi.security.oauth2 import OAuth2PasswordBearer,OAuth2PasswordRequestForm
import os
from passlib.context import CryptContext
import jwt
from jwt import PyJWTError
from datetime import datetime, timedelta, timezone
from fastapi import Depends,HTTPException,status,APIRouter
from email_validator import validate_email, EmailNotValidError
from dependencies import get_db



# loading .env 
load_dotenv()

# get variables from .env
token_expire_time = int(os.getenv("TOKEN_EXPIRE_MINUTES"))
secret_key = os.getenv("SECRET_KEY")
algorithm = os.getenv("ALGORITHM")

router = APIRouter(
    prefix="/user",
    tags=["auth"]
)

# create password context
pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")

# create oauth schema
oauth_schema = OAuth2PasswordBearer(tokenUrl="/user/login/token")


def get_hashed_password(password:str):
    return pwd_context.hash(password)

def verify_password(password:str,hashed_password:str):
    return pwd_context.verify(password,hashed_password)

def get_user(email:str,db:Session):
    user_model = db.query(User).filter(User.email==email).first()
   
    return user_model

def authenticate_user(email:str,password:str,db:Session):
    user = get_user(email,db)
    if user is None:
        return False
    if not verify_password(password,user.hashed_password):
        return False
    return user

def create_access_token(data:dict):
    to_encode = data.copy()
    expire_time = datetime.now(timezone.utc) + timedelta(minutes=token_expire_time)
    to_encode.update({"exp":expire_time})
    encode_jwt = jwt.encode(to_encode,secret_key,algorithm)
    return encode_jwt

async def get_current_user(db:Session = Depends(get_db) ,token:str=Depends(oauth_schema)):
    credential_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate Credentials",
            headers={"WWW-Authenticate":"Bearer"}
        )
     
    try:
        payload = jwt.decode(token,secret_key,algorithms=[algorithm])
        email:str = payload.get("sub")
        if email is None:
            raise credential_exception
    except PyJWTError:
        raise credential_exception
    
    user = get_user(email,db)
    return user

@router.post("/register/",response_model=Token)
async def user_register(user:UserIn,db:Session=Depends(get_db)):
    try:
        check_email = validate_email(user.email,check_deliverability=True)
        email_normalize = check_email.normalized
    except EmailNotValidError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid email format: {user.email}. Error: {e}"
        )

    check_user = authenticate_user(email_normalize,user.password,db)
    if check_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Email address already exist, try to login.")
    
    hash_password = get_hashed_password(user.password)

    user_model = User(
        email = email_normalize,
        hashed_password = hash_password,
    )

    if user.role:
        user_model.role = user.role
    
    db.add(user_model)
    db.commit()
    db.refresh(user_model)

    token_data:dict = {
        "sub":email_normalize
    }

    access_token = create_access_token(token_data)
    return {"access_token":access_token,"token_type":"bearer"}

@router.post("/login/token",response_model=Token)
async def user_login(form_data:OAuth2PasswordRequestForm = Depends(),db:Session=Depends(get_db)):
    check_user = authenticate_user(form_data.username,form_data.password,db)
    if not check_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid user try to register.")
    
    token_data:dict = {
        "sub":form_data.username
    }
    access_token = create_access_token(token_data)
    return {"access_token":access_token,"token_type":"bearer"}




@router.get("/list",response_model=list[UserOut])
async def get_all_users(current_user:UserOut=Depends(get_current_user),db:Session=Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You have no authoroty to access the content.")
    
    users = db.query(User).all()
    return users


@router.delete("/delete/{user_id}")
async def user_delete(user_id:int,current_user:UserOut=Depends(get_current_user),db:Session=Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You have no authoroty to access the content.")
    
    user_model=db.query(User).filter(User.id == user_id).first()
    if user_model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="User not found")
    if user_model.role == "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You can\'t delete admin.")
    db.delete(user_model)
    db.commit()
    return {"message": "User deleted successfully"}



