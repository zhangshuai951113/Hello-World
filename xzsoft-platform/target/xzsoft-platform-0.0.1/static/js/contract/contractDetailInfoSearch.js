//合同日志查询
function contractDetailInfoList(number) {
	$("#contractDetailTBody").html("");
	$(".all_contract_detail_check").prop("checked", false);
	$.ajax({url : "getContractDetailInfoData",
			data : {
				'page' : number,
				"contractInfoId" : $("#contractInfoId").val(),
				'rows' : 10
			},
			dataType : "json",
			type : "post",
			async : false,
			success : function(resp) {
				var objs = eval(resp);
				$.each(objs,function(index, ele) {
					// 追加数据
					var tr = "";
					tr += "<tr class='table-body' align='center'>";
					tr += "<td><input type='checkbox' class='sub_contract_detail_check' contract-detail-info-id=" + ele.id + "></td>";
					tr += "<td>" + ele.goodsName + "</td>";
					tr += "<td >" + ele.quantity + "</td>";
					tr += "<td>" + ele.unitPrice + "</td>";
					tr += "<td>" + ele.totalMoney + "</td>";
					tr += "<td>" + ele.lossDeductMoney + "</td>";
					tr += "<td>" + ele.lineName + "</td>";
					tr += "<td>" + ele.distance + "</td>";
					tr += "<td>" + ele.forwardingUnit + "</td>";
					tr += "<td>" + ele.consignee + "</td>";
					tr += "<td>" + ele.remarks + "</td>";
					// 将tr追加
					$("#contractDetailTBody").append(tr);
				});
			}
	});
	// 获取最大数据记录数
	$.ajax({
		url : "getContractDetailInfoCount",
		type : "post",
		data : {
			"contractInfoId" : $("#contractInfoId").val()
		},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			contractPagination.setTotalItems(resp);
			$("#contractDetailNum").text(resp);
		}
	});

}

// 分页
var contractPagination = $("#contractPage").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		contractList(current);
	}
});

function contractJumpPage(e) {
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
	contractPagination.setCurrentPage(value);
}

function contractDetailWinShow() {
	$("#contractDetailSelectModal").modal("show");
	contractDetailInfoList(1);
}

// 绑定合同选择列表
$("body").on("click", ".sub_contract_check", function() {
	// 获取当前选中的状态
	var isChecked = $(this).is(":checked");
	$(".sub_contract_check").prop("checked", false);
	if (isChecked) {
		$(this).prop("checked", isChecked);
	} else {
		$(this).prop("checked", isChecked);
	}
});

// 保存选中的合同明细
function saveCheckedContractDetailSelect() {
	var contractDetailInfoIds = findSelectedContractDetailIds(); 
	$.ajax({
		url : basePath + "/contractDetailInfo/addSubContractDetailInfo",
		asyn : false,
		type : "POST",
		data : {"contractDetailInfoIds":contractDetailInfoIds,"contractInfoId":$("#contractInfoId").val()},
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					commonUtil.showPopup("提示", "保存成功");
					$("#contractDetailSelectModal").modal("hide");
					searchContractDetailInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存合同信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
	
}


//全选/全不选
$("body").on("click", ".all_contract_detail_check", function() {
	var auditBtnDisabled = false;
	var delBtnDisabled = false;
	var auditBtnStyle = "operation-button operation-blue";
	var delBtnStyle = "operation-button operation-blue";
	if ($(".all_contract_detail_check").is(":checked")) {
		// 全选时
		$(".sub_contract_detail_check").each(function() {
			$(this).prop("checked", true);
			if ($(this).attr("data-status") != 1) {
				auditBtnDisabled = true;
				auditBtnStyle = "operation-button operation-grey";
				if ($(this).attr("data-status") == 2) {
					delBtnDisabled = true;
					delBtnStyle = "operation-button operation-grey";
				}
			}

		});
	} else {
		// 全不选时
		$(".sub_contract_detail_check").each(function() {
			$(this).prop("checked", false);
		});
	}
	$("#auditBtn").attr("disabled", auditBtnDisabled);
	$("#auditBtn").attr("class", auditBtnStyle);
	$("#delBtn").attr("disabled", delBtnDisabled);
	$("#delBtn").attr("class", delBtnStyle);
});

// 部分选择判断
$("body").on("click", ".sub_contract_detail_check", function() {
	var isAll = true;
	var auditBtnDisabled = false;
	var auditBtnStyle = "operation-button operation-blue";
	var delBtnDisabled = false;
	var delBtnStyle = "operation-button operation-blue";
	$(".sub_contract_detail_check").each(function() {
		if ($(this).is(":checked")) {
			$(this).prop("checked", true);
			if ($(this).attr("data-status") != 1) {
				auditBtnDisabled = true;
				auditBtnStyle = "operation-button operation-grey";
				if ($(this).attr("data-status") == '2') {
					delBtnDisabled = true;
					delBtnStyle = "operation-button operation-grey";
				}
			}

		} else {
			$(this).prop("checked", false);
		}
		if (!$(this).prop("checked")) {
			isAll = false;
		}
	});
	$("#auditBtn").attr("disabled", auditBtnDisabled);
	$("#auditBtn").attr("class", auditBtnStyle);
	$("#delBtn").attr("disabled", delBtnDisabled);
	$("#delBtn").attr("class", delBtnStyle);
	$(".all_contract_detail_check").prop("checked", isAll);
});
