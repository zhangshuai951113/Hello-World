var sign='';
$(function(){
	if($("#proxyPerson").val()!=null && $("#proxyPerson").val()!=''){
		$("#proxy_person").show();
	}
});



//进入选择运单信息模态框
function findWaybillInfoMation(){
	var url=basePath+"/paymentInfo/goFindWaybillInfoModel";
	$("#find_waybill_info_model").load(url);
}

//进入选择代理人模态框
function findProxyInfoMation(){
	var url=basePath+"/paymentInfo/goFindProxyInfoModel";
	$("#find_proxy_info_model").load(url);
}

//取消
function closeupdatePrePaymentInfo(){
	window.location.href=basePath+"/paymentInfo/goPrePaymentInfoMationPage"+"?sign=1";
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
function updatePrePaymentInfoMation(){
	sign=2;
	updatePrePaymentInfoMationById(sign);
}

//修改
function updatePrePaymentInfoMationById(sign){
	
	//验证
	//1、预付金额
	var prePaymentPrice=$.trim($("#prePaymentPrice").val());
	if(prePaymentPrice==undefined || prePaymentPrice==''){
		 xjValidate.showTip("请输入预付金额!");
		 return false;
	}
	
	//预付金额匹配数字
	var regax=/^\d+(\.\d+)?$/;
	if(!regax.test(prePaymentPrice)){
		xjValidate.showTip("请输入正确的预付金额!");
		return false;
	}
	
	var a=/^[0-9]*$/;
	if(!a.test(prePaymentPrice)){
		$("#prePaymentPrice").val(getFloat(prePaymentPrice,4));
	}else{
		$("#prePaymentPrice").val(toDecimal2(prePaymentPrice));
	}
	
	//运单号
	var waybillInfoName=$.trim($("#waybillInfoName").val());
	if(waybillInfoName==undefined || waybillInfoName==''){
		 xjValidate.showTip("请选择运单信息!");
		 return false;
	}
	
	//支付类型
	var paymentType=$.trim($("#paymentType").val());
	if(paymentType==undefined || paymentType==''){
		xjValidate.showTip("请选择支付类型!");
		 return false;
	}
	
	//验证通过
	$.ajax({
		url:basePath+"/paymentInfo/addOrUpdatePrePaymentInfoMation",
		data:$("#update_pre_payment_info_form").serialize()+"&sign="+sign+"",
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					xjValidate.showPopup(resp.msg,"提示",true);
					closeupdatePrePaymentInfo();
				}else{
					xjValidate.showPopup(resp.msg,"提示",true);
				}
				
			}else{
				 xjValidate.showPopup("系统异常!","提示",true);
			}
		}
	});
}