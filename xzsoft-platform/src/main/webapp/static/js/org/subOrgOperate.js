$(function(){
	//初始化三证合一显示
	initIsCombine();
	
	//上传图片初始化
	$('.upload_img').each(function(){
		uploadLoadFile($(this));
	})
});

/**
 * 初始化三证合一显示
 * @author chengzhihuan 2017年5月18日
 */
function initIsCombine(){
	//取出是否三证合一字段
	var isCombine = $("#is_combine").val();
	//若是三证合一则隐藏税务登记证与组织机构代码证
	if(isCombine && isCombine==1){
		$("#is_combine_div").hide();
		$("#tax_img_div").hide();
		$("#org_img_div").hide();
	}
}

/**
 * 下列选择切换是否三证合一
 * @author chengzhihuan 2017年5月18日
 */
function changeIsCombine(){
	//取出是否三证合一字段
	var isCombine = $("#is_combine").val();
	//若是三证合一则隐藏税务登记证与组织机构代码证
	if(isCombine && isCombine==1){
		$("#is_combine_div").hide();
		$("#tax_img_div").hide();
		$("#org_img_div").hide();
	}
	//若不是三证合一则显示税务登记证与组织机构代码证
	else{
		$("#is_combine_div").show();
		$("#tax_img_div").show();
		$("#org_img_div").show();
	}
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
   				commonUtil.showPopup("提示","请上传格式为 jpg|png|bmp 的图片");
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
   					commonUtil.showPopup("提示",resultJson.errorMsg);
   	   				return;
   				}
   			}else{
   				commonUtil.showPopup("提示","服务器异常，请稍后重试");
   				return;
   			}

		}
	});
}

/**
 * 新增/编辑子机构信息
 * @author chengzhihuan 2017年5月18日
 */
