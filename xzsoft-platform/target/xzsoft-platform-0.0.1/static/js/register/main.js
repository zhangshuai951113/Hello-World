$(".button").click(function(){
	var userRole=$("input:radio[name='userRole']:checked").val();
	var userName=$("#userName").val();
	var password=$("#password").val();
	var confirmPassword=$("#confirmPassword").val();
	var mobilePhone=$("#mobilePhone").val();
	//校验用户类型
	if(userRole==undefined || userRole==""){
		$.alert("用户类型不能为空!");
		return false;
	}
	//校验用户名
	if(userName==undefined || userName==""){
		$.alert("用户名不能为空!");
		return false;
	}
	var a="^(?![0-9]+$)[0-9A-Za-z]+$";
	var re = new RegExp(a);
	if(!re.test(userName)){
		$.alert("用户名只能由英文或数字和英文混合组成!");
		return false;
	}
	if(userName.length>50){
		$.alert("用户名的长度不能超过50个字符!");
		return false;
	}
	//校验密码
	if(password==undefined || password==""){
		$.alert("密码不能为空!");
		return false;
	}
	var b="^[0-9A-Za-z]{6,10}$";
	var re = new RegExp(b);
	if(!re.test(password)){
		$.alert("密码只能由数字和字母组成,并且长度在6~10位之间!");
		return false;
	}
	
	//校验确认密码
	if(confirmPassword==undefined || confirmPassword==""){
		$.alert("确认密码不能为空!");
		return false;
	}
	if(confirmPassword!=password){
		$.alert("两次密码输入不一致,请确认后在重新输入!");
		return false;
	}
	//校验手机号
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
		url:"addUserInfo",
		type:"post",
		data:{
			"userRole":userRole,
			"userName":userName,
			"password":password,
			"confirmPassword":confirmPassword,
			"mobilePhone":mobilePhone,
			"code":code
			},
	    dataType:"json",
	    async : true,
	    success:function(resp){
	    	var json=eval(resp);
	    	if(json.success==true){
	    		$.confirm({
	    			title:"",
	    		     content:"用户注册成功",
	    		      buttons: {
	    		          '确定': function () {
	    		        	  window.location.href="/xzsoft-platform/userInfo/login";
	    		          }
	    		      }
	    		  });
			}else{
				 $.alert(json.msg);
			}
	    }
	});
});

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
			url:"mobilePhoneCode",
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
