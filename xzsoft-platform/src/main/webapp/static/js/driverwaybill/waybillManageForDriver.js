$(function() {
	// 搜索
	searchDriverWaybillInfo(1);
	
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
	  }, 500);
	  
});

/**
 * 分页查询发起司机运单信息
 * 
 * @param number
 */
function searchDriverWaybillInfo(number) {
	// 货物名称
	var goodsName = $.trim($("#goodsName").val());
	// 线路
	var lineInfoId = $("#lineInfoId").val();
	// 委托方
	var entrustName = $.trim($("#entrustName").val());
	// 发货单位
	var forwardingUnit = $("#forwardingUnit").val();
	// 收货单位
	var _consignee = $("#_consignee").val();
	// 运单状态
	var waybillStatus = $.trim($("#waybillStatus").val());
	// 计划拉运日期
	var planTransportDateStart = $.trim($("#planTransportDateStart").val());
	var planTransportDateEnd = $.trim($("#planTransportDateEnd").val());
	// 请求url
	var url = basePath + "/driverWaybillInfo/listDriverWaybillInfo #driver_waybill_info";
	$("#search_driver_waybill_info").load(url, {
		"page" : number,
		"rows" : 10,
		"goodsName" : goodsName,
		"lineInfoId" : lineInfoId,
		"entrustName" : entrustName,
		"forwardingUnit" : forwardingUnit,
		"consignee" : _consignee,
		"waybillStatus" : waybillStatus,
		"planTransportDateStart" : planTransportDateStart,
		"planTransportDateEnd" : planTransportDateEnd
	}, function() {
		//允许零散货物表格拖着
		  $("#tableDrag").colResizable({
		    liveDrag: true,
		    partialRefresh:true,
		    gripInnerHtml: "<div class='grip'></div>",
		    draggingClass: "dragging"
		  });
	});
}

/**
 * 确认接单
 * @param driverWaybillInfoId
 * @author zhangya
 */
