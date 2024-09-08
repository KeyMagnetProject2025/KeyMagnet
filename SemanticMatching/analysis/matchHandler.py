import Levenshtein
import json
import re


def calSimilarity(item1, item2):

    if item2 in item1:
        return 1.

    item1 = item1[:len(item2)]
    distance = Levenshtein.distance(item1, item2)

    return 1 - distance/len(item2)


def isMatched(node, node_next, IDF_details):
    black_list = ["code", "data", "openid", "token", "openId", "Mobile", "User"]
    node_id = list(node.keys())[0]
    node_next_id = list(node_next.keys())[0]

    callerIds = node_next[node_next_id]['callerIds']
    if node_id in callerIds:
        return True

    IDF_info = node_next[node_next_id]['IDFs']
    if IDF_info and node_id in IDF_details:
        for type, values in IDF_info.items():
            for value in values:
                if value in black_list:
                    continue
                if value in IDF_details[node_id][type]:
                    return True

    node_res = node[node_id]['content']['success']
    node_next_detail = node_next[node_next_id]['details']
    node_next_detail = '; '.join(node_next_detail)
    node_next_detail = node_next_detail.replace(r"(", " ")
    node_next_detail = node_next_detail.replace(r")", " ")
    node_next_detail = node_next_detail.replace(r"'", " ")
    node_next_detail = node_next_detail.replace(r'"', " ")
    node_next_detail = re.split(r'()[.,:;{}\s]\s*', node_next_detail)

    for item in node_res:
        item = item.split('.')[-1]
        if len(item) < 4:
            continue
        if item in black_list:
            continue
        if item in node_next_detail:
            return True
    return False
