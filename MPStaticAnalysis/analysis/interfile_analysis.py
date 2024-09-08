import os
import re
import json

from utils.prefilter import pageFilter
from utils.fileHandler import path_join, parseJson, parseComponent, parseAPPJSON
from utils.logging import logger as LOGGER


# relations: required file -> current file
# parents: current file -> required file
def getRequireRelations(miniapp_root, filepath, relations, parents, indegrees, platform):
    if not os.path.exists(filepath):
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if platform == 'wechat':
        pattern = re.compile('require\("(.*?)"')
    elif platform == 'baidu':
        pattern = re.compile('\("(.*?)"\)')
    elif platform == 'alipay':
        pattern = re.compile('require\("(.*?)"')
    elif platform == 'tiktok':
        pattern = re.compile('\("(.*?)"\)')

    requires = pattern.findall(content)

    for require in requires:
        require_path = path_join(miniapp_root, filepath, require)
        if not require_path.endswith('.js'):
            require_path = require_path + '.js'
        if not os.path.exists(require_path):
            continue

        if pageFilter(require_path, miniapp_root):

            if require_path not in relations:
                relations[require_path] = []
            if filepath not in parents:
                parents[filepath] = []
            if require_path not in indegrees:
                indegrees[require_path] = 0

            indegrees[filepath] += 1
            if filepath not in relations[require_path]:
                relations[require_path].append(filepath)
                parents[filepath].append(require_path)


# union-and-check set
def findRoot(filepath, parents):
    roots = []
    if filepath not in parents:
        return [filepath]

    for filepath in parents[filepath]:
        roots.extend(findRoot(filepath, parents))

    return roots


def getInnerId(root_path):
    dirs = os.listdir(root_path)
    for dir in dirs:
        if os.path.isdir(os.path.join(root_path, dir)):
            return dir
    return ''


def getInfo(miniapp_root, platform):

    pagequeue = []

    # if platform == 'wechat' or platform == 'baidu' or platform == 'tiktok':
    appjspath = path_join(miniapp_root, miniapp_root, 'app.js')
    appservicepath = path_join(miniapp_root, miniapp_root, 'app-service.js')
    gamejspath = path_join(miniapp_root, miniapp_root, 'game.js')

    if os.path.exists(gamejspath):
        LOGGER.error('[ERROR] {} mini-game'.format(miniapp_root))
        return

    if not os.path.exists(appjspath):
        LOGGER.error('[ERROR] {} not found app.js'.format(miniapp_root))
        return

    pagequeue.append(('app', appjspath))

    appjsonpath = path_join(miniapp_root, miniapp_root, 'app.json')
    appjsonpath_v = path_join(miniapp_root, miniapp_root, 'app_v.json')
    appconfigpath = path_join(miniapp_root, miniapp_root, 'app-config.json')

    if platform == 'alipay':
        innerId = getInnerId(miniapp_root)
        if not innerId:
            return
        else:
            miniapp_root = os.path.join(miniapp_root, innerId)

        appjspath = path_join(miniapp_root, miniapp_root, 'app.js')
        if os.path.exists(appjspath):
            pagequeue.append(('app', appjspath))
        appjsonpath = path_join(miniapp_root, miniapp_root, 'appConfig.json')

    isConfig = False
    if os.path.exists(appjsonpath_v):
        appjsonpath = appjsonpath_v
    elif not os.path.exists(appjsonpath) and os.path.exists(appconfigpath):
        isConfig = True
        appjsonpath = appconfigpath

    appjson = parseJson(appjsonpath)
    if not appjson:
        LOGGER.error('[ERROR] {} not found app.json'.format(miniapp_root))
        return

    pages = parseAPPJSON(miniapp_root, appjsonpath, appjson, pagequeue)
    components = {}
    for pagepath in pages:
        if not isConfig:
            parseComponent(miniapp_root, pagepath, components, pagequeue)
        pagequeue.append(('page', pagepath + '.js'))

    if os.path.exists(appservicepath) and platform == 'baidu':
        with open(appservicepath, 'r', encoding='utf-8') as f:
            content = f.read()
        dirs = os.listdir(miniapp_root)
        for dir in dirs:
            if dir.endswith('.js'):
                _str = 'window.define("{}"'.format(dir[:-3])
                if _str in content:
                    common_path = path_join(miniapp_root, miniapp_root, dir)
                    pagequeue.append(('page', common_path))

    modules_path = path_join(
        miniapp_root, miniapp_root, 'preload-modules.json')
    if os.path.exists(modules_path):
        modules = parseJson(modules_path)
        for page in modules['__APP__']:
            common_path = path_join(miniapp_root, miniapp_root, page)
            pagequeue.append(('page', common_path))

    relations = {}
    parents = {}
    indegrees = {}
    for (label, filepath) in pagequeue:
        if not os.path.exists(filepath):
            continue

        if 'app.js' in filepath or pageFilter(filepath, miniapp_root):
            indegrees[filepath] = 0
            getRequireRelations(miniapp_root, filepath,
                                relations, parents, indegrees, platform)

    return {
        'children': relations,
        'parents': parents,
        'indegrees': indegrees
    }


def genMiniAPP(miniapp_root, outDir, platform):
    info = getInfo(miniapp_root, platform)
    if not info:
        return

    dir = outDir + miniapp_root.split('/')[-1]
    if not os.path.exists(dir):
        os.makedirs(dir)

    with open(dir + '/miniapp.json', 'w', encoding='utf-8') as f:
        json.dump(info, f)
