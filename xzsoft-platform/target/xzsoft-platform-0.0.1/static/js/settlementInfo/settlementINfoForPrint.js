//时间戳转化成固定日期格式          
  var format = function(time, format){
      var t = new Date(time);
      var tf = function(i){return (i < 10 ? '0' : '') + i};
      return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
          switch(a){
              case 'yyyy':
                  return tf(t.getFullYear());
                  break;
              case 'MM':
                  return tf(t.getMonth() + 1);
                  break;
              case 'mm':
                  return tf(t.getMinutes());
                  break;
              case 'dd':
                  return tf(t.getDate());
                  break;
              case 'HH':
                  return tf(t.getHours());
                  break;
              case 'ss':
                  return tf(t.getSeconds());
                  break;
          }
      })
  }
  //把null值转化为空字符串
  function toChar(data) {
		if (data == null) {
			data = "";
		}
		return data;
	}
  //把null值变成0
  function toZero(data) {
		if (data == null || data == "") {
			data = "0";
		}
		return data;
	}
var LODOP,P_ID="",TaskID1,TaskID2,t,waiting=false,c=0,loop=0; //声明为全局变量 
/*function getStatusValue(ValueType,ValueIndex,oResultOB){
	LODOP=getLodop(); 
	if (LODOP.CVERSION) LODOP.On_Return=function(TaskID,Value){oResultOB.value=Value;};
	var strResult=LODOP.GET_VALUE(ValueType,ValueIndex);
	if (!LODOP.CVERSION) return strResult; else return "";
};*/
//获取结算单打印的值
function getSettlementForPrint(data){
	$("#printBody1").html("");
	$("#printBody1").empty();
	
	var jsonAll = data;
	var settlementInfo = data.settlementInfo;
	if(settlementInfo.isProxyMode == 1){//代理模式
		var settlementInfoProxy = data.settlementInfoProxy;
	}
	$("#printBody1").append("<div style = 'float:left;width:98%;font-family:'yahei''>" +
			"<div class='t-head' style = 'width: 100%;text-align: center;font-size:30px;'>"+toChar(settlementInfo.printListHeader)+"结算单</div>" +
			"<table class='t-form' style = 'text-left:center;font-size:14px;margin-top:15px'><tbody><tr>" +
			"<td colspan='3'>发货单位："+toChar(settlementInfo.forwardingUnit)+"</td>" +
			"<td colspan='3' >收货单位："+toChar(settlementInfo.consignee)+"</td></tr>" +
			"<tr><td colspan='3'>客户名称："+toChar(settlementInfo.entrustName)+"</td>" +
			"<td colspan='3' >外协单位："+toChar(settlementInfo.shipperName)+"</td>" +
			"<td colspan='3' >运单号："+toChar(settlementInfo.waybillId)+"</td></tr>" +
			"<tr><td colspan='3'>组织部门："+toChar(settlementInfo.projectName)+"</td>" +
			"<td colspan='3' >制单日期："+format(new Date(settlementInfo.makeTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
			"<td colspan='2'>结算单号：<span  style= 'font-weight:bold' >"+toChar(settlementInfo.settlementId)+"</span></td></tr></tbody></table>" +
			"<table class='t-table' style = 'table-layout: fixed;width:100%;height:260px;text-align: center;border-collapse:collapse;border:1px solid;margin-top:10px'><tbody>" +
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>车牌号码</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.carCode)+"</td>" +
			"<td style = 'border:1px solid;'>发货日期</td>" +
			"<td colspan='2' style ='border:1px solid;'>"+format(new Date(settlementInfo.forwardingTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
			"<td style = 'border:1px solid;'>回单日期</td>" +
			"<td colspan='2' style = 'border:1px solid;'>"+format(new Date(settlementInfo.makeTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td></tr>" +
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>起点</td>" +
			"<td colspan='3' style = 'border:1px solid;'>"+toChar(settlementInfo.forwardingUnit)+"</td>" +
			"<td style = 'border:1px solid;'>终点</td>" +
			"<td colspan='3' style = 'border:1px solid;'>"+toChar(settlementInfo.consignee)+"</td></tr>" +
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>货物名称</td>" +
			"<td style = 'border:1px solid;'>司机运单号</td>" +
			"<td style = 'border:1px solid;'>发货单号</td>" +
			"<td style = 'border:1px solid;'>到货单号</td>" +
			"<td style = 'border:1px solid;'>发货吨位</td>" +
			"<td style = 'border:1px solid;'>到货吨位</td>" +
			"<td style = 'border:1px solid;'>运输单价</td>" +
			"<td style = 'border:1px solid;'>运费</td></tr>" +
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.goodsName)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.driverWaybillId)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.forwardingId)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.arriveId)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.forwardingTonnage)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.arriveTonnage)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.currentTransportPrice)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.shipperPrice)+"</td></tr>" +
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>扣损吨位</td>" +
			"<td style = 'border:1px solid;'>扣损单价</td>" +
			"<td style = 'border:1px solid;'>扣损金额</td>" +
			"<td style = 'border:1px solid;'>其它扣款</td>" +
			"<td style = 'border:1px solid;'>应付运费</td>" +
			"<td style = 'border:1px solid;'>其它税费</td>" +
			"<td style = 'border:1px solid;'>运费成本</td>" +
			"<td style = 'border:1px solid;'>进项税</td></tr>" +
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.lossTonnage)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.deductionUnitPrice)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.deductionPrice)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.otherPrice)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.payablePrice)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.otherTaxPrice)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.transportPriceCost)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.incomeTax)+"</td></tr>" +
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>工本费</td>" +
			"<td style = 'border:1px solid;'>实付金额</td>" +
			"<td style = 'border:1px solid;'>预付款</td>" +
			"<td style = 'border:1px solid;'>本次付款</td>" +
			"<td colspan='4' rowspan='1' class='textarea-td' style = 'border:1px solid;text-align:left;'>备注:"+toChar(settlementInfo.remarks)+"</td></tr>" +
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.costPrice)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.actualPaymentPrice)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.advancePrice)+"</td>" +
			"<td style = 'border:1px solid;'>"+toChar(settlementInfo.thisPayPrice)+"</td>" +
			"<td colspan='4'  rowspan='2'  class='textarea-td' style = 'word-break: break-all; word-wrap:break-word;border:1px solid;text-align:left;font-size:11px;'>" +
			"有价券金额:"+toChar(settlementInfo.couponUseTotalPrice)+"" +
			" 公路通行费:" +toZero(settlementInfo.highwayToll)+
			" 高速公路通行费:" +toZero(settlementInfo.superHighwayToll)+
			" 财政通行费:" +toZero(settlementInfo.otherToll)+
			"<br/>有价券卡号:" +toChar(settlementInfo.cardCode)+
			"</td></tr>" +
			"<tr style = 'border:1px solid;'>" +
			"<td colspan='4' class='textarea-td' style = 'border:1px solid;'>大写金额："+toChar(settlementInfo.capitalAmount)+"</td>" +
			"</tr></tbody></table>" +			
			"<table class='t-foot' style = 'width: 100%;text-left: center;font-size:14px;margin-top:10px'><tbody>" +
			"<tr><td style = 'padding-left: 10mm;'>制单人："+toChar(settlementInfo.makeUserName)+"</td>" +
			"<td></td><td style = 'padding-left: 0mm;'>复核人：</td>" +
			"<td></td><td style = 'padding-left: 0mm;'>收款人：</td>" +
			"<td></td><td style = 'padding-left: 0mm;'>出纳：</td>" +
			"<td></td></tr><tr><td colspan='4'></td>" +
			"<td colspan='4' class='textarea-td'>打印时间："+new Date().toLocaleString()+"</td></tr></tbody></table></div>" +
			"<div style = 'float:left;font-size: 11px;width:1.5%;margin:125px 0 0 3px';>第一联白存根第二联黄挂账第三联粉结算" +
			"</div>");
	
	if(settlementInfo.isProxyMode == 1){//代理模式
		$("#printBody2").html("");
		$("#printBody2").empty();
		$("#printBody2").append("<div style = 'float:left;width:98%;font-family:'yahei''>" +
				"<div class='t-head' style = 'width: 100%;text-align: center;font-size:30px;'>"+toChar(settlementInfo.proxyName)+"结算单</div>" +
				"<table class='t-form' style = 'text-left:center;font-size:14px;margin-top:15px'><tbody><tr>" +
				"<td colspan='3' >发货单位："+toChar(settlementInfo.forwardingUnit)+"</td>" +
				"<td colspan='3'>收货单位："+toChar(settlementInfo.consignee)+"</td>" +
				"<td colspan='3' >运单号："+toChar(settlementInfo.waybillId)+"</td></tr>" +
				"<tr><td colspan='3'>客户名称："+toChar(settlementInfoProxy.entrustName)+"</td>" +
				"<td colspan='3'  >组织部门："+toChar(settlementInfo.projectName)+"</td>" +
				"<td colspan='3' >结算单号："+toChar(settlementInfo.settlementId)+"</td></tr></tbody></table>" +
				"<table class='t-table' style = 'table-layout: fixed;width:100%;height:260px;text-align: center;border-collapse:collapse;border:1px solid;margin-top:10px'><tbody>" +
				"<tr style = 'border:1px solid;'>" +
				"<td style = 'border:1px solid;'>车牌号码</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.carCode)+"</td>" +
				"<td style = 'border:1px solid;'>发货日期</td>" +
				"<td colspan='2' style ='border:1px solid;'>"+format(new Date(settlementInfo.forwardingTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
				"<td style = 'border:1px solid;'>回单日期</td>" +
				"<td colspan='2' style = 'border:1px solid;'>"+format(new Date(settlementInfo.makeTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td></tr>" +
				"<tr style = 'border:1px solid;'>" +
				"<td style = 'border:1px solid;'>起点</td>" +
				"<td colspan='3' style = 'border:1px solid;'>"+toChar(settlementInfo.forwardingUnit)+"</td>" +
				"<td style = 'border:1px solid;'>终点</td>" +
				"<td colspan='3' style = 'border:1px solid;'>"+toChar(settlementInfo.consignee)+"</td></tr>" +
				"<tr style = 'border:1px solid;'>" +
				"<td style = 'border:1px solid;'>货物名称</td>" +
				"<td style = 'border:1px solid;'>司机运单号</td>" +
				"<td style = 'border:1px solid;'>发货单号</td>" +
				"<td style = 'border:1px solid;'>到货单号</td>" +
				"<td style = 'border:1px solid;'>发货吨位</td>" +
				"<td style = 'border:1px solid;'>到货吨位</td>" +
				"<td style = 'border:1px solid;'>运输单价</td>" +
				"<td style = 'border:1px solid;'>运费</td></tr>" +
				"<tr style = 'border:1px solid;'>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.goodsName)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.driverWaybillId)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.forwardingId)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.arriveId)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.forwardingTonnage)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.arriveTonnage)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.currentTransportPrice)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfoProxy.shipperPrice)+"</td></tr>" +
				"<tr style = 'border:1px solid;'>" +
				"<td style = 'border:1px solid;'>扣损吨位</td>" +
				"<td style = 'border:1px solid;'>扣损单价</td>" +
				"<td style = 'border:1px solid;'>扣损金额</td>" +
				"<td style = 'border:1px solid;'>其它扣款</td>" +
				"<td style = 'border:1px solid;'>应付运费</td>" +
				"<td style = 'border:1px solid;'>其它税费</td>" +
				"<td style = 'border:1px solid;'>运费成本</td>" +
				"<td style = 'border:1px solid;'>进项税</td></tr>" +
				"<tr style = 'border:1px solid;'>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.lossTonnage)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.deductionUnitPrice)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.deductionPrice)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.otherPrice)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfoProxy.payablePrice)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfoProxy.otherTaxPrice)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfoProxy.transportPriceCost)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfoProxy.incomeTax)+"</td></tr>" +
				"<tr style = 'border:1px solid;'>" +
				"<td style = 'border:1px solid;'>工本费</td>" +
				"<td style = 'border:1px solid;'>实付金额</td>" +
				"<td style = 'border:1px solid;'>预付款</td>" +
				"<td style = 'border:1px solid;'>本次付款</td>" +
				"<td colspan='4' rowspan='1' class='textarea-td' style = 'border:1px solid;text-align:left;'>备注:"+toChar(settlementInfo.remarks)+"</td></tr>" +
				"<tr style = 'border:1px solid;'>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.costPrice)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfoProxy.actualPaymentPrice)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfo.advancePrice)+"</td>" +
				"<td style = 'border:1px solid;'>"+toChar(settlementInfoProxy.thisPayPrice)+"</td>" +
				"<td colspan='4'  rowspan='2'  class='textarea-td' style = 'word-break: break-all; word-wrap:break-word;border:1px solid;text-align:left;font-size:11px;'>" +
				"有价券金额:"+toChar(settlementInfo.couponUseTotalPrice)+"" +
				" 公路通行费:" +toZero(settlementInfo.highwayToll)+
				" 高速公路通行费:" +toZero(settlementInfo.superHighwayToll)+
				" 财政通行费:" +toZero(settlementInfo.otherToll)+
				"<br/>有价券卡号:" +toChar(settlementInfo.cardCode)+
				"</td></tr>" +
				"<tr style = 'border:1px solid;'>" +
				"<td colspan='4' class='textarea-td' style = 'border:1px solid;'>大写金额："+toChar(settlementInfo.capitalAmount)+"</td>" +
				"</tr></tbody></table>" +			
				"<table class='t-foot' style = 'width: 100%;text-left: center;font-size:14px;margin-top:10px'><tbody>" +
				"<tr><td style = 'padding-left: 10mm;'>制单人："+toChar(settlementInfo.makeUserName)+"</td>" +
				"<td></td><td style = 'padding-left: 0mm;'>复核人：</td>" +
				"<td></td><td style = 'padding-left: 0mm;'>收款人：</td>" +
				"<td></td><td style = 'padding-left: 0mm;'>出纳：</td>" +
				"<td></td></tr><tr><td colspan='4'></td>" +
				"<td colspan='4' class='textarea-td'>打印时间："+new Date().toLocaleString()+"</td></tr></tbody></table></div>" +
				"<div style = 'float:left;font-size: 11px;width:1.5%;margin:125px 0 0 3px';>第一联白存根第二联黄挂账第三联粉结算" +
				"</div>");
	}
}

//结算挂账结算单打印预览
function myPreview() {		
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0 || selectlist.length > 1) {
      xjValidate.showPopup("请选择一条数据","提示");
      return;
    }
    
    var ftr = $("#SettlementCheck:checked").parents("tr");
	var id = ftr.children().eq(1).html();
	 $.ajax({
	    	url:basePath+"/settlementInfo/printSettlementInfo",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{id:id},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup("请求失败！","提示");
	        },
	        success:function(data){
	        	var ids = "";
	        	getSettlementForPrint(data);
	        	var printNumber = data.settlementInfo.printNumber;
	        	if(data.settlementInfo.isProxyMode == 0){//不是代理模式
	        		LODOP=getLodop();  
	        		if(printNumber >0){
	        		LODOP.SET_SHOW_MODE ("HIDE_PBUTTIN_PREVIEW",true);
	        		}
	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody1").innerHTML);
        			LODOP.SET_PRINT_MODE("CATCH_PRINT_STATUS",true);
	        		if (LODOP.CVERSION) {
	        			CLODOP.On_Return=function(TaskID,Value){ 
	        				if (Value){
	        					ids = data.settlementInfo.id;
	        					//调用修改打印次数的方法
//	        		        	editPrintCount(ids);
	        				}else {
	        					//alert("放弃打印！");
	        				}
	        					};
	        		};
	        		LODOP.PREVIEW();
	        	}else{
	        		LODOP=getLodop();  
	        		if(printNumber >0){
		        		LODOP.SET_SHOW_MODE ("HIDE_PBUTTIN_PREVIEW",true);
		        		}
	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody1").innerHTML);
	        		LODOP.NewPage();
	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody2").innerHTML);
        			LODOP.SET_PRINT_MODE("CATCH_PRINT_STATUS",true);
	        		if (LODOP.CVERSION) {
	        			CLODOP.On_Return=function(TaskID,Value){ 
	        				if (Value){
	        					ids = data.settlementInfo.id;
	        					//调用修改打印次数的方法
//	        		        	editPrintCount(ids);
	        				}else {
	        					//alert("放弃打印！");
	        				}
	        					};
	        		};
	        		LODOP.PREVIEW();
	        	}
	        }
	 });
};		  
//将打印成功的结算单的打印次数修改为1
function editPrintCount(ids){
	 $.ajax({
	    	url:basePath+"/settlementInfo/updatePrintCount",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{ids:ids},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup("请求失败！","提示");
	        },
	        success:function(data){
	        	}
	        });
}
//返单结算结算单打印预览
function myReOrderPreview() {		
	 var checkList = findAllCheck(".re_order_settlement_check");
	  if(checkList.length == 0 || checkList.length > 1){
		  xjValidate.showPopup("请选择一条记录!","提示");
		  return;
	  }
	  var id = checkList[0].id;
	 $.ajax({
	    	url:basePath+"/settlementInfo/printSettlementInfo",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{id:id},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup("请求失败！","提示");
	        },
	        success:function(data){
	        	var ids = "";
	        	getSettlementForPrint(data);
	        	var printNumber = data.settlementInfo.printNumber;
	        	if(data.settlementInfo.isProxyMode == 0){//不是代理模式
	        		LODOP=getLodop();  
    				//LODOP=getLodop(document.getElementById('LODOP_OB'),document.getElementById('LODOP_EM'));
	        		if(printNumber >0){
		        		LODOP.SET_SHOW_MODE ("HIDE_PBUTTIN_PREVIEW",true);
		        		}
	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody1").innerHTML);
        			LODOP.SET_PRINT_MODE("CATCH_PRINT_STATUS",true);
	        		if (LODOP.CVERSION) {
	        			CLODOP.On_Return=function(TaskID,Value){ 
	        				if (Value){
	        					//alert("打印！");
	        					ids = data.settlementInfo.id;
	        					//调用修改打印次数的方法
//	        		        	editPrintCount(ids);
	        				}else {
	        					//alert("放弃打印！");
	        				}
	        					};
	        		};
	        		LODOP.PREVIEW();
	        		
	        	}else{
	        		LODOP=getLodop();  
	        		if(printNumber >0){
		        		LODOP.SET_SHOW_MODE ("HIDE_PBUTTIN_PREVIEW",true);
		        		}
	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody1").innerHTML);
	        		LODOP.NewPage();
	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody2").innerHTML);
        			LODOP.SET_PRINT_MODE("CATCH_PRINT_STATUS",true);
	        		if (LODOP.CVERSION) {
	        			CLODOP.On_Return=function(TaskID,Value){ 
	        				if (Value){
	        					//alert("打印！");
	        					ids = data.settlementInfo.id;
	        					//调用修改打印次数的方法
//	        		        	editPrintCount(ids);
	        				}else {
	        					//alert("放弃打印！");
	        				}
	        					};
	        		};
	        		LODOP.PREVIEW();
	        		
	        	}
	        	
	        }
	        });
	 
};		

