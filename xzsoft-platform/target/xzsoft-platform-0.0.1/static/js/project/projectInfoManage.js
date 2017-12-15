// 组织选择
var orgInfoPage = null;

// 请求是否正在进行中
var ajaxing = false;

$(function() {
	// 搜索
	searchProjectInfo(1);

	// 全选/全不选
	$("body").on("click", ".all_check", function() {

		if ($(".all_check").is(":checked")) {
			// 全选时
			$(".sub_check").each(function() {
				$(this).prop("checked", true);
			});
		} else {
			// 全不选时
			$(".sub_check").each(function() {
				$(this).prop("checked", false);
			});
		}
	});

	// 部分选择判断
	$("body").on("click", ".sub_check", function() {
		var isAll = true;
		$(".sub_check").each(function() {
			if ($(this).is(":checked")) {
				$(this).prop("checked", true);
			} else {
				$(this).prop("checked", false);
			}
			if (!$(this).prop("checked")) {
				isAll = false;
			}
		});
		$(".all_check").prop("checked", isAll);
	});

	// 关闭编辑窗口
	$("body").on("click", ".project-info-opt-close", function() {
		$("#show_project_info").empty();
	});
	
	//关闭组织弹框
	$("body").on("click",".org-opt-close",function(){
		$("#show-org-data-info").empty();
	});

	// 编辑项目信息
	$("body").on("click", ".modify-operation", function() {
		// 项目ID
		var projectInfoId = $(this).parent().attr("project-info-id");
		if (projectInfoId && projectInfoId != "") {
			addOrEditProjectInfoPage(projectInfoId);
		}
	});
	// 删除项目
	$("body").on("click", ".delete-operation", function() {
		// 项目ID
		var projectInfoId = $(this).parent().attr("project-info-id");
		if (projectInfoId && projectInfoId != "") {
			deleteProjectInfo(projectInfoId);
		}
	});
});

/**
 * 分页查询
 * 
 * @author zhangya 2017年6月12日
 * @param number
 *            页数
 */
function pagerGoto(number) {
	searchProjectInfo(number);
}
function loadOrgInfoPage(){
	loadOrgInfo(1);
}
/**
 * 跳转到某页
 * 
 * @author zhangya 2017年6月12日
 */
function btnPagerGoto() {
	// 取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	// 取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	// 数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		commonUtil.showPopup("提示", "请输出正确的数字");
		return;
	}

	// 跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}

	searchProjectInfo(goPage);
}

/**
 * 根据页数查询项目信息
 * 
 * @author zhangya 2017年6月22日
 * @param number
 *            页数
 */
function searchProjectInfo(number) {
	// 项目编号
	var projectId = $.trim($("#projectId").val());
	// 项目名称
	var projectName = $.trim($("#projectName").val());
	// 所属组织
	var orgInfoId = $.trim($("#orgInfoId").val());
	// 请求地址
	var url = basePath + "/projectInfo/listProjectInfo #project-info-data";
	$("#search-project-info").load(url, {
		"page" : number,
		"rows" : 10,
		"projectId" : projectId,
		"orgInfoId" : orgInfoId,
		"projectName" : projectName
	}, function() {
		
		// 允许表格拖着
		$("#tableDrag").colResizable({
			liveDrag : true,
			gripInnerHtml : "<div class='grip'></div>",
			draggingClass : "dragging",
			 ifDel: 'tableDrag'
		});
	});
}

/**
 * 删除勾选有价券类型
 * 
 * @returns
 */
function deleteCheckedProject() {
	// 所有选中项目ID
	var ProjectInfoIds = findAllCheckProjectInfoIds();
	if (ProjectInfoIds == undefined || ProjectInfoIds == "") {
		commonUtil.showPopup("提示", "请选择需要删除的项目");
		return;
	}

	//删除项目
	deleteProjectInfo(ProjectInfoIds);
}

