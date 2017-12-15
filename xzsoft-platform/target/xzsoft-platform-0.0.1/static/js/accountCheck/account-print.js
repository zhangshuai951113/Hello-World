
function doPrint() {
	// 记录原页面
	var bdhtml = window.document.body.innerHTML;
	var sprnstr="<!--startprint-->"; //开始打印标识字符串有17个字符
	var eprnstr="<!--endprint-->"; //结束打印标识字符串
	
	var printHtml=bdhtml.substr(bdhtml.indexOf(sprnstr)+17); //从开始打印标识之后的内容
	printHtml=printHtml.substring(0,printHtml.indexOf(eprnstr)); //截取开始标识和结束标识之间的内容
	
	var pwin=window.open('',"print"); 
	pwin.document.write(printHtml);
	pwin.document.close();                   
	pwin.print();	
}

function fanhui(){
	window.history.back();
}

