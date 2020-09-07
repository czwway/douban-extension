let addBtn = document.querySelector('#add_btn'),
    keyword_list_dom = document.querySelector('#keyword_list'),
    style_list_dom = document.querySelector('#style_list'),
    input_dom = document.querySelector('#input')

//
let keywordlist = [],
    czwConfig = {
        hideType: 'grey'
    }

// 添加关键字事件
addBtn.addEventListener('click', () => {

    let input_text = input_dom.value.trim()

    if (!input_text) return

    keywordlist.push({
        'text': input_text,
        'time': new Date().toLocaleString(),
    })

    chrome.storage.sync.set({
        'czwkeywordlist': keywordlist
    }, function (data) {
        update_keyword_list_dom()

        input_dom.value = ''
    })
})
//切换类型
style_list_dom.addEventListener('click', (e) => {
    var event = e || window.event;
    var target = event.target || event.srcElement;
    // 判断是否匹配目标元素
    if (target.className.indexOf('list-item') == -1) return

    let type = target.getAttribute('data-type')

    czwConfig.hideType = type
    chrome.storage.sync.set({
        'czwConfig': czwConfig
    }, function (data) {
        upload_style_list_dom()
    })

})
// 删除关键字事件
keyword_list_dom.addEventListener('click', (e) => {
    var event = e || window.event;
    var target = event.target || event.srcElement;

    // 判断是否匹配目标元素
    if (target.className.indexOf('delete') == -1) return

    let index = target.getAttribute('data-index') - 0

    keywordlist.splice(index, 1)

    chrome.storage.sync.set({
        'czwkeywordlist': keywordlist
    }, function (data) {
        update_keyword_list_dom()
    })
})

//获取用户列表存储的记录
chrome.storage.sync.get('czwkeywordlist', function (data) {
    console.log('获取存储的记录keywordlist', data)
    data.czwkeywordlist && (keywordlist = data.czwkeywordlist)

    update_keyword_list_dom()
});
//获取配置存储的记录
chrome.storage.sync.get('czwConfig', function (data) {
    console.log('获取存储的记录czwConfig', data)
    data.czwConfig && (czwConfig = data.czwConfig)

    upload_style_list_dom()
});

//更新关键词dom
let update_keyword_list_dom = function () {
    let html = ``
    keywordlist.forEach((item, index) => {
        html += `<div class="list-item"><p class="name">${item.text}</p><span class="btn delete" data-index='${index}'>删除</span></div>`
    })
    keyword_list_dom.innerHTML = html

    sendMessageEv()
}
//更新类型dom
let upload_style_list_dom = function () {

    style_list_dom.querySelectorAll('.list-item .icon').forEach(item => {
        item.className = 'icon'
    })

    style_list_dom.querySelectorAll('.list-item').forEach(item => {
        if (item.getAttribute('data-type') == czwConfig.hideType) {
            item.querySelector('.icon').className = 'icon active'
        }
    })

    sendMessageEv()
}

//发送请求到background
let sendMessageEv = function () {
    chrome.runtime.sendMessage({eventName: ""}, function(response) {});
}