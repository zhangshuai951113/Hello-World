//进入选择结算信息模态框
function findSettlementInfoMation(){
	var sign=$(".isProxy").val();
	var paymentObject=$.trim($(".paymentObject").val());
	if(sign==undefined || sign=='' && paymentObject==undefined || paymentObject==''){
		xjValidate.showTip("请先选择是否代理扣款和付款对象!");
		return false;
	}else{
		
		//当付款对象为物流公司时，结算信息显示对账信息
		if(paymentObject==1){
			
			//结算信息字段修改为对账信息字段
			$("#accountCheck").show();
			$("#settInfo").hide();
			//隐藏字段
			//运单号
			/*$("#waybillIdDiv").hide();*/
			//支付人
			$("#paymentPersonNameDiv").hide();
			/*//车牌号
			$("#carCodeDiv").hide();
			//组织部门
			$("#projectInfoNameDiv").hide();
			//货物
			$("#goodsNameDiv").hide();
			//零散货物
			$("#scatteredGoodsDiv").hide();
			//客户编号
			$("#customerNamePage").hide();
			//线路
			$("#lineInfoNameDiv").hide();
			//发货时间
			$("#forwardingTimeDiv").hide();
			//到货时间
			$("#arriveTimeDiv").hide();
			//运价
			$("#transportPriceDiv").hide();*/
			//司机发票税金
			$("#driverInvoiceTaxDiv").hide();
			//单车保险
			$("#singleCarInsuranceDiv").hide();
			//工本费
			$("#costPriceDiv").hide();
			//其他扣款
			$("#otherPriceDiv").hide();
			//有价券金额
			$("#couponPriceDiv").hide();
			//有价券进项税
			$("#couponIncomeTaxDiv").hide();
			//运费成本
			$("#transportPriceCostDiv").hide();
			//运费进项税
			$("#transportPriceIncomeTaxDiv").hide();
			//进项税
			$("#incomeTaxDiv").hide();
			var url=basePath+"/paymentInfo/goFindAccountCheckInfoMationPage";
			$("#find_accountCheck_info_model").load(url);
		}else{
			//结算信息字段修改为对账信息字段
			$("#settMation").text("结算信息");
			
			var url=basePath+"/paymentInfo/goFindSettlementInfoMationPage";
			$("#find_settlement_info_model").load(url);
		}
		
	}
	
}

//进入选择代理人模态框
function findProxyInfoMation(){
	var url=basePath+"/paymentInfo/goFindProxyInfoModel";
	$("#find_proxy_info_model").load(url);
}

//点击取消按钮
function closeAddPaymentInfo(){
	window.location.href=basePath+"/paymentInfo/goPaymentInfoMationPage";
}

getFloat = function (number, n) { 
	  n = n ? parseInt(n) : 0; 
	  if (n <= 0) return Math.round(number); 
	  number = Math.round(number * Math.pow(10, n)) / Math.pow(10, n); 
	  return number; 
	};
	
function toDecimal2(x) {  
  var f = parseFloat(x);  
  if (isNaN(f)) {  
      return false;  
  }  
  var f = Math.round(x*100)/100;  
  var s = f.toString();  
  var rs = s.indexOf('.');  
  if (rs < 0) {  
      rs = s.length;  
      s += '.';  
  }  
  while (s.length <= rs + 4) {  
      s += '0';  
  }  
  return s;  
} 

