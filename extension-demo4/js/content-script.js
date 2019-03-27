(function() {
	const baseUrl = "https://www.hbg.com/-/x/pro/v1/";
	const cookie = {
		set:function(key,val,time){//设置cookie方法
			var date=new Date(); //获取当前时间
			var expiresDays=time;  //将date设置为n天以后的时间
			date.setTime(date.getTime()+expiresDays*24*3600*1000); //格式化为cookie识别的时间
			document.cookie=key + "=" + val +";expires="+date.toGMTString();  //设置cookie
		},
		get:function(key){//获取cookie方法
			/*获取cookie参数*/
			var getCookie = document.cookie.replace(/[ ]/g,"");  //获取cookie，并且将获得的cookie格式化，去掉空格字符
			var arrCookie = getCookie.split(";")  //将获得的cookie以"分号"为标识 将cookie保存到arrCookie的数组中
			var tips;  //声明变量tips
			for(var i=0;i<arrCookie.length;i++){   //使用for循环查找cookie中的tips变量
				var arr=arrCookie[i].split("=");   //将单条cookie用"等号"为标识，将单条cookie保存为arr数组
				if(key==arr[0]){  //匹配变量名称，其中arr[0]是指的cookie名称，如果该条变量为tips则执行判断语句中的赋值操作
					tips=arr[1];   //将cookie的值赋给变量tips
					break;   //终止for循环遍历
				}
			}
			return tips;
		},
		delete:function(key){ //删除cookie方法
			 var date = new Date(); //获取当前时间
			 date.setTime(date.getTime()-10000); //将date设置为过去的时间
			 document.cookie = key + "=v; expires =" +date.toGMTString();//设置cookie
		}
	};
	const param = {
		"amount":"", 
		"account-id":"",
		"source":"web",
		"type":"buy-market", // 购买
		"symbol": "topht" //用什么币买什么币
	}
	const order = ()=>{
		$.ajax(
			{
				url:`${baseUrl}order/orders/place`,
				type:'post',
				dataType:"json",			
				beforeSend: function(xhr) {
					xhr.setRequestHeader("content-type", "application/json; charset=utf-8");
					xhr.setRequestHeader("hb-pro-token", cookie.get("HB-PRO-TOKEN"));
				
				},
				data:JSON.stringify(param),
				success:function(resp){
					console.log(resp);
				},
				error:function(err){
					console.log(err);
				}
			}
		);
	}
	const getBalance = (currency)=>{
		$.ajax(  // 获取accountId和各种币的剩余值
			{
				url:`${baseUrl}account/spot-account/balance`,
				type:'get',
				dataType:"json",			
				beforeSend: function(xhr) {
					xhr.setRequestHeader("content-type", "application/json; charset=utf-8");
					xhr.setRequestHeader("hb-pro-token", cookie.get("HB-PRO-TOKEN"));	
				},
				success:function(resp){
					if(resp.status==="ok"){
						param["account-id"]=resp.data.id;	
						for(let i in resp.data.list){
							if(resp.data.list[i].currency===currency&&resp.data.list[i].type==="trade"){
								// 获取到用来可用的支付货币
								param["amount"] = Number((resp.data.list[i].balance/100).toFixed(8));
								break;
							}
						}
						order();
					}
					else{
						console.log("getBalance失败")
					}
				},
				error:function(err){console.log(err)}
			}
		);
	}	
	getBalance("ht");	
})();