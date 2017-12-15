$(function(){
	$("#mobilePhone").val("");
	$("#code").val("");
});

/**
 * 获取手机验证码
 */
function getMobilePhoneVerificationCode(){
	//获取到输入的手机号
	var mobilePhone=$.trim($("#mobilePhone").val());
	if(mobilePhone==undefined || mobilePhone==''){
		$.alert("请输入手机号!");
		return false;
	}else{
		
		 checkCodeCountdown();
		
		$.ajax({
			url:"getMobilePhoneCode",
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

function verifyIdentity(){
	//获取到手机号和验证码进行验证
	var mobilePhone=$.trim($("#mobilePhone").val());
	if(mobilePhone==undefined || mobilePhone==''){
		$.alert("请输入手机号!");
		return false;
	}
	//匹配11为数字
	 var myreg=/^1[0-9]{10}$/;
	 if(!myreg.test(mobilePhone)){
		 $.alert("请输入有效的手机号!");
			return false;
	 }
	 
	 //验证码
	 var code = $.trim($("#code").val());
	 if(code==undefined || code==''){
		 $.alert("请输入验证码!");
			return false;
	 }
	 
	 //验证通过
	 $.ajax({
		 url:"verifyIdentity",
		 data:{"mobilePhone":mobilePhone,"code":code},
		 dataType:"JSON",
		 type:"POST",
		 async:true,
		 success:function(resp){
			if(resp){
				if(resp.success){
						$("#updateMobilPhone").val(mobilePhone);
						$("#updateCode").val(code);
						$("#update_password").attr("action","/xzsoft-platform/forgotPassword/updatePasswordPage");
						$("#update_password").submit();
				}else{
					$.alert(resp.msg);
				}
			}else{
				$.alert("系统繁忙，请稍后再试!");
			}
		 }
	 });
}

//重置密码
function updatePassword(){
	//获取到新密码
	var password = $.trim($("#myPassword").val());
	if(password==undefined || password==""){
		$.alert("请输入新密码!");
		return false;
	}
	
	if(!10>password.length>6){
		$.alert("密码长度在6~10为之间!");
		return false;
	}
	
	//获取到确认二次密码
	var newPassword = $.trim($("#newPassword").val());
	if(newPassword==undefined || newPassword==''){
		$.alert("请输入确认密码!");
		return false;
	}
	//判断两次密码是否一致
	if(password!=newPassword){
		$.alert("两次密码输入不一致，请重新输入!");
		return false;
	}
	
	//验证成功
	$.ajax({
		url:"updateMyPassword",
		data:{
			"updateMobilePhone":$("#updateMobilePhone").val(),
			"password":password,
			"updateCode":$("#updateCode").val()
			},
		dataType:"JSON",
		type:"POST",
		async:true,
		success:function(resp){
			if(resp){
				if(resp.success){
					$.alert(resp.msg);
					setTimeout(function(){
						 window.location.href="/xzsoft-platform/userInfo/login";
					},1500);
				}else{
					$.alert(resp.msg);
				}
			}else{
				$.alert("系统异常!");
			}
		}
	});
}

function closePassword(){
	 $.confirm({
	      title: '提示',
	      content: '您确定要放弃修改吗？',
	      buttons: {
	          '确定': function () {
	        	  window.location.href="/xzsoft-platform/userInfo/login";
	          },
	          '取消': function () {
	          }
	      }
	  });
	
}

var countdown=60;

/**
 * 验证码倒计时
 * */
function checkCodeCountdown(){
	
	if(countdown==0){
		$("#getMobilePhoneVerificationCode").attr("onclick","getMobilePhoneVerificationCode(this)");
		$("#getMobilePhoneVerificationCode").text("获取验证码");
		countdown=60;
		return;
	}else{
		$("#getMobilePhoneVerificationCode").removeAttr("onclick");
		$("#getMobilePhoneVerificationCode").text("重新发送("+countdown+")");
		countdown--;
	}
	setTimeout(function() { 
		checkCodeCountdown() 
	},1000)
}