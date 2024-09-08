import json
from mitmproxy import ctx

from utils.logging import logger as Logger
from utils.extraUtils import filterUnrelatedRequest
from db_util.handle_mongo import mongo


def getAppInfo():
    with open('data/current_app.json', 'r', encoding='utf-8') as f:
        appInfo = json.load(f)
    
    return appInfo


class ModifyResponse:
    def __init__(self):
        self.searched = False

    def request(self, flow):
        request_url = flow.request.url
        if request_url.startswith('https://search.line.me/lnexearch?') and 'hs.tab.service' in request_url:
            info = json.loads(flow.request.headers['x-line-info'])
            info['region'] = 'JP'
            flow.request.headers['x-line-info'] = json.dumps(info)
    
    def response(self, flow):
        request_url = flow.request.url
        print(request_url)
        if request_url.startswith('https://search.line.me/lnexearch?') and 'hs.tab.service' in request_url:
            self.searched = True
            res = json.loads(flow.response.get_text())
            res['result']['main'][0]['body']['itemList'] = [getAppInfo()]
            print(res)
            flow.response.set_text(json.dumps(res))

        if self.searched and not filterUnrelatedRequest(request_url):
            status = str(flow.response.status_code)
            if 'content-type' in flow.response.headers:
                content_type = flow.response.headers['content-type']
            else:
                content_type = ''

            target_type = ['application/json', 'text/html', 'text/xml', 'text/plain', 'text/json', 'text/javascript', 'application/javascript']
            if not status.startswith('5'):
                flag = False
                if 'json' in content_type or 'xml' in content_type or 'html' in content_type or 'javascript' in content_type or 'text' in content_type:
                    flag = True

                if flag:
                    request_abstract = {
                        'url': flow.request.url,
                        'request_params': flow.request.get_text(),
                        'request_headers': flow.request.headers,
                        'response_headers': flow.response.headers,
                        'response_params': flow.response.get_text()
                    }

                    miniapp = getAppInfo()['link'].split('/')[-1]
                    mongo.insert_data(miniapp, request_abstract)       

addons = [
    ModifyResponse()
]
