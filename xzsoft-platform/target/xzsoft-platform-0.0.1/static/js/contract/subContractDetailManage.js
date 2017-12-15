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
 * 获取选中的待转包合同明细ID
 */
function findSelectedContractDetailIds() {
	// 所有选中合同明细ID
	var contractDetailIds = new Array();
	$(".sub_contract_detail_check").each(function() {
		if ($(this).is(":checked")) {
			contractDetailIds.push($(this).attr("contract-detail-info-id"))
		}
	});
	return contractDetailIds.join(",");
}

/**
 * 分页查询
 * 
 * @param number
 *            页数
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
		"contractClassify" : 2,
		"lineInfoId" : lineInfoId,
		"goodsName" : goodsName,
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
			draggingClass : "dragging"
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

function deleteContractDetailInfo(contractDetailInfoIds) {
	if (contractDetailInfoIds) {
		$
				.confirm({
					title : "提示",
					content : "是否确认删除所选合同明细信息？",
					buttons : {
						'确认' : function() {
							$
									.ajax({
										url : basePath
												+ "/contractDetailInfo/deleteContractDetailInfo",
										asyn : false,
										type : "POST",
										data : {
											"contractDetailInfoIds" : contractDetailInfoIds
										},
										dataType : "json",
										success : function(dataStr) {
											if (dataStr) {
												if (dataStr.success) {
													commonUtil.showPopup("提示",
															dataStr.msg);
													searchContractDetailInfo(1);
												} else {
													commonUtil.showPopup("提示",
															dataStr.msg);
													return;
												}
											} else {
												commonUtil.showPopup("提示",
														"删除异常，请稍后重试");
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
