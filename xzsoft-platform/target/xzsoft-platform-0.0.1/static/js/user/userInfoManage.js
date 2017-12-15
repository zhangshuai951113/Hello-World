$(function(){
	
	//搜索
	searchUserInfo(1);
	
	//启用用户
	$("body").on("click",".enabled-operation",function(){
		//用户ID
		var userInfoId = $(this).parent().attr("user-info-id");
		operateUser(userInfoId,1);
	});
	
	//停用用户
	$("body").on("click",".disable-operation",function(){
		//用户ID
		var userInfoId = $(this).parent().attr("user-info-id");
		operateUser(userInfoId,2);
	});
	
	//注销用户
	$("body").on("click",".logout-operation",function(){
		//用户ID
		var userInfoId = $(this).parent().attr("user-info-id");
		operateUser(userInfoId,3);
	});
	
	//维护司机信息
	//注销用户
	$("body").on("click",".wh-operation",function(){
		//用户ID
		var userInfoId = $(this).parent().attr("user-info-id");
		whDriverMation(userInfoId);
	});
	
	//单个用户重置密码
	$("body").on("click",".view-operation",function(){
		//用户ID
		var userInfoId = $(this).parent().attr("user-info-id");
		$("#hidden_user_info_ids").val(userInfoId);
		//打开弹框
		$("#passwordReset").modal('show');
	});
	
	//全选/全不选
	$("body").on("click",".all_user_check",function(){
		if($(".all_user_check").is(":checked")){
			//全选时
			$(".sub_user_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_user_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	//关闭企业普通员工弹框
	$("body").on("click",".enterprise-user-opt-close",function(){
		$("#show_enterprise_user_info").empty();
	});
	
	//关闭企业司机弹框
	$("body").on("click",".driver-info-opt-close",function(){
		$("#show_driver_info").empty();
	});
	
	//关闭组织弹框
	$("body").on("click",".org-opt-close",function(){
		$("#show-org-data-info").empty();
	});
	
	//编辑用户
	$("body").on("click",".modify-operation",function(){
		//用户ID
		var userInfoId = $(this).parent().attr("user-info-id");
		if(userInfoId && userInfoId!=""){
			editUserInfo(userInfoId);
		}
	});
	//运单零散货物数据较多，增加滑动
    $(".iscroll").css("min-height", "55px");
    $(".iscroll").mCustomScrollbar({
      theme: "minimal-dark"
    });
    
});

var pagination = $(".pagination-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  searchUserInfo(current);
	  }
});

function jumpPage(e) {
	var totalPage=Math.floor((parent.getTotalRecords+9)/10);
	var myreg=/^[0-9]+.?[0-9]*$/;
	var re = new RegExp(myreg);
	var number=$(e).prev().find('input').val();
	if(!re.test(number)){
		xjValidate.showPopup("请输入正确的数字!","提示",true);
		$(e).prev().find('input').val("");
		return false;
	}
	var value = parseInt(number);
	if(value<1){
		$(e).prev().find('input').val("1")
		value=1;
	}
	if(value>=totalPage){
		$(e).prev().find('input').val(totalPage);
		value=totalPage;
	}
	pagination.setCurrentPage(value);
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
 * 跳转到某页
 * @author chengzhihuan 2017年5月25日
 */
function btnPagerGoto() {
	//取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	//取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	//数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		commonUtil.showPopup("提示","请输出正确的数字");
		return;
	}
	
	//跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	
	searchUserInfo(goPage);
}

/**
 * 根据页数查询用户信息
 * @author chengzhihuan 2017年5月25日
 * @param number 页数
 */
function searchUserInfo(number){
	//用户名
	var userName = $.trim($("#userName").val());
	//手机号
	var mobilePhone = $.trim($("#mobilePhone").val());
	//企业用户类型
	var enterpriseUserType = $("#enterpriseUserType").val();
	//启用状态
	var isAvailable = $("#isAvailable").val();
	//注销状态
	var userState = $("#userState").val();
	//真实姓名
	var realName = $("#realName").val();
	
	var data={
			"userName":userName,
			"mobilePhone":mobilePhone,
			"isAvailable":isAvailable,
			"userState":userState,
			"enterpriseUserType":enterpriseUserType,
			"realName":realName,
			"page":number,
			"rows":10
	};
	
	//请求地址
	var url = basePath + "/user/userInfoList #user-info-data";
	$("#search-user-info").load(url,data,
		function(){
			//允许表格拖着
		//允许表格拖着
		$("#tableDrag").colResizable({
		  liveDrag:true, 
		  gripInnerHtml:"<div class='grip'></div>", 
		  draggingClass:"dragging",
		  resizeMode: 'overflow',
		 ifDel: 'tableDrag'
		});
		});
	
	$.ajax({
		 url:basePath+"/user/countUserInfoForPage",
		 type:"post",
		 data:data,
		 dataType:"json",
		 async:true,
		 success:function(resp){
			 parent.getTotalRecords=resp;
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
}

/**
 * 启用/停用/注销勾选用户
 * @param operateType 操作类型 1:启用 2:停用 3:注销
 */
function operateCheckedUser(operateType){
	//所有选中用户ID
	var userIds = findAllCheckUserIds();
	if(userIds==undefined || userIds==""){
		commonUtil.showPopup("提示","请选择需要操作的用户");
		return;
	}
	
	//根据用户ID启用/停用/注销用户
	operateUser(userIds,operateType);
}

/**
 * 根据用户ID启用/停用/注销用户
 * @author chengzhihuan 2017年5月25日
 * @param userInfoIds 用户ID集合，逗号分隔
 * @param operateType 操作类型 1:启用 2:停用 3:注销
 */
function operateUser(userInfoIds,operateType){
	//操作名称
	var operateName;
	if(operateType==1){
		operateName = "启用";
	}else if(operateType==2){
		operateName = "停用";
	}else if(operateType==3){
		operateName = "注销";
	}
	
	//根据用户ID启用/停用/注销用户
	$.confirm({
		title: "提示",
		content: "是否确认"+operateName+"所选用户",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/user/operateUser",
	    			asyn : false,
	    			type : "POST",
	    			data : {"userInfoIds":userInfoIds,"operateType":operateType},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						window.location.href = basePath + "/user/showUserInfoListPage";
	    					}else{
	    						commonUtil.showPopup("提示",dataStr.msg);
	    						return;
	    					}
	    				}else{
	    					commonUtil.showPopup("提示",operateName+"用户服务异常忙，请稍后重试");
	    					return;
	    				}
	    			}
	    		});
	    	},
	        '取消': function () {
	        	
	        }
	    }
	});
}

