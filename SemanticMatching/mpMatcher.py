import os
import json
import random

from analysis.nodeInference import inference
from analysis.similarityAnalysis import match

from utils.logging import logger as LOGGER
from utils.fileHandler import parseJson
from constant.env import Constant
from multiprocessing import Pool


def getSemantics(platform):

    semantics = {}
    platforms = []
    platforms.append(platform)
    for file in os.listdir(Constant.SEMANTIC_DIR):
        get_platform = file.split('_')[-1][:-5]
        if get_platform != platform:
            platforms.append(get_platform)
    for platform in platforms:
        with open(Constant.SEMANTIC_DIR + 'semantics_' + platform + '.json', 'r') as f:
            datas = json.load(f)

        for secret, content in datas.items():
            semantics[secret + '_' + platform] = content

    return semantics


def launch(appId, dir, platform):
    semantics = getSemantics(platform)
    
    CBG = parseJson(appId, dir, 'request_traces_final.json')
    IDF_details = {} if platform == 'line' or platform == 'vk' else parseJson(appId, dir, 'IDF_details.json')
    dependencies = parseJson(appId, dir, 'mapping.json') if platform == 'line' or platform == 'vk' else {}

    secrets_matched = []
    i = 0
    LOGGER.info('start to analyse ' + appId)
    for secret, content in semantics.items():
        for semantic in content:
            # Step 1: node inference
            LOGGER.info('start node inference ' + appId)
            nodes = inference(CBG, semantic, platform)
            LOGGER.info('Finish node inference ' + appId)
            
            if len(nodes) < len(semantic):
                continue
            
            # Step 2: graph matching
            LOGGER.info('start matching ' + appId)
            flag = match(nodes, IDF_details, dependencies)
            LOGGER.info('Finish matching ' + appId)
            if flag:
                with open(f'test.json', 'w') as f:
                    json.dump(nodes, f, ensure_ascii=False)
                with open(f'sem.json', 'w') as f:
                    json.dump(semantic, f, ensure_ascii=False)
                if secret.startswith('sessionkey') and 'sessionkey_' + platform in secrets_matched:
                    continue
                if secret.startswith('appsecret') and 'appsecret_' + platform in secrets_matched:
                    continue
                secrets_matched.append(secret)
                break
    
    LOGGER.info(appId + ' analyse finished!')
    print(appId, "  ", secrets_matched)
    return appId, secrets_matched


def dirAnalyse(inputDir, platform):
    
    appIds = os.listdir(inputDir)
    
    visited = []
    res_a = []
    LOGGER.info('Analysis start!')
    pool = Pool(processes=10)
    for appId in appIds:
        old_appId = appId

        if os.path.isdir(os.path.join(inputDir, appId)) and appId not in visited:
            res_a.append(pool.apply_async(
                launch, args=(appId, inputDir, platform)))
        else:
            if os.path.isdir(os.path.join(inputDir, appId)):
                secrets[old_appId] = secrets[appId]
    pool.close()
    pool.join()
    secrets = {}

    for res in res_a:
        appId, secrets_matched = res.get()
        secrets[appId] = secrets_matched
    with open('./output/results.json', 'w') as f:
        json.dump(secrets, f)
    LOGGER.info('Analysis finished!')


if __name__ == '__main__':
    
    inputDir = '/path/to/dataset/WechatDataSet/output'
    dirAnalyse(inputDir, 'wechat')
