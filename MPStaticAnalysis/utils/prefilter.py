def pageFilter(path, miniapp_root):

    with open(path, 'r', encoding='utf-8') as f:
        source = f.read()
    source = source.lower()
    items = ['request', '.ajax', '.http', '.post',
             '.get', '.fetch', '.send', '.then(function(']
    flag = False
    for item in items:
        if source.find(item) != -1:
            flag = True
    if not flag:
        return False

    path = path.replace('../', '').replace(miniapp_root[1:], '')[1:]
    path = path.lower()
    patterns = ['sdk', '.min.js', 'ald-stat',
                'wxcharts.js', 'bmap', 'qqmap', 'amap']
    for pattern in patterns:
        if pattern in path:
            return False

    patterns2 = ['aes.js', '/des.js', 'base64.js', 'rsa.js',
                 'rsa_encry.js', 'rsaEncrypt.js', 'md5.js', 'crypto.js', 'wxparse']
    for pattern in patterns2:
        if pattern in path:
            return False

    patterns3 = ['@', '__', 'miniprogram_npm', 'node_modules',
                 'npm/', 'lib/', 'libs/', '.bundle.js', 'taro.js', 'runtime.js']
    for pattern in patterns3:
        if pattern in path:
            return False

    if path.startswith('_') or path.startswith('$'):
        return False

    return True
