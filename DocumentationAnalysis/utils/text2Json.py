import re
import json


def preProcess(content):
    pattern = re.compile('[ \n]//.*?[,\n]')
    notes = pattern.findall(content)
    for note in notes:
        content = content.replace(note, '')
    res = content.replace('\t', '').replace(' ', '')
    res = res.replace('\n', '').replace('&nbsp;', '')
    return res


def parseList(content, start, end):
    res = []
    temp = start
    
    while temp <= end:
        # print('List: start to parse index {}: {}'.format(temp, content[temp]))
        if content[temp] == '{':
            left = 1
            temp_start = temp + 1
            temp_end = temp
            while left != 0:
                temp_end += 1                
                if content[temp_end] == '{':
                    left += 1
                elif content[temp_end] == '}':
                    left -= 1
            temp = temp_end + 1
            res.append(parseJson(content, temp_start, temp_end - 1))
        elif content[temp] == '[':
            left = 1
            temp_start = temp + 1
            temp_end = temp
            while left != 0:
                temp_end += 1                
                if content[temp_end] == '[':
                    left += 1
                elif content[temp_end] == ']':
                    left -= 1
            temp = temp_end + 1
            res.append(parseList(content, temp_start, temp_end - 1))
        elif content[temp] == ',':
            temp += 1
        else:
            element_start = temp
            element_end = temp
            
            hasQuote = True if content[element_start] == '"' else False
            while element_end <= end and (content[element_end] != ',' or hasQuote):
                element_end += 1
                if content[element_end] == '"':
                    hasQuote = False
        
            temp = element_end + 1
            element = content[element_start: element_end]
            if content[element_start] == '"' and content[element_end - 1] == '"' or content[element_start] == '\'' and content[element_end - 1] == '\'':
                element = element[1: -1]
            
            res.append(element)

    return res


def parseJson(content, start, end):
    res = {}
    temp = start

    key_start = temp
    key_end = temp + 1
    while key_end <= end and content[key_end] != ':':
        key_end += 1
    key = content[key_start: key_end]
    if content[key_start] == '"' and content[key_end - 1] == '"':
        key = key[1: -1]

    temp = key_end + 1
    while temp <= end:
        # print('Json: start to parse index {}: {}'.format(temp, content[temp]))
        if content[temp] == '{':
            left = 1
            temp_start = temp + 1
            temp_end = temp
            while left != 0:
                temp_end += 1
                if content[temp_end] == '{':
                    left += 1
                elif content[temp_end] == '}':
                    left -= 1
            temp = temp_end + 1
            res[key] = parseJson(content, temp_start, temp_end - 1)
        elif content[temp] == '[':
            left = 1
            temp_start = temp + 1
            temp_end = temp
            while left != 0:
                temp_end += 1
                if content[temp_end] == '[':
                    left += 1
                elif content[temp_end] == ']':
                    left -= 1
            temp = temp_end + 1
            res[key] = parseList(content, temp_start, temp_end - 1)
        elif content[temp] == ',':
            key_start = temp + 1
            key_end = temp + 2
            while key_end < end and content[key_end] != ':':
                key_end += 1
            key = content[key_start: key_end]
            if content[key_start] == '"' and content[key_end - 1] == '"' or content[key_start] == '\'' and content[key_end - 1] == '\'':
                key = key[1: -1]
            
            temp = key_end + 1
        else:
            element_start = temp
            element_end = temp

            hasQuote = True if content[element_start] == '"' else False
            while element_end <= end and (content[element_end] != ',' or hasQuote):
                element_end += 1
                if content[element_end] == '"':
                    hasQuote = False
            
            temp = element_end

            element = content[element_start: element_end]
            if content[element_start] == '"' and content[element_end - 1] == '"' or content[element_start] == '\'' and content[element_end - 1] == '\'':
                element = element[1: -1]
            
            if key not in res:
                res[key] = element
                
    return res  
    

def parseText(content):
    content = preProcess(content)
    if len(content) < 1:
        return
    
    start = 0
    end = len(content) - 1
    while content[start] != '{':
        start += 1
    
    while content[end] != '}':
        end -= 1
    
    print('start: {}, end: {}'.format(start, end))
    parseRes = parseJson(content, start + 1, end - 1)

    return parseRes


if __name__ == '__main__':
    content = ''
    res = parseText(content)
    print(res)
