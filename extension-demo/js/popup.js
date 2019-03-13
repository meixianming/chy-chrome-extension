let config
$('#saveConfig').click(() => {
	// 保存相关配置
	config = {
		intervalTime:$("#intervalTime").val(),
		buyText:$("#buyText").val(),
		maxNumText:$("#maxNumText").val(),
		numberText:$("#numberText").val(),
		verifyCodeText:$("#verifyCodeText").val(),
		confirmText:$("#confirmText").val()
	}
	// popup主动发消息给content-script
	sendMessageToContentScript({cmd:'saveConfig', value:config}, function(response){
		console.log('来自content的回复：'+response);
		// alert("配置保存成功！")
		chrome.notifications.create(null, {
			type: 'basic',
			iconUrl: 'icon.png',
			title: 'tip',
			message: '保存配置成功！'
		});
	});
});
// popup主动发消息给content-script 请求config配置
sendMessageToContentScript({cmd:'getConfig', value:config}, function(response){
	console.log('来自content的回复：'+response);
	// alert("配置保存成功！")
	setInputValue(response);
});

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	console.log('收到来自content-script的消息：');
	console.log(request, sender, sendResponse);
	if(request.config){
		setInputValue(request.config)
		
	}
	// sendResponse('我是popup，我已收到你的消息：' + JSON.stringify(request));
});
function setInputValue(config){
	// 文本框赋值
	$("#intervalTime").val(config.intervalTime);
	$("#buyText").val(config.buyText);
	$("#maxNumText").val(config.maxNumText);
	$("#numberText").val(config.numberText);
	$("#verifyCodeText").val(config.verifyCodeText);
	$("#confirmText").val(config.confirmText);
}

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 向content-script主动发送消息
function sendMessageToContentScript(message, callback)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.sendMessage(tabId, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}