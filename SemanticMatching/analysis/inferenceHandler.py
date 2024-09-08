import os
import re


callBackMapping = {
    'bindgetphonenumber': ['getPhoneNumber', 'getPhoneNumberHandler', 'onGetPhoneNumber']
}

def callBackInference(page_path, semantic_client, callback, platform):

    _path = page_path.replace('.prep.js', '.wxml')
    pattern = callback + '="(\w+)"'

    functionName = ''
    if os.path.exists(_path):
        with open(_path, 'r') as f:
            content = f.read()
        res = re.compile(pattern).findall(content)
        if len(res) > 0:
            functionName = res[0]

    if not functionName:
        functionName = callBackMapping[callback][0]

    callerNames = semantic_client['callerNames']
    for callerName in callerNames:
        if functionName.lower() in callerName.lower():
            return True

    return False


def isContain(source, names):
    for name in names:
        if source in name:
            return True
    return False


def contextInference(semantic_client, semantic_server):
    details = semantic_client['details']
    callerNames = semantic_client['callerNames'] if 'callerNames' in semantic_client else ''
    node_type = semantic_server['node_type']
    details = '; '.join(details).replace('_', '').lower()
    blackList = ['grant_type', 'scope']
    for param, paramInfo in semantic_server['request_params'].items():
        param = param.replace('_', '').lower()
        secret_type = paramInfo['secret_type']
        if node_type == 'generator' and secret_type == 'framework':
            sources = paramInfo['source']
            flag = False
            for source in sources:
                if isContain(source.split('.')[-1], callerNames):
                    flag = True
                    break
            if not flag:
                return False
            return True

    for param, paramInfo in semantic_server['request_params'].items():
        if param in blackList:
            continue
        param = param.replace('_', '').lower()
        secret_type = paramInfo['secret_type']

        if (node_type == 'generator' or node_type == '') and (secret_type == '' or secret_type == 'callback'):
            if param not in details:
                return False

        elif node_type == 'utilizer':
            if secret_type == 'framework':
                sources = paramInfo['source']
                flag = False
                for source in sources:
                    if isContain(source.split('.')[-1], callerNames):
                        flag = True
                        break
                if not flag:
                    return False
            else:
                if param not in details:
                    return False
    return True
