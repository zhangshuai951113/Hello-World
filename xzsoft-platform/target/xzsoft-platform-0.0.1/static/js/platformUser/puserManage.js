$(function(){
	//搜索
	searchUserInfo(1);
	
	//启用用户
	$("body").on("click",".enabled-operation",function(){
		//用户ID
		var userInfoId = $(this).parent().attr("user-info-id");
		operatePuser(userInfoId,1);
	});
	
	//停用用户
	$("body").on("click",".disable-operation",function(){
		//用户ID
		var userInfoId = $(this).parent().attr("user-info-id");
		operatePuser(userInfoId,2);
	});
	
	//注销用户
	$("body").on("click",".logout-operation",function(){
		//用户ID
		var userInfoId = $(this).parent().attr("user-info-id");
		operatePuser(userInfoId,3);
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
	
	//关闭弹框
	$("body").on("click",".puser-info-opt-close",function(){
		$("#show_puser_info").empty();
	});
	
	
	//编辑用户
	$("body").on("click",".modify-operation",function(){
		//用户ID
		var userInfoId = $(this).parent().attr("user-info-id");
		if(userInfoId && userInfoId!=""){
			addOrEditPuserPage(userInfoId);
		}
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
 * @author qiutianhui 2017年8月3日
 * @param number 页数
 */
function searchUserInfo(number){
	//用户名
	var userName = $.trim($("#userName").val());
	//手机号
	var mobilePhone = $.trim($("#mobilePhone").val());
	//启用状态
	var isAvailable = $("#isAvailable").val();
	//注销状态
	var userState = $("#userState").val();
	
	var data={
			"userName":userName,
			"mobilePhone":mobilePhone,
			"isAvailable":isAvailable,
			"userState":userState,
			"page":number,
			"rows":10
	};

	//请求地址
	var url = basePath + "/user/puserList #puser-info-data";
	$("#search-puser-info").load(url,data,
		function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
			  liveDrag:true, 
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging"
			});
		});
	
	$.ajax({
		 url:"getCountPusers",
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
	operatePuser(userIds,operateType);
}

/**
 * 根据用户ID启用/停用/注销用户
 * @author chengzhihuan 2017年5月25日
 * @param userInfoIds 用户ID集合，逗号分隔
 * @param operateType 操作类型 1:启用 2:停用 3:注销
 */
function operatePuser(userInfoIds,operateType){
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
	    			url : basePath + "/user/operatePuser",
	    			asyn : false,
	    			type : "POST",
	    			data : {"userInfoIds":userInfoIds,"operateType":operateType},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						window.location.href = basePath + "/user/showPuserListPage";
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
		url : basePath + "/user/resetPuserPassword",
		asyn : false,
		type : "POST",
		data : {"userInfoIds":userInfoIds,"password":newPassword,"rePassword":reNewPassword},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					window.location.href = basePath + "/user/showPuserListPage";
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
 * 新增/编辑用户信息初始页
 * @param userInfoId 用户ID
 * @author chengzhihuan 2017年5月22日
 */
function addOrEditPuserPage(userInfoId){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(userInfoId!=undefined && userInfoId!=""){
		operateType = 2;
	}else{
		operateType = 1;
	}
	
	//请求地址
	var url = basePath + "/user/initPuserPage #puser-data-info";
	$("#show_puser_info").load(url,{"userInfoId":userInfoId,"operateType":operateType},function(){})
}

/**
 * 新增/编辑用户信息
 */
function addOrUpdatePuser(){
	
	//TODO 用户名规则
	var userName = $("#puser_user_name").val();
	if(userName==undefined || userName==""){
		commonUtil.showPopup("提示","登录账号不能为空");
		return;
	}
	
	//用户ID
	var puserId = $("#hidden_user_puser_id").val();
	//用户ID为空时验证密码
	if(puserId==undefined || puserId==""){
		//TODO 密码规则
		var password = $("#puser_password").val();
		if(password==undefined || password==""){
			commonUtil.showPopup("提示","密码不能为空");
			return;
		}
	}
	
	//手机号
	var mobilePhone = $("#puser_mobile_phone").val();
	if(mobilePhone==undefined || mobilePhone==""){
		commonUtil.showPopup("提示","手机号不能为空");
		return;
	}
	
	var myreg = /^1[34578]\d{9}$/; 
	if(!myreg.test(mobilePhone)){
		commonUtil.showPopup("提示","请输入有效的手机号");
		return;
	}
	
	
	//新增/编辑用户信息
	$.ajax({
		url : basePath + "/user/addOrUpdatePuser",
		asyn : false,
		type : "POST",
		data : $('#puser_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#show_puser_info").empty();
					//刷新页面
					window.location.href = basePath + "/user/showPuserListPage";
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