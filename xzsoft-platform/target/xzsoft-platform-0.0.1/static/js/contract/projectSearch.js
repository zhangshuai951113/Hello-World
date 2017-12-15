var whooseProject ="";
//项目信息查询
function projectList(number) {
	$("#projectTBody").html("");
	$.ajax({
		url : basePath + "/projectInfo/getProjectData",
		data : {
			'page' : number,
			'projectName':$("#projectNameQuery").val(),
			'rows' : 10
		},
		dataType : "json",
		type : "post",
		async : false,
		success : function(resp) {
			var objs = eval(resp);
			$.each(objs, function(index, ele) {
				// 追加数据
				var tr = "";
				tr += "<tr class='table-body' align='center'>";
				tr+="<td><input type='checkbox' class='sub_project_check' projectId="+ele.id+" projectName="+ele.projectName+" projectOrgName="+ele.orgInfoName+"></td>";
				tr += "<td>" + ele.projectId + "</td>";
				tr += "<td>" + ele.projectName + "</td>";
				tr += "<td>" + ele.orgInfoName + "</td>";

				// 将tr追加
				$("#projectTBody").append(tr);

			});
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url : basePath + "/projectInfo/getProjectCount",
		type : "post",
		data : {'projectName':$("#projectNameQuery").val()},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			projectPagination.setTotalItems(resp);
			$("#projectAmount").text("搜索结果共" + resp + "条");
		}
	});

}

//重置按钮
function resetProject(){
	setTimeout(function(){
		projectList(1);
	},500);
}

//分页
var projectPagination = $(".project-pagination-list").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		projectList(current);
	}
});

function projectJumpPage(e) {
	var totalPage = parseInt((parent.getTotalRecords + 9) / 10);
	var myreg = /^[0-9]+.?[0-9]*$/;
	var re = new RegExp(myreg);
	var number = $(e).prev().find('input').val();
	if (!re.test(number)) {
		commonUtil.showPopup("提示", "请输入正确的数字!");
		$(e).prev().find('input').val("");
		return false;
	}
	var value = parseInt(number);
	if (value < 1) {
		$(e).prev().find('input').val("1")
		value = 1;
	}
	if (value >= totalPage) {
		$(e).prev().find('input').val(totalPage);
		value = totalPage;
	}
	projectPagination.setCurrentPage(value);
}

/**
 * 添加项目弹出框
 */
function projectsShow() {
	$("#projectSelectModal").modal('show');
	projectList(1);
}

//绑定委托方项目输入框(项目填写与确认项目共用)
$("body").on("click", "#entrust_project_name", function() {
	whooseProject="0";
	projectsShow();
});
//绑定承运方项目输入框(项目填写与确认项目共用)
$("body").on("click", "#shipper_project_name", function() {
	whooseProject="1";
	projectsShow();
});

//设置项目列表单选模式
$("body").on("click", ".sub_project_check", function() {
	var isChecked = $(this).is(":checked");
	$(".sub_project_check").prop("checked", false);
	if (isChecked) {
		$(this).prop("checked", isChecked);
	} else {
		$(this).prop("checked", isChecked);
	}
});

//项目选择确认  type 0 新增修改时的委托方或承运方项目 1 确认时的的委托方或承运方项目
function projectSelect() {
	$(".sub_project_check").each(function() {
		if ($(this).is(":checked")) {
			if(type == "0"){
				if(whooseProject =="0"){
					//委托方项目
					$("#entrust_project_name").val($(this).attr("projectName"));
					$("#entrust_project").val($(this).attr("projectId"));
					$("#entrust_project_org_name").val($(this).attr("projectOrgName"));
				}else{
					//承运方项目
					$("#shipper_project_name").val($(this).attr("projectName"));
					$("#shipper_project").val($(this).attr("projectId"));
					$("#shipper_project_org_name").val($(this).attr("projectOrgName"));
				}
			}else{
				$("#projectName").text($(this).attr("projectName"));
				$("#projectId").val($(this).attr("projectId"));
			}
			$("#projectSelectModal").modal('hide');
			$("#projectNameQuery").val(null);
			return false;
		}
	});
}

//提交确认信息
function submitCommit(result) {
	//校验操作类型
	if(result ==undefined || result==""){
		commonUtil.showPopup("提示", "操作类型不能为空!");
		return;
	}
	//校验项目
	var projectName = $("#projectName").text();
	if(projectName ==undefined || projectName==""){
		commonUtil.showPopup("提示", "承运方项目不能为空!");
		return;
	}
	var projectId = $("#projectId").val();
	if(projectId ==undefined || projectId==""){
		commonUtil.showPopup("提示", "承运方项目不能为空!");
		return;
	}
	//校验合同ID
	var contractInfoId = $("#contract_id").val();
	if(contractInfoId ==undefined || contractInfoId==""){
		commonUtil.showPopup("提示", "请选择待确认的合同!");
		return;
	}
	//校验确认意见
	var confirmOpinion = $("#confirm_opinion").val();
	if(confirmOpinion ==undefined || confirmOpinion==""){
		commonUtil.showPopup("提示", "确认意见不能为空!");
		return;
	}
	//提交信息
		$.ajax({
			url : basePath + "/contractInfo/contractInfoConfirm",
			asyn : false,
			type : "POST",
			data : {
				"contractInfoId" : contractInfoId,
				"confirmOpinion" : confirmOpinion,
				"projectId" : projectId,
				"result" : result
			},
			dataType : "json",
			success : function(dataStr) {
				if (dataStr) {
					if (dataStr.success) {
						confirmModalClose();
						commonUtil.showPopup("提示", dataStr.msg);
						searchContractInfo(1);
						//消息刷新---zhangbo加
						readyMessages();
					} else {
						commonUtil.showPopup("提示", dataStr.msg);
						return;
					}
				} else {
					commonUtil.showPopup("提示", "合同确认服务异常忙，请稍后重试");
					return;
				}
			}
		});
}
//关闭项目选择框
function confirmModalClose() {
	$("#confirmModal").modal("hide");
}