//点击保存按钮
function addPaymentInfoMation(){
	
	//验证数字
	var regax=/^[0-9]*$/;
	
	//验证
	//本次付费
	var thisPayPrice=$.trim($("#thisPayPrice").val());
	if(thisPayPrice==undefined || thisPayPrice==''){
		xjValidate.showTip("请输入本次付费金额!");
		return false;
	}
	
	//付款对象
	var paymentObject=$.trim($("#paymentObject").val());
	if(paymentObject==undefined || paymentObject==''){
		xjValidate.showTip("请选择付款对象!");
		return false;
	}
	
	
	//是否代理付款
	var isProxyPayment=$.trim($("#isProxyPayment").val());
	if(isProxyPayment==undefined || isProxyPayment==''){
		xjValidate.showTip("请选择是否代理付款!");
		return false;
	}
	
	//判断是结算还是对账
	
	//对账
	if(settOrAcc==2){
		//对账信息
		var accountCheckInfoId=$.trim($("#accountCheckInfoId").val());
		if(accountCheckInfoId==undefined || accountCheckInfoId==''){
			xjValidate.showTip("请选择对账信息!");
			return false;
		}
		
	}else 
		//结算
		if(settOrAcc==1){
			//运单号
			var waybillId=$.trim($("#waybillId").val());
			if(waybillId==undefined || waybillId==''){
				xjValidate.showTip("请选择结算信息!");
				return false;
			}
			
			/*//运单号
			var waybillId=$.trim($("#waybillId").val());
			if(waybillId==undefined || waybillId==''){
				xjValidate.showTip("运单号不能为空!");
				return false;
			}*/
			
			/*//客户编号
			if($("#user_role").val()==2){
				var customerName=$.trim($("#customerName").val());
				if(customerName==undefined || customerName==''){
					xjValidate.showTip("客户名称不能为空!");
					return false;
				}
			}*/
			
			/*//线路
			var lineInfoName=$.trim($("#lineInfoName").val());
			if(lineInfoName==undefined || lineInfoName==''){
				xjValidate.showTip("线路不能为空!");
				return false;
			}*/
			
			/*//发货时间
			var forwardingTime=$.trim($("#forwardingTime").val());
			if(forwardingTime==undefined || forwardingTime==''){
				xjValidate.showTip("发货时间不能为空!");
				return false;
			}*/
			
			/*//到货时间
			var arriveTime=$.trim($("#arriveTime").val());
			if(arriveTime==undefined || arriveTime==''){
				xjValidate.showTip("到货时间不能为空!");
				return false;
			}*/
			
			/*//运价
			var transportPrice=$.trim($("#transportPrice").val());
			if(transportPrice==undefined || transportPrice==''){
				xjValidate.showTip("运价不能为空!");
				return false;
			}*/
			
			/*//运费成本
			var transportPriceCost=$.trim($("#transportPriceCost").val());
			if(transportPriceCost==undefined || transportPriceCost==''){
				xjValidate.showTip("运费成本不能为空!");
				return false;
			}*/
			
			/*//运费进项税
			var transportPriceIncomeTax=$.trim($("#transportPriceIncomeTax").val());
			if(transportPriceIncomeTax==undefined || transportPriceIncomeTax==''){
				xjValidate.showTip("运费进项税不能为空!");
				return false;
			}*/
			
			/*//进项税
			var incomeTax=$.trim($("#incomeTax").val());
			if(incomeTax==undefined || incomeTax==''){
				xjValidate.showTip("进项税不能为空!");
				return false;
			}*/
	}
	
	//发货吨位
	var forwardingTonnage=$.trim($("#forwardingTonnage").val());
	if(forwardingTonnage==undefined || forwardingTonnage==''){
		xjValidate.showTip("发货吨位不能为空!");
		return false;
	}
	//到货吨位
	var arriveTonnage=$.trim($("#arriveTonnage").val());
	if(arriveTonnage==undefined || arriveTonnage==''){
		xjValidate.showTip("到货吨位不能为空!");
		return false;
	}
	
	//应付费用
	var payablePrice=$.trim($("#payablePrice").val());
	if(payablePrice==undefined || payablePrice==''){
		xjValidate.showTip("应付费用不能为空!");
		return false;
	}
	//身份证号
	var WidCard=$.trim($("#WidCard").val());
	if(WidCard==undefined || WidCard==''){
		xjValidate.showTip("身份证号不能为空!");
		return false;
	}
	//卡号
	var WbankCardId=$.trim($("#WbankCardId").val());
	if(WbankCardId==undefined || WbankCardId==''){
		xjValidate.showTip("卡号不能为空!");
		return false;
	}
	//开户行
	var WbankName=$.trim($("#WbankName").val());
	if(WbankName==undefined || WbankName==''){
		xjValidate.showTip("开户行不能为空!");
		return false;
	}
	
	//发货吨位
	var forwardingTonnage=$.trim($("#forwardingTonnage").val());
	
	//到货吨位
	var arriveTonnage=$.trim($("#arriveTonnage").val());
	
	//司机发票税金
	var driverInvoiceTax=$.trim($("#driverInvoiceTax").val());
	
	//单车保险
	var singleCarInsurance=$.trim($("#singleCarInsurance").val());
	
	//工本费
	var costPrice=$.trim($("#costPrice").val());
	
	//其他扣款
	var otherPrice=$.trim($("#otherPrice").val());
	
	//有价券金额
	var couponPrice=$.trim($("#couponPrice").val());
	
	//有价券进项税
	var couponIncomeTax=$.trim($("#couponIncomeTax").val());
	
	//运费成本
	var transportPriceCost=$.trim($("#transportPriceCost").val());
	
	//运费进项税
	var transportPriceIncomeTax=$.trim($("#transportPriceIncomeTax").val());
	
	//进项税
	var incomeTax=$.trim($("#incomeTax").val());
	
	//应付费用
	var payablePrice=$.trim($("#payablePrice").val());
	
	
	//支付类型
	var paymentType=$.trim($("#paymentType").val());
	if(paymentType==undefined || paymentType==''){
		xjValidate.showTip("请选择支付类型!");
		return false;
	}
	
	
	//验证通过新增付款信息
	$.ajax({
		url:basePath+"/paymentInfo/saveOrUpdatePaymentInfoMation",
		data:$("#add_payment_info_form").serialize()+"&sign="+1+"",
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					closeAddPaymentInfo();
					xjValidate.showPopup(resp.msg,"提示",true);
				}else{
					xjValidate.showPopup(resp.msg,"提示",true);
				}
				
			}else{
				 xjValidate.showPopup("系统异常!","提示",true);
			}
		}
	});
}

