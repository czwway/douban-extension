console.log('content_script注入灵魂')

// 监听popup发起的请求
chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {

        console.log( 'content_script监听到来自backgropund的请求', request )

        if (request.action === "changeDOM") {
            czw_changeDom(request.keywordlist, request.hideType)
            sendResponse(true)
        }
    }
);

let classMAP = {
    'hide': 'czw-hide',
    'grey': 'czw-grey',
}

// 更新页面dom
let czw_changeDom = (keywordList,hideType) =>{

    //获取页面所有符合的dom
    let domList = Array.from(document.querySelectorAll('table.olt tr:not(.th)'))
    let keywordMAP = {}
    
    keywordList.forEach(item=>{
        keywordMAP[item.text] = item.time
    })

    domList.forEach(item=>{
        let userName = item.querySelectorAll('td')[1].textContent.trim()

        //去掉类名
        for( var key in classMAP  ){
            item.classList.remove( classMAP[key] )
        }

        if( keywordMAP[userName] ) item.classList.add( classMAP[hideType] )
    })
}