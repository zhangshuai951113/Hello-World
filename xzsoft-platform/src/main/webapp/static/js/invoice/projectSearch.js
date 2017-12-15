//项目信息查询
function projectList(number) {
	//项目名称
	//var carCode = $.trim($("#ci_car_code").val());
	
	$("#projectTBody").html("");
	$.ajax({
		url : "getProjectData",
		data : {
			'page' : number,
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
				tr+="<td><input type='checkbox' class='sub_project_check' projectInfoId="+ele.id+" projectId="+ele.projectId+" projectName="+ele.projectName+"></td>";
				tr += "<td>" + ele.id + "</td>";
				tr += "<td>" + ele.projectId + "</td>";
				tr += "<td>" + ele.projectName + "</td>";

				// 将tr追加
				$("#projectTBody").append(tr);

			});
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url : "getProjectCount",
		type : "post",
		data : {},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			projectPagination.setTotalItems(resp);
			$("#panel-num-project").text("搜索结果共" + resp + "条");
		}
	});

}

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