//结算挂账批量直接打印
function myPrint() {		 
	var ids ="";
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0) {
    	xjValidate.showPopup("请选择要打印的单据!","提示");
      return;
    }
	    $("#SettlementCheck:checked").each(function() {
	    	var id = $(this).parents("tr").children().eq(1).html();
	    	ids += id+",";
	    })
		  //批量打印
		  $.ajax({
		    	url:basePath+"/settlementInfo/batchPrintSettlementInfo",//请求的action路径
		        async:false,//是否异步
		        cache:false,//是否使用缓存
		        type:'POST',//请求方式：post
		        data:{ids:ids},
		        dataType:'json',//数据传输格式：jsoni
		        error:function(){
		            //请求失败处理函数
		            xjValidate.showPopup("请求失败！","提示");
		        },
		        success:function(data){
		        	var ids = "";
		        	if(data != null){
		        		for(var i = 0;i<data.length;i++){
		        			var count = data.length;
		        			var obj = data[i];
		        			getSettlementForPrint(obj);
		        			var settlementInfo = obj.settlementInfo;
		         			var printNumber = settlementInfo.printNumber;
	        				if(printNumber>0){
	        					xjValidate.showPopup("您所选的结算单存在已打印或已加入打印队列的数据！","提示");
	        					return;
	        				}else{
		        		    //var settlementInfoProxy = obj.settlementInfoProxy;
		        			if(settlementInfo.isProxyMode == 0){//不是代理模式
		    	        		LODOP=getLodop();  
		        				//LODOP=getLodop(document.getElementById('LODOP_OB'),document.getElementById('LODOP_EM'));
		    	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
		    	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody1").innerHTML);
		    	        	}else{
		    	        		LODOP=getLodop();
		        				//LODOP=getLodop(document.getElementById('LODOP_OB'),document.getElementById('LODOP_EM'));

		    	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
		    	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody1").innerHTML);
		    	        		LODOP.NewPage();
		    	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
		    	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody2").innerHTML);
		    	        	}
		        			LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME",settlementInfo.printListHeader+"结算单打印");//为每个打印单独设置任务名	
		        			LODOP.PRINT();
		        			//if(LODOP.PRINT()){
		        				ids += settlementInfo.id+",";
	    					//}else{
	    					//	return;
	    					//}
		        		
	        				//调用修改打印次数的方法
//				        	editPrintCount(ids);
	        				}
		        		}
		        		
		    			//
		        	}
		        }
		        });
			       
	};  	
