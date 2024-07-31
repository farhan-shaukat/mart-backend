from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from sqlmodel import Session, select
from product.model import Product
from product.database import get_session
from typing import List
from fastapi.security import OAuth2PasswordBearer
import httpx
from supabase import create_client
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

router = APIRouter()

URL = os.getenv("URL")
API_KEY = os.getenv("API_KEY")
supabase = create_client(URL, API_KEY)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/token")

async def verify_token(token: str = Depends(oauth2_scheme)):
    async with httpx.AsyncClient() as client:
        response = await client.get("http://localhost:8001/verify_token", headers={"Authorization": f"Bearer {token}"})
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def upload_file(file: UploadFile) -> str:
    bucket_name = "ImtiazMall"
    file_content = await file.read()
    original_filename = file.filename
    unique_filename = original_filename

    # Check if the file exists and change the name if necessary
    existing_file = supabase.storage.from_(bucket_name).get_public_url(original_filename)
    if existing_file:
        unique_filename = f"{uuid.uuid4()}_{original_filename}"

    # Upload the file to Supabase storage
    response = supabase.storage.from_(bucket_name).upload(unique_filename, file_content)
    
    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to upload file")
    
    # Get the public URL for the uploaded file
    url = supabase.storage.from_(bucket_name).get_public_url(unique_filename)
    return url


@router.post("/products_create/", response_model=Product, tags=['Products'])
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
        name = name,
        description = description,
        quantity = quantity,
        price = price,
        imgUrl = img_url
    )

    session.add(product)
    session.commit()
    session.refresh(product)

    return product


@router.get("/products/", response_model=List[Product], tags=['Products'])
async def read_products(session: Session = Depends(get_session)):
    statement = select(Product)
    products = session.exec(statement).all()
    return products


@router.put("/products_update/{id}", response_model=Product, tags=['Products'])
async def update_product(
    id: int,
    name: str = Form(...),
    description: str = Form(...),
    quantity: int = Form(...),
    price: float = Form(...),
    file: UploadFile = File(None),
    session: Session = Depends(get_session),
    token: str = Depends(verify_token)
):
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if file:
        img_url = await upload_file(file)
        product.imgUrl = img_url

    product.name = name
    product.description = description
    product.quantity = quantity
    product.price = price

    session.add(product)
    session.commit()
    session.refresh(product)

    return product

@router.put("/products_update_quantity/{id}",response_model= Product,tags = ['Products'])
async def update_product_quantity(
    id: int,
    quantity: int = Form(...),
    session: Session = Depends(get_session),
    token : Session = Depends(verify_token)
):
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.quantity = quantity
    session.add(product)
    session.commit()
    session.refresh(product)

    return product

@router.delete("/products_delete/{id}", response_model=dict, tags=['Products'])
async def delete_product(
    id: int,
    session: Session = Depends(get_session),
    token: str = Depends(verify_token)
):
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    session.delete(product)
    session.commit()

    return {"detail": "Product deleted successfully", "Product": product}
