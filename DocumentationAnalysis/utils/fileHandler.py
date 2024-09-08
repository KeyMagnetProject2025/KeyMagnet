import re
import json
import pickle

from constants.env import Constant


def readFile_pickle(_path):
    with open(_path, 'rb') as f:
        data = pickle.load(f)
    return data


def writeFile_pickle(res, _path):
    with open(_path, 'wb') as f:
        pickle.dump(res, f)


def readFile_json(_path):
    with open(_path, 'r') as f:
        data = json.load(f)

    return data


def writeFile_json(res, _path):
    with open(_path, 'w') as f:
        json.dump(res, f, ensure_ascii=False)


def getPotentialSecret(param, param_description, platform):
    if param in Constant.SECRETS[platform]:
        return param.replace('_', '')

    _values = re.findall(r'([\._a-zA-Z]+)', param_description)
    for _value in _values:
        if _value.lower() in Constant.SECRETS[platform]:
            return _value.lower().replace('_', '')

    return ''


def linkExtractor(param_description):
    if 'href' in param_description:
        links = re.findall('href=\"(.*?)\"', param_description)
    else:
        links = re.findall("\\[.*?\\]\\((.*?)\\)", param_description)

    return links


def tableHandler(xml_info, param_idx, description_idx, is_necessary_idx, platform, _type):

    res = {}
    # print(xml_info)
    rows_info = re.findall('<tr>(.*?)</tr>', xml_info)
    for row_info in rows_info:
        cols_info = re.findall('<td>(.*?)</td>', row_info)

        if not cols_info:
            continue

        if '>' in cols_info[param_idx]:
            param_idx += 1
            description_idx += 1
            is_necessary_idx += 1

        if is_necessary_idx > -1 and cols_info[is_necessary_idx] == '否':
            continue

        _param = cols_info[param_idx]
        if description_idx > len(cols_info) - 1:
            param_description = ''
        else:
            param_description = cols_info[description_idx]
        secret_type = getPotentialSecret(_param, param_description, platform)

        if _type == 'request':
            res[_param] = {'param_description': param_description,
                           'source': linkExtractor(param_description), 'secret_type': secret_type}
        else:
            res[_param] = {'param_description': param_description,
                           'secret_type': secret_type}

    return res


def markdownHandler(xml_info, param_idx, description_idx, is_necessary_idx, platform, _type):

    res = {}
    for item in xml_info:
        print(item)
        if is_necessary_idx > -1 and '否' in item[is_necessary_idx]:
            continue
        _param = item[param_idx]
        param_description = item[description_idx]
        secret_type = getPotentialSecret(_param, param_description, platform)

        if _type == 'request':
            res[_param] = {'param_description': param_description,
                           'source': linkExtractor(param_description), 'secret_type': secret_type
                           }
        else:
            res[_param] = {'param_description': param_description, 'secret_type': secret_type}

    return res


def getLineInfo():
    res = requests.get(
        'https://developers.line.biz/en/reference/line-mini-app/', headers=Constant.HEADERS)
    page = etree.HTML(res.text)
    content = page.xpath(
        "//div[@class='content__default content-with-sidebars']")[0]

    links = [item.xpath("./a/@href")[0] for item in content.xpath("./h3")]

    p_elements = content.xpath("./p")
    APIs = [p.xpath("string()")
            for p in p_elements if 'https://api.line.me' in p.xpath("string()")]

    request_elements = content.xpath(
        "./h4[contains(text(), 'Request body')]/following-sibling::div[1]")
    response_elements = content.xpath(
        "./h4[contains(text(), 'Response')]/following-sibling::div[1]")
    res = {}
    for idx, link in enumerate(links):
        API = APIs[idx]
        request_params = {}
        for element in request_elements[idx].xpath("./div[@class='parameter-entry']"):
            param_name = element.xpath(
                ".//div[@class='font-bold']")[0].xpath("string()")
            param_description = element.xpath(
                ".//div[@class='parameter-body']")[0].xpath("string()")
            source = element.xpath(".//div[@class='parameter-body']//a/@href")
            source = [
                'https://developers.line.biz/en/reference/liff/' + item for item in source]
            secret_type = getPotentialSecret(param_name, param_description)
            request_params[param_name] = {
                "param_description": param_description,
                "source": source,
                "secret_type": secret_type
            }
        response_params = {}
        for element in response_elements[idx].xpath(".//div[@class='parameter-entry']"):
            param_name = element.xpath(
                ".//div[@class='font-bold']")[0].xpath("string()")
            param_description = element.xpath(
                ".//div[@class='parameter-body']")[0].xpath("string()")
            secret_type = getPotentialSecret(param_name, param_description)
            response_params[param_name] = {
                "param_description": param_description,
                "secret_type": secret_type
            }
        abstract = {'url': API, 'page_link': page_link, 'method': method, 'description': '',
                    'request_params': request_params, 'response_params': response_params}
        res[page_link.split('#')[-1]] = abstract

    return res