/**
 * 重置选中密码初始化
 * @author chengzhihuan 2017年5月25日
 */
function resetCheckedPwdPre(){
	//所有选中用户ID
	var userIds = findAllCheckUserIds();
	
	if(userIds==undefined || userIds==""){
		commonUtil.showPopup("提示","请选择需要操作的用户");
		return;
	}
	
	$("#hidden_user_info_ids").val(userIds);
	
	//打开弹框
	$("#passwordReset").modal('show');
}

/**
 * 获取所有选中的用户ID
 * @author chengzhihuan 2017年5月25日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckUserIds(){
	//所有选中用户ID
	var userIds = new Array();
	$(".sub_user_check").each(function(){
		if($(this).is(":checked")){
			userIds.push($(this).attr("data-id"))
		}
	});
	
	return userIds.join(",");
}

/**
 * 重置用户密码
 * @author chengzhihuan 2017年5月25日
 */
function resetPassword(){
	//新密码
	var newPassword = $("#new_password").val();
	if(newPassword==undefined || newPassword==""){
		commonUtil.showPopup("提示","新密码不能为空");
		return;
	}
	
	//确认密码
	var reNewPassword = $("#re_new_password").val();
	if(reNewPassword==undefined || reNewPassword==""){
		commonUtil.showPopup("提示","确认密码不能为空");
		return;
	}
	
	if(newPassword!=reNewPassword){
		commonUtil.showPopup("提示","新密码与确认密码不一致");
		return;
	}
	
	//用户ID
	var userInfoIds = $("#hidden_user_info_ids").val();
	if(userInfoIds==undefined || userInfoIds==""){
		commonUtil.showPopup("提示","所选用户不能为空");
		return;
	}
	
	//重置密码
	$.ajax({
		url : basePath + "/user/resetPassword",
		asyn : false,
		type : "POST",
		data : {"userInfoIds":userInfoIds,"password":newPassword,"rePassword":reNewPassword},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					window.location.href = basePath + "/user/showUserInfoListPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示",operateName+"用户服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 编辑用户
 * @author chengzhihuan 2017年5月26日
 * @param userInfoId 用户ID
 */
function editUserInfo(userInfoId){
	//编辑司机/普通员工信息
	$.ajax({
		url : basePath + "/user/isDriverUser",
		asyn : false,
		type : "POST",
		data : {"userInfoId":userInfoId},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//是否为司机用户
					var isDriverUser = dataStr.isDriverUser;
					if(isDriverUser){
						//司机用户编辑
						addOrEditDriverInfoPage(userInfoId);
					}else{
						//普通员工编辑
						addOrEditEnterpriseUserInfoPage(userInfoId);
					}
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","查询用户类型服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 新增/编辑司机信息初始页
 * @param userInfoId 用户ID
 * @author chengzhihuan 2017年5月22日
 */
function addOrEditDriverInfoPage(userInfoId){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(userInfoId!=undefined && userInfoId!=""){
		operateType = 2;
	}else{
		operateType = 1;
	}
	
	//请求地址
	var url = basePath + "/user/initDriverPage #driver-data-info";
	$("#show_driver_info").load(url,{"userInfoId":userInfoId,"operateType":operateType},function(){})
}

/**
 * 新增/编辑司机信息
 */
function addOrUpdateDriver(){
	
	//TODO 用户名规则
	var userName = $("#driver_user_name").val();
	if(userName==undefined || userName==""){
		commonUtil.showPopup("提示","登录账号不能为空");
		return;
	}
	
	//用户ID
	var userDriverId = $("#hidden_user_driver_id").val();
	//用户ID为空时验证密码
	if(userDriverId==undefined || userDriverId==""){
		//TODO 密码规则
		var password = $("#driver_password").val();
		if(password==undefined || password==""){
			commonUtil.showPopup("提示","密码不能为空");
			return;
		}
	}
	
	//手机号
	var mobilePhone = $("#driver_mobile_phone").val();
	if(mobilePhone==undefined || mobilePhone==""){
		commonUtil.showPopup("提示","手机号不能为空");
		return;
	}
	
	var myreg = /^1[34578]\d{9}$/; 
	if(!myreg.test(mobilePhone)){
		commonUtil.showPopup("提示","请输入有效的手机号");
		return;
	}
	
	//所属组织
	var orgInfoId = $("#enterprise_user_org_info_id").val();
	if(orgInfoId==undefined || orgInfoId==""){
		commonUtil.showPopup("提示","所属组织不能为空");
		return;
	}
	
	//新增/编辑司机信息
	$.ajax({
		url : basePath + "/user/addOrUpdateDriver",
		asyn : false,
		type : "POST",
		data : $('#driver_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#show_driver_info").empty();
					//刷新页面
					window.location.href = basePath + "/user/showUserInfoListPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","保存企业司机信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 新增/编辑企业普通员工信息初始页
 * @param userInfoId 用户ID
 * @author chengzhihuan 2017年5月26日
 */
function addOrEditEnterpriseUserInfoPage(userInfoId){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(userInfoId!=undefined && userInfoId!=""){
		operateType = 2;
	}else{
		operateType = 1;
	}
	
	//请求地址
	var url = basePath + "/user/initEnterpriseUserPage #enterprise-user-data-info";
	$("#show_enterprise_user_info").load(url,{"userInfoId":userInfoId,"operateType":operateType},function(){
		//上传图片初始化
		$('.upload_img').each(function(){
			uploadLoadFile($(this));
		})
	})
}

/**
 * 新增/编辑企业普通员工信息
 * @author chengzhihuan 2017年5月26日
 */
function addOrUpdateEnterpriseUser(){
	//员工姓名
	var realName = $.trim($("#e_user_real_name").val());
	if(realName==undefined || realName==""){
		commonUtil.showPopup("提示","员工姓名不能为空");
		return;
	}
	
	if(realName.length>40){
		commonUtil.showPopup("提示","员工姓名不能超过20个汉字");
		return;
	}
	
	//员工编号
	var personCode = $.trim($("#e_user_person_code").val());
	if(personCode!=undefined && personCode!="" && personCode.length>18){
		commonUtil.showPopup("提示","员工编号不能超过18个字符");
		return;
	}
	
	//登录账号
	var userName = $("#e_user_user_name").val();
	if(userName==undefined || userName==""){
		commonUtil.showPopup("提示","登录账号不能为空");
		return;
	}
	
	//TODO 账户规则
	
	//用户ID
	var userInfoId = $("#hidden_enterprise_user_id").val();
	//用户ID为空时验证密码
	if(userInfoId==undefined || userInfoId==""){
		//TODO 密码规则
		var password = $("#e_user_password").val();
		if(password==undefined || password==""){
			commonUtil.showPopup("提示","密码不能为空");
			return;
		}
	}
	
	//身份证号
	var idCard = $.trim($("#e_user_id_card").val());
	if(idCard==undefined || idCard==""){
		commonUtil.showPopup("提示","身份证号不能为空");
		return;
	}
	
	var cardreg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
	if(!cardreg.test(idCard)){
		commonUtil.showPopup("提示","请输入有效的身份证号");
		return;
	}
	
	//居住地址
	var address = $.trim($("#e_user_address").val());
	if(address!=undefined && address!="" && address.length>160){
		commonUtil.showPopup("提示","居住地址不能超过80个汉字");
		return;
	}
	
	//手机号
	var mobilePhone = $.trim($("#e_user_mobile_phone").val());
	if(mobilePhone==undefined || mobilePhone==""){
		commonUtil.showPopup("提示","手机号不能为空");
		return;
	}
	
	var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/; 
	if(!myreg.test(mobilePhone)){
		commonUtil.showPopup("提示","请输入有效的手机号");
		return;
	}
	
	//邮箱
	var email = $.trim($("#e_user_mail").val());
	var emailreg = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g;
	if(email!=undefined && email!=""&& !emailreg.test(email)){
		commonUtil.showPopup("提示","请输入有效的邮箱地址");
		return;
	}
	
	//所属组织
	var orgInfoId = $("#enterprise_user_org_info_id").val();
	if(orgInfoId==undefined || orgInfoId==""){
		commonUtil.showPopup("提示","所属组织不能为空");
		return;
	}
	
	//身份证(正面)
	var idCardImage = $.trim($("#id_card_image").val());
	if(idCardImage!=undefined && idCardImage!="" && idCardImage.length>200){
		commonUtil.showPopup("提示","身份证(正面)图片存储路径不能超过200个字符");
		return;
	}
	
	//身份证(反面)
	var idCardImageCopy = $.trim($("#id_card_image_copy").val());
	if(idCardImageCopy!=undefined && idCardImageCopy!="" && idCardImageCopy.length>200){
		commonUtil.showPopup("提示","身份证(反面)图片存储路径不能超过200个字符");
		return;
	}
	
	//备注
	var remark = $.trim($("#e_user_remark").val());
	if(remark!=undefined && remark!="" && remark.length>160){
		commonUtil.showPopup("提示","备注信息不能超过80个汉字");
		return;
	}
	
	//新增/编辑司机信息
	$.ajax({
		url : basePath + "/user/addOrUpdateEnterpriseUser",
		asyn : false,
		type : "POST",
		data : $('#enterprise_user_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#show_enterprise_user_info").empty();
					//刷新页面
					window.location.href = basePath + "/user/showUserInfoListPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","保存企业普通员工信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 组织信息初始页
 * @param userInfoId 用户ID
 * @author jiangweiwei 2017年10月9日
 */
function showOrgInfoPage(number){
	var orgInfoId = $("#orgInfoId").val();
	var orgInfoName = $("#orgInfoName").val();
	//请求地址
	var url = basePath + "/user/showOrgInfoPage #org-data-info";
	$("#show-org-data-info").load(url,{
		"page" : number,
		"rows" : 10,
		"orgInfoId" : orgInfoId,
		"orgInfoName" : orgInfoName
		},function(){
			 $("#orgInfoName").val(orgInfoName);
			//允许表格拖着
			$("#tableDrag").colResizable({
				  liveDrag:true, 
				  partialRefresh:true,
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  resizeMode: 'overflow'
			});
		})
}

/**
* 分页查询
* @author jiangww 2017年10月9日
* @param number 页数
*/
function pagerGoto(number) {
	showOrgInfoPage(number);
}

/**
 * 跳转到某页
 * @author jiangww 2017年10月9日
 */
function btnPagerGoto() {
	//取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	//取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	//数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		commonUtil.showPopup("提示","请输出正确的数字");
		return;
	}
	
	//跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	showOrgInfoPage(goPage);
}

/**
 * 选择组织信息
 * @author jiangweiwei 2017年10月9日
 */
function submitSelectOrgInfo(){
		var selectlist = findAllCheck(".sub_org_info_check");
		/*if(selectlist.length==0 || selectlist.length>1) {
	   $.alert("请选择一条数据");
	   //return;
	}*/
//		$("#enterprise_user_org_info_id").val($(this).attr("data-id"));
//		$("#orgName").val($(this).attr("data-name"));
//		$("#orgParentId").val($(this).attr("data-parent-id"));
//		$("#orgParentName").val($(this).attr("data-parent-name"));
		$("#enterprise_user_org_info_id").val(selectlist[0].enterpriseUserOrgInfoId);
		$("#orgName").val(selectlist[0].orgName);
		$("#orgParentId").val(selectlist[0].orgParentId);
		$("#orgParentName").val(selectlist[0].orgParentName);
		$("#org-data-info").empty();

}

/**
 * 查找选择
 */
function findAllCheck(element) {
	var checkList = new Array();
	$(element).each(function() {
		if ($(this).is(":checked")) {
			var params = {
				"enterpriseUserOrgInfoId" : $(this).attr("data-id"),
				"orgName" : $(this).attr("data-name"),
				"orgParentId" : $(this).attr("data-parent-id"),
				"orgParentName" : $(this).attr("data-parent-name")
			}
			checkList.push(params);
		}
	});
	return checkList;
}

//维护司机信息
function whDriverMation(id){
	 $.ajax({
		 url:basePath+"/driverInfo/findDriverRootOrgInfoIdAndUserOrgRootId",
		 data:{"id":id,"sign":2},
		 type:"post",
	     dataType:"json",
	     async:false,
	     success:function(resp){
	    	 if(resp.success){
	    		//请求地址
					var url = basePath + "/driverInfo/updateDriverPage";
					//加载模态框地址
					$("#show_ownDriver_info").load(url,function(){
						//上传图片初始化
						$('.upload_img').each(function(){
							uploadLoadFile($(this));
						})
						$.ajax({
							url:basePath+"/driverInfo/findOwnDriverById",
							data:{"id":id,"sign":2},
							dataType:"json",
							type:"post",
							async:false,
							success:function(resp){
								
								var driverStatus="未分配";
								if(resp.driverStatus==1){
									driverStatus="已分配";
								}
								
								var isAvailable="否";
								if(resp.isAvailable==1){
									isAvailable="是";
								}
								
								$("#ownDriverName").val(resp.driverName);
								$("#ownMobilePhone").val(resp.mobilePhone);
								$("#ownIdCard").val(resp.idCard);
								$("#ownDrivingLicense").val(resp.drivingLicense);
								$("#ownOpeningBank").val(resp.openingBank);
								$("#ownAccountName").val(resp.accountName);
								$("#ownBankAccount").val(resp.bankAccount);
								$("#ownCarCode").val(resp.carCode);
								$("#ownOrgInfoId").val(resp.orgName);
								$("#ownDriverStatus").val(driverStatus);
								$("#ownIsAvailable").val(isAvailable);
								$("#idCardImage").val(resp.idCardImg);
								$("#idCardImageCopy").val(resp.idCardImgCopy);
								$("#driverLicenseImg").val(resp.driverLicenseImg);
								$("#driverLicenseImgCopy").val(resp.driverLicenseImgCopy);
								$("#remarks").text(resp.remarks);
								$("#ownId").val(resp.id);
								
								if(resp.idCardImg){
									$("#myIdCardImage").attr("src",fastdfsServer+'/'+resp.idCardImg);
								}
								
								if(resp.idCardImgCopy){
									$("#myIdCardImageCopy").attr("src",fastdfsServer+'/'+resp.idCardImgCopy);
								}
								
								if(resp.driverLicenseImg){
									$("#myDriverLicenseImg").attr("src",fastdfsServer+'/'+resp.driverLicenseImg);
								}
								
								if(resp.driverLicenseImgCopy){
									$("#myDriverLicenseImgCopy").attr("src",fastdfsServer+'/'+resp.driverLicenseImgCopy);
								}
								
								//添加不可编辑状态
								document.getElementById("ownMobilePhone").readOnly=true;
								document.getElementById("ownOrgInfoId").readOnly=true;
								document.getElementById("ownDriverStatus").readOnly=true;
								document.getElementById("ownIsAvailable").readOnly=true;
								document.getElementById("ownCarCode").readOnly=true;
								
							}
						});
					});
	    	 }else{
	    		 xjValidate.showTip(resp.msg,"提示",true);
	    	 }
	 }
	 });
}

//点击添加修改自有司机信息
function save(){
	//判断司机姓名是否为空
	var driverName=$.trim($("#ownDriverName").val());
	if(driverName==undefined || driverName==""){
		xjValidate.showTip( "司机名称不能为空!");
		return false;
	}
	//司机姓名长度校验
	if(driverName.length>100){
		xjValidate.showTip( "司机名称的长度不能超过50个字符!");
		return false;
	}
	//校验手机号是否为空
	var mobilePhone=$.trim($("#ownMobilePhone").val());
	if(mobilePhone==undefined || mobilePhone==""){
		xjValidate.showTip( "请输入手机号码!");
		return false;
	}
	//验证手机号码是否符合规则
	var myreg = /^1[34578]\d{9}$/; 
	if(!myreg.test(mobilePhone)){
		xjValidate.showTip( "请输入正确的手机号码!");
		return false;
	}
	//校验身份证号是否为空
	var idCard=$.trim($("#ownIdCard").val());
	if(idCard==undefined || idCard==""){
		xjValidate.showTip( "身份证号码不能为空!");
		return false;
	}
	//校验身份证号码是否符合规范
	var myreg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	var re = new RegExp(myreg);
	if(!re.test(idCard)){
		xjValidate.showTip( "请输入正确的身份证号码!");
		return false;
	}
	//校验驾驶证编号是否为空
	var drivingLicense=$.trim($("#ownDrivingLicense").val());
	if(drivingLicense==undefined || drivingLicense==""){
		xjValidate.showTip( "驾驶证编号不能为空!");
		return false;
	}
	//校验驾驶证编号长度
	if(drivingLicense.length>100){
		xjValidate.showTip( "驾驶证编号的长度不能超过50个字符!");
		return false;
	}
	//校验开户行是否为空
	var openingBank=$.trim($("#ownOpeningBank").val());
	if(openingBank==undefined || openingBank==""){
		xjValidate.showTip( "开户行不能为空!");
		return false;
	}
	//校验开户行长度
	if(openingBank.length>100){
		xjValidate.showTip( "开户行的长度不能超过50个字符!");
	}
	//校验开户名是否为空
	var accountName=$.trim($("#ownAccountName").val());
	if(accountName==undefined || accountName==""){
		xjValidate.showTip( "开户名不能为空!");
		return false;
	}
	//校验银行账号是否为空
	var bankAccount=$.trim($("#ownBankAccount").val());
	if(bankAccount==undefined || bankAccount==""){
		xjValidate.showTip( "银行账号不能为空!");
		return false;
	}
	//检验银行长号长度
	if(bankAccount.length>40){
		xjValidate.showTip( "银行账号的长度不能超过20个字符!");
	}
	//校验身份证正面附件是否为空  
	var idCardImage=$.trim($("#idCardImage").val());
	if(idCardImage==undefined || idCardImage==""){
		xjValidate.showTip( "请上传身份证正面附件!");
		return false;
	}
	//检验身份证反面附件
	var idCardImageCopy=$.trim($("#idCardImageCopy").val());
	if(idCardImageCopy==undefined || idCardImageCopy==""){
		xjValidate.showTip( "请上传身份证反面附件!");
		return false;
	}
	//校验司机驾驶证正面附件
	var driverLicenseImg=$.trim($("#driverLicenseImg").val());
	if(driverLicenseImg==undefined || driverLicenseImg==""){
		xjValidate.showTip( "请上传驾驶证正面附件!");
		return false;
	}
	//校验司机驾驶证反面附件
	var driverLicenseImgCopy=$.trim($("#driverLicenseImgCopy").val());
	if(driverLicenseImgCopy==undefined || driverLicenseImgCopy==""){
		xjValidate.showTip( "请上传身份证反面附件!");
		return false;
	}
	//获取当前点击司机ID
	var id=$.trim($("#ownId").val());
	//获取备注信息
	var remarks=$.trim($("#remarks").val());
	//全部验证通过
	$.ajax({
		url:basePath+"/driverInfo/findDriverRootOrgInfoIdAndUserOrgRootId",
		data:{id:id,"sign":1},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			if(resp.success){
				$.ajax({
					url:basePath+"/driverInfo/updateOwnDriverInformation",
					data:$("#updateDriverInfo").serialize(),
					dataType:"json",
					type:"post",
					async:false,
					success:function(resp){
						if(resp.success){
							$.alert(resp.msg,"提示",true);
							$("#show_ownDriver_info").html("");
						}else{
							$.alert(resp.msg,"提示",true);
						}
					}
				});
			}else{
				$.alert(resp.msg,"提示",true);
			}
		}
	});
}

//关闭维护司机模态框
function closeButton(){
	$("#show_ownDriver_info").html("");
	$("#show_department_info").html("");
}