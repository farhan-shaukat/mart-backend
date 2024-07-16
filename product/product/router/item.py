from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form,status
from sqlmodel import Session, select
from product.model import Product
from product.database import get_session
import os
from pydantic import EmailStr
from typing import List
from fastapi.security import OAuth2PasswordBearer
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://127.0.0.1:8001/token")
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@router.get("/create_bucket/")
async def createBucket():
    response = supabase.storage.create_bucket("ImtiazMartResources", {"public": True})
    return response


async def verify_token(token: str = Depends(oauth2_scheme)):
    async with httpx.AsyncClient() as client:
        response = await client.get("http://127.0.0.1:8001/verify_token", headers={"Authorization": f"Bearer {token}"})
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    response = supabase.storage.from_('ImtiazMartResources').upload(file.filename, content)

    public_url: str | None = None
    if (response):
        public_url = supabase.storage.from_('ImtiazMartResources').get_public_url(file.filename)
        
    return public_url

@router.post("/add_product/", tags = ['Products'])
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    quantity: int = Form(...),
    price: float = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    token: str = Depends(verify_token)
):
    img_url = await upload_file(file)
    product = Product(
        name=name,
        description=description,
        quantity=quantity,
        price=price,
        imgUrl=img_url
    )
    
    session.add(product)
    session.commit()
    session.refresh(product)
    

@router.get("/products/", response_model = List[Product], tags = ['Products'])
async def read_products(session: Session = Depends(get_session)):
    statement = select(Product)
    products = session.exec(statement).all()
    return products

@router.put("/products/{id}", response_model = Product, tags = ['Products'])
async def update_product(
    id: int,
    name: str = Form(...),
    description: str = Form(...),
    quantity: int = Form(...),
    price: float = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    token: str = Depends(verify_token)
):
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code = 404, detail = "Product not found")

    img_url = await upload_file(file)

    product.name = name
    product.description = description
    product.quantity = quantity
    product.price = price
    product.imgUrl = img_url

    session.add(product)
    session.commit()
    session.refresh(product)
    
    return product

@router.delete("/products/{id}", response_model = dict, tags = ['Products'])
async def delete_product(
    id: int, 
    session: Session = Depends(get_session),
    token: str = Depends(verify_token)
):
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code = 404, detail = "Product not found")
    
    session.delete(product)
    session.commit()
    
    return {"detail": "Product deleted successfully","Product " : product}