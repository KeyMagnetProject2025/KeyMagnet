import Levenshtein
import xml.etree.ElementTree as ET


def clearXML(content):
    tree = ET.ElementTree(ET.fromstring(content))
    root = tree.getroot()

    for child in root.findall('node'):
        if child.attrib['package'] == 'com.android.systemui':
            root.remove(child)

    return ET.tostring(root).decode()


def traverseNodes(nodes, res):
    if not nodes:
        return
    
    for node in nodes:
        if 'text' in node.attrib and node.attrib['text']:
            res.append(node.attrib['text'])

        if node.attrib['class'] == 'android.widget.EditText':
            res.append('EditText---' + node.attrib['bounds'])

        traverseNodes(node.findall('node'), res)


def getSiblings(content):
    tree = ET.ElementTree(ET.fromstring(content))
    root = tree.getroot()
    
    nodes = root.findall('node')
    texts = []
    traverseNodes(nodes, texts)

    siblings = []
    context = ''
    for text in texts:
        if text.startswith('EditText---'):
            siblings.append(context)
            context = ''
        else:
            context += ', ' + text

    return siblings


def pageSimilarity(xml1, xml2):
    distance = Levenshtein.distance(xml1, xml2)

    return distance * 1./len(xml1)
