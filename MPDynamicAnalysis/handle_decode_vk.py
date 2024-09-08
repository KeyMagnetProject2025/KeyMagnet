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
        if "/method/execute.searchApps" in flow.request.url:
            flow.request.headers["X-Response-Format"] = "json"
        print(flow.request.url)

    def response(self, flow):
        
        if "/method/execute.searchApps" in flow.request.url:
            self.searched = True
            res = json.loads(flow.response.get_text())
            item = {
                "description": "",
                "type": "vk_app",
                "app": {},
                "section": "vk_apps"
            }
            item['app'] = getAppInfo()
            res['response']['apps']['items']= [item]
            print(res)
            flow.response.set_text(json.dumps(res))
            return

        if self.searched and not filterUnrelatedRequest(flow.request.url):
            status = str(flow.response.status_code)
            if 'content-type' in flow.response.headers:
                content_type = flow.response.headers['content-type']
            else:
                content_type = ''

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

                    miniapp = str(getAppInfo()['id'])
                    mongo.insert_data(miniapp, request_abstract)       

addons = [
    ModifyResponse()
]
