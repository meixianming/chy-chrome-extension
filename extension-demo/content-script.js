(function() {
	console.log('这是 simple-chrome-plugin-demo 的content-script！');
	const maxNum = Number(document.querySelector('.max-amount').innerText);
	console.log(maxNum)
})();