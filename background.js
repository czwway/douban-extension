chrome.storage.sync.clear(function(){})

// 监听插件安装成功
chrome.runtime.onInstalled.addListener(function () {

    //创建右键菜单
    chrome.contextMenus.create({
        "contexts": ['selection'],
        "id": '020202020',
        "title": '加入关键字过滤',
        "visible": true,
        "documentUrlPatterns": ['*://www.douban.com/group/*']
    }, () => {});

    // 右键菜单点击监听事件
    chrome.contextMenus.onClicked.addListener( async function (info, tab) {
        console.log(info.selectionText)

        let list = await getsStorage('czwkeywordlist'), keywordlist = list || []

        keywordlist.push({
            'text': info.selectionText,
            'time': new Date().toLocaleString(),
        })
    
        chrome.storage.sync.set({
            'czwkeywordlist': keywordlist
        }, function (data) {
            sendMessageToPopup()
        })
    });


    // 定义插件被激活的规则
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    hostEquals: 'www.douban.com'
                },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });


    // 监听变化
    chrome.tabs.onSelectionChanged.addListener(function () {})

    // 监听更新
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        console.log(changeInfo,  tab.url )
        if (changeInfo.status === 'complete' && tab.url.match(/www.douban.com\/group/)) {
            chrome.pageAction.show(tabId);
            sendMessageToPopup()
        } else {
            chrome.pageAction.hide(tabId);
        }
    })

});

//异步获取Storage
let getsStorage = (key) => {
    return new Promise((resolve, reject)=>{
        chrome.storage.sync.get( null , function (data) {
            resolve( key ?data[key] :data)
        })
    })
}

// 监听popup发起的消息
chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {

        console.log( 'background监听到来自popup的更新请求', request )

        sendMessageToPopup()

        sendResponse(true)
    }
);

//发送消息到popup
let sendMessageToPopup = async function(){

    let paras = {
        action: "changeDOM",
        keywordlist: [],
        hideType: 'grey',
    }

    //获取用户列表存储的记录
    let list = await getsStorage('czwkeywordlist')
    let config = await getsStorage('czwConfig')

    list && (paras.keywordlist = list)
    config && (paras.hideType = config.hideType)

    console.log( 'background发送消息到content_script', paras )

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        tabs && tabs[0] && chrome.tabs.sendMessage(tabs[0].id, paras , function (response) {})
    })
}