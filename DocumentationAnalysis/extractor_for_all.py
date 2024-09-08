import os
import re
import json
import requests
from lxml import etree

from constants.env import Constant
from utils.text2Json import parseText
from utils.fileHandler import readFile_pickle, readFile_json, writeFile_json, tableHandler, markdownHandler, getPotentialSecret, linkExtractor


class ExtractorUtil:

    def linkHander(api_link, platform):

        if platform == 'vk':
            api_link = Constant.API_mapping[platform]['prefix'].format(
                Constant.vk_access_token, api_link)
            return api_link
        elif platform == 'baidu':
            if api_link[-1] == '/':
                api_link = api_link[:-1]
            api_link = Constant.API_mapping[platform]['prefix'].format(
                api_link)
            return api_link
        # elif platform == 'tiktok':
        #     print(api_link)
        #     if 'server' in api_link:
        #         suffix = re.findall(r'server/(.*)', api_link)[0]
        #         if 'pan-knowledge' in suffix:
        #             idx = suffix.index('/')
        #             suffix = suffix[:idx] + '/product' + suffix[idx:]
        #         api_link = f"https://lf-cdn-tos.bytescm.com/obj/static/docs/resource/page-data/zh-CN/mini-app/develop/server/{suffix}/page-data.aef720e8a1506cb4f3c819fa2b052340.json"
        #     return api_link
        if not api_link.startswith('https://'):
            if api_link.startswith('/'):
                api_link = '.' + api_link
            api_link = os.path.join(
                Constant.API_mapping[platform]['prefix'], api_link)

        return api_link

    # extract the API list
    def getAllAPIs(platform):
        url = Constant.API_mapping[platform]['openapi']
        links = []

        if platform == 'vk':
            url = url.format(Constant.vk_access_token)
        elif platform == 'alipay':
            res = readFile_pickle('./data/urlList.pkl')

        if not links:
            res = requests.get(url, headers=Constant.HEADERS)

        # for wechat
        apilist_pattern = "xpath$div[@class='table-wrp'].table$0$0$1"
        # for baidu
        # apilist_pattern = "json$\[([a-zA-Z]*)\]$\]\((.*?)\)\|$\)\|(.*?)\|"
        # for tiktok
        # apilist_pattern = "json$\"target\":\"_blank\".*?\"value\":\"(.*?)\"$href\":\"(.*?)\",\"target\":\"_blank\"$none"
        # for alipay
        # apilist_pattern = "data"
        # for line
        # apilist_pattern = "xpath$div[@class='content__default content-with-sidebars']$./h3$./h3$none"
        # for vk
        # apilist_pattern = "json$\"type\":\"method\",\"title\":\"(.*?)\"$\"type\":\"method\",.*?\"url\":\"(.*?)\"$\"type\":\"method\",.*?\"description\":\"(.*?)\""

        items = apilist_pattern.split('$')

        apiInfo = {}
        if items[0] == 'xpath':
            print(res.text)
            page = etree.HTML(res.text)
            element = items[1].split('.')

            if element[-1] == 'table':
                _xpath = "//{}/table/tbody/tr".format(element[0])
                apis = page.xpath(_xpath)
                for api in apis:
                    api_name = api.xpath("./td")[0].xpath("a/text()")[0]
                    api_link = api.xpath("./td")[0].xpath("a/@href")[0]
                    api_description = api.xpath("./td")[1].xpath("text()")[0]
                    print(api_name, api_link, api_description)

                    apiInfo[api_name] = {'link': ExtractorUtil.linkHander(
                        api_link, platform), 'short_description': api_description}
            else:
                _xpath = "//{}".format(items[1])
                content = page.xpath(_xpath)[0]
                api_names = content.xpath("{}/text()".format(items[2]))
                api_links = [item.xpath("./a/@href")[0]
                             for item in content.xpath("{}".format(items[3]))]

                for idx, api_name in enumerate(api_names):
                    api_link = api_links[idx]
                    apiInfo[api_name] = {'link': ExtractorUtil.linkHander(
                        api_link, platform), 'short_description': ''}

        elif items[0] == 'json':
            content = res.text.replace(r"\/", r"/")
            api_names = re.findall('{}'.format(items[1]), content)
            api_links = re.findall('{}'.format(items[2]), content)
            api_descriptions = re.findall('{}'.format(items[3]), content)
            print(api_names, api_links, api_descriptions)
            for idx, api_name in enumerate(api_names):
                api_link = api_links[idx]
                if len(api_descriptions) <= idx:
                    api_description = ''
                else:
                    api_description = api_descriptions[idx]

                apiInfo[api_name] = {
                    'link': ExtractorUtil.linkHander(api_link, platform),
                    'short_description': api_description,
                }
        elif items[0] == 'data':
            return res

        return apiInfo

    def getAPIAbstract(link, description, platform):
        print(link)
        res = requests.get(link, headers=Constant.HEADERS)
        # print(res.text)
        # for wechat
        pattern = 'regex$table'
        # for baidu
        # pattern = 'regex$json'
        # for tiktok
        # pattern = 'json$json'
        # for apliay
        # pattern = 'json$json'
        # for line
        # pattern = 'xpath'
        # for vk
        # pattern = 'json$json'

        items = pattern.split('$')
        try:
            if items[0] == 'regex':
                content = res.text.replace('\n', '')
                content = content.replace(" ", "").replace(
                    '[', '').replace(']', '')
            elif items[0] == 'xpath':
                page = etree.HTML(res.text)
            elif items[0] == 'json':
                content = res.json()
        except Exception as e:
            pass

        # for wechat
        url_pattern = '\"language-text\"><code>(.*?)</code'
        request_params_pattern = '请求参数.*?<tbody>(.*?)</tbody>'
        if '返回参数' in content:
            response_params_pattern = '返回参数.*?<tbody>(.*?)</tbody>'
        elif '返回值' in content:
            response_params_pattern = '返回值.*?<tbody>(.*?)</tbody>'
        idxs = [0, 3, 2, 0, 2, -10]

        # for baidu
        # url_pattern = 'plain(.*?)```'
        # request_params_pattern = '\\|([a-zA-Z_]+[\w\\-]+)\\|(.*?)\\|(.*?)\\|(.*?)\\|'
        # response_params_pattern = '\\|([a-zA-Z_]+[\w\\-]+)\\|(.*?)\\|(.*?)\\|'
        # idxs = [0, 3, 2, 0, 2, -10]

        # print(content)
        # for tiktok
        # content = re.findall(
        #     'window._ROUTER_DATA = (\{.*?\}),\"errors\":null', res.text)[0]
        # content = parseText(content)
        # content = content['loaderData']['zh-CN\\u002F$']['openApiMeta']
        # url_pattern = 'Path'
        # request_params_pattern = 'ReqSchema.BodyParam.Desc,'
        # response_params_pattern = 'RespSchema.BodyParam.Desc,'

        # for alipay
        # try:
        #     content = json.loads(content['result']['text'])['apiData']
        # except:
        #     text = json.loads(content['result']['rawText'])['apiData']
        # url_pattern = 'apiMethodName'
        # request_params_pattern = 'requestParamList.value.fieldName,description'
        # response_params_pattern = 'responseParamList.value.fieldName,description'

        # for line
        # content = page.xpath("//div[@class='content__default content-with-sidebars']")[0]
        # url_pattern = './p'
        # request_params_pattern = "./h4[contains(text(), 'Request body')]/following-sibling::div[1]"
        # response_params_pattern = "./h4[contains(text(), 'Response')]/following-sibling::div[1]"

        # for vk
        # content = content['response']['page']['contents']
        # url_pattern = 'path'
        # request_params_pattern = 'params.name,description'
        # response_params_pattern = 'result_description'

        # print(content)

        abstract = {}
        if items[0] == 'regex':
            if items[1] == 'table':
                url = re.findall(url_pattern, content)[0]
                print(url)
                url = url.replace('\\n', '').replace('GET', '').replace(
                    'POST', '').replace(' ', '').replace('\/', '/')
                request_params = re.findall(request_params_pattern, content)

                if not request_params:
                    request_params = {}
                else:
                    request_params = tableHandler(
                        request_params[0], idxs[0], idxs[1], idxs[2], platform, 'request')

                response_params = re.findall(
                    response_params_pattern, content)[0]

                response_params = tableHandler(
                    response_params, idxs[3], idxs[4], idxs[5], platform, 'response')
                abstract = {'url': url, 'page_link': link, 'description': description,
                            'request_params': request_params, 'response_params': response_params}
            elif items[1] == 'json':
                url = re.findall(url_pattern, content)[0]
                print(url)
                url = url.replace('\\n', '').replace('GET', '').replace(
                    'POST', '').replace(' ', '').replace('\/', '/')
                request_params = re.findall(request_params_pattern, content)
                request_params = markdownHandler(
                    request_params, idxs[0], idxs[1], idxs[2], platform)

                response_params = re.findall(response_params_pattern, content)
                response_params = markdownHandler(
                    response_params, idxs[3], idxs[4], idxs[5], platform)

                abstract = {'url': url, 'page_link': link, 'description': description,
                            'request_params': request_params, 'response_params': response_params}
        # elif items[0] == 'xpath':
        elif items[0] == 'json':
            url = content[url_pattern]

            request_params = {}
            response_params = {}

            keys = request_params_pattern.split('.')
            keys2 = keys[-1].split(',')

            if isinstance(content[keys[0]], list):
                for param in json.loads(content[keys[0]]):
                    if len(keys) > 2:
                        param = param[keys[1]]
                    param_name = param[keys2[0]]
                    param_description = param[keys2[1]]
                    request_params[param_name] = {
                        'param_description': param_description, 'source': linkExtractor(param_description), 'secret_type': getPotentialSecret(param_name, param_description, platform)}
            elif isinstance(content[keys[0]], dict):
                params = content[keys[0]]
                if len(keys) > 2:
                    params = params[keys[1]]
                for param_name, info in params.items():
                    param_description = info[keys2[0]]
                    request_params[param_name] = {
                        'param_description': param_description, 'source': linkExtractor(param_description), 'secret_type': getPotentialSecret(param_name, param_description, platform)}

            if platform == 'vk':
                result = content[response_params_pattern]
                for _item in linkExtractor(result):
                    response_params[_item] = {
                        'param_description': '', 'secret_type': getPotentialSecret(_item, '', platform)
                    }
            else:
                keys = response_params_pattern.split('.')
                keys2 = keys[-1].split(',')

                if isinstance(content[keys[0]], list):
                    for param in json.loads(content[keys[0]]):
                        if len(keys) > 2:
                            param = param[keys[1]]
                        param_name = param[keys2[0]]
                        param_description = param[keys2[1]]
                        response_params[param_name] = {
                            'param_description': param_description, 'secret_type': getPotentialSecret(param_name, param_description, platform)}
                elif isinstance(content[keys[0]], dict):
                    params = content[keys[0]]
                    if len(keys) > 2:
                        params = params[keys[1]]
                    for param_name, info in params.items():
                        param_description = info[keys2[0]]
                        request_params[param_name] = {
                            'param_description': param_description, 'secret_type': getPotentialSecret(param_name, param_description, platform)}

            abstract = {'url': link, 'page_link': link, 'description': description,
                        'request_params': request_params, 'response_params': response_params}
        return abstract

    def getDocumentsInfo(platform):

        # apiInfo = ExtractorUtil.getAllAPIs(platform)
        # writeFile_json(apiInfo, 'apis/{}.json'.format(platform))
        # print(apiInfo)
        # return

        apiInfo = readFile_json('./apis/{}.json'.format(platform))
        if platform == 'line':
            res = getLineInfo()
        else:
            res = {}
            for api, content in apiInfo.items():
                # print(api)
                # if api == 'code2Session':
                api_abstract = ExtractorUtil.getAPIAbstract(
                    content['link'], content['short_description'], platform)
                res[api] = api_abstract

        with open('./documents/{}.json'.format(platform), 'w') as f:
            json.dump(res, f, ensure_ascii=False)


if __name__ == '__main__':

    platform = 'wechat'
    ExtractorUtil.getDocumentsInfo(platform)
