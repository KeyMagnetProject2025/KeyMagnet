import json


class Constant:
    PLATFORM = 'Line'
    # PLATFORM = 'VK'
    APPINFO = {
        "docRank": 1,
        "docId": "1653306035",
        "link": "https://liff.line.me/1657495985-EZRJYOq0",
        "thumb": {
            "imageUrl": "https://obs.line-scdn.net/0hA0R7QhiRHh9vTgtUXwJhSDwTFX1cLAAUTXoKeA8xJipGLSwUF0A3MA8mHG4CACsiGEk3OAwxMkRDHzA1D300eAMxQ1AJFQUhGH03OwMdJV8EBQUTW1Q3BQ/f256x256"
        },
        "title": "nagaoka taxi",
        "desc": "",
        "isApp": 0,
        "appScheme": "https://liff.line.me/1657495985-EZRJYOq0",
        "area": "svc_bas"
    }


def getAppInfo():
    with open('data/current_app.json', 'r', encoding='utf-8') as f:
        appInfo = json.load(f)
    
    return appInfo


def setAppInfo(appInfo):
    with open('data/current_app.json', 'w', encoding='utf-8') as f:
        json.dump(appInfo, f, ensure_ascii=False)
