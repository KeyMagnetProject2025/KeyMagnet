class Constant:
    
    HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0'}
    
    API_mapping = {
        'wechat': {
            'openapi': 'https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/',
            'openapi_old': 'https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/',
            'frameworkapi': 'https://developers.weixin.qq.com/miniprogram/dev/api/',
            'prefix': 'https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/'
        },
        'baidu': {
            'openapi': 'https://smartprogram.baidu.com/forum/api/docs_detail?path=/develop/serverapi/serverapilist&preview=0',
            'frameworkapi': 'https://smartprogram.baidu.com/docs/develop/api/apilist/',
            'prefix': 'https://smartprogram.baidu.com/forum/api/docs_detail?path={}&preview=0'
        },
        'tiktok': {
            'openapi': 'https://lf-cdn-tos.bytescm.com/obj/static/docs/resource/page-data/zh-CN/mini-app/develop/server/server-api-introduction/page-data.aef720e8a1506cb4f3c819fa2b052340.json',
            'framworkapi': 'https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/overview',
            'prefix': 'https://developer.open-douyin.com/'
        },
        'alipay': {
            'openapi': 'https://opendocs.alipay.com/mini/03l3fq?pathHash=8f560c7e'
        },
        'line': {
            'openapi': 'https://developers.line.biz/en/reference/line-mini-app/',
            'frameworkapi': '',
            'prefix': 'https://developers.line.biz/en/reference/line-mini-app/'
        },
        'vk': {
            'openapi': 'https://api.vk.com/method/documentation.getPage?access_token={}&v=5.131&lang=en&page=%2Fmethod',
            'frameworkapi': '',
            'prefix': 'https://api.vk.com/method/documentation.getPage?access_token={}&v=5.131&lang=en&page={}'
        }
    }
    
    vk_access_token = 'anonym.eyJ0eXAiOi***'

    SECRETS = {
        'wechat': ['accesstoken', 'access_token', 'appsecret', 'app_secret', 'sessionkey', 'session_key', 'encryptkey', 'encrypt_key'],
        'baidu': ['accesstoken', 'access_token', 'appsecret', 'app_secret', 'sessionkey', 'session_key', 'encryptkey', 'encrypt_key'],
        'tiktok': ['accesstoken', 'access_token', 'appsecret', 'app_secret', 'sessionkey', 'session_key', 'encryptkey', 'encrypt_key'],
        'alipay': ['sign'],
        'line': ['clientsecret', 'client_secret', 'accesstoken', 'access_token', 'clientassertion', 'client_assertion', 'channelaccesstoken', 'channel_access_token', 'notificationtoken', 'notification_token'],
        'vk': ['serviceaccesskey', 'service_access_key', 'appsecret', 'app_secret', 'ключ доступа', 'ключ доступа сообщества', 'access_key', 'accesskey', 'client_secret', 'clientsecret', 'token']
    }
   