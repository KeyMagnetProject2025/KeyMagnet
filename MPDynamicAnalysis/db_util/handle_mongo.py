import re
import pymongo
from pymongo.collection import Collection
from env.constant import Constant


class Handle_mongo_db(object):
    def __init__(self):
        mongo_client = pymongo.MongoClient(host='***', port=27017)
        self.db_data = mongo_client[Constant.PLATFORM]

    def insert_data(self, collection_name, item):
        db_collections = Collection(self.db_data, collection_name)
        db_collections.insert_one(item)
    
    def del_collection(self, collection_name):
        self.db_data.drop_collection(collection_name)
    
    def get_collections(self):
        return self.db_data.list_collection_names()
    
    def get_docs(self, collection_name):
        db_collections = Collection(self.db_data, collection_name)
        documents = db_collections.find()
        return documents


mongo = Handle_mongo_db()
