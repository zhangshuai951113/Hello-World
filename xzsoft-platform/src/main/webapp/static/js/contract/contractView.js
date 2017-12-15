$(function() {
	//时间调用插件
	  setTimeout(function () {
	    $(".date-time").datetimepicker({
	      format: "YYYY-MM-DD",
	      autoclose: true,
	      todayBtn: true,
	      todayHighlight: true,
	      showMeridian: true,
	      pickTime: false
	    });
	  }, 500)
	// 搜索
	searchContractInfo(1);
});

/**
 * 根据页数查询发起合同信息
 * 
 * @param number
 */
function searchContractInfo(number) {
	// 合同编号
	var contractCode = $.trim($("#contractCode").val());
	// 合同名称
	var contractName = $("#contractName").val();
	// 委托方
	var entrustName = $.trim($("#entrustName").val());
	// 承运方
	var shipperName = $("#shipperName").val();
	// 合同状态
	var contractStatus = $("#contractStatus").val();
	// 合同分类
	var contractClassify = $.trim($("#contractClassify").val());
	// 合同类型
	var contractType = $.trim($("#contractType").val());
	// 合同创建日期
	var createTimeStart = $.trim($("#createTimeStart").val());
	var createTimeEnd = $.trim($("#createTimeEnd").val());
	// 请求url
	var url = basePath + "/contractInfo/listContractInfoForView #contract_info";

	$("#search_contract_info").load(url, {
		"page" : number,
		"rows" : 10,
		"contractName" : contractName,
		"contractCode" : contractCode,
		"entrustName" : entrustName,
		"shipperName" : shipperName,
		"contractStatus" : contractStatus,
		"contractClassify" : contractClassify,
		"contractType" : contractType,
		"createTimeStart" : createTimeStart,
		"createTimeEnd" : createTimeEnd
	}, function() {
		//允许表格拖着
		$("#tableDrag").colResizable({
			  liveDrag:true, 
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging",
			  partialRefresh:true
		});
		//数据较多，增加滑动
		$.mCustomScrollbar.defaults.scrollButtons.enable = true; 
	  	$.mCustomScrollbar.defaults.axis = "yx"; 
	  	$(".iscroll").css("min-height","55px");
	  	$(".iscroll").mCustomScrollbar({
	    	theme: "minimal-dark"
	  	});
	});
}

/**
 * 明细操作
 */
$("body").on("click",".detail-edit",function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	// 主键ID存在
	if (contractInfoId) {
		$("#contract_info_id").val(contractInfoId);
		$("#contract_detail_form").attr("action",basePath + "/contractDetailInfo/showContractDetailInfoPageForView");
		$("#contract_detail_form").submit();
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 合同信息查看
 */
$("body").on("click", ".view-operation", function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	var url = basePath + "/contractInfo/viewContractInfoWithDetail";
	
	if (contractInfoId) {
		$("#contract_info_id").val(contractInfoId);
		$("#contract_detail_form").attr("action",url);
		$("#contract_detail_form").submit();
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
//	$("#contract_info_view").load(url, {
//		"contractInfoId" : contractInfoId
//	}, function() {
//	});
});

/*
 * 关闭查看窗口
 */
$("body").on("click", ".contract-opt-close", function() {
	$("#contract_info_view").empty();
});

// 全选/全不选
$("body").on("click", ".all_check", function() {
	var auditBtnDisabled = false;
	var delBtnDisabled = false;
	var auditBtnStyle = "operation-button operation-blue";
	var delBtnStyle = "operation-button operation-blue";
	if ($(".all_check").is(":checked")) {
		// 全选时
		$(".sub_check").each(function() {
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
		$(".sub_check").each(function() {
			$(this).prop("checked", false);
		});
	}
	$("#auditBtn").attr("disabled", auditBtnDisabled);
	$("#auditBtn").attr("class", auditBtnStyle);
	$("#delBtn").attr("disabled", delBtnDisabled);
	$("#delBtn").attr("class", delBtnStyle);
});

// 部分选择判断
$("body").on("click", ".sub_check", function() {
	var isAll = true;
	var auditBtnDisabled = false;
	var auditBtnStyle = "operation-button operation-blue";
	var delBtnDisabled = false;
	var delBtnStyle = "operation-button operation-blue";
	$(".sub_check").each(function() {
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
	$(".all_check").prop("checked", isAll);
});

/**
 * 分页查询
 * @param number 页数
 */
function pagerGoto(number) {
	searchContractInfo(number);
}

/**
 * 跳转到某页
 */
function btnPagerGoto() {
	// 取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	// 取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	// 数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		alert("请输出正确的数字");
		return;
	}

	// 跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	searchContractInfo(goPage);
}