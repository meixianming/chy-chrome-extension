import React, { Component } from 'react';
import './App.scss';

class App extends Component {
	constructor(){
		super();
		this.state = {
			remainTime:10,
			maxAmount:"12,213,434",
			showDialog:false,
			code:"", //输入的验证码
			num:"", // 填写的购买数量
			options: {} // 验证配置信息
		}
		this.countDown.bind(this);
		this.handleCode.bind(this);
		this.handleNum.bind(this);
		this.verify.bind(this);
		this.createCode.bind(this)
		this.writeAuthCode.bind(this);
		this.randomColor.bind(this);
		this.randomNum.bind(this);
		this.timer = null;
		this.nodeIterator.bind(this);		
  	}
	countDown(){
		if(this.state.remainTime){
			const t = this.state.remainTime - 1;
			this.setState({
				remainTime:`0${t}`
			},()=>{setTimeout(()=>{
				this.countDown();
			},1000)})
		}
	}
	handleCode(e){
		this.setState({
			code:e.target.value
		})
	}
	handleNum(e){
		this.setState({
			num:e.target.value
		})
	}
	verify(){
		// if(this.state.code.toUpperCase()===this.state.options.txt.toUpperCase()&&this.state.num<=this.state.maxAmount){
		alert("点击了confirm按钮")
	}
	createCode(length) {  //创建随机数,并生成验证码
        var code = "";
        var codeLength = parseInt(length); //验证码的长度
        ////所有候选组成验证码的字符，当然也可以用中文的
        var codeChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']; 
        //循环组成验证码的字符串
        for (var i = 0; i < codeLength; i++)
        {
            //获取随机验证码下标
            var charNum = Math.floor(Math.random() * 62);
            //组合成指定字符验证码
            code += codeChars[charNum];
		}
		this.setState({
			options:{
				canvasId: "auth-code",/**canvas的id*/
				txt: code,/**传入验证码内容*/
				height: 50,/**验证码高度 */
				width: 200/**验证码宽度 */
			}
		},()=>{
			this.writeAuthCode(this.state.options)
		})
    }
	writeAuthCode(options){  // 生成验证码
		let canvas = document.getElementById(options.canvasId);
		canvas.width=options.width||300
		canvas.height=options.height||150
		let ctx = canvas.getContext('2d');/**创建一个canvas对象*/
		ctx.textBaseline = "middle";
		ctx.fillStyle = this.randomColor(180, 255);/**这个范围的颜色作背景看起来清晰一些*/
		ctx.fillRect(0, 0, options.width, options.height);
		for (let i = 0; i < options.txt.length; i++) {
			let txt = options.txt.charAt(i);/**让每个字不一样*/
			ctx.font = '20px SimHei';
			ctx.fillStyle = this.randomColor(50, 160); /**随机生成字体颜色*/
			ctx.shadowOffsetY = this.randomNum(-3, 3);
			ctx.shadowBlur = this.randomNum(-3, 3);
			ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
			let x = options.width / (options.txt.length+1) * (i+1);
			let y = options.height / 2;
			let deg = this.randomNum(-30, 30);
			/**设置旋转角度和坐标原点*/
			ctx.translate(x, y);
			ctx.rotate(deg * Math.PI / 180);
			ctx.fillText(txt, 0, 0);
			/**恢复旋转角度和坐标原点*/
			ctx.rotate(-deg * Math.PI / 180);
			ctx.translate(-x, -y);
		}
		/**1~4条随机干扰线随机出现*/
		for (let i = 0; i < this.randomNum(1,4); i++) {
			ctx.strokeStyle =this.randomColor(40, 180);
			ctx.beginPath();
			ctx.moveTo(this.randomNum(0, options.width), this.randomNum(0, options.height));
			ctx.lineTo(this.randomNum(0, options.width), this.randomNum(0, options.height));
			ctx.stroke();
		}
		/**绘制干扰点*/
		for (let i = 0; i < options.width / 6; i++) {
			ctx.fillStyle = this.randomColor(0, 255);
			ctx.beginPath();
			ctx.arc(this.randomNum(0, options.width), this.randomNum(0, options.height), 1, 0, 2 * Math.PI);
			ctx.fill();
		}

		this.setState({
			imgUrl:canvas.toDataURL("image/png")
		})
	};
	/**随机数字**/
	randomNum(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}
	/**随机颜色**/
	randomColor(min, max) {
		let r = this.randomNum(min, max);
		let g = this.randomNum(min, max);
		let b = this.randomNum(min, max);
		return "rgb(" + r + "," + g + "," + b + ")";
	}
	nodeIterator(matchContent,type="text",tagName){
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
	componentDidMount(){
		this.countDown();  
		this.createCode(4);  
	}
	render() {
		return (
			<div className="App">
			<div className="count-down">
				<div className="remain-time">
					Starts In : <span>00</span>d
					<span>00</span>h
					<span>00</span>m
					<span>{this.state.remainTime}</span>s
				</div>
				<button onClick={()=>{this.setState({remainTime:0})}}>立刻触发</button>
			</div>
			<div className="purchase-btn">
				<button disabled={this.state.remainTime>0?true:false} onClick={(e)=>{this.createCode(4,e);this.setState({showDialog:true})}}>Buy now</button>
			</div>
			<div className="dialog" style={{display:this.state.showDialog?"block":"none"}}>
				<div>Your current balance:<font className="max-amount">111,111 BNB</font></div>
				<div style={{color:"yellow"}}>Max purchase amount {this.state.maxAmount} FET</div>
				<div className="amount">
					Purchase amount
					<input type="number" onChange={(e)=>{this.handleNum(e)}}/>
				</div>
				<div className="verify-code">
					Enter verification code
					<input type="text" onChange={(e)=>{this.handleCode(e)}}/>
					<canvas id='auth-code' style={{display:"none"}}></canvas>
					<img src="http://pokmtwnjr.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20190317122528.png" alt="ss"/>
					 {/* <img src={this.state.imgUrl} alt="识别码图片"/> */}
					{/* <button className="refresh" onClick={(e)=>{this.createCode(4,e)}}>刷新验证码</button> */ }
				</div>
				<button onClick={(e)=>this.verify(e)}>Confirm Purchase</button>
			</div>
			</div>
		);
	}
}

export default App;
