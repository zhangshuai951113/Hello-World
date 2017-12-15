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

$("body").on("click", ".contract-opt-close", function() {
	$("#contract_detail_info_edit").empty();
});

/*
 * 根据ID删除合同明细信息
 */
$("body").on("click",".delete-operation",function() {
	var contractDetailInfoId = $(this).parent().attr("contract-detail-info-id");
	if (contractDetailInfoId) {
		deleteContractDetailInfo(contractDetailInfoId);
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 合同明细信息查看
 */
$("body").on("click",".view-operation",function() {
	var carInfoId = $(this).parent().attr("car-info-id");
	$("#car_info_id").val(carInfoId);
	$("#edit_form").attr("action",basePath + "/contractDetailInfo/viewcontractDetailInfoPage");
	$("#edit_form").submit();
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
 * 删除选中的合同明细
 */
function deleteCheckedContractDetailInfo(){
	// 获取选中的操作记录
	var contractDetailInfoIds = findAllCheckContractDetailIds();
	if (contractDetailInfoIds == undefined || contractDetailInfoIds == "") {
		commonUtil.showPopup("提示", "请选择要删除的合同明细！");
		return;
	}
	// 删除操作
	deleteContractDetailInfo(contractDetailInfoIds);
}

/**
 * 获取所有选中合同明细ID
 */
function findAllCheckContractDetailIds() {
	// 所有选中合同明细ID
	var contractDetailIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			contractDetailIds.push($(this).attr("data-id"))
		}
	});
	return contractDetailIds.join(",");
}

/**
 * 分页查询
 * @param number 页数
 */
function pagerGoto(number) {
	searchContractDetailInfo(number);
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

/**
 * 根据页数查询发起合同信息
 * @param number
 */
function searchContractDetailInfo(number) {
	var contractInfoId = $.trim($("#contractInfoId").val());
	 // 货物名称
	 var goodsName = $.trim($("#goodsName").val());
	//线路
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
	var url = basePath + "/contractDetailInfo/listContractDetailInfo #contract_detail_info";
	$("#search_contract_detail_info").load(url, {
		"page" : number,
		"rows" : 10,
		"contractInfoId" : contractInfoId,
		"contractClassify" : 1,
		"lineInfoId" : lineInfoId,
		"goodsName" : goodsName,
		"forwardingUnit" : forwardingUnit,
		"consignee" : consignee,
		"lContractStartTime" : lContractStartTime,
		"lContractEndTime" : lContractEndTime,
		"lContractEndTimeStart" : lContractEndTimeStart,
		"lContractEndTimeEnd" : lContractEndTimeEnd
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
 * 新增/修改合同信息初始页
 * @param contractDetailInfoId 合同ID
 * @author zhangya 2017年6月1日
 */
function addOrEditContractDetailInfoPage(contractDetailInfoId) {
	// 请求地址
	var contractInfoId = $("#contractInfoId").val();
	var url = basePath
			+ "/contractDetailInfo/addOrEditContractDetailInfoPage #contract-detail-data-info";
	$("#contract_detail_info_edit").load(url, {
		"contractDetailInfoId" : contractDetailInfoId,
		"contractInfoId" : contractInfoId
	}, function() {
	});
}
/**
 * 编辑合同明细信息初始页
 * @param contractDetailInfoId
 */
$("body").on("click",".modify-operation",function() {
	var contractDetailInfoId = $(this).parent().attr("contract-detail-info-id");
	// 主键ID存在则进行权限校验
	if (contractDetailInfoId) {
		addOrEditContractDetailInfoPage(contractDetailInfoId);
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/**
 * 绑定上传事件
 */
$(function() {
	// 上传图片初始化
	$('.upload_img').each(function() {
		uploadLoadFile($(this));
	})
});

/**
 * 绑定上传事件的dom对象
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn, {
		action : basePath + '/upload/imageUpload',
		name : 'myfile',
		dataType : 'json',
		onSubmit : function(file, ext) {
			// 文件上传格式校验
			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))) {
				commonUtil.showPopup("提示", "请上传格式为 jpg|png|bmp 的图片");
				return;
			}
		},
		// 服务器响应成功时的处理函数
		onComplete : function(file, resultJson) {
			if (resultJson) {
				resultJson = $.parseJSON(resultJson);
				// 是否成功
				var isSuccess = resultJson.isSuccess;
				// 上传图片URL
				var uploadUrl = resultJson.uploadUrl;
				if (isSuccess == "true") {
					// 图片类型
					var imgType = btn.attr("img-type");
					btn.attr("src", fastdfsServer + "/" + uploadUrl);
					$("#" + imgType).val(uploadUrl);
				} else {
					commonUtil.showPopup("提示", resultJson.errorMsg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "服务器异常，请稍后重试");
				return;
			}

		}
	});
}

/**
 * 提交合同明细信息
 * @author zhangya
 */
function saveContractDetailInfo() {
	// 1、货物名称
	var goodsName = $.trim($("#goods_name").val());
	if (goodsName == undefined || goodsName == "") {
		commonUtil.showPopup("提示", "货物不能为空");
		return;
	}
	var goodsInfoId = $.trim($("#goods_info_id").val());
	if (goodsInfoId == undefined || goodsInfoId == "") {
		commonUtil.showPopup("提示", "货物不能为空");
		return;
	}

	// 2、数量
	var quantity = $.trim($("#quantity").val());
	if (quantity == undefined || quantity == "") {
		commonUtil.showPopup("提示", "数量不能为空");
		return;
	}
	// 3、单位运价校验
	var unitPrice = $.trim($("#unit_price").val());
	if (unitPrice == undefined || unitPrice == "") {
		commonUtil.showPopup("提示", "单位运价不能为空");
		return;
	}

	// 4、损耗扣款校验
	var lossDeductMoney = $.trim($("#loss_deduct_money").val());
	if (lossDeductMoney == undefined || lossDeductMoney == "") {
		commonUtil.showPopup("提示", "损耗扣款不能为空");
		return;
	}

	// 5、发货单位校验
	var forwardingUnit = $.trim($("#forwarding_unit").val());
	if (forwardingUnit == undefined || forwardingUnit == "") {
		commonUtil.showPopup("提示", "发货单位不能为空");
		return;
	}
	// 6、收货单位校验
	var consignee = $.trim($("#consigneefd").val());
	if (consignee == undefined || consignee == "") {
		commonUtil.showPopup("提示", "收货单位不能为空");
		return;
	}
	// 7、线路校验
	var lineName = $.trim($("#line_name").val());
	if (lineName == undefined || lineName == "") {
		commonUtil.showPopup("提示", "线路不能为空");
		return;
	}
	var lineInfoId = $.trim($("#line_info_id").val());
	if (lineInfoId == undefined || lineInfoId == "") {
		commonUtil.showPopup("提示", "线路不能为空");
		return;
	}
	// 8、生效日期校验
	var effectiveDate = $.trim($("#effective_date").val());
	if (effectiveDate == undefined || effectiveDate == "") {
		commonUtil.showPopup("提示", "生效不能为空");
		return;
	}
	// 9、截止日期校验
	var endDate = $.trim($("#end_date").val());
	if (endDate == undefined || endDate == "") {
		commonUtil.showPopup("提示", "截止日期不能为空");
		return;
	}

	$.ajax({
		url : basePath + "/contractDetailInfo/addOrUpdateContractDetailInfo",
		asyn : false,
		type : "POST",
		data : $('#contract_detail_info_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					commonUtil.showPopup("提示", "保存成功");
					$("#contract_detail_info_edit").empty();
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

function deleteContractDetailInfo(contractDetailInfoIds) {
	if (contractDetailInfoIds) {
		$.confirm({title : "提示",
					content : "是否确认删除所选合同明细信息？",
					buttons : {
						'确认' : function() {
							$.ajax(
								{url : basePath + "/contractDetailInfo/deleteContractDetailInfo",
								asyn : false,
								type : "POST",
								data : {
									"contractDetailInfoIds" : contractDetailInfoIds
								},
								dataType : "json",
								success : function(dataStr) {
									if (dataStr) {
										if (dataStr.success) {
											commonUtil.showPopup("提示", dataStr.msg);
											searchContractDetailInfo(1);
										} else {
											commonUtil.showPopup("提示", dataStr.msg);
											return;
										}
									} else {
										commonUtil.showPopup("提示", "删除异常，请稍后重试");
										return;
									}
								}
							});
						},
						'取消' : function() {

						}
					}
				});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
}

// 单位运价输入框
$("body").on("change", "#unit_price", function() {
	var quantity = $("#quantity").val();
	if (quantity == undefined || quantity == "") {
		quantity = 0;
	}
	var unitPrice = $(this).val();
	$("#total_money").val(unitPrice * quantity);
});

// 数量输入框
$("body").on("change", "#quantity", function() {
	var unitPrice = $("#unit_price").val();

	if (unitPrice == undefined || unitPrice == "") {
		unitPrice = 0;
	}
	var quantity = $(this).val();
	$("#total_money").val(unitPrice * quantity);
});

//新增招标明细信息
function addbiddingDetailPage(){
	
	var url=basePath+"/contractInfo/showBiddingDtailMationPage";
	$("#add_bidding_detail_info_mation").load(url);
	
}