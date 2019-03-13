chrome.runtime.onInstalled.addListener(function(){
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					// 只有打开百度才显示pageAction
					new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: 'launchpad.binance.com/en/project/'}}),
					new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: 'launchpad.binance.com/cn/project/'}}),
					new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: 'localhost'}}),
					new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: '152.136.95.92/chrome-extension/'}})
				],
				actions: [new chrome.declarativeContent.ShowPageAction()]
			}
		]);
	});
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if(request.start){
		chrome.notifications.create(null, {
			type: 'basic',
			iconUrl: 'icon.png',
			title: 'tip',
			message: '查询到购买按钮，开始定时监听'
		});
	}
	// sendResponse('我是popup，我已收到你的消息：' + JSON.stringify(request));
});