//获取选中的多条记录
function findAllCheckReOrderSettlementInfoIds(){
  	//所有选中返单结算信息ID
  	var reOrderSettlementInfoIds = new Array();
  	$(".re_order_settlement_check").each(function(){
  		if($(this).is(":checked")){
  			reOrderSettlementInfoIds.push($(this).attr("data-id"))
  		}
  	});
  	
  	return reOrderSettlementInfoIds.join(",");
  }
//返单结算批量直接打印
function myReOrderPrint() {		
	 var ids = "";
	 var checkList = findAllCheck(".re_order_settlement_check");
	  if(checkList.length == 0){
		  xjValidate.showPopup("请选择要打印的单据!","提示");
		  return;
	  }
	  var ssettlementObject = findAllCheck(".re_order_settlement_check");
	  $.each(ssettlementObject,function(i, val) {
		   var id = val.id
		   ids += id+",";
		    });
	  //批量打印
	  $.ajax({
	    	url:basePath+"/settlementInfo/batchPrintSettlementInfo",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{ids:ids},
	        dataType:'json',//数据传输格式：jsoni
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup("请求失败！","提示");
	        },
	        success:function(data){
	        	var ids = "";
	        	if(data != null){
	        		for(var i = 0;i<data.length;i++){
	        			var count = data.length;
	        			var obj = data[i];
	        			getSettlementForPrint(obj);
	        			var settlementInfo = obj.settlementInfo;
	        			var printNumber = settlementInfo.printNumber;
        				if(printNumber>0){
        					xjValidate.showPopup("您所选的结算单存在已打印或已加入打印队列的数据！","提示");
        					return;
        				}else{
	        		    //var settlementInfoProxy = obj.settlementInfoProxy;
	        			if(settlementInfo.isProxyMode == 0){//不是代理模式
	    	        		LODOP=getLodop();  
	        				//LODOP=getLodop(document.getElementById('LODOP_OB'),document.getElementById('LODOP_EM'));
	    	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
	    	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody1").innerHTML);
	    	        	}else{
	    	        		LODOP=getLodop();
	        				//LODOP=getLodop(document.getElementById('LODOP_OB'),document.getElementById('LODOP_EM'));
	    	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
	    	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody1").innerHTML);
	    	        		LODOP.NewPage();
	    	        		LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
	    	        		LODOP.ADD_PRINT_HTM("0.5cm","2cm","20cm","14cm",document.getElementById("printBody2").innerHTML);
	    	        	}
	        			LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME",settlementInfo.printListHeader+"结算单打印");//为每个打印单独设置任务名	
	        			LODOP.PRINT();
	        			//if(LODOP.PRINT()){
	        				ids += settlementInfo.id+",";
	        				//调用修改打印次数的方法
    					//}else{
    					//	return;
    					//}
	        		}
	        		//调用修改打印次数的方法
//		        	editPrintCount(ids);
    				}
	        		
	        	}
	        }
	        });
		       
};  








