from analysis.matchHandler import isMatched


def match_level(node, nodes, dependencies, level):

    if level not in nodes:
        return True
    
    flag = False
    for node_next in nodes[level]:
        if node in dependencies and dependencies[node] == node_next:
            if match_level(node_next, nodes, dependencies, level + 1):
                flag = True
    
    return flag


def match_level_2(node, nodes, IDF_details, level):

    if level not in nodes:
        return True
    
    flag = False
    for node_next in nodes[level]:
        if isMatched(node, node_next, IDF_details) and match_level_2(node_next, nodes, IDF_details, level + 1):
            flag = True
    
    return flag


def match(nodes, IDF_details, dependencies):

    for node in nodes[0]:
        if dependencies:
            if match_level(node, nodes, dependencies, 1):
                return True
        elif match_level_2(node, nodes, IDF_details, 1):
            return True

    return False


if __name__ == '__main__':
    match()