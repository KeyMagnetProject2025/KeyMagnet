import os
import json
import random
import uuid
import traceback

from urllib.parse import urlparse, parse_qs
from db_util.handle_mongo import mongo

from utils.requestHandler import get_field_values, calDependency


def isFilter(url):

    blackList = ['https://www.googletagmanager.com', 'https://graph.facebook.com', 'https://firebasestorage.googleapis.com', 'https://search.line.me/lnexearch', 
    'https://jp-col-tcp.nelo.linecorp.com/_store', 'https://liffsdk.line-scdn.net', 'https://api.line.me/oauth2/v2.1/verify']
    for item in blackList:
        if url.startswith(item):
            return True
    
    blackList2 = ['googleapis.com', 'www.google.com', 'baidu.com', 'launches.appsflyer.com']
    for item in blackList2:
        if item in url:
            return True

    url = url.split('?')[0]
    if url.endswith('.js') or url.endswith('.css'):
        return True

    return False


def handleRequestParams(url, request_params):
    
    field_output = {}
    try:
        request_params = json.loads(request_params)
        parsed_url = urlparse(url)
        query_params = parse_qs(parsed_url.query)
        parameter = {}
        for key, value in query_params.items():
            if value:
                parameter[key] = value[0]
        
        if not request_params:
            return parameter
        
        field_output = get_field_values(request_params)
        for key, value in parameter.items():
            field_output[key] = value[0]
                
    except Exception as e:
        pass
    
    return field_output


def handleResponseParams(response_params):

    if not response_params:
        return {}
    
    field_output = {}
    try:
        response_params = json.loads(response_params)
        field_output = get_field_values(response_params)
    except Exception as e:
        pass
    
    return field_output
    
            
def getCollections(collections):
    for collection in collections:
        # if collection != '1657578703-oaj3jWN6':
        #     continue
        documents = mongo.get_docs(collection)

        requests = {}
        for doc in documents:
            url = doc['url']
            
            if ('response_headers' in doc and 'text/javascript' in str(doc['response_headers'])) or isFilter(url):
                continue

            # if 'text/html' in str(doc['response_headers']):
            #     extract_from_html(doc['response_params'])

            request_params = doc['request_params'] if doc['request_params'] else '{}'
            response_params = doc['response_params'] if doc['response_params'] else '{}'

            _request = handleRequestParams(url, request_params)
            _response = handleResponseParams(response_params)
            
            details = []
            details.append(url)
            details.append(json.dumps(_request))
            node = {
                'content': {
                    'url': url,
                    'data': _request,
                    'success': _response
                },
                'details': details
            }

            random_uuid = str(uuid.uuid4())
            requests[random_uuid] = node

        if not os.path.exists('./output/' + collection):
            os.makedirs('./output/' + collection)
        
        with open('./output/{}/requests.json'.format(collection), 'w') as f:
            json.dump(requests, f)
            
        if len(requests) == 1:
            continue

        request_ids = list(requests.keys())
        mapping = {} # source => sink
        
        node_i = 0
        while node_i < len(request_ids) - 1:
            node_j = node_i + 1
            request_i = requests[request_ids[node_i]]
            request_j = requests[request_ids[node_j]]
            while node_j < len(request_ids):
                if calDependency(request_i, request_j):
                    mapping[request_ids[node_i]] = request_ids[node_j]
                elif calDependency(request_j, request_i):
                    mapping[request_ids[node_j]] = request_ids[node_i]
                
                node_j += 1
            
            node_i += 1

        with open('./output/{}/mapping.json'.format(collection), 'w') as f:
            json.dump(mapping, f)
        

if __name__ == '__main__':

    collections = mongo.get_collections()
    getCollections(collections)