(function($) {
	//初始化运单列表page页面
	
	//判断该条打印单是否代理
	/*var isProxyMode = $("#isProxyMode").val();
	if(isProxyMode == 1){//是代理模式
		$("#printBody2Div").show();
	}else{
		$("#printBody2Div").hide();
	}*/
})(jQuery);

//设置页眉页脚的初始值为空
/*function pagesetup_null() {
    try {
        var RegWsh = new ActiveXObject("WScript.Shell");
       hkey_key = "header";
       RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "");
        hkey_key = "footer";
        RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "");
    } catch (e) { alert(e); }
}*/
//自定义页眉页脚
/*function SetupPage() {
    try {
        var RegWsh = new ActiveXObject("WScript.Shell");
        hkey_key = "header"
        RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "&w&b页码，&p/&P")
        hkey_key = "footer"
        RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "&b&d") //去掉了&u 因为我不想显示当前打印页的网址 
        hkey_key = "margin_bottom";
        RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "0.39"); //0.39相当于把页面设置里面的边距设置为10 
        hkey_key = "margin_left";
        RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "0.39");
        hkey_key = "margin_right";
        RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "0.39");
        hkey_key = "margin_top";
        RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "0.39");
    }
    catch (e) { 
    	
    }
}*/
//打印第二条结算单
/*function doPrint2() {
	bdhtml = window.document.body.innerHTML;// 获取当前页的html代码

	prnhtml = $("#printBody2").html();

	window.document.body.innerHTML = prnhtml;
	window.print();
	window.document.body.innerHTML = bdhtml;
}*/

