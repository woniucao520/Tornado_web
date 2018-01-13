# coding:utf8
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column,Integer,SmallInteger,String,Boolean,DECIMAL,TIMESTAMP,text,Text,DateTime

from datetime import datetime
from time import time

Base = declarative_base()


class MyProductAddress(Base):

    __tablename__ = 'test_product_address'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    consignee = Column(String(128), nullable=False)   # 收件人
    mobile = Column(String(11), nullable=False, unique=True)  # 手机号
    provice = Column(Integer, nullable=False)  # 省
    city = Column(Integer,nullable=False)    # 市
    district = Column(Integer,nullable=False)  # 区
    address = Column(String(128),nullable=False)   # 详细地址
    zipcode = Column(String(20),nullable=False)   # 邮编
    is_default =  Column(Integer,server_default='0')   # 默认选项


    created_at = Column(DateTime, default=datetime.now()) # 创建
    deleted_at = Column(DateTime,default=datetime.now())  # 删除
    updated_at = Column(DateTime,default=datetime.now())  # 更新


    def install(engine):
        Base.metadata.create_all(engine)


    def uninstall(engine):
        Base.metadata.drop_all(engine)