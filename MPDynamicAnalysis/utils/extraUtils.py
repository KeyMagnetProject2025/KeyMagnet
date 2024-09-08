def filterUnrelatedRequest(request_url):
    
    unrelatedAction = ['https://googleads.g.doubleclick.net', 'https://uts-front.line-apps.com', 'https://www.google-analytics.com', 
                       'https://gwk.line.naver.jp/LIFF1?X-Line-Liff-Id', 'https://analytics.google.com', 'https://ad.mail.ru/mobile', 
                       'https://sun6-21.userapi.com']
    
    for action in unrelatedAction:
        if request_url.startswith(action):
            return True
    if 'vkvd' in request_url and 'my.cdn.me' in request_url:
        return True

    return False