//打印第一条结算单
/*function doPrint1() {
	bdhtml = window.document.body.innerHTML;// 获取当前页的html代码

	prnhtml = $("#printBody1").html();

	window.document.body.innerHTML = prnhtml;
	window.print();
	window.document.body.innerHTML = bdhtml;
	
	*/
	
	//判断该条打印单是否代理
	/*var isProxyMode = $("#isProxyMode").val();
	
	bdhtml = window.document.body.innerHTML;// 获取当前页的html代码

	prnhtml1 = $("#printBody1").html();
	prnhtml2 = $("#printBody2").html();

	window.document.body.innerHTML = prnhtml1;
	if(isProxyMode ==1){//是代理
		window.document.body.innerHTML = prnhtml1+prnhtml2;
	}
	window.print();
	window.document.body.innerHTML = bdhtml;*/
	
	/*var printStr = "<html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8'></head><body>";
	var content = "";
	var str = document.getElementById('printBody1').innerHTML;     //获取需要打印的页面元素 ，page1元素设置样式page-break-after:always，意思是从下一行开始分割。
	content = content + str;
	if(isProxyMode ==1){//是代理
		str = document.getElementById('printBody2').innerHTML;     //获取需要打印的页面元素
		content = content + str;
	}
	
	
    printStr = printStr+content+"</body></html>";                                              
    var pwin=window.open("","print"); 
    pwin.document.write(content);
    pwin.document.close();                   
    pwin.print();    
	*/
//}

/*function fanhui(){
	window.history.back();
}*/
