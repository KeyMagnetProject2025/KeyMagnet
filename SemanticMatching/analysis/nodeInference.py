import Levenshtein
from collections import defaultdict

from analysis.inferenceHandler import callBackInference, contextInference


def calSimilarity(item1, item2):

    if item2 in item1:
        return 1.

    item1 = item1[:len(item2)]
    distance = Levenshtein.distance(item1, item2)

    return 1 - distance/len(item2)


def semanticCompare(semantic_client, semantic_server, platform):
    api_server = semantic_server['api']
    url_server = semantic_server['url'].split('?')[0]
    params_server = semantic_server['request_params']

    if url_server and calSimilarity(semantic_client['content']['url'], url_server) > 0.9:
        return True

    if platform != 'line' and platform != 'vk':
        for param, paramInfo in params_server.items():
            if paramInfo['secret_type'] == 'callback':
                callback = paramInfo['source'][0]

                page_path = semantic_client['parent']
                if callBackInference(page_path, semantic_client, callback, platform):
                    return True
    if contextInference(semantic_client, semantic_server):
        return True

    return False


def inference(CBG, semantic, platform):

    nodes = defaultdict(list)
    for idx, semantic_server in enumerate(semantic):
        for request_id, semantic_client in CBG.items():
            if semanticCompare(semantic_client, semantic_server, platform):
                nodes[idx].append({request_id: semantic_client})
    return nodes
