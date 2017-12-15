//委托方查询
function entrustList(number) {
	$("#entrustTBody").html("");
	$.ajax({
		url : "getEntrustData",
		data : {
			'cooperateStatus' : $("#cooperate_status").val(),
			'orgName' : $("#entrustNameQuery").val(),
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
				tr+="<td><input type='checkbox' class='sub_entrust_check' orgInfoId="+ele.id+" orgName="+ele.orgName+" rootOrgName="+ele.rootOrgName+" rootOrgInfoId="+ele.rootOrgInfoId+"></td>";
				tr += "<td>" + ele.orgName + "</td>";
				tr += "<td>" + ele.rootOrgName + "</td>";
				// 将tr追加
				$("#entrustTBody").append(tr);
			});
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url : "getEntrustCount",
		type : "post",
		data : {'cooperateStatus' : $("#cooperate_status").val(),'orgName' : $("#entrustNameQuery").val()},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			entrustPagination.setTotalItems(resp);
			$("#panel-num-entrust").text("搜索结果共" + resp + "条");
		}
	});

}

// 分页
var entrustPagination = $(".pagination-list-entrust").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		entrustList(current);
	}
});

//重置按钮
function resetEntrust(){
	setTimeout(function(){
		entrustList(1);
	},500);
}

function entrustJumpPage(e) {
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
	entrustPagination.setCurrentPage(value);
}

//绑定委托方输入框 
$("body").on("click", "#entrust_name", function() {
	$("#entrustNameQuery").val(null);
	$("#entrustSelectModal").modal('show');
	entrustList(1);

});

//委托方选择列表单选模式
$("body").on("click", ".sub_entrust_check", function() {
	var isChecked = $(this).is(":checked");
	$(".sub_entrust_check").prop("checked", false);
	if (isChecked) {
		$(this).prop("checked", isChecked);
	} else {
		$(this).prop("checked", isChecked);
	}
});

//委托方选择确认

function entrustSelect() {
	$(".sub_entrust_check").each(function() {
		if ($(this).is(":checked")) {
			$("#entrust_name").val($(this).attr("orgName"));
			$("#entrust").val($(this).attr("orgInfoId"));
			$("#entrust_org_root_name").val($(this).attr("rootOrgName"));
			$("#entrust_org_root").val($(this).attr("rootOrgInfoId"));
			return false;
		}
	});
	$("#entrustSelectModal").modal('hide');
}