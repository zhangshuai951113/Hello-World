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
				tr+="<td><input type='checkbox' class='sub_project_check' projectId="+ele.id+" projectName="+ele.projectName+"></td>";
				tr += "<td>" + ele.projectId + "</td>";
				tr += "<td>" + ele.projectName + "</td>";

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
			$("#bidding_project_name").val($(this).attr("projectName"));
			$("#bidding_project").val($(this).attr("projectId"));
			$("#projectSelectModal").modal('hide');
			$("#projectNameQuery").val(null);
			return false;
		}
	});
}

//关闭项目选择框
function confirmModalClose() {
	$("#confirmModal").modal("hide");
}
