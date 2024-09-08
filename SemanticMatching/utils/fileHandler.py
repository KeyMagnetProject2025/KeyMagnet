import os
import json


def parseJson(appId, dir, filename):
    
    _path = os.path.join(dir, appId, filename)
    if not os.path.exists(_path):
        print('File ' + _path + ' not exists!')
        return {}
    
    with open(_path, 'r') as f:
        datas = json.load(f)
    
    return datas