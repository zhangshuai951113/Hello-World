/*
(function() {
	var slider = new SliderUnlock("#slider", {
		successLabelTip : "验证通过"
	}, function() {
		var username = $("#username").val();
		var password = $("#password").val();
		
		if(username==undefined || $.trim(username)=="") {
			$.alert("用户名不能为空");
			error();
			return;
		}
		
		if(password==undefined || $.trim(password)=="") {
			$.alert("密码不能为空");
			error();
			return;
		}
		
		
		var data ={'username':username,'password':password};
		$.ajax({
			type:"get",
			url : "checkLogin",
			data:data,
			dataType:"json",
			async : false,
			success : function(responseText) {
				var json = eval(responseText); 
				if(json.success){
					window.location.href="/xzsoft-platform/index";
				}else{
					error();
					$.alert(json.msg);
				}

			}
		});
		
		var data ={'username':username,'password':password};
		var form = $('#login_id');
		form.ajaxSubmit(function(){
			$.ajax({
				type:"get",
				url : "checkLogin",
				data:data,
				dataType:"json",
				async : true,
				success : function(responseText) {
					var json = eval(responseText); 
					if(json.success){
						window.location.href="/xzsoft-platform/index";
					}else{
						error();
						$.alert(json.msg);
					}
				}
			});
		});
	});
	slider.init();
	
	function error() {
		//登录失败调用
		setTimeout(function() {
			slider.index = 0;
			slider.init();
			$("#labelTip").text("拖动滑块验证").css("color","#666666");
			$('#label .slide-icon').css("background-image","url("+bathPath+"/static/images/login/sliding-icon.png)");
		},1000)
		
	}
}())
*/