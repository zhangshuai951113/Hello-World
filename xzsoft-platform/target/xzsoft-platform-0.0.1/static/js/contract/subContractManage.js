//判断查询的类型 0 发起的合同 1 接收的合同
var type = "0";
// 切换显示的列ID
var tableId = "#search_contract_info";
$(function() {

	// tab页切换
	$(".tab-box .tab-text").bind("click", function() {
		var target = $(this).data("target");
		if (target == "#initiate-contract-tab") {
			tableId = "#search_contract_info";
			type = "0";
		} else {
			tableId = "#search_contract_info1";
			type = "1";
		}
		$(".tab-box .tab-text").removeClass("active");
		$(this).addClass("active");
		$(".tab-content").hide();
		$(target).show();
		searchContractInfo(1)
	});
	
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
 * @param number
 */
function searchContractInfo(number) {
	// 转包合同编号
	var subContractCode = $.trim($("#subContractCode").val());
	// 合同名称
	var contractName = $("#contractName").val();
	// 委托方
	var entrustName = $.trim($("#entrustName").val());
	// 承运方
	var shipperName = $("#shipperName").val();
	// 合同状态
	var contractStatus = $("#contractStatus").val();
	// 协调状态
	var cooperateStatus = $.trim($("#cooperateStatus").val());
	// 合同创建日期
	var createTimeStart = $.trim($("#createTimeStart").val());
	var createTimeEnd = $.trim($("#createTimeEnd").val());
	//线路
	var lineInfoId = $.trim($("#lineInfoIdQuery").val());
	// 请求url
	var url = basePath + "/contractInfo/listContractInfo #contract_info";
	$(tableId).load(url, {
		"page" : number,
		"rows" : 10,
		"contractName" : contractName,
		"subContractCode" : subContractCode,
		"entrustName" : entrustName,
		"shipperName" : shipperName,
		"contractStatus" : contractStatus,
		"cooperateStatus" : cooperateStatus,
		"createTimeStart" : createTimeStart,
		"createTimeEnd" : createTimeEnd,
		"lineInfoId" : lineInfoId,
		"contractClassify" : 2,
		"type" : type
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

/*
 * 明细操作
 */
$("body").on("click",".detail-edit",function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	// 主键ID存在
	if (contractInfoId) {
		$("#contract_info_id").val(contractInfoId);
		$("#contract_detail_form").attr("action",basePath + "/contractDetailInfo/showSubContractDetailInfoPage");
		$("#contract_detail_form").submit();
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 明细查看
 */
$("body").on("click",".detail-view",function() {
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
 * 关闭查看窗口
 */
$("body").on("click", ".contract-opt-close", function() {
	$("#contract_info_edit").empty();
});

/*
 * 根据ID删除合同信息
 */
$("body").on("click", ".delete-operation", function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	// 主键ID存在则进行删除操作
	if (contractInfoId) {
		deleteContractInfo(contractInfoId);
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 根据合同ID提交审核
 */
$("body").on("click", ".submit-operation", function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	// 操作类型
	var operateType = 2;
	// 主键ID存在则提交审核
	if (contractInfoId) {
		$.confirm({
			title : "提示",
			content : "是否确认提交审核？",
			buttons : {
				'确认' : function() {
					operateContract(contractInfoId, operateType);
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
 * 根据ID发送合同确认
 */
$("body").on("click", ".send-operation", function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	// 发送确认
	var operateType = 5;
	// 主键ID存在则发送确认
	if (contractInfoId) {
		$.confirm({
			title : "提示",
			content : "是否发送合同确认？",
			buttons : {
				'确认' : function() {
					operateContract(contractInfoId, operateType);
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
 * 根据ID撤回合同
 */
$("body").on("click", ".retract-operation", function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	// 发送确认
	var operateType = 6;
	// 主键ID存在则发送确认
	if (contractInfoId) {
		$.confirm({
			title : "提示",
			content : "是否确认撤回合同？",
			buttons : {
				'确认' : function() {
					operateContract(contractInfoId, operateType);
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
 * 操作类型 2:提交审核 5:发送确认 6:撤回
 */
function operateContract(contractInfoIds, operateType) {
	$.ajax({
		url : basePath + "/contractInfo/operateContractInfo",
		asyn : false,
		type : "POST",
		data : {
			"contractInfoIds" : contractInfoIds,
			"operateType" : operateType
		},
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					commonUtil.showPopup("提示", dataStr.msg);
					searchContractInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "合同操作异常，请稍后重试");
				return;
			}
		}
	});
}

/*
 * 审核操作
 */
$("body").on("click", ".audit-operation", function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	// 主键ID存在则进行审核
	if (contractInfoId) {
		$.ajax({
			url : basePath + "/contractInfo/checkBeforeAudit",
			asyn : false,
			type : "POST",
			data : {
				"contractInfoIds" : contractInfoId
			},
			dataType : "json",
			success : function(dataStr) {
				if (dataStr) {
					if (dataStr.success) {
						auditWin(contractInfoId);
					} else {
						commonUtil.showPopup("提示", dataStr.msg);
						return;
					}
				} else {
					commonUtil.showPopup("提示", "合同审核服务异常忙，请稍后重试");
					return;
				}
			}
		});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 发起合同信息查看
 */
$("body").on("click", ".view-send-contract", function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	var url = basePath + "/contractInfo/viewContractInfoPage";
	$("#contract_info_edit").load(url, {"contractInfoId" : contractInfoId,"flag":0}, function() {});
});

/*
 * 接收合同信息查看
 */
$("body").on("click", ".view-receive-contract", function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	var url = basePath + "/contractInfo/viewContractInfoPage";
	$("#contract_info_edit").load(url, {"contractInfoId" : contractInfoId,"flag":1}, function() {});
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
			if ($(this).attr("data-status") != 2) {
				auditBtnDisabled = true;
				auditBtnStyle = "operation-button operation-grey";
				if ($(this).attr("data-status") != 1) {
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
 * 操作合同信息 2 提交审核 5 发送确认 6 撤回
 */
function operateCheckedContractInfo(operateType) {
	if (operateType == undefined || operateType == "") {
		commonUtil.showPopup("提示", "操作无效！");
		return;
	}
	var operateStr = "";
	if (operateType == 2) {
		operateStr = "提交审核"
	} else if (operateType == 5) {
		operateStr = "发送确认"
	} else if (operateType == 6) {
		operateStr = "撤回"
	}
	// 获取选中的操作记录
	var contractInfoIds = findAllCheckedContractInfoIds();
	if (contractInfoIds == undefined || contractInfoIds == "") {
		commonUtil.showPopup("提示", "请选择要" + operateStr + "合同！");
		return;
	}
	$.confirm({
		title : "提示",
		content : "是否确认" + operateStr + "？",
		buttons : {
			'确认' : function() {
				operateContract(contractInfoIds, operateType);
			},
			'取消' : function() {
			}
		}
	});
}

/**
 * 审核选中的合同
 */
function auditCheckedContractInfo() {

	// 获取选中的操作记录
	var contractInfoIds = findAllCheckedContractInfoIds();
	if (contractInfoIds == undefined || contractInfoIds == "") {
		commonUtil.showPopup("提示", "请选择要审核的合同！");
		return;
	}

	$.ajax({
		url : basePath + "/contractInfo/checkBeforeAudit",
		asyn : false,
		type : "POST",
		data : {
			"contractInfoIds" : contractInfoIds
		},
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					auditWin(contractInfoIds);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "合同审核服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 获取所有选中的合同ID
 * @author zhangya 2017年5月26日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckedContractInfoIds() {
	// 所有选中合同ID
	var contractInfoIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			contractInfoIds.push($(this).attr("data-id"))
		}
	});
	return contractInfoIds.join(",");
}

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

/*
 * 编辑合同信息初始页
 */
$("body").on("click", ".modify-operation", function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	// 主键ID存在则进行权限校验
	if (contractInfoId) {
		// 合同修改前校验
		$.ajax({
			url : basePath + "/contractInfo/checkBeforeOperate",
			asyn : false,
			type : "POST",
			data : {
				"contractInfoId" : contractInfoId
			},
			dataType : "json",
			success : function(dataStr) {
				if (dataStr) {
					if (dataStr.success) {
						addOrEditContractInfoPage(contractInfoId);
					} else {
						commonUtil.showPopup("提示", dataStr.msg);
						return;
					}
				} else {
					commonUtil.showPopup("提示", "合同修改服务异常忙，请稍后重试");
					return;
				}
			}
		});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/**
 * 新增/修改合同信息初始页
 * @param contractInfoId 合同ID
 * @author zhangya 2017年6月1日
 */
function addOrEditContractInfoPage(contractInfoId) {
	// 请求地址
	var url = basePath
			+ "/contractInfo/addOrEditContractInfoPage #contract-data-info";
	$("#contract_info_edit").load(url, {
		"contractInfoId" : contractInfoId,
		"contractClassify":"2"
	}, function() {
		//时间调用插件
		 setTimeout(function () {
			// 上传图片初始化
			$('.upload_img').each(function() {
				uploadLoadFile($(this));
			})
			//时间调用插件
		    $(".date-time-edit").datetimepicker({
		      format: "YYYY-MM-DD",
		      autoclose: true,
		      todayBtn: true,
		      todayHighlight: true,
		      showMeridian: true,
		      pickTime: false
		    });
		  }, 500)
	});
}

/**
 * 编辑审核信息提交
 * @param contractInfoId
 * @author zhangya 2017年5月22日
 */
function auditWin(contractInfoId) {
	$
			.confirm({
				title : '请您填写审核意见:',
				content : ''
						+ '<form action="" class="formName">'
						+ '<div class="form-group">'
						+ '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px" />'
						+ '</div>' + '</form>',
				buttons : {
					formSubmit : {
						text : '通过',
						btnClass : 'btn-blue',
						action : function() {
							var opinion = this.$content.find('#auditOpinion')
									.val();
							if (!opinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							// 提交审核信息
							contractInfoAudit(contractInfoId, opinion, 1)
						}
					},
					formSubmit1 : {
						text : '不通过',
						btnClass : 'btn-red',
						action : function() {
							var opinion = this.$content.find('#auditOpinion')
									.val();
							if (!opinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							// 提交审核信息
							contractInfoAudit(contractInfoId, opinion, 2)
						}
					},
					'取消' : function() {
						// close
					}
				},
				onContentReady : function() {
					// bind to events
					var jc = this;
					this.$content.find('form').on('submit', function(e) {
						// if the user submits the form by pressing enter in the
						// field.
						e.preventDefault();
						jc.$$formSubmit.trigger('click'); // reference the
						// button and click
						// it
					});
				}
			});
}
/**
 * 审核合同信息
 * 
 * @param contractInfoIds
 *            合同ID
 * @param opinion
 *            审核意见
 * @param restul
 *            审核结果
 * @returns
 */
function contractInfoAudit(contractInfoIds, opinion, result) {
	var auditInfo = {
		"opinion" : opinion,
		"result" : result,
		"contractInfoIds" : contractInfoIds
	};
	// 提交主机构审核意见信息
	$.ajax({
		url : basePath + "/contractInfo/auditContractInfo",
		asyn : false,
		type : "POST",
		data : auditInfo,
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					commonUtil.showPopup("提示", dataStr.msg);
					searchContractInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "合同审核服务异常忙，请稍后重试");
				return;
			}
		}
	});

}

/**
 * 绑定附件上事件
 */
$(function() {

	// 上传图片初始化
	$('.upload_img').each(function() {
		uploadLoadFile($(this));
	})
});

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
			if (!(ext && /^(jpg|png|bmp|docx|doc|pdf|xls|xlsx)$/.test(ext.toLowerCase()))) {
				commonUtil.showPopup("提示", "请上传格式为 jpg|png|bmp|docx|doc|pdf|xls|xlsx 的文件");
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
					var imgText = btn.attr("img-text");
					btn.attr("src", fastdfsServer + "/" + uploadUrl);
					$("#" + imgType).val(uploadUrl);
					$("#" + imgText).text(file);
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
 * 提交合同信息
 * @author zhangya
 */
function saveContractInfo() {
	// 1、合同编号校验
	var contractCode = $.trim($("#contract_code").val());
	if (contractCode == undefined || contractCode == "") {
		commonUtil.showPopup("提示", "合同编号不能为空");
		return;
	}

	// 2、合同名称校验
	var contractName = $.trim($("#contract_name").val());
	if (contractName == undefined || contractName == "") {
		commonUtil.showPopup("提示", "合同名称不能为空");
		return;
	}
	// 3、委托方校验
	var entrust = $.trim($("#entrust").val());
	if (entrust == undefined || entrust == "") {
		commonUtil.showPopup("提示", "委托方不能为空");
		return;
	}
	var entrustName = $.trim($("#entrust_name").val());
	if (entrust == undefined || entrust == "") {
		commonUtil.showPopup("提示", "委托方不能为空");
		return;
	}

	// 4、承运方校验
	// var shipper = $.trim($("#shipper").val());
	// if (shipper == undefined || shipper == "") {
	// commonUtil.showPopup("提示", "承运方不能为空");
	// return;
	// }
	// var shipperName = $.trim($("#shipper_name").val());
	// if (shipperName == undefined || shipperName == "") {
	// commonUtil.showPopup("提示", "承运方不能为空");
	// return;
	// }

	// 5、币种校验
	var currency = $.trim($("#currency").val());
	if (currency == undefined || currency == "") {
		commonUtil.showPopup("提示", "币种不能为空");
		return;
	}
	// // 6、业务类型校验
	// var businessType = $.trim($("#business_type").val());
	// if (businessType == undefined || businessType == "") {
	// commonUtil.showPopup("提示", "业务类型不能为空");
	// return;
	// }
	// 7、合同类型校验
	var contractType = $.trim($("#contract_type").val());
	if (contractType == undefined || contractType == "") {
		commonUtil.showPopup("提示", "合同类型不能为空");
		return;
	}
	// // 8、合同金额校验
	// var contractMoney = $.trim($("#contract_money").val());
	// if (contractMoney == undefined || contractMoney == "") {
	// commonUtil.showPopup("提示", "合同金额不能为空");
	// return;
	// }
	// 9、支付方式校验
	var paymentMode = $.trim($("#payment_mode").val());
	if (paymentMode == undefined || paymentMode == "") {
		commonUtil.showPopup("提示", "支付方式不能为空");
		return;
	}
	// 10、支付方式校验
	var transportMode = $.trim($("#transport_mode").val());
	if (transportMode == undefined || transportMode == "") {
		commonUtil.showPopup("提示", "运输方式不能为空");
		return;
	}

	// 11、合同附件校验
	// var driverLicenseImgCopy = $.trim($("#driver_license_img_copy").val());
	// if (driverLicenseImgCopy == undefined && driverLicenseImgCopy == "") {
	// commonUtil.showPopup("提示", "司机行驶证附件(副本)不能为空！");
	// return;
	// }

	$.ajax({
		url : basePath + "/contractInfo/addOrUpdateSubContractInfo",
		asyn : false,
		type : "POST",
		data : $('#contract_info_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					$("#contract_info_edit").empty();
					commonUtil.showPopup("提示", "保存成功");
					searchContractInfo(1);
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

// 关闭窗口
$("body").on("click", ".commonTable-opt-close", function() {
	$("#commonTable").empty();
});

// 绑定承运方输入框
$("body").on("click", ".sub_shipper_check", function() {
	var isChecked = $(this).is(":checked");
	$(".sub_shipper_check").prop("checked", false);
	if (isChecked) {
		$(this).prop("checked", isChecked);
	} else {
		$(this).prop("checked", isChecked);
	}
});

// 删除选中的合同主信息
function deleteCheckedContractInfo() {
	var contractInfoIds = findAllCheckedContractInfoIds();
	deleteContractInfo(contractInfoIds);
}
// 删除合同主信息
function deleteContractInfo(contractInfoIds) {
	// 校验合同ID
	if (contractInfoIds == null) {
		commonUtil.showPopup("提示", "所选合同信息不能为空！");
		return;
	}
	$.confirm({
		title : "提示",
		content : "是否确认删除所选合同信息",
		buttons : {
			'确认' : function() {
				$.ajax({
					url : basePath + "/contractInfo/deleteContractInfo",
					asyn : false,
					type : "POST",
					data : {
						"contractInfoIds" : contractInfoIds
					},
					dataType : "json",
					success : function(dataStr) {
						if (dataStr) {
							if (dataStr.success) {
								commonUtil.showPopup("提示", dataStr.msg);
								searchContractInfo(1);
							} else {
								commonUtil.showPopup("提示", dataStr.msg);
								return;
							}
						} else {
							commonUtil.showPopup("提示", "删除合同服务异常，请稍后重试");
							return;
						}
					}
				});
			},
			'取消' : function() {

			}
		}
	});
}

/*
 * 合同确认
 */
$("body").on("click", ".confirm-operation", function() {
	var contractInfoId = $(this).parent().attr("contract-info-id");
	var shipperOrgRoot = $(this).parent().attr("shipper-org-root");
	// 主键ID存在则进行权限校验
	if (contractInfoId) {
		// 合同修改前校验
		$.ajax({
			url : basePath + "/contractInfo/checkBeforeConfirm",
			asyn : false,
			type : "POST",
			data : {
				"contractInfoId" : contractInfoId,
				"shipperOrgRoot" : shipperOrgRoot
			},
			dataType : "json",
			success : function(dataStr) {
				if (dataStr) {
					if (dataStr.success) {
						$("#confirmModal").modal("show");
						$("#contract_id").val(contractInfoId);
					} else {
						commonUtil.showPopup("提示", dataStr.msg);
						return;
					}
				} else {
					commonUtil.showPopup("提示", "合同确认服务异常忙，请稍后重试");
					return;
				}
			}
		});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

//协同状态变化
function cooperateStatusChange(){
	$("#shipper").val(null);
	$("#shipper_name").val(null);
	$("#shipper_org_root").val(null);
	$("#shipper_org_root_name").val(null);
}
