import os
import json
import copy

from collections import defaultdict


def getReuqDetails(dependencies, details, callerNames, callerIds, IDFs, functionMapData):

    for ident, dependencyInfo in dependencies.items():
        for item in dependencyInfo:
            if item['type'] == 'normal':
                details.append(item['value'])
            elif item['type'] == 'getStorageSync':
                IDFs['storageSync'].append(item['value'])
            elif item['type'] == 'getStorage':
                IDFs['storage'].append(item['value'])
            elif item['type'] == 'globalData':
                IDFs['globalData'].append(item['value'])
            elif item['type'] == 'parameter':
                function_id = str(item['id'])
                if function_id in functionMapData and functionMapData[function_id]['type'] == 'request':
                    callerId = 'request__' + str(functionMapData[function_id]['id']) + '__Loc__' + functionMapData[function_id]['loc']
                    callerIds.append(callerId)

                for caller in item['__caller']:
                    if 'name' in caller:
                        callerNames.append(caller['name'])
                    if 'container' in caller:
                        callerNames.append(caller['container'])
                    if 'arguments' in caller:
                        details.extend(caller['arguments'])
                    if 'dependencies' in caller:
                        getReuqDetails(caller['dependencies'], details, callerNames, callerIds, IDFs, functionMapData)
            

def cleanRequests(appId, outDir):
    middle_file = os.path.join(outDir, appId, 'request_traces_middle.json')
    if not os.path.exists(middle_file):
        return
    function_map = os.path.join(outDir, appId, 'function_map.json')
    with open(middle_file, 'r', encoding='utf=8') as f:
        middleData = json.load(f)
    with open(function_map, 'r', encoding='utf-8') as f:
        functionMapData = json.load(f)
    
    res = copy.deepcopy(middleData)

    for request_id, requestInfo in middleData.items():
        callerNames = []
        callerIds = []
        IDFs = defaultdict(list)
        details = [requestInfo['content']['url'], requestInfo['content']['data']]

        getReuqDetails(requestInfo['dependencies'], details, callerNames, callerIds, IDFs, functionMapData)

        res[request_id]['details'] = details
        res[request_id]['callerNames'] = callerNames
        res[request_id]['callerIds'] = callerIds
        res[request_id]['IDFs'] = IDFs
    
    final_path = middle_file.replace('_middle.json', '_final.json')
    with open(final_path, 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False)


if __name__ == '__main__':
    for appid in os.listdir('/path/to/dataset/output/'):
        cleanRequests(appid, '/path/to/dataset/output/')