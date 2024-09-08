import time
import json
import traceback
import uiautomator2 as u2

from func_timeout import func_set_timeout
from db_util.handle_mongo import mongo

from env.constant import setAppInfo, Constant
from utils.logging import logger as Logger
from utils.traverse import dfs_traversal


def lineAnalysis():
    resource_id = '//*[@resource-id="jp.naver.line.android:id/content_recycler_view"]/android.view.ViewGroup[1]'
    if d.xpath(resource_id).exists:
        d.xpath(resource_id).click()
    else:
        return False

    time.sleep(10)
    
    if d(text='Allow').exists:
        d(text='Allow').click()
    else:
        if d(text='Verification').exists and d(text='Verification').info.get('resourceName') == 'jp.naver.line.android:id/header_title':
            time.sleep(10)
            if d(text='Allow').exists:
                d(text='Allow').click()
            else:
                return False
    
    time.sleep(20)
    resourc_id = "jp.naver.line.android:id/liff_pin_induction_close_button"
    if d(resourceId=resourc_id).exists:
        d(resourceId=resourc_id).click()

    elements = d.xpath('//*[@clickable="true"]').all()
    
    flag = False
    for element in elements:
        resourceId = element.info.get('resourceId', '')
        if 'jp.naver.line.android:id/liff_header' in resourceId or 'com.android.systemui:id' in resourceId:
            continue
        if resourceId == 'jp.naver.line.android:id/common_dialog_cancel_btn':
            continue
        flag = True
        break
    
    if not flag:
        return False
    
    visited = []
    dfs_traversal(d, visited, 0)

    return True


def vkAnalysis():
    d.xpath('//*[@resource-id="com.vkontakte.android:id/recycler"]/android.widget.LinearLayout[1]/android.widget.LinearLayout[1]').click()
    time.sleep(30)
    
    if d(resourceId="com.vkontakte.android:id/negative_button").exists:
        d(resourceId="com.vkontakte.android:id/negative_button").click()

    visited = []
    dfs_traversal(d, visited, 0)
    return True


@func_set_timeout(600)
def reachLineSearchView(keyword):
    try:
        d.app_start('jp.naver.line.android', stop=True)
        time.sleep(2)
        d(resourceId="jp.naver.line.android:id/main_tab_search_bar_hint_text").click()
        time.sleep(1)
        d.send_keys(keyword, clear=True)
        
        time.sleep(2)
        d(resourceId="jp.naver.line.android:id/tab_more_button").click()
        d(resourceId="jp.naver.line.android:id/tab_expand_item_text", text="Services").click()
        time.sleep(3)
        
        flag = lineAnalysis()
        return flag
    except:
        Logger.error(traceback.format_exc())
        return False
    

@func_set_timeout(600)
def reachVKSearchView(keyword):
    try:
        d.app_start('com.vkontakte.android', stop=True)
        time.sleep(2)
        d.xpath('//*[@resource-id="com.vkontakte.android:id/tab_news"]/android.widget.ImageView[1]').click()
        d(resourceId="com.vkontakte.android:id/search_button").click()
        time.sleep(3)
        d.send_keys(keyword)
        time.sleep(2)
        d.swipe(0.9, 0.14, 0.4, 0.14)
        d.swipe(0.9, 0.14, 0.4, 0.14)
        d.swipe(0.9, 0.14, 0.4, 0.14)
        time.sleep(3)
        d(text="Mini apps").click()
        time.sleep(1)

        flag = vkAnalysis()
        return flag
    except:
        Logger.error(traceback.format_exc())
        return False


def analyzer(keyword):
    with open('./data/vk_total.json', 'r', encoding='utf-8') as f:
        appList = json.load(f)

    idx = 0
    while idx < len(appList):
        link = str(appList[idx]['id'])

        appInfo = appList[idx]
        setAppInfo(appInfo)

        miniapp = link
        mongo.del_collection(miniapp)
        
        platform = Constant.PLATFORM
        for i in range(3):
            try:
                if platform == 'Line':
                    status = reachLineSearchView(keyword)
                elif platform == 'VK':
                    status = reachVKSearchView(keyword)
                    
                if status:
                    with open('visited_vk.txt', 'a+') as f:
                        f.write(link + '\n')
                    break
            except:
                Logger.error(traceback.format_exc())
                break
        
        idx += 1


if __name__ == '__main__':
    d = u2.connect()
    print(d.info)
    analyzer('a')
