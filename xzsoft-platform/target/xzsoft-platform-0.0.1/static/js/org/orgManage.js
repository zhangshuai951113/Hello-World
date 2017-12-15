$(function(){
	//搜索
	searchOrgInfo(1);
	
	//编辑子机构/部门
	$("body").on("click",".modify-operation",function(){
		var orgInfoId = $(this).parent().attr("org-info-id");
		//主键ID存在则进行编辑
		if(orgInfoId && orgInfoId!=""){
			editSubOrgOrDepartment(orgInfoId);
		}
	});
	
	//删除子机构/部门
	$("body").on("click",".delete-operation",function(){
		//组织ID
		var orgInfoId = $(this).parent().attr("org-info-id");
		
		$.confirm({
			title: "提示",
			content: "是否确认删除该组织",
			buttons: {
		    	'确认': function () {
		    		//主键ID存在则进行编辑
		    		if(orgInfoId){
		    			deleteSubOrgOrDepartment(orgInfoId);
		    		}
		    	},
		        '取消': function () {
		        	
		        }
		    }
		});
	});
	
	//关闭弹框
	$("body").on("click",".department-opt-close",function(){
		$("#show_department_info").empty();
	});
	
	//停用弹窗初始化
	$("body").on("click",".disable-operation",function(){
		//初始化模板描述
		$("#myModalLabel").html("组织停用");
		$("#modal_opearate_title").html("停用原因:");
		$("#modal_opearate_reason").val("");
		$("#modal_opearate_reason").attr("placeholder","请输入停用原因");
		$("#modal_org_info_id").attr("operate-type",2);
		
		var orgInfoId = $(this).parent().attr("org-info-id");
		//主键ID存在则进行编辑
		if(orgInfoId){
			$("#modal_org_info_id").val(orgInfoId);
		}
	});
	
	//启用弹窗初始化
	$("body").on("click",".enabled-operation",function(){
		//初始化模板描述
		$("#myModalLabel").html("组织启用");
		$("#modal_opearate_title").html("启用原因:");
		$("#modal_opearate_reason").val("");
		$("#modal_opearate_reason").attr("placeholder","请输入启用原因");
		$("#modal_org_info_id").attr("operate-type",1);
		
		var orgInfoId = $(this).parent().attr("org-info-id");
		//主键ID存在则进行编辑
		if(orgInfoId){
			$("#modal_org_info_id").val(orgInfoId);
		}
	});
	
	//注销弹窗初始化
	$("body").on("click",".logout-operation",function(){
		//初始化模板描述
		$("#myModalLabel").html("组织注销");
		$("#modal_opearate_title").html("注销原因:");
		$("#modal_opearate_reason").val("");
		$("#modal_opearate_reason").attr("placeholder","请输入注销原因");
		$("#modal_org_info_id").attr("operate-type",3);
		
		var orgInfoId = $(this).parent().attr("org-info-id");
		//主键ID存在则进行编辑
		if(orgInfoId){
			$("#modal_org_info_id").val(orgInfoId);
		}
	});
	
	
});

/**
 * 分页查询
 * @author chengzhihuan 2017年5月18日
 * @param number 页数
 */
function pagerGoto(number) {
	searchOrgInfo(number);
}


/**
 * 跳转到某页
 * @author chengzhihuan 2017年5月18日
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
	
	searchOrgInfo(goPage);
}

/**
 * 根据页数查询机构
 * @author chengzhihuan 2017年5月18日
 * @param number 页数
 */
function searchOrgInfo(number){
	//组织名称
	var orgName = $.trim($("#orgName").val());
	//统一社会信用代码
	var creditCode = $.trim($("#creditCode").val());
	//启用状态
	var isAvailable = $("#isAvailable").val();
	//组织类型
	var orgType = $("#orgType").val();
	//审核状态
	var orgStatus = $("#orgStatus").val();

	//请求地址
	var url = basePath + "/orgInfo/listOrgInfo #org_info";
	$("#search_org_info").load(url,
		{"page":number,"rows":10,"orgName":orgName,"creditCode":creditCode,
		"isAvailable":isAvailable,"orgType":orgType,"orgStatus":orgStatus},
		function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
				  liveDrag:true, 
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  ifDel: 'tableDrag'
			});
		})
	}

/**
 * 跳转到子机构新增页面
 * @author chengzhihuan 2017年5月22日
 */
function addSubOrgInfoPage(){
	$("#hidden_sub_operate_type").val(1);
	$("#form_sub_org_opt").attr("action",basePath+"/orgInfo/initSubOrgInfoPage");
	$("#form_sub_org_opt").submit();
}

/**
 * 编辑子机构/部门
 * @author chengzhihuan 2017年5月22日
 * @param orgInfoId 组织ID
 */
