//点击取消按钮
function closeWithdrawalsPage(){
	window.location.href=basePath+"/fundAccountManagement/goRootFundAccountManagementPage";
}

var countdown=60;

//点击获取验证码
function getMobilePhoneVerificationCode(obj){
	//获取到输入的手机号
	var mobilePhone=$.trim($("#mobilePhone").val());
	if(mobilePhone==undefined || mobilePhone==''){
		$.alert("请输入手机号!");
		return false;
	}else{
		//调用验证码倒计时
		checkCodeCountdown(obj);
		
		$.ajax({
			url:basePath+"/user/mobilePhoneCode",
			data:{"mobilePhone":mobilePhone},
			 dataType:"json",
			type:"post",
			async:true,
			success:function(resp){
				if(resp){
					if(resp.success){
						
					}else{
						$.alert(resp.msg);
					}
				}else{
					$.alert("系统繁忙，请稍后再试!");
				}
			}
		});
	}
}

//验证码倒计时显示
function checkCodeCountdown(obj){
	if (countdown == 0) { 
		$("#mobilePhoneVerificationCode").attr("onclick","getMobilePhoneVerificationCode(this)");
    $("#mobilePhoneVerificationCode").text("获取验证码"); 
    countdown = 60; 
    return;
} else { 
	$("#mobilePhoneVerificationCode").removeAttr("onclick");
    $("#mobilePhoneVerificationCode").text("重新发送(" + countdown + ")"); 
    countdown--;
} 
	setTimeout(function() { 
		checkCodeCountdown() 
	},1000)
}

//点击充值按钮
function withdraealsMoneyBtn(){
	
	var thisPrice=$("#thisPrice").val();
	if(thisPrice==undefined || thisPrice==''){
		$.alert("请输入本次交易金额!");
		return false;
	}
	
	 var isNum = /^\d+(\.\d+)?$/;
	 if(!isNum.test(thisPrice)){
		 $.alert("请输入正确的金额!");
		 return false;
	 }
	 
	 var num=parseFloat(thisPrice);
	 if(num<=0){
		 $.alert("请输入0以上的金额!");
		 return false;
	 }
	 
	 var paymentMethod=$("input[type='radio']:checked").val();
	 if(paymentMethod==undefined || paymentMethod==''){
		 $.alert("请选择提现方式!");
		 return false;
	 }
	 
	//校验手机号
	 var mobilePhone=$("#mobilePhone").val();
	if(mobilePhone==undefined || mobilePhone==""){
		$.alert("手机号不能为空!");
		return false;
	}
	var c="^((13[0-9])|(15[^4,\\D])|(18[0-9])|(17[0-9]))\\d{8}$";
	var re = new RegExp(c);
	if(!re.test(mobilePhone)){
		$.alert("请输入正确的手机号码!");
		return false;
	}
	
	var code = $.trim($("#code").val());
	if(code==undefined || code == ''){
		$.alert("请输入验证码!");
		return false;
	}
	
	//验证通过
	$.ajax({
		url:basePath+"/fundAccountManagement/rechargeOrWithdrawals",
		data:{
			"CZZHName":$("#CZZHName").text(),
			"CZZHPrice":$("#CZZHPrice").text(),
			"CZKYPrice":$("#CZKYPrice").text(),
			"CZRedis":$("#CZRedis").text(),
			"thisPrice":$("#thisPrice").val(),
			"paymentMethod":paymentMethod,
			"mobilePhone":$("#mobilePhone").val(),
			"code":$("#code").val(),
			"sign":2
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					$.alert(resp.msg);
					setTimeout(function(){
						window.location.href=basePath+"/fundAccountManagement/goRootFundAccountManagementPage";
					},1000);
				}else{
					$.alert(resp.msg);
				}
			}else{
				$.alert("系统异常，请稍后再试!");
			}
		}
	});
	
}