$("body").on("click", ".waybill-confirm-operation", function() {
	var driverWaybillInfoId = $(this).parent().attr("driver-waybill-info-id");
	// 主键ID存在则提交审核
	if (driverWaybillInfoId) {
		$.confirm({
			title : "提示",
			content : "是否确认接单？",
			buttons : {
				'确认' : function() {
					operateDriverWaybill(driverWaybillInfoId, 1);
				},
				'取消' : function() {
				}
			}
		});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/**
 * 确认拒单
 * @param driverWaybillInfoId
 * @author zhangya
 */
$("body").on("click", ".withdraw-operation", function() {
	var driverWaybillInfoId = $(this).parent().attr("driver-waybill-info-id");
	// 发送确认
	var operateType = 2;
	// 主键ID存在则发送确认
	if (driverWaybillInfoId) {
		$.confirm({
			title : "提示",
			content : "是否确认拒单？",
			buttons : {
				'确认' : function() {
					operateDriverWaybill(driverWaybillInfoId, operateType);
				},
				'取消' : function() {
				}
			}
		});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 维护装货信息
 * @author zhangya 2017年6月5日
 */
$("body").on("click", ".edit-loading", function() {
	var driverWaybillInfoId = $(this).parent().attr("driver-waybill-info-id");
	if (driverWaybillInfoId) {
		operateDriverWaybill(driverWaybillInfoId, 3);
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 维护卸货信息
 */
$("body").on("click", ".edit-discharge", function() {
	var driverWaybillInfoId = $(this).parent().attr("driver-waybill-info-id");
	if (driverWaybillInfoId) {
		operateDriverWaybill(driverWaybillInfoId, 4);
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 司机运单信息查看
 */
$("body").on("click", ".view-driver-waybill", function() {
	var driverWaybillInfoId = $(this).parent().attr("driver-waybill-info-id");
	if (driverWaybillInfoId) {
		operateDriverWaybill(driverWaybillInfoId, 5);
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 上传在途磅单照片
 */
$("body").on("click", ".upload-onpassageimg", function() {
	var driverWaybillInfoId = $(this).parent().attr("driver-waybill-info-id");
	if (driverWaybillInfoId) {
		operateDriverWaybill(driverWaybillInfoId,6);
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/**
 * 操作类型 1:确认接单 2:确认拒单 3:维护装货信息 4:维护卸货信息 5:司机查看运单 6:上传在途磅单
 */
function operateDriverWaybill(driverWaybillInfoIds, operateType) {

	if (operateType == undefined || operateType == "") {
		commonUtil.showPopup("提示", "操作无效！");
		return;
	}

	$.ajax({
		url : basePath + "/driverWaybillInfo/operateDriverWaybillInfo",
		asyn : false,
		type : "POST",
		data : {
			"driverWaybillInfoIds" : driverWaybillInfoIds,
			"operateType" : operateType
		},
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					if (operateType == 1 | operateType == 2) {
						commonUtil.showPopup("提示", dataStr.msg);
						searchDriverWaybillInfo(1);
						//消息刷新---zhangbo加
						readyMessages();
					} else {
						//弹出维护装卸货信息页面
						var url =basePath + "/driverWaybillMaintainInfo/editDriverWaybillMaintainInfoPage #maintain-driver-waybill-info";
						$("#driver_waybill_maintain_info_edit").load(url,{"driverWaybillInfoId":driverWaybillInfoIds,"operateType" : operateType},
								function (){
									// 上传图片初始化
									$('.upload_img').each(function() {
										uploadLoadFile($(this));
									});
									
									//时间调用插件（精确到时分秒）
									  setTimeout(function () {
									    $(".date-time-ss").datetimepicker({
									      format: "YYYY-MM-DD HH:mm:ss",
									      autoclose: true,
									      todayBtn: true,
									      todayHighlight: true,
									      showMeridian: true,
									      useSeconds: true
									    });
									  }, 500);
									  
									//图片预览
										$('.view-img').viewer({
											title:false
										});
								});
					}
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "司机运单操作异常，请稍后重试");
				return;
			}
		}
	});
}

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
			if ($(this).attr("data-status") != 2) {
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
			if ($(this).attr("data-status") != 2) {
				auditBtnDisabled = true;
				auditBtnStyle = "operation-button operation-grey";
				if ($(this).attr("data-status") != 1) {
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
 * 操作司机运单信息 1 确认接单 2 确认拒单
 */
function operateCheckedDriverWaybillInfo(operateType) {
	if (operateType == undefined || operateType == "") {
		commonUtil.showPopup("提示", "操作无效！");
		return;
	}
	var operateStr = "";
	if (operateType == 1) {
		operateStr = "确认接单"
	} else if (operateType == 2) {
		operateStr = "确认拒单"
	}
	// 获取选中的操作记录
	var driverWaybillInfoIds = findAllCheckedDriverWaybillInfoIds();
	if (driverWaybillInfoIds == undefined || driverWaybillInfoIds == "") {
		commonUtil.showPopup("提示", "请选择要" + operateStr + "的运单！");
		return;
	}

	$.confirm({
		title : "提示",
		content : "是否" + operateStr + "？",
		buttons : {
			'确认' : function() {
				operateDriverWaybill(driverWaybillInfoIds, operateType);
			},
			'取消' : function() {
			}
		}
	});
}

/**
 * 获取所有选中的司机运单ID
 * @author zhangya 2017年5月26日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckedDriverWaybillInfoIds() {
	// 所有选中司机运单ID
	var driverWaybillInfoIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			driverWaybillInfoIds.push($(this).attr("data-id"))
		}
	});
	return driverWaybillInfoIds.join(",");
}

/**
 * 分页查询
 * @param number  页数
 */
function pagerGoto(number) {
	searchDriverWaybillInfo(number);
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
	searchDriverWaybillInfo(goPage);
}

/**
 * 绑定上传事件的dom对象
 * @author zhangya 2017年6月21日
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

/*
 * 关闭运单维护框
 */
$("body").on("click",".maintain-win-close",function(){
	$("#driver_waybill_maintain_info_edit").empty();
});

/**
 * 维护装货信息
 * @author zhangya
 */
function saveDriverWaybillLoadingInfo() {
	// 1、装货量校验
	var loadingAmount = $.trim($("#loading_amount").val());
	if (loadingAmount == undefined || loadingAmount == "") {
		commonUtil.showPopup("提示", "装货量不能为空");
		return;
	}

	// 2、装货日期校验
	var loadingDate = $.trim($("#loading_date").val());
	if (loadingDate == undefined || loadingDate == "") {
		commonUtil.showPopup("提示", "装货日期不能为空");
		return;
	}
	// 3、装货磅单照片校验
//	var loadingImg = $.trim($("#loading_img").val());
//	if (loadingImg == undefined || loadingImg == "") {
//		commonUtil.showPopup("提示", "装货磅单照片不能为空");
//		return;
//	}

	$.ajax({
		url : basePath + "/driverWaybillMaintainInfo/maintainDriverWaybillLoadingOrUnloadingInfo",
		asyn : false,
		type : "POST",
		data : $('#maintain_driver_waybill_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					$("#driver_waybill_maintain_info_edit").empty();
					commonUtil.showPopup("提示", "保存成功");
					searchDriverWaybillInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存司机运单信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}
/**
 * 维护卸货信息
 * @author zhangya
 */
function saveDriverWaybillUnloadingInfo() {
	// 1、卸货量校验
	var unloadingAmount = $.trim($("#unloading_amount").val());
	if (unloadingAmount == undefined || unloadingAmount == "") {
		commonUtil.showPopup("提示", "卸货量不能为空");
		return;
	}
	
	// 2、卸货日期校验
	var unloadingDate = $.trim($("#unloading_date").val());
	if (unloadingDate == undefined || unloadingDate == "") {
		commonUtil.showPopup("提示", "卸货日期不能为空");
		return;
	}
	// 3、卸货磅单照片校验
//	var unloadingImg = $.trim($("#unloading_img").val());
//	if (unloadingImg == undefined || unloadingImg == "") {
//		commonUtil.showPopup("提示", "卸货磅单照片不能为空");
//		return;
//	}
	$.ajax({
		url : basePath + "/driverWaybillMaintainInfo/maintainDriverWaybillLoadingOrUnloadingInfo",
		asyn : false,
		type : "POST",
		data : $('#maintain_driver_waybill_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					$("#driver_waybill_maintain_info_edit").empty();
					commonUtil.showPopup("提示", "保存成功");
					searchDriverWaybillInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存司机运单信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 上传在途磅单
 * @author zhangya
 */
function uploadOnpassageImgInfo() {
	var onpassageImg = $.trim($("#onpassageImg").val());
	$.ajax({
		url : basePath + "/driverWaybillMaintainInfo/uploadOnpassageImgInfo",
		asyn : false,
		type : "POST",
		data : $('#maintain_driver_waybill_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					$("#driver_waybill_maintain_info_edit").empty();
					commonUtil.showPopup("提示", "保存成功");
					searchDriverWaybillInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "上传在途磅单信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}