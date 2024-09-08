import re
from lxml import etree


def get_field_values(data, parent_key=''):
    if isinstance(data, dict):
        values = {}
        for key, value in data.items():
            new_key = f"{parent_key}.{key}" if parent_key else key
            if isinstance(value, (dict, list)):
                values.update(get_field_values(value, new_key))
            else:
                values[new_key] = value
        return values
    elif isinstance(data, list):
        values = {}
        for index, item in enumerate(data):
            new_key = f"{parent_key}[{index}]"
            values.update(get_field_values(item, new_key))
        return values
    else:
        return {parent_key: data}


# def extract_from_html(content):

#     parser = etree.HTMLParser()
#     tree = etree.fromstring(content, parser)

#     script_contents = tree.xpath('//script/text()')

#     for content in script_contents:
#         print(content.strip())


def calDependency(node_i, node_j):

    for item_i, value_i in node_i['content']['success'].items():
        for item_j, value_j in node_j['content']['data'].items():
            if value_i == value_j and len(str(value_i)) >= 5:
                return True
    
    return False
