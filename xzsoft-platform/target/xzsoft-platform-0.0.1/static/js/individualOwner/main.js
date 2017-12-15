
$(function(){
	list();
	//上传图片初始化
	$('.upload_img').each(function(){
		uploadLoadFile($(this));
	})
});

function list(){
	$.ajax({
		url:"findIndividualOwnerByUserInfoId",
		data:"",
		type:"get",
		async : false,
		success : function(resp) {
			var json=eval(resp);
			$("#userName").text(json.userName);
			$("#mobilePhone" ).text(json.mobilePhone);
            $("#userInfoId").val(json.userInfoId);
            $("#sex").val(json.sex);
            $("#idCard").val(json.idCard);
            $("#address").val(json.address);
            $("#openingBank").val(json.openingBank);
            $("#accountName").val(json.accountName);
            $("#bankAccount").val(json.bankAccount);
            $("#idCardImage").val(json.idCardImage);
            $("#idCardImageCopy").val(json.idCardImageCopy);
            if(json.idCardImageCopy) {
            	$("#myIdCardImageCopy").attr("src", fastdfsServer+'/'+json.idCardImageCopy);
            }
            if(json.idCardImage){
            	$("#myIdCardImage").attr("src", fastdfsServer+'/'+json.idCardImage);
            }
            $("#realName").val(json.realName);
		}
	});
}


/**
 * 绑定上传事件的dom对象
 * @author chengzhihuan 2017年5月18日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn,{
   		action: basePath + '/upload/imageUpload',
   		name: 'myfile',
		dataType: 'json',
   		onSubmit : function(file , ext){
   			//文件上传格式校验
   			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))){
   				$.alert("请上传格式为 jpg|png|bmp 的图片!");
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
   					$.alert(resultJson.errorMsg);
   	   				return;
   				}
   			}else{
   				$.alert("服务器异常，请稍后重试");
   				return;
   			}
		}
	});
}


//保存个体货主修改信息
   $("#updateButton").click(function(){
	//1、验证真实姓名是否填写
	var realName=$.trim($("#realName").val());
	if(realName==undefined || realName==""){
		xjValidate.showPopup("真实姓名不能为空!","提示",true);
		return false;
	}
	
	if(realName.length>100){
		xjValidate.showPopup("真实姓名的长度不能超过50个字符!","提示",true);
		return false;
	}
	
	//校验性别是否为空
	var sex=$.trim($("#sex").val());
	if(sex==undefined || sex==""){
		xjValidate.showPopup("性别不能为空!","提示",true);
		return false;
	}
	
	//2、校验身份证号码
	var idCard=$.trim($("#idCard").val());
	if(idCard==undefined || idCard==""){
		xjValidate.showPopup("身份证号码不能为空!","提示",true);
		return false;
	}
	
	var myreg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	var re = new RegExp(myreg);
	if(!re.test(idCard)){
		xjValidate.showPopup("请输入正确的身份证号码!","提示",true);
		return false;
	}
	
	//居住地址校验
	var address=$.trim($("#address").val());
	if(address==undefined || address==""){
		xjValidate.showPopup("居住地址不能为空!","提示",true);
		return false;
	}
	
	  //3、校验开户行
	var openingBank=$.trim($("#openingBank").val());
	if(openingBank==undefined || openingBank==""){
		xjValidate.showPopup("开户行不能为空!","提示",true);
		return false;
	}
	
	if(openingBank.length>100){
		xjValidate.showPopup("开户行不能超过50个字符!","提示",true);
		return false;
	}
	
	
	//4、校验开户名
	var accountName=$.trim($("#accountName").val());
	if(accountName==undefined || accountName==""){
		xjValidate.showPopup("开户名不能为空!","提示",true);
		return false;
	}
	
	if(accountName.length>40){
		xjValidate.showPopup("开户名不能超过20个字符!","提示",true);
		return false;
	}
	
	//4、校验银行账号
	var bankAccount=$.trim($("#bankAccount").val());
	if(bankAccount==undefined || bankAccount==""){
		xjValidate.showPopup("银行账号不能为空!","提示",true);
		return false;
	}
	
	//身份证正面附件校验
	var idCardImage=$.trim($("#idCardImage").val());
	if(idCardImage==undefined || idCardImage==""){
		xjValidate.showPopup("身份证正面照片不能为空!","提示",true);
		return false;
	}
	
	//身份证反面附件校验
	var idCardImageCopy=$.trim($("#idCardImageCopy").val());
	if(idCardImageCopy==undefined || idCardImageCopy==""){
		xjValidate.showPopup("身份证反面照片不能为空!","提示",true);
		return false;
	}
	//全部通过
	$.ajax({
		url:"updateIndividualOwnerByUserInfoId",
		type:"post",
		data:$("#updateIndividualOwnerForm").serialize(),
		dataType:"json",
		async:false,
		success:function(resp) {
			xjValidate.showPopup(resp.msg,"提示",true);
		}
	});
});