/**
 * 获取所有选中的项目ID
 * 
 * @author zhangya 2017年6月13日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckProjectInfoIds() {
	// 所有选中项目ID
	var projectInfoIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			projectInfoIds.push($(this).attr("data-id"))
		}
	});

	return projectInfoIds.join(",");
}

/**
 * 新增/编辑项目信息初始页
 * 
 * @param projectInfoId
 *           项目信息ID
 * @author zhangya 2017年6月12日
 */
function addOrEditProjectInfoPage(projectInfoId) {
	// 请求地址
	var url = basePath
			+ "/projectInfo/addOrEditProjectInfoPage #project-info";
	$("#show_project_info").load(url, {
		"projectInfoId" : projectInfoId
	}, function() {
	})
}

/**
 * 保存项目信息
 */
function saveProjectInfo() {

	// 项目编号
	var projectId = $("#project_id").val();
	if (projectId == undefined || projectId == "") {
		commonUtil.showPopup("提示", "项目编号不能为空");
		return;
	}

	// 项目名称
	var projectName = $("#project_name").val();
	if (projectName == undefined || projectName == "") {
		commonUtil.showPopup("提示", "项目名称不能为空");
		return;
	}
	
	// 所属组织
	var orgInfoId = $("#org_info_id").val();
	if (orgInfoId == undefined || orgInfoId == "") {
		commonUtil.showPopup("提示", "所属组织不能为空");
		return;
	}

	$.ajax({
		url : basePath + "/projectInfo/addOrUpdateProjectInfo",
		asyn : false,
		type : "POST",
		data : $('#project_info_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					$("#show_project_info").empty();
					commonUtil.showPopup("提示", dataStr.msg);
					// 刷新数据
					searchProjectInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存项目信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

// 删除项目信息
function deleteProjectInfo(projectInfoIds) {
	// 校验项目ID
	if (projectInfoIds == null) {
		commonUtil.showPopup("提示", "所选项目信息不能为空！");
		return;
	}
	$.confirm({
		title : "提示",
		content : "是否确认删除所选项目",
		buttons : {
			'确认' : function() {
				$.ajax({
					url : basePath + "/projectInfo/deleteProjectInfo",
					asyn : false,
					type : "POST",
					data : {
						"projectInfoIds" : projectInfoIds
					},
					dataType : "json",
					success : function(dataStr) {
						if (dataStr) {
							if (dataStr.success) {
								commonUtil.showPopup("提示", dataStr.msg);
								searchProjectInfo(1);
							} else {
								commonUtil.showPopup("提示", dataStr.msg);
								return;
							}
						} else {
							commonUtil.showPopup("提示", "删除项目服务异常，请稍后重试");
							return;
						}
					}
				});
			},
			'取消' : function() {

			}
		}
	});
}

/**
 * 组织信息初始页
 * @param userInfoId 用户ID
 * @author jiangweiwei 2017年10月9日
 */
//function showOrgInfoPage(number){
//	var orgInfoId = $("#orgInfoId").val();
//	var orgInfoName = $("#orgInfoName").val();
//	//请求地址
//	var url = basePath + "/projectInfo/showOrgInfoPage #org-data-info";
//	$("#show-org-data-info").load(url,{
//		"page" : number,
//		"rows" : 10,
//		"orgInfoId" : orgInfoId,
//		"orgInfoName" : orgInfoName
//	},function(){
//		//初始化运单列表page页面
//		orgInfoPage = $("#orgInfoPage").operationList({
//			"current" : 1, //当前目标
//			"maxSize" : 4, //前后最大列表
//			"itemPage" : 10, //每页显示多少条
//			"totalItems" : 0, //总条数
//			"chagePage" : function(current) {
//				//调用ajax请求拿最新数据
//				getWaybillList();
//			}
//		});
//		
//		//允许表格拖着
//		$("#orgInfoTable").colResizable({
//			  liveDrag:true, 
//			  partialRefresh:true,
//			  gripInnerHtml:"<div class='grip'></div>", 
//			  draggingClass:"dragging",
//			  resizeMode: 'overflow'
//		});
//	});
//}


function showOrgInfoPage(){
	
	
	//初始化组织列表page页面
	orgInfoPage = $("#orgInfoPage").operationList({
		"current" : 1, //当前目标
		"maxSize" : 4, //前后最大列表
		"itemPage" : 10, //每页显示多少条
		"totalItems" : 0, //总条数
		"chagePage" : function(current) {
			//调用ajax请求拿最新数据
			loadOrgInfo(current);
		}
	});
	loadOrgInfo(1);
	
}
/**
 * 加载组织页面数据
 */
function loadOrgInfo(current){
	orgInfoPage.options.current = current;
	
	var orgInfoId = $("#orgInfoId").val();
	var orgInfoName = $("#orgInfoName").val();
	
	var params = {
		"orgInfoId" : orgInfoId,
		"orgInfoName" : orgInfoName,
		"page" : orgInfoPage.options.current,
		"rows" : orgInfoPage.options.itemPage
	};
	 
	// 查询数据
	$.ajax({
		url : basePath + "/projectInfo/getOrgInfoData",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(resp) {
			if (resp) {
				if (resp.success) {
					console.log(resp);
					$("#orgInfoSelectModal").modal("show");
					// 处理数据
					var total = resp.total;
					var list = resp.list;
					if (list == null || list == undefined || list.length == null || list.length == undefined) {
						length = 0;
					} else {
						length = list.length;		
					}
					var html = '';
					for(var i = 0; i < length; i++){
						var info = list[i];
						html += '<tr class="table-body ">';
						html += '<td>';
						html += '<label class="i-checks"> ';
						html += '<input class="sub_org_info_check" type="checkbox" data-id="'+info.id+'" data-name="'+info.orgName+'" data-parent-id="'+info.parentOrgInfoId+'" data-parent-name="'+info.parentOrgName+'">';
						html += '</label>';
						html += '</td>';
						html += '<td>'+info.orgName+'</td>';
						html += '<td>'+info.parentOrgName+'</td>';
						html += '</tr>';
					} 
					$("#orgInfoTbody").html(html);
					$("#orgInfoNum").text(total);
					orgInfoPage.setTotalItems(total);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
				}
			} else {
				commonUtil.showPopup("提示", "服务异常忙，请稍后重试");
			}
		},
		error:function(){commonUtil.showPopup("提示", "服务请求失败");},
		complete:function(){ajaxing = false;}
	});
}
/**
 * 组织页面跳转
 */
function orgInfoPageJump(e) {
	var value = $(e).prev().find('input').val();
	linePage.setCurrentPage(value);
}



/**
 * 选择组织信息
 * @author jiangweiwei 2017年10月9日
 */
function submitSelectOrgInfo(){
		var selectlist = findAllCheck(".sub_org_info_check");
		
		if (selectlist.length == 0 || selectlist.length > 1) {
			commonUtil.showPopup("提示", "请选择一条数据");
			return false;
		}
		/*if(selectlist.length==0 || selectlist.length>1) {
	   $.alert("请选择一条数据");
	   //return;
	}*/
//		$("#enterprise_user_org_info_id").val($(this).attr("data-id"));
//		$("#orgName").val($(this).attr("data-name"));
//		$("#orgParentId").val($(this).attr("data-parent-id"));
//		$("#orgParentName").val($(this).attr("data-parent-name"));
		console.log(selectlist[0]);
		$("#org_info_id").val(selectlist[0].enterpriseUserOrgInfoId);
		$("#orgName").val(selectlist[0].orgName);
		$("#orgParentId").val(selectlist[0].orgParentId);
		$("#orgParentName").val(selectlist[0].orgParentName);
		//$("#org-data-info").empty();
		$("#orgInfoSelectModal").modal("hide");
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