//是否代理付款改变事件
function isProxyPayment(){
	$("#proxy_person").hide();
	$("#settlementInfoInfoId").val("");
	$("#proxyPersonName").val("");
	$("#waybillId").val("");
	$("#paymentPersonName").val("");
	$("#CpaymentCompanyName").val("");
	$("#carCode").val("");
	$("#projectInfoName").val("");
	$("#goodsInfoName").val("");
	$("#scatteredGoods").val("");
	$("#customerName").val("");
	$("#lineInfoName").val("");
	$("#forwardingTime").val("");
	$("#arriveTime").val("");
	$("#transportPrice").val("");
	$("#forwardingTonnage").val("");
	$("#arriveTonnage").val("");
	$("#driverInvoiceTax").val("");
	$("#singleCarInsurance").val("");
	$("#costPrice").val("");
	$("#otherPrice").val("");
	$("#couponPrice").val("");
	$("#couponIncomeTax").val("");
	$("#transportPriceCost").val("");
	$("#transportPriceIncomeTax").val("");
	$("#incomeTax").val("");
	$("#payablePrice").val("");
	$("#WidCard").val("");
	$("#WbankCardId").val("");
	$("#WbankName").val("");
	$("#remarks").html("");
	$("#paymentPerson").val("");
	$("#CpaymentCompany").val("");
	$("#projectInfoId").val("");
	$("#goodsInfoId").val("");
	$("#lineInfoId").val("");
	$("#proxyPerson").val("");
	$("#customerId").val("");
}

//付款对象改变事件
function paymentObject(){
	
	var paymentObject=$.trim($("#paymentObject").val());
	if(paymentObject==1){
		$("#settInfo").hide();  //结算框隐藏
		$("#accountCheck").show();  //对账框显示
		$("#waybillDiv").hide();  //运单框隐藏
		$("#paymentPersonNameDiv").hide();  //支付人框隐藏
		$("#carCodeDiv").hide();  //车牌号框隐藏
		$("#projectInfoNameDiv").hide();  //组织部门框隐藏
		$("#goodsInfoNameDiv").hide();  //货物隐藏
		$("#scatteredGoodsDiv").hide();  //零散货物
		$("#customerNameDiv").hide();  //客户隐藏
		$("#lineInfoNameDiv").hide();  //线路隐藏
		$("#forwardingTimeDiv").hide();  //发货时间
		$("#arriveTimeDiv").hide();  //到货时间
		$("#transportPriceDiv").hide();  //运价
		$("#driverInvoiceTaxDiv").hide();  //司机发票税金
		$("#singleCarInsuranceDiv").hide();  //单车保险
		$("#costPriceDiv").hide();  //工本费
		$("#waybillIdDiv").hide();  //运单号
		$("#otherPriceDiv").hide();  //其他扣款
		$("#couponPriceDiv").hide();  //有价券
		$("#couponIncomeTaxDiv").hide();  //有价券进项税
		$("#transportPriceCostDiv").hide();  //运费成本
		$("#transportPriceIncomeTaxDiv").hide();  //运费进项税
		$("#incomeTaxDiv").hide();  //进项税
	}else{
		$("#settInfo").show();  //结算框隐藏
		$("#accountCheck").hide();  //对账框显示
		$("#waybillDiv").show();  //运单框隐藏
		$("#paymentPersonNameDiv").show();  //支付人框隐藏
		$("#carCodeDiv").show();  //车牌号框隐藏
		$("#projectInfoNameDiv").show();  //组织部门框隐藏
		$("#goodsInfoNameDiv").show();  //货物隐藏
		$("#scatteredGoodsDiv").show();  //零散货物
		$("#customerNameDiv").show();  //客户隐藏
		$("#lineInfoNameDiv").show();  //线路隐藏
		$("#forwardingTimeDiv").show();  //发货时间
		$("#arriveTimeDiv").show();  //到货时间
		$("#transportPriceDiv").show();  //运价
		$("#waybillIdDiv").show();  //运单号
		$("#driverInvoiceTaxDiv").show();  //司机发票税金
		$("#singleCarInsuranceDiv").show();  //单车保险
		$("#costPriceDiv").show();  //工本费
		$("#otherPriceDiv").show();  //其他扣款
		$("#couponPriceDiv").show();  //有价券
		$("#couponIncomeTaxDiv").show();  //有价券进项税
		$("#transportPriceCostDiv").show();  //运费成本
		$("#transportPriceIncomeTaxDiv").show();  //运费进项税
		$("#incomeTaxDiv").show();  //进项税
	}
}