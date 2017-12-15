/**
 * 
 * @author luojuan 2017年5月24日
 */
$(function(){
	
	//上传图片初始化
	$('.upload_img').each(function(){
		uploadLoadFile($(this));
	})
});
	/**
	 * 绑定上传事件的dom对象
	 * @author luojuan 2017年5月24日
	 */
	function uploadLoadFile(btn) {
		new AjaxUpload(btn,{
	   		action: basePath + '/upload/imageUpload',
	   		name: 'myfile',
			dataType: 'json',
	   		onSubmit : function(file , ext){
	   			//文件上传格式校验
	   			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))){
	   				xjValidate.showPopup("请上传格式为 jpg|png|bmp 的图片","提示",true);
	   				return;
	   			}
	   		},
	   		//服务器响应成功时的处理函数
	   		onComplete :function(file, resultJson){
	   			if(resultJson){
	   				resultJson = $.parseJSON(resultJson);
	   				//是否成功
	   				var isSuccess = resultJson.isSuccess;
	   				//上传图片URL
	   				var uploadUrl = resultJson.uploadUrl;
	   				if(isSuccess=="true"){
	   					//图片类型
	   					var imgType = btn.attr("img-type");
						btn.attr("src",fastdfsServer+"/"+uploadUrl);
						$("#"+imgType).val(uploadUrl);
	   				}else{
	   					xjValidate.showPopup(resultJson.errorMsg,"提示",true);
	   	   				return;
	   				}
	   			}else{
	   				xjValidate.showPopup("服务器异常，请稍后重试","提示",true);
	   				return;
	   			}

			}
		});
	}
function commitRootCarInfo(){
	//1、司机名称校验
	var driverName = $.trim($("#driverName").val());
	if(driverName==undefined || driverName==""){
		xjValidate.showPopup("司机名称不能为空","提示",true);
		return;
	}
	
	if(driverName.length>100){
		xjValidate.showPopup("司机名称不能超过50个汉字","提示",true);
		return;
	}
	
	//2、移动电话校验
	var mobilePhone = $.trim($("#mobilePhone").val());
	if(mobilePhone==undefined || mobilePhone==""){
		xjValidate.showPopup("移动电话不能为空","提示",true);
		return;
	}
	
	var myreg = /^1[34578]\d{9}$/; 
	if(!myreg.test(mobilePhone)){
		xjValidate.showPopup("请输入有效的手机号","提示",true);
		return;
	}
	
	//3、身份证号校验
	var idCard = $.trim($("#idCard").val());
	if(idCard==undefined || idCard==""){
		xjValidate.showPopup("身份证号不能为空","提示",true);
		return;
	}
	
	var cardreg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
	if(!cardreg.test(idCard)){
		xjValidate.showPopup("请输入有效的身份证号","提示",true);
		return;
	}
	
	//4、驾驶证编号
	var drivingLicense = $.trim($("#drivingLicense").val());
	if(drivingLicense.length>100){
		xjValidate.showPopup("驾驶证编号不能超过50个汉字","提示",true);
		return;
	}
	
	//5、开户行校验
	var openingBank= $.trim($("#openingBank").val());
	if(openingBank==undefined || openingBank==""){
		xjValidate.showPopup("开户行不能为空","提示",true);
		return;
	}
	
	if(openingBank.length>100){
		xjValidate.showPopup("开户行不能超过50个汉字","提示",true);
		return;
	}
	
	//6、开户名校验
	var accountName = $.trim($("#accountName").val());
	if(accountName==undefined || accountName==""){
		xjValidate.showPopup("开户名不能为空","提示",true);
		return;
	}
	
	if(accountName.length>40){
		xjValidate.showPopup("开户名不能超过20个汉字","提示",true);
		return;
	}
	
	//7、银行账号校验
	var bankAccount = $.trim($("#bankAccount").val());
	if(bankAccount==undefined || bankAccount==""){
		xjValidate.showPopup("银行账号不能为空","提示",true);
		return;
	}
	//8、备注校验
	var remarks= $.trim($("#remarks").text());
	if(remarks!=undefined && remarks!="" && remarks.length>200){
		xjValidate.showPopup("备注信息不能超过100个汉字","提示",true);
		return;
	}
	//同意电子协议
	if(!$("#isCheck").is(":checked")){
		xjValidate.showPopup("请同意电子协议","提示",true);
		return;
	}
	
	$.ajax({
		url : basePath + "/driverInfo/updateRootIndivdualDriver",
		asyn : false,
		type : "POST",
		data : $('#root_driver_info_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					xjValidate.showPopup("保存成功","提示",true);
					window.location.href = basePath+"/driverInfo/rootindivdualDriverInitPage";
				}else{
					return;
				}
			}else{
				xjValidate.showPopup("保存个人信息服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
}
