﻿(function() {
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
		verifyCodeText:"Enter verification code",
		purchaseNum:1000,
		confirmText:"Confirm Purchase"
	},JSON.parse(localStorage.getItem("binanceConfig")));

	let purchaseNumContent = {
		x:"",
		y:""
	}
	let detectContent = {
		x:"",
		y:"",
		text:""
	}
	let buyNowInterval;
	const getImg = ()=>{  // 本地服务器截图
		$.post("http://localhost:8888/window_capture", 
			{},function(result){
				result=JSON.parse(result);
				console.log(result.img_url);
				locate_boxes(result.img_url);
		});
	}
	const locate_boxes = (image_url)=>{ //识别文本框接口
		$.post("http://e23a977869.zicp.vip/locate_boxes", 
			{
				image_url:image_url,
				image_name:"test"
			},function(result){
				result=JSON.parse(result);		
				purchaseNumContent.x = result.text_box_location.center_x;
				purchaseNumContent.y = result.text_box_location.center_y;
				detectContent.x = result.captcha_box_location.center_x;
				detectContent.y = result.captcha_box_location.center_y;
				startPurchase()
		});
	}
	const detect_captcha_code = ()=>{ //识别验证码
		const img = nodeIterator(config.verifyCodeText,"Sibling","IMG")||nodeIterator(config.verifyCodeText);
		console.log("捕捉到验证码图片")
		$.post("http://e23a977869.zicp.vip/detect_captcha_code", 
			{
				image_url:img.src,
				image_name:"test"
			},function(result){
				result=JSON.parse(result)
				detectContent.text = result.captcha_code;
				startDetect();	
		});
		// // detectContent.text = "mei";
		// startDetect();
	}
	const startDetect = ()=>{  //本地服务器调用系统权限移动鼠标，输入文字
		$.post("http://localhost:8888/input_text", {
			x: detectContent.x,
			y: detectContent.y,
			text: detectContent.text
		},function(result){
				if(JSON.parse(result).code===200){
					/*startPurchase()*/
					const confirmBtn = nodeIterator(config.confirmText);
					setTimeout(()=>{
						confirmBtn.click();
					},2000)
				}		
		});
	}
	const startPurchase = ()=>{  //本地服务器调用系统权限移动鼠标，输入文字
		$.post("http://localhost:8888/input_text", {
			x:purchaseNumContent.x,
			y:purchaseNumContent.y,
			text:config.purchaseNum
		},function(result){
				if(JSON.parse(result).code===200){
					detect_captcha_code()
				}		
		});
	}
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
					getImg();
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