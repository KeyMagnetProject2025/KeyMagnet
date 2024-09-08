import os
import json

from engine.api import analyse

from analysis.interfile_analysis import genMiniAPP

from utils.requestHandler import cleanRequests
from utils.logging import logger as LOGGER

from multiprocessing import Pool


def getPages(datas):
   
    indegrees = datas['indegrees']
    pages = [] 
    while True:
        flag = False  
        
        for filename, degree in indegrees.items():     
            if degree == 0:
                if filename in pages:
                    flag = False
                    break
                if ' ' in filename:
                    pages.append('"' + filename + '"')
                else:
                    pages.append(filename)
                indegrees[filename] = -1
                
                flag = True

                if filename in datas['children']:
                    for requiree in datas['children'][filename]:
                        indegrees[requiree] -= 1
        
        if not flag:
            break
    
    return pages


def launch(appId, dir, outDir, platform):
    middle_file = os.path.join(outDir, appId, 'request_traces_middle.json')
    if os.path.exists(middle_file):
        return
    
    miniapp_root = dir + appId
    
    LOGGER.info('start to analyse ' + miniapp_root)
    genMiniAPP(miniapp_root, outDir, platform)
    
    path = outDir + '%s/miniapp.json' % (appId)
    if not os.path.exists(path):
        return

    with open(path, 'r', encoding='utf-8') as f:
        datas = json.load(f)
    pages = getPages(datas)
    flag = analyse(appId, pages, outDir)
    cleanRequests(appId, outDir)

    LOGGER.info(miniapp_root + ' analyse finished!')


def singleAnalysis():

    # launch('wx0e2bfceb2c3aa168', '/path/to/dataset/wx0e2bfceb2c3aa168/', '/path/to/output/', 'wechat')
    launch('wx0e2bfceb2c3aa168', '../testcase/wx0e2bfceb2c3aa168/', './output/', 'wechat')


def getAppIds(inputDir):

    appIds = os.listdir(inputDir)
    return appIds


def dirAnalyse(inputDir, outputDir, platform):

    appIds = getAppIds(inputDir)
    visited = []
    
    LOGGER.info('Analysis start!')
    pool = Pool(processes=20)
    for appId in appIds:
        if os.path.isdir(os.path.join(inputDir, appId)) and appId not in visited:
            pool.apply_async(launch, args=(appId, inputDir, outputDir, platform))

    pool.close()
    pool.join()
    LOGGER.info('Analysis finished!')


if __name__ == '__main__':    
    
    singleAnalysis()
    # platform = 'wechat'
    # inputDir = '/path/to/dataset/WechatDataSet/' 
    # outputDir = '/path/to/dataset/WechatDataSet/'
    # dirAnalyse(inputDir, outputDir, platform)
