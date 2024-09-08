import os
import json
from pathlib import Path

from utils.logging import logger as LOGGER


def path_join(miniapp_root, path, *paths):
    if path.startswith('/') and not path == miniapp_root:
        result = os.path.join(miniapp_root, '.' + path)
        return os.path.relpath(result)

    mydir = path
    if not os.path.isdir(path):
        mydir = os.path.dirname(path)
    result = os.path.join(mydir, *tuple(paths))
    result = os.path.relpath(result)
    result = Path(result).as_posix()

    return result


def parseJson(file):
    ret = {}
    if not file.endswith('.json'):
        file = file + '.json'
    LOGGER.info('[INFO] start parse ' + file)

    try:
        with open(file, 'r', encoding='utf-8') as f:
            ret = json.load(f)
    except Exception as e:
        LOGGER.error('[ERROR] not found app.json or can\'t open ' + file)
        LOGGER.error('Error is ' + str(e))

    return ret


def parseAPPJSON(miniapp_root, mypath, myjson, pagequeue):
    pages = [path_join(miniapp_root, mypath, pagepath)
             for pagepath in myjson['pages']]
    if 'subPackages' in myjson and 'pages' in myjson['subPackages']:
        subPackages = myjson['subPackages']
        for subPackage in subPackages:
            root = subPackage['root']
            pages += [path_join(miniapp_root, mypath, root, pagepath)
                      for pagepath in subPackage['pages']]

    if 'page' in myjson:
        components = {}
        for page, data in myjson['page'].items():
            if 'usingComponents' in data['window']:
                file = page.replace('.html', '.js')
                for key, value in data['window']['usingComponents'].items():
                    componentpath = path_join(
                        miniapp_root, value) if value[0] == '/' else path_join(miniapp_root, file, value)
                    if componentpath in components:
                        continue

                    components[componentpath] = {'ComponentName': key}
                    pagequeue.append(('component', componentpath + '.js'))

    return pages


def parseComponent(miniapp_root, file, components, pagequeue):

    ret = parseJson(file)
    if not ret or 'usingComponents' not in ret:
        return

    if isinstance(ret['usingComponents'], str):
        return

    for key, value in ret['usingComponents'].items():

        componentpath = path_join(
            miniapp_root, value) if value[0] == '/' else path_join(miniapp_root, file, value)

        if componentpath in components or not os.path.exists(componentpath + '.js'):
            continue

        components[componentpath] = {'ComponentName': key}
        ret = parseComponent(miniapp_root, componentpath,
                             components, pagequeue)
        if not ret:
            pagequeue.append(('component', componentpath + '.js'))

    return
