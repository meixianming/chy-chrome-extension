(function() {
	const nodeIterator =(matchContent,type="text",tagName)=>{
		// 查找dom元素方法
		if(type==="text"){
			// 精准匹配文本
			let nodeIterator = document.createNodeIterator(
				document.body,
				NodeFilter.SHOW_ELEMENT,
				(node) => {
					return node.textContent.includes(matchContent)
						&& node.nodeName.toLowerCase() !== 'script' // not interested in the script
						&& node.children.length === 0 // this is the last node
						? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
				}
			);
			let pars = [];
			let currentNode;
			while (currentNode = nodeIterator.nextNode()){
				pars.push(currentNode);
			}
			if(pars.length!==1){
				console.log(`${matchContent}匹配不正确`)
			}
			return pars[0];
		}
		else{
			// 通过兄弟文本，查找所需dom元素，如查找没有文本input框，只能通过先查找他的兄弟元素的方式
			let nodeIterator = document.createNodeIterator(
				document.body,
				NodeFilter.SHOW_ELEMENT,
				(node) => {
					return node.tagName===tagName
						&& node.nodeName.toLowerCase() !== 'script' // not interested in the script
						&& node.children.length === 0 // this is the last node
						? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
				}
			);
			let pars = [];
			let currentNode;
			while (currentNode = nodeIterator.nextNode()){
				if(currentNode.parentNode.textContent.includes(matchContent)){
					// 父元素包含要匹配兄弟元素文本，说明该标签是要查找的dom元素
					pars.push(currentNode);
				}
			}	
			if(pars.length!==1){
				console.log(`${matchContent}匹配不正确`)
			}
			return pars[0];
		}
	}
	
	let config = Object.assign({},{
		intervalTime:2000,
		buyText:"Buy now",
		maxNumText:"Max purchase amount",
		numberText:"Purchase amount",
		verifyCodeText:"Enter verification code",
		confirmText:"Confirm Purchase"
	},JSON.parse(localStorage.getItem("binanceConfig")))
	let buyNowInterval;
	const init = ()=>{
		let buyNow = nodeIterator(config.buyText);
		if(buyNow){
			chrome.runtime.sendMessage({start:1}, function(response) {});
		}
		buyNowInterval = setInterval(()=>{
			if(!buyNow){// 有可能页面加载慢，这里做一个容错处理
				buyNow =nodeIterator(config.buyText);	
				if(buyNow){
					chrome.runtime.sendMessage({start:1}, function(response) {});
				}	
			}
			if(!buyNow.disabled){
				console.log("触发点击buy now 按钮，弹出dialog")
				buyNow.click();
				clearInterval(buyNowInterval);
				setTimeout(()=>{
					　window.html2canvas(document.body, {
						　　　　onrendered: function(canvas){
							   const img = canvas.toDataURL();
							   console.log(img);
						}
					});	
					const maxAmount =nodeIterator(config.maxNumText).textContent.replace(/[^0-9]/ig,"");
					console.log(`获取到最大购买数量为${maxAmount}`);
					const purchaseInput = nodeIterator(config.numberText,"Sibling","INPUT")||nodeIterator(config.numberText);
					console.log(`捕捉到${config.numberText}的INPUT框`);
					purchaseInput.value=maxAmount;
					console.log(`${config.numberText}框写入最大购买数量`);
					const verifyInput = nodeIterator(config.verifyCodeText,"Sibling","INPUT")||nodeIterator(config.verifyCodeText);
					console.log(`捕捉到${config.verifyCodeText}的INPUT框`);
					verifyInput.value = "mei";
					const confirmBtn = nodeIterator(config.confirmText);
					setTimeout(()=>{
						confirmBtn.click();
					},2000)
				},2000)
			}
		},config.intervalTime)
	}
	// 监听popup的保存配置信息
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
		if(request.cmd === 'saveConfig'){
			sendResponse('接收到saveConfig信息');
			console.log(request.value);
			config = request.value;
			clearInterval(buyNowInterval);
			localStorage.setItem("binanceConfig",JSON.stringify(request.value));
			init();
		};
		if(request.cmd === 'getConfig'){
			sendResponse(config);
		};
	});
	// 发送浏览器保存的配置信息给popup
	chrome.runtime.sendMessage({config:config}, function(response) {
		// tip('收到来自后台的回复：' + response);
	});
	init();
})();