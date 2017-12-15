//承运方查询
function shipperList(number) {
	$("#shipperTBody").html("");
	$.ajax({
		url : "getShipperData",
		data : {
			'cooperateStatus' : $("#cooperate_status").val(),
			'orgName' : $("#shipperNameQuery").val(),
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
				tr+="<td><input type='checkbox' class='sub_shipper_check' orgInfoId="+ele.id+" orgName="+ele.orgName+" rootOrgInfoId="+ele.rootOrgInfoId+" rootOrgName="+ele.rootOrgName+"></td>";
				tr += "<td>" + ele.orgName + "</td>";
				tr += "<td>" + ele.rootOrgName + "</td>";

				// 将tr追加
				$("#shipperTBody").append(tr);

			});
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url : "getShipperCount",
		type : "post",
		data : {'cooperateStatus' : $("#cooperate_status").val(),'orgName' : $("#shipperNameQuery").val()},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			shipperPagination.setTotalItems(resp);
			$("#panel-num-shipper").text("搜索结果共" + resp + "条");
		}
	});
}

// 分页
var shipperPagination = $(".pagination-list-shipper").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		shipperList(current);
	}
});

function shipperJumpPage(e) {
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
	shipperPagination.setCurrentPage(value);
}

//绑定承运方输入框
$("body").on("click", "#shipper_name", function() {
	$("#shipperNameQuery").val(null);
	$("#shipperSelectModal").modal('show');
	shipperList(1);
});

// 承运方选择列表单选模式
$("body").on("click", ".sub_shipper_check", function() {
	var isChecked = $(this).is(":checked");
	$(".sub_shipper_check").prop("checked", false);
	if (isChecked) {
		$(this).prop("checked", isChecked);
	} else {
		$(this).prop("checked", isChecked);
	}
});


// 承运方选择确认

function shipperSelect() {
	$(".sub_shipper_check").each(function() {
		if ($(this).is(":checked")) {
			$("#shipper_name").val($(this).attr("orgName"));
			$("#shipper").val($(this).attr("orgInfoId"));
			$("#shipper_org_root_name").val($(this).attr("rootOrgName"));
			$("#shipper_org_root").val($(this).attr("rootOrgInfoId"));
			return false;
		}
	});
	$("#shipperSelectModal").modal('hide');
}