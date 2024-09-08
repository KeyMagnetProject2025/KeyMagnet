import json
import time
import traceback

from env.constant import Constant
from utils.xmlHandler import clearXML, pageSimilarity, getSiblings

from utils.logging import logger as Logger


def getHint(element, siblings, idx):
    hint = element.info.get('text', '')
    if idx < len(siblings):
        hint += siblings[idx]

    return hint


def getContent(hint):

    hints_based_fill = {
        'Japanese': {
            '姓': '***',
            '名': '***',
            '全角': '***',
            'お名前': '***',
            'メール': '***@gmail.com',
            'メールアドレス': '***@gmail.com',
            '電話': '090****22',
            '電話番号': '090****22',
            '郵便': '1****2',
            '住所': 't***o',
            'ふりがな': '***',
            'フリガナ': '***',
            '郵便番号': '0**-**01'
        },
        'Russian': {
            'Вес': '10',
            'Сумма': '100',
            'Телефон': '227******24',
            'Телефонный': '227******24',
            'Телефонные': '227******24',
            'Телефонный номер': '227******24',
            'Номер телефона': '227******24',
            'Почта': '***@gmail.com',
            'Почтовый ящик': '***@gmail.com',
            'Адрес почтового ящика': '***@gmail.com',
            'Электронная почта': '***@gmail.com',
            'Имя': 'Прокофий',
            'Отчество': 'Петрович',
            'Фамилия': 'Мелехов',
            'Молния': '1****5',
            'Почтовые индексы': '1****5',
            'Почтовый индекс': '1****5',
            'Почтовый код': '1****5',
            'Почтовых индексов': '1****5',
            'Почтовый индекс': '1****5',
            'Почтовым индексам': '1****5',
            'Индекс': '1****5',
            'Почтовые коды': '1****5',
            'Адрес': 'Кемеровская область',
            'Которых': 'Кемеровская область',
            'Местом': 'Кемеровская область',
            'Места жительства': 'Кемеровская область',
            'Национальный идентификационный номер': '2*******9'
        },
        'English': {
            'last name': '***',
            'first name': '***',
            'second name': '***',
            'surname': '***',
            'name': '***',
            'family name': '***',
            'given name': '***',
            'sex': '***',
            'phone number': '12********5',
            'telephone number': '12********5',
            'home address': 'L****n',
            'postcode': '1****5',
            'zip code': '1****5',
            'pin code': '1****5',
            'e-mail': '***@gmail.com',
            'ID card': '2*******9',
            'identity card': '2*******9'
        },
        'Chinese': {
            '姓': '*',
            '名': '**',
            '姓名': '***',
            '性别': '*',
            '手机号': '13******15',
            '手机号码': '13******15',
            '邮箱地址': '***@gmail.com',
            '邮件地址': '***@gmail.com',
            '家庭住址': '**市**区',
            '邮编': '20***1',
            '邮政编码': '20***1',
            '身份证号码': '3****************8',
            '身份证号': '3****************8'
        }
    }

    platform = Constant.PLATFORM
    if platform == 'Line':
        preferedLanguage = 'Japanese'
    elif platform == 'VK':
        preferedLanguage = 'Russian'

    for key, value in hints_based_fill[preferedLanguage].items():
        if key in hint:
            return value
    
    for language, info in hints_based_fill.items():
        for key, value in info.items():
            if key in hint:
                return value

    # default phone number
    return '09***22'


def customized_input(element, siblings, idx):

    hint = getHint(element, siblings, idx)
    print(hint)
    content = getContent(hint)
    print(content)

    element.set_text(content)


def customized_checked(d, element):
    elements = d(className='android.widget.CheckedTextView')
    _elements = []
    for element in elements:
        _elements.append(element)

    _elements = _elements[::-1]
    for element in _elements:
        if element.info.get('text', '') != '' and element.info.get('text', '') != '--':
            element.click()
            return


def genSignature(element):

    return json.dumps(element.info)


def genPageSignature(d):

    xml = d.dump_hierarchy()
    return clearXML(xml)


def dfs_traversal(d, visited, depth=0, isJump=False):
    for i in range(3):
        try:
            if d(resourceId="com.vkontakte.android:id/vk_apps_error_retry").exists:
                d(resourceId="com.vkontakte.android:id/vk_apps_error_retry").click()
                time.sleep(10)
        except:
            Logger.error(traceback.format_exc())

    app_current = d.app_current()

    platform = Constant.PLATFORM
    if platform == 'Line':
        if app_current['activity'] == 'com.linecorp.line.search.impl.view.SearchActivity' or app_current['package'] != 'jp.naver.line.android':
            return False
    elif platform == 'VK':
        print(app_current)
        if app_current['activity'] == 'com.vkontakte.android.FragmentWrapperActivity' or app_current['package'] != 'com.vkontakte.android':
            return False
        if d(resourceId="com.vkontakte.android:id/msv_icon_search").exists and d(text="Mini apps").exists:
            return False
        if d.xpath('//*[@resource-id="com.vkontakte.android:id/tab_news"]/android.widget.ImageView[1]').exists:
            return False
        print(0)

    if depth > 3:
        return True

    elements = d(clickable='true')
    page_before = genPageSignature(d)

    if 'android.widget.EditText' in page_before:
        siblings = getSiblings(page_before)
        print(siblings)

        idx = 0
        for element in elements:
            try:
                className = element.info.get('className', '')
                if className == 'android.widget.EditText':
                    element.click()
                    customized_input(element, siblings, idx)
                    idx += 1
                elif className == 'android.widget.Spinner':
                    element.click()
                    customized_checked(d, element)
                elif className == 'android.widget.CheckBox':
                    element.click()
                elif className == 'android.widget.RadioButton':
                    element.click()
            except:
                Logger.error(traceback.format_exc())

        page_before = genPageSignature(d)

    elements = d.xpath('//*[@clickable="true"]').all()
    for element in elements:
        resourceId = element.info.get('resourceId', '')
        if 'jp.naver.line.android:id/liff_header' in resourceId or 'com.android.systemui:id' in resourceId:
            continue
        if resourceId == 'jp.naver.line.android:id/common_dialog_cancel_btn':
            continue
        if 'com.vkontakte.android:id/vk_menu' in resourceId:
            continue

        signature = genSignature(element) + page_before
        if signature in visited:
            continue

        visited.append(signature)

        className = element.info.get('className', '')
        if className == 'android.widget.EditText' or className == 'android.widget.Spinner' or className == 'android.widget.CheckBox' or className == 'android.widget.RadioButton':
            continue
        else:
            try:
                element.click()
                time.sleep(3)
                page_after = genPageSignature(d)
                similarity = pageSimilarity(page_before, page_after)
                print(similarity)
                if similarity > 0.2:
                    flag = dfs_traversal(d, visited, depth + 1, True)
                    if not flag:
                        return flag
            except:
                Logger.error(traceback.format_exc())
                if 'timed out' in traceback.format_exc():
                    return

    for i in range(3):
        page_before = genPageSignature(d)
        d.swipe_ext("up", 0.9, duration=1.0)
        page_after = genPageSignature(d)
        if page_before != page_after:
            flag = dfs_traversal(d, visited, depth, False)
            if not flag:
                return flag
        else:
            break

    if isJump:
        d.press("back")

    return True