function editSubOrgOrDepartment(orgInfoId){
	//1、校验是否为机构
	$.ajax({
		url : basePath + "/orgInfo/isSubOrg",
		asyn : false,
		type : "POST",
		data : {"orgInfoId":orgInfoId},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					var isSubOrg = dataStr.isSubOrg;
					
					//2、子机构跳转子机构编辑页，部门跳转部门编辑页
					if(isSubOrg){
						//子机构编辑
						$("#hidden_sub_operate_type").val(2);
						$("#hidden_sub_org_info_id").val(orgInfoId);
						$("#form_sub_org_opt").attr("action",basePath+"/orgInfo/initSubOrgInfoPage");
						$("#form_sub_org_opt").submit();
					}else{
						addOrEditDepartmentInfoPage(orgInfoId);
					}
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","查询组织信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 删除子机构/部门
 * @author chengzhihuan 2017年5月22日
 * @param orgInfoId 组织ID
 */
function deleteSubOrgOrDepartment(orgInfoId){
	//删除组织
	$.ajax({
		url : basePath + "/orgInfo/deleteOrgInfo",
		asyn : false,
		type : "POST",
		data : {"orgInfoId":orgInfoId},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//commonUtil.showPopup("提示","删除成功");
					window.location.href = basePath+"/orgInfo/showOrgInfoListPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","查询组织信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 新增/编辑部门信息初始化页
 * @param orgInfoId 组织ID
 * @author chengzhihuan 2017年5月22日
 */
function addOrEditDepartmentInfoPage(orgInfoId){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(orgInfoId!=undefined && orgInfoId!=""){
		operateType = 2;
	}else{
		operateType = 1;
	}
	
	//请求地址
	var url = basePath + "/orgInfo/initDepartmentPage #department-data-info";
	$("#show_department_info").load(url,{"orgInfoId":orgInfoId,"operateType":operateType},function(){})
}

/**
 * 新增/编辑保存部门信息
 * @author chengzhihuan 2017年5月22日
 */
function saveDepartmentOpt(){
	//1、部门名称校验
	var orgName = $.trim($("#department_org_name").val());
	if(orgName==undefined || orgName==""){
		commonUtil.showPopup("提示","部门名称不能为空");
		return;
	}
	
	if(orgName.length>70){
		commonUtil.showPopup("提示","部门名称不能超过35个汉字");
		return;
	}
	
	//2、所属组织校验
	var parentOrgInfoId = $("#department_parent_org_info_id").val();
	if(parentOrgInfoId==undefined || parentOrgInfoId==""){
		commonUtil.showPopup("提示","所属组织不能为空");
		return;
	}

	//3、联系人校验
	var contactName = $.trim($("#department_contact_name").val());
	if(contactName!=undefined && contactName!="" && contactName.length>40){
		commonUtil.showPopup("提示","联系人姓名不能超过20个汉字");
		return;
	}
	
	//4、移动电话校验
	var mobilePhone = $.trim($("#department_mobile_phone").val());
	var myreg = /^1[34578]\d{9}$/; 
	if(mobilePhone!=undefined && mobilePhone!="" && !myreg.test(mobilePhone)){
		commonUtil.showPopup("提示","请输入有效的手机号");
		return;
	}
	
	//5、固定电话校验
	var telephone = $.trim($("#department_telephone").val());
	var telereg = /^((0\d{2,3})-)(\d{7,8})$/;
	if(telephone!=undefined && telephone!="" && !telereg.test(telephone)){
		commonUtil.showPopup("提示","请输入有效的固定电话");
		return;
	}
	
	//6、保存部门信息
	$.ajax({
		url : basePath + "/orgInfo/addOrUpdateDepartment",
		asyn : false,
		type : "POST",
		data : $('#department_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//commonUtil.showPopup("提示","保存成功");
					//关闭弹框
					$("#show_department_info").empty();
					//刷新页面
					window.location.href = basePath+"/orgInfo/showOrgInfoListPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","保存部门信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 启用/停用/注销组织信息
 * @author chengzhihuan 2017年5月23日
 */
function operateSubOrgInfo(){
	//操作类型
	var operateType = $("#modal_org_info_id").attr("operate-type");
	if(operateType==undefined || operateType==""){
		commonUtil.showPopup("提示","操作类型不能为空");
		return;
	}
	
	//操作名称
	var operateName;
	if(operateType==1){
		operateName = "启用";
	}else if(operateType==2){
		operateName = "停用";
	}else if(operateType==3){
		operateName = "注销";
	}else{
		commonUtil.showPopup("提示","未知操作");
		return;
	}
	
	//操作组织
	var orgInfoId = $("#modal_org_info_id").val();
	if(orgInfoId==undefined || orgInfoId==""){
		commonUtil.showPopup("提示","组织不能为空");
		return;
	}

	//操作原因
	var operateReason = $.trim($("#modal_opearate_reason").val());
	if(operateReason==undefined || operateReason==""){
		commonUtil.showPopup("提示","组织"+operateName+"原因不能为空");
		return;
	}
	
	if(operateReason.length>160){
		commonUtil.showPopup("提示","组织"+operateName+"原因不能超过80个汉字");
		return;
	}
	
	//启用/停用/注销组织
	$.ajax({
		url : basePath + "/orgInfo/operateSubOrgInfo",
		asyn : false,
		type : "POST",
		data : {"orgInfoId":orgInfoId, "operateType":operateType, "operateReason":operateReason},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//commonUtil.showPopup("提示",operateName+"成功");
					//关闭弹框
					$('#disableModal').modal('hide');
					//刷新页面
					window.location.href = basePath+"/orgInfo/showOrgInfoListPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示",operateName+"组织服务异常忙，请稍后重试");
				return;
			}
		}
	});
}