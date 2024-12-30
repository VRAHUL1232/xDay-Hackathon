# config.py
from datetime import timedelta
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dfd6bc1785f2fd2ad1ad598948af5617b0b2ace9e1a92f34c21568e2cbf98493')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///users.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', '3ad57b86b9764217241e0b2f08fbc208cd42f61475235ead294ba270e2715cf9b68176962bd566f9ad3f3f3a99efb43e4bbcc38c7a7a1b74af7ec20c48035e8c')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)