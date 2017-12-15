/**
 * 明细信息查看页
 */
$(function() {
	// 搜索
	searchContractDetailInfo(1);
	
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
});

/*
 * 关闭查看窗口
 */
$("body").on("click", ".contract-opt-close", function() {
	$("#contract_detail_info_view").empty();
});

/*
 * 合同明细详细信息查看
 */
$("body").on("click",".view-operation",function() {
	var contractDetailInfoId = $(this).parent().attr("contract-detail-info-id");
	// 合同主ID
	var contractInfoId = $("#contractInfoId").val();
	// 请求地址
	var url = basePath + "/contractDetailInfo/viewContractDetailInfoPage #contract-detail-data-info";
	$("#contract_detail_info_view").load(url, {"contractDetailInfoId" : contractDetailInfoId,
												"contractInfoId" : contractInfoId }, function() {});
});

/*
 *  全选/全不选
 */
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

function resetContract(){
	setTimeout(function(){
		searchContractDetailInfo(1);
	},500);
}

/*
 * 部分选择判断
 */
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
	searchContractDetailInfo(number);
}

/**
 * 根据页数查询发起合同信息
 * @param number
 */
function searchContractDetailInfo(number) {
	var contractInfoId = $.trim($("#contractInfoId").val());
	 // 货物名称
	 var goodsName = $.trim($("#goodsName").val());
	 // 线路
	 var lineInfoId = $.trim($("#lineInfoIdQuery").val());
	//发货单位
	var forwardingUnit = $.trim($("#forwardingUnit").val());
	//到货单位
	var consignee = $.trim($("#consignee").val());
	//起始日期开始
	var lContractStartTime = $("#lContractStartTime").val();
	//起始日期截止
	var lContractEndTime = $("#lContractEndTime").val();
	//结束日期开始
	var lContractEndTimeStart = $("#lContractEndTimeStart").val();
	//结束日期结束
	var lContractEndTimeEnd = $("#lContractEndTimeEnd").val();
	// 请求地址
	var url = basePath + "/contractDetailInfo/listContractDetailInfoForView #contract_detail_info";
	$("#search_contract_detail_info").load(url, {
		"page" : number,
		"rows" : 10,
		"contractInfoId" : contractInfoId,
		"goodsName" : goodsName,
		"lineInfoId" : lineInfoId,
		"forwardingUnit" : forwardingUnit,
		"consignee" : consignee,
		"lContractStartTime" : lContractStartTime,
		"lContractEndTime" : lContractEndTime,
		"lContractEndTimeStart" : lContractEndTimeStart,
		"lContractEndTimeEnd" : lContractEndTimeEnd
	}, function() {
		
		// 允许表格拖着
		$("#tableDrag").colResizable({
			liveDrag : true,
			gripInnerHtml : "<div class='grip'></div>",
			draggingClass : "dragging",
			resizeMode: 'overflow'
				
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
 * 分页查询
 * @param number 页数
 */
function pagerGoto(number) {
	searchContratDetailInfo(number);
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
	searchContractDetailInfo(goPage);
}