function commitSubOrgInfo(){
	//1、组织名称校验
	var orgName = $.trim($("#orgName").val());
	if(orgName==undefined || orgName==""){
		commonUtil.showPopup("提示","组织名称不能为空");
		return;
	}
	
	if(orgName.length>70){
		commonUtil.showPopup("提示","组织名称不能超过35个汉字");
		return;
	}
	
	//2、通讯地址校验
	var contactAddress = $.trim($("#contactAddress").val());
	if(contactAddress!=undefined && contactAddress!="" && contactAddress.length>120){
		commonUtil.showPopup("提示","通讯地址不能超过60个汉字");
		return;
	}
	
	//3、注册地址校验
	var registerAddress = $.trim($("#registerAddress").val());
	if(registerAddress==undefined || registerAddress==""){
		commonUtil.showPopup("提示","注册地址不能为空");
		return;
	}
	
	if(registerAddress.length>120){
		commonUtil.showPopup("提示","注册地址不能超过60个汉字");
		return;
	}
	
	//4、联系人姓名校验
	var contactName = $.trim($("#contactName").val());
	if(contactName!=undefined && contactName!="" && contactName.length>40){
		commonUtil.showPopup("提示","联系人姓名不能超过20个汉字");
		return;
	}
	
	//5、移动电话校验
	var mobilePhone = $.trim($("#mobilePhone").val());
	var myreg = /^1[34578]\d{9}$/; 
	if(mobilePhone!=undefined && mobilePhone!="" && !myreg.test(mobilePhone)){
		commonUtil.showPopup("提示","请输入有效的手机号");
		return;
	}
	
	//6、法定代表人校验
	var legalPersonName = $.trim($("#legalPersonName").val());
	if(legalPersonName==undefined || legalPersonName==""){
		commonUtil.showPopup("提示","法定代表人不能为空");
		return;
	}
	
	if(legalPersonName.length>40){
		commonUtil.showPopup("提示","法定代表人不能超过20个汉字");
		return;
	}
	
	//7、固定电话校验校验
	var telephone = $.trim($("#telephone").val());
	var telereg = /^((0\d{2,3})-)(\d{7,8})$/;
	if(telephone!=undefined && telephone!="" && !telereg.test(telephone)){
		commonUtil.showPopup("提示","请输入有效的固定电话");
		return;
	}
	
	//8、法人身份证号校验
	var idCard = $.trim($("#idCard").val());
	var cardreg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
	if(idCard!=undefined && idCard!="" && !cardreg.test(idCard)){
		commonUtil.showPopup("提示","请输入有效的法人身份证号");
		return;
	}
	
	//9、统一社会信用代码校验
	var creditCode = $.trim($("#creditCode").val());
	if(creditCode==undefined || creditCode==""){
		commonUtil.showPopup("提示","统一社会信用代码不能为空");
		return;
	}
	
	//10、统一社会信用代码证附件校验
	var creditImg = $.trim($("#credit_img").val());
	if(creditImg==undefined || creditImg==""){
		commonUtil.showPopup("提示","统一社会信用代码证附件不能为空");
		return;
	}
	
	//11、邮编校验
	var postcode = $.trim($("#postcode").val());
	var postreg =  /^[0-9][0-9]{5}$/;
	if(postcode!=undefined && postcode!="" && !postreg.test(postcode)){
		commonUtil.showPopup("提示","请输入有效的邮编");
		return;
	}
	
	//12、传真校验
	var fax = $.trim($("#fax").val());
	var faxreg = /^(\d{3,4}-)?\d{7,8}$/;
	if(fax!=undefined && fax!="" && !faxreg.test(fax)){
		commonUtil.showPopup("提示","传真格式为:XXX-12345678或XXXX-1234567或XXXX-12345678");
		return;
	}
	
	//13、电子邮箱校验
	var email = $.trim($("#email").val());
	var emailreg = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g;
	if(email!=undefined && email!=""&& !emailreg.test(email)){
		commonUtil.showPopup("提示","请输入有效的邮箱地址");
		return;
	}
	
	//14、开户行校验
	var bankName= $.trim($("#bankName").val());
	if(bankName==undefined || bankName==""){
		commonUtil.showPopup("提示","开户行不能为空");
		return;
	}
	
	if(bankName.length>70){
		commonUtil.showPopup("提示","开户行不能超过35个汉字");
		return;
	}
	
	//15、开户名校验
	var accountName = $.trim($("#accountName").val());
	if(accountName==undefined || accountName==""){
		commonUtil.showPopup("提示","开户名不能为空");
		return;
	}
	
	if(accountName.length>40){
		commonUtil.showPopup("提示","开户名不能超过20个汉字");
		return;
	}
	
	//16、银行账号校验
	var bankAccount = $.trim($("#bankAccount").val());
	if(bankAccount==undefined || bankAccount==""){
		commonUtil.showPopup("提示","银行账号不能为空");
		return;
	}
	
	//17、道路运输许可证号校验
	var roadTransportPermitNum = $.trim($("#roadTransportPermitNum").val());
	if(roadTransportPermitNum==undefined || roadTransportPermitNum==""){
		commonUtil.showPopup("提示","道路运输许可证号不能为空");
		return;
	}
	
	//18、备注校验
	var remarks= $.trim($("#remarks").text());
	if(remarks!=undefined && remarks!="" && remarks.length>160){
		commonUtil.showPopup("提示","备注信息不能超过80个汉字");
		return;
	}
	
	//19、三证信息校验
	var isCombine = $("#is_combine").val();
	if(isCombine==undefined || isCombine==""){
		commonUtil.showPopup("提示","请选择是否三证合一");
		return;
	}
	
	//营业执照号
	var licenseNum = $.trim($("#licenseNum").val());
	//组织机构代码证
	var orgNum = $.trim($("#orgNum").val());
	//税务登记号
	var taxNum = $.trim($("#taxNum").val());
	//营业执照附件
	var licenseImg = $.trim($("#license_img").val());
	//税务登记证附件
	var taxImg = $.trim($("#tax_img").val());
	//组织机构代码证附件
	var orgImg = $.trim($("#org_img").val());
	if(isCombine==1){
		var checkIsCombine = licenseNum!=undefined && licenseNum!="" && licenseImg!=undefined && licenseImg!="";
		if(!checkIsCombine){
			commonUtil.showPopup("提示","请填写三证相关信息");
			return;
		}
	}else{
		var checkIsCombine = licenseNum!=undefined && licenseNum!="" && licenseImg!=undefined && licenseImg!=""
						   	&&orgNum!=undefined && orgNum!="" && orgImg!=undefined && orgImg!=""
							&&taxNum!=undefined && taxNum!="" && taxImg!=undefined && taxImg!="";
		if(!checkIsCombine){
			commonUtil.showPopup("提示","请填写三证相关信息");
			return;
		}
	}
	
	//20、提交子机构维护操作请求
	$.ajax({
		url : basePath + "/orgInfo/addOrUpdateSubOrgInfo",
		asyn : false,
		type : "POST",
		data : $('#sub_org_info_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
//					commonUtil.showPopup("提示","保存成功");
					window.location.href = basePath+"/orgInfo/showOrgInfoListPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","维护子机构服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 返回组织管理页面
 * @author chengzhihuan 2017年5月22日
 */
function gotoOrgManage(){
	window.location.href = basePath+"/orgInfo/showOrgInfoListPage";
}