var ajaxing = false; // 请求是否正在进行中

// 明细（运单）
var detailWaybillPage = null;

// 对账单id
var globalAccountInfoId = null;

$(function() {
//	$(".iscroll-detail").mCustomScrollbar({
//	theme: "minimal-dark"
//	});
	searchAccountCheckInfo(1);
	
	//时间调用插件
    setTimeout(function() {
       $(".date-time").datetimepicker({
          format: "YYYY-MM-DD",
          autoclose: true,
          todayBtn: true,
          todayHighlight: true,
          showMeridian: true,
          pickerPosition: "bottom-left",
          startView: 2,//月视图
          minView: 2//日期时间选择器所能够提供的最精确的时间选择视图
        }); 
    },500);
    
   
	//uploadLoadFile($("#importBtn"));
	//uploadLoadFile($(".loadExcels"));
	
});

/**
 * 根据页数查询对账信息
 * @param number
 */
function searchAccountCheckInfo(number) {
	// 对账单编号
	var accountCheckId = $.trim($("#accountCheckId").val());
	// 对账单状态
	var accountCheckStatus = $("#accountCheckStatus").val();
	//制单日期
	var makeTimeStart = $("#makeTimeStart").val();
	var makeTimeEnd = $("#makeTimeEnd").val();

	// 请求地址
	var url = basePath + "/accountCheckInfo/listAccountCheckInfo #account_check_info_list";
	$("#search_account_check_info").load(url, {
		"page" : number,
		"rows" : 10,
		"accountCheckId" : accountCheckId,
		"accountCheckStatus" : accountCheckStatus,
		"makeTimeStart" : makeTimeStart,
		"makeTimeEnd" : makeTimeEnd,
		"confirmPrice":$("#confirmPrice").val(),
		"confirmForwardingTonnage":$("#confirmForwardingTonnage").val(),
		"confirmArriveTonnage":$("#confirmArriveTonnage").val(),
		"confirmLossTonnage":$("#confirmLossTonnage").val(),
		"confirmOutCar":$("#confirmOutCar").val(),
		"lossDifference":$("#lossDifference").val(),
		"otherDifference":$("#otherDifference").val(),
		"differenceIncome":$("#differenceIncome").val(),
		"confirmUser":$("#confirmUser").val(),
		"confiirmTimeStart":$("#confiirmTimeStart").val(),
		"confiirmTimeEnd":$("#confiirmTimeEnd").val()
	}, function() {
	    //允许表格拖着
		
		$("#tableDrag").colResizable({
			liveDrag:true, 
			gripInnerHtml:"<div class='grip'></div>", 
			draggingClass:"dragging",
			resizeMode: 'overflow'
    	});	 
		//setTimeout(function(){},500);
	}); 
}

/*
 * 审核操作
 */
$("body").on("click", ".audit-operation", function() {
	var accountCheckInfoId = $(this).parent().attr("account-check-info-id");
	// 主键ID存在则进行审核
	if (accountCheckInfoId) {
		operateAccountCheckInfo(accountCheckInfoId,3);
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 对账信息提交审核
 * @param accountCheckInfoId 对账信息ID
 */
$("body").on("click", ".submit-operation", function() {
	var accountCheckInfoId = $(this).parent().attr("account-check-info-id");
	if (accountCheckInfoId) {
		$.confirm({
			title : "提示",
			content : "是否确认将所选对账信息提交审核？",
			buttons : {
				'确认' : function() {
					operateAccountCheckInfo(accountCheckInfoId,2);
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
 * 根据ID删除自有对账信息信息
 * @param accountCheckInfoId 对账信息ID
 */
$("body").on("click", ".delete-operation", function() {
	var accountCheckInfoId = $(this).parent().attr("account-check-info-id");
	if (accountCheckInfoId) {
		$.confirm({
			title : "提示",
			content : "是否确认删除所选对账信息？",
			buttons : {
				'确认' : function() {
					operateAccountCheckInfo(accountCheckInfoId,4);
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
 * 自有对账信息信息查看
 */
$("body").on("click", ".view-operation", function() {
	var accountCheckInfoId = $(this).parent().attr("account-check-info-id");
	$("#car_info_id").val(accountCheckInfoId);
	$("#edit_form").attr("action", basePath + "/accountCheckInfo/viewAccountCheckInfoPage");
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
			if ($(this).attr("data-status") != 2) {
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
 * 获取所有选中的对账信息ID
 */
function findAllCheckAccountCheckInfoIds() {
	// 所有选中对账信息ID
	var accountCheckInfoIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			accountCheckInfoIds.push($(this).attr("data-id"))
		}
	});
	return accountCheckInfoIds.join(",");
}

/**
 * 分页查询
 * @param number 页数
 */
function pagerGoto(number) {
	searchAccountCheckInfo(number);
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
	searchAccountCheckInfo(goPage);
}

/**
 * 新增对账单信息初始页
 */
function addAccountCheckInfoPage() {
	// 请求地址
	window.location.href = basePath + "/accountCheckInfo/editAccountCheckInfoPage";
}

/**
 * 编辑自有对账信息信息初始页
 * @param accountCheckInfoId 对账信息ID
 * @author zhangya 2017年6月1日
 */
$("body").on("click",".modify-operation",function() {
	var accountCheckInfoId = $(this).parent().attr("account-check-info-id");
	// 对账单类型（1：结算单对账、2：运单对账）
	var accountType = $(this).parent().attr("account-type");
	// 主键ID存在则进行权限校验
	if (accountCheckInfoId) {
		if (accountType == 2 || accountType == '2') {
			//弹出修改页面
			$("#account_check_info_id").val(accountCheckInfoId);
			$("#edit_form").attr("action",basePath+ "/accountCheckInfo/editAccountCheckInfoPageForWaybillAccount");
			$("#edit_form").submit();
		} else {
			operateAccountCheckInfo(accountCheckInfoId,1);
		}
		
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});



/**
 * 编辑审核信息提交
 */
function auditWin(accountCheckInfoIds) {
	$.confirm({
				title : '请您填写审核意见:',
				content : ''
						+ '<form action="" class="formName">'
						+ '<div class="form-group">'
						+ '<textarea type="text" placeholder="审核意见" id ="opinion" class="name form-control" required style="height:150px" />'
						+ '</div>' + '</form>',
				buttons : {
					formSubmit : {
						text : '通过',
						btnClass : 'btn-blue',
						action : function() {
							var opinion = $("#opinion").val();
							var auditInfo = {"opinion" : opinion,"result" : 1,"accountCheckInfoIds" : accountCheckInfoIds};
							// 提交对账信息审核意见信息
							$.ajax({
								url : basePath + "/accountCheckInfo/auditAccountCheckInfo",
								asyn : false,
								type : "POST",
								data : auditInfo,
								dataType : "json",
								success : function(dataStr) {
									if (dataStr) {
										if (dataStr.success) {
											commonUtil.showPopup("提示", dataStr.msg);
											searchAccountCheckInfo(1);
										} else {
											commonUtil.showPopup("提示",dataStr.msg);
											return;
										}
									} else {
										commonUtil.showPopup("提示","保存对账信息服务异常忙，请稍后重试");
										return;
									}
								}
							});
						}
					},
					formSubmit1 : {
						text : '不通过',
						btnClass : 'btn-red',
						action : function() {
							var opinion = $("#opinion").val();
							var auditInfo = {
								"opinion" : opinion,
								"result" : 2,
								"accountCheckInfoIds" : accountCheckInfoIds
							};
							// 提交对账信息审核意见信息
							$.ajax({
								url : basePath + "/accountCheckInfo/auditAccountCheckInfo",
								asyn : false,
								type : "POST",
								data : auditInfo,
								dataType : "json",
								success : function(dataStr) {
									if (dataStr) {
										if (dataStr.success) {
											commonUtil.showPopup("提示", dataStr.msg);
											searchAccountCheckInfo(1);
										} else {
											commonUtil.showPopup("提示",dataStr.msg);
											return;
										}
									} else {
										commonUtil.showPopup("提示","保存对账信息服务异常忙，请稍后重试");
										return;
									}
								}
							});
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
 * 绑定上传事件的dom对象
 * @author zhangya 2017年6月1日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn, {
		action : basePath + '/accountCheckInfo/importAccountCheckDetail',
		name : 'myfile',
		dataType : 'json',
		data:{"accountCheckInfoId":accountCheckInfoId},
		onSubmit : function(file, ext) {
			// 文件上传格式校验
			if (!(ext && /^(xlsx|xls)$/.test(ext.toLowerCase()))) {
				commonUtil.showPopup("提示", "请上传格式为 xlsx|xls 的文件");
				return;
			}
		},
		// 服务器响应成功时的处理函数
		onComplete : function(file, resultJson) {
			if (resultJson) {
				resultJson = $.parseJSON(resultJson);
				if (resultJson.success) {
					commonUtil.showPopup("提示", resultJson.msg);
				} else {
					commonUtil.showPopup("提示", resultJson.msg);
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
 * 对账信息管理操作（1 修改 2 提交审核 3 审核 4 删除）
 * @param accountCheckInfoIds 对账单ID
 * @param operateType 操作类型 
 */
function operateAccountCheckInfo(accountCheckInfoIds,operateType) {

	$.ajax({
			url : basePath + "/accountCheckInfo/operateAccountCheckInfo",
			asyn : false,
			type : "POST",
			data : {
				"accountCheckInfoIds" : accountCheckInfoIds,
				"operateType" : operateType
			},
			dataType : "json",
			success : function(dataStr) {
				if (dataStr) {
					if (dataStr.success) {
						if (operateType == 1) {
							//弹出修改页面
							$("#account_check_info_id").val(accountCheckInfoIds);
							$("#edit_form").attr("action",basePath+ "/accountCheckInfo/editAccountCheckInfoPage	");
							$("#edit_form").submit();
						}else if (operateType == 2) {
							commonUtil.showPopup("提示", dataStr.msg);
							//数据刷新
							searchAccountCheckInfo(1);
							
						}else if (operateType == 3) {
							//弹出审核框
							auditWin(accountCheckInfoIds);
						}else if (operateType == 4) {
							commonUtil.showPopup("提示", dataStr.msg);
							//数据刷新
							searchAccountCheckInfo(1);
						}
					} else {
						commonUtil.showPopup("提示", dataStr.msg);
						return;
					}
				} else {
					commonUtil.showPopup("提示", "保存对账信息信息服务异常忙，请稍后重试");
					return;
				}
			}
		});
}

/**
 * 操作选中的对账信息
 * @param operateType
 * @returns
 */
function operateAllCheckedAccountInfo(operateType){
	//校验操作类型
	if (operateType == undefined || operateType == "") {
		commonUtil.showPopup("提示", "操作无效！");
		return;
	}
	var operateTypeStr = "";
	if (operateType == 1) {
		operateTypeStr = "修改"
	}else if (operateType == 2) {
		operateTypeStr = "提交审核"
	}else if (operateType == 3) {
		operateTypeStr = "审核"
	}else if (operateType == 4) {
		operateTypeStr = "删除"
	}else if (operateType == 5) {
		operateTypeStr = "发送确认"
	}
	//获取选中的对账信息ID
	var accountCheckInfoIds = findAllCheckAccountCheckInfoIds();
	// 获取选中的操作记录
	if (accountCheckInfoIds == undefined || accountCheckInfoIds == "") {
		commonUtil.showPopup("提示", "请选择要" + operateTypeStr + "的对账信息！");
		return;
	}
	
	$.confirm({
		title : "提示",
		content : "是否确认"+operateTypeStr+"所选对账信息？",
		buttons : {
			'确认' : function() {
				operateAccountCheckInfo(accountCheckInfoIds,operateType);
			},
			'取消' : function() {
			}
		}
	});
	
}
/**
 * 导出
 */
function exportAccount(){
	var ids = findAllCheckAccountCheckInfoIds(); // 1,2,3
	if (ids == null || ids == '' || ids == undefined) {
		commonUtil.showPopup("提示", "请选择数据");
		return ;
	}
	$("#ids").val(ids);
	var url = basePath + "/accountCheckInfo/exportAccount";
    $('#exportAccount').attr('action', url);
    $('#exportAccount').submit();
}

/**
 * 打印
 */
function printAccount(){
	var selectlist = findAllCheck(".sub_check");
	if (selectlist.length != 1) {
		commonUtil.showPopup("提示", "请选择 1 条数据");
		return ;
	}
	$("#print-id").val(selectlist[0].id);
	var url = basePath+"/accountCheckInfo/showPrintAccountPage";
	$('#printAccount').attr('action', url);
    $('#printAccount').submit();
}


/**
 * 查找选择
 */
function findAllCheck(element) {
	var checkList = new Array();
	$(element).each(function() {
		if ($(this).is(":checked")) {
			var params = {
				"id" : $(this).attr("data-id"),
				"name" : $(this).attr("data-name")
			}
			checkList.push(params);
		}
	});
	return checkList;
}

/**
 * 显示运单对账新增修改界面
 * op 操作类型 
 */
function showWaybillAccountPage(){
	// 请求地址
	window.location.href = basePath + "/accountCheckInfo/showWaybillAccountPage";
}

/**
 * 显示对账但明细界面（运单对账）
 */
function detailWabyillWinShow(accountInfoId){
	globalAccountInfoId = accountInfoId;
	$("#detailWaybillModal").modal("show");
	$(".all_detail_wabyill_check").prop("checked", false);
		
	$(".all_detail_wabyill_check").on('click',function(){
		if ($(this).is(':checked')) {
			// 全选
			$(".sub_detail_wabyill_check").each(function(){
				$(this).prop("checked", true);
			});
		} else {
			// 全不选
			$(".sub_detail_wabyill_check").each(function(){
				$(this).prop('checked',false);
			});
		}
	});
	
	//允许表格拖着
//	setTimeout(function() {
//		$("#accountDetailWaybillTable").colResizable({
//			liveDrag:true, 
//			gripInnerHtml:"<div class='grip'></div>", 
//			draggingClass:"dragging",
//			resizeMode: 'overflow'
//		});
//    },500);
	
	
	detailWaybillPage = $(".detail-pagination-list").operationList({
		"current" : 1, // 当前目标
		"maxSize" : 4, // 前后最大列表
		"itemPage" : 10, // 每页显示多少条
		"totalItems" : 0, // 总条数
		"chagePage" : function(current) {
			// 调用ajax请求拿最新数据
			loadDetailWaybillList(1);
		}
	});
	
	// 加载数据
	loadDetailWaybillList(1);
}

function loadDetailWaybillList(current){
	detailWaybillPage.options.current  = current;
	$.ajax({
		url : "getDetailWaybill",
		data : {
			'accountCheckInfoId' : globalAccountInfoId,
			'page' : detailWaybillPage.options.current,
			'rows' : detailWaybillPage.options.rows
		},
		dataType : "json",
		type : "post",
		async : false,
		success : function(resp) {
			console.log(resp);
			var list = resp.list;
			var count = resp.count;
			var length = list.length;
			if (length == null || length == undefined) {
				length = 0;
			}

			$("#detailWaybillTBody").html("");
			$.each(list, function(index, ele) {
				var shipperName =ele.shipperName;
				if(shipperName == null){
					shipperName ="";
				}
				// 追加数据
				var tr = "";
				tr += "<tr class='table-body' align='center'>";
				tr += "<td style='width: 40px;'><label class='i-checks'> <input type='checkbox' class='sub_detail_wabyill_check' data-id="+ele.id+"></label></td>";
				tr += "<td>" + formatString(ele.waybillId)  + "</td>";
				tr += "<td>" + formatString(ele.carCode)  + "</td>";
				tr += "<td>" + formatString(ele.entrustName) + "</td>";
				tr += "<td>" + formatString(ele.goodsName) + "</td>";
				tr += "<td>" + formatString(ele.scatteredGoods) + "</td>";
				tr += "<td>" + formatString(ele.lineName) + "</td>";
				tr += "<td>" + formatString(ele.forwardingUnit) + "</td>";
				tr += "<td>" + formatString(ele.consignee) + "</td>";
				// 将tr追加
				$("#detailWaybillTBody").append(tr);
			});
			$("#detailWaybillNum").html(count);
			detailWaybillPage.setTotalItems(count);
		}
	});
}
/**
 * 明细-运单-翻页
 * @param e
 */
function detailWaybillPageJump(e){
	var value = e.prve().find('input').val();
	loadDetailWaybillList(value);
}

/**
 * 处理string
 */
function formatString(value){
	if (value == null || value == undefined) {
		return '';
	}
	return value;
}
/**
 * 处理数字
 */
function formatNumber(value){
	if (value == null || value == undefined) {
		return 0;
	}
	return value;
}
/**
 * 明细-运单-删除
 */
function deleteDetailWaybill(){
	var accountDetailIds = [];
	$(".sub_detail_wabyill_check").each(function(){
		if ($(this).is(":checked")) {
			var id = $(this).attr("data-id");
			accountDetailIds.push(id);
		}
	});
	if (accountDetailIds.length == 0) {
		commonUtil.showPopup("提示", "请选择数据");
		return;
	}
	
	var params = {"accountDetailIds":accountDetailIds.join(",")};
	
	$.ajax({
		url : basePath + "/accountCheckInfo/deleteAccountDetailWaybill",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){commonUtil.showPopup("提示","请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(resp) {
			if (resp) {
				if (resp.success) {
					commonUtil.showPopup("提示","删除成功");
					// 刷新明细表格
					loadDetailWaybillList(1);
					// 刷新表格
					searchAccountCheckInfo(1);
				} else {
					commonUtil.showPopup("提示",resp.msg);
				}
			} else {
				commonUtil.showPopup("提示","服务异常忙，请稍后重试");
			}
		},
		error:function(){ajaxing = false;xjValidate.showTip("提示","服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	
}


/**
 * 预览
 */
function accountPreview(){
	// 获取选中的数据
	var accountCheckInfoIdList = [];
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			var id = $(this).attr("data-id");
			accountCheckInfoIdList.push(id);
		}
	});
	if (accountCheckInfoIdList.length != 1) {
		commonUtil.showPopup("提示", "请选择 1 条数据");
		return;
	}

	// 对账单主键
	var accountCheckInfoId = accountCheckInfoIdList[0];

	$.ajax({
		url : basePath + "/accountCheckInfo/getAccountCheckInfoByPKey",// 请求的action路径
		async : false,// 是否异步
		cache : false,// 是否使用缓存
		type : 'POST',// 请求方式：post
		data : { "accountCheckInfoId" : accountCheckInfoId },
		dataType : 'json',// 数据传输格式：json
		beforeSend:function(){
			if(ajaxing){commonUtil.showPopup("提示","请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		error:function(){ajaxing = false;xjValidate.showTip("提示","服务请求失败");},
		success : function(resp) {
			ajaxing = false;
			if (!resp) {
				commonUtil.showPopup("提示","服务异常忙，请稍后重试");
				return;
			}
			if (!resp.success) {
				commonUtil.showPopup("提示",resp.msg);
				return;
			}
			
			var accountCheckInfo = resp.accountCheckInfo;
			getAccountForPrint(accountCheckInfo);

			LODOP = getLodop();
			
			LODOP.SET_SHOW_MODE("HIDE_PBUTTIN_PREVIEW", false);
			LODOP.SET_PRINT_PAGESIZE(1, document.getElementById('W1').value,document.getElementById('H1').value, "");
			LODOP.ADD_PRINT_HTM("0.5cm", "2cm", "24cm", "14cm", document.getElementById("printBody1").innerHTML);
			LODOP.SET_PRINT_MODE("CATCH_PRINT_STATUS", true);
			if (LODOP.CVERSION) {
				CLODOP.On_Return = function(TaskID, Value) {};
			}
			
			LODOP.PREVIEW();
			$("#printBody1").empty();
			
		}
	});
}
/**
 * 打印
 */

function accountPrint(){
	 
	// 获取选中的数据
	var accountCheckInfoIdList = [];
	$(".sub_check").each(function(){
		if ($(this).is(":checked")) {
			var id = $(this).attr("data-id");
			accountCheckInfoIdList.push(id);
		}
	});
	if (accountCheckInfoIdList.length == 0 || accountCheckInfoIdList.length != 1) {
		commonUtil.showPopup("提示", "请选择 1 条数据");
		return;
	}
	
	// 对账单主键
	var accountCheckInfoId = accountCheckInfoIdList[0];
	
	// 打印
	$.ajax({
		url : basePath + "/accountCheckInfo/getAccountCheckInfoByPKey",
		async : false,// 是否异步
		cache : false,// 是否使用缓存
		type : 'POST',// 请求方式：post
		data : {"accountCheckInfoId":accountCheckInfoId},
		dataType : 'json',// 数据传输格式：json
		beforeSend:function(){
			if(ajaxing){commonUtil.showPopup("提示","请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		error:function(){ajaxing = false;xjValidate.showTip("提示","服务请求失败");},
		success : function(resp) {
			ajaxing = false;
			if (!resp) {
				commonUtil.showPopup("提示","服务异常忙，请稍后重试");
				return;
			}
			if (!resp.success) {
				commonUtil.showPopup("提示",resp.msg);
				return;
			}
			
			var accountCheckInfo = resp.accountCheckInfo;
			getAccountForPrint(accountCheckInfo);
			LODOP = getLodop();
			LODOP.SET_PRINT_PAGESIZE(1,document.getElementById('W1').value,document.getElementById('H1').value,"");
			LODOP.ADD_PRINT_HTM("0.5cm","2cm","24cm","14cm",document.getElementById("printBody1").innerHTML);
			LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME","对账单打印");// 为每个打印单独设置任务名
			LODOP.PRINT();
			$("#printBody1").empty();
		}
	});
			       
	
}


//获取结算单打印的值
function getAccountForPrint(accountCheckInfo){
	$("#printBody1").html("");
	$("#printBody1").empty();
	
	$("#printBody1").append(
			"<div style = 'float:left;width:98%;font-family:'yahei''>" +
			
			"<div class='t-head' style = 'width: 100%;text-align: center;font-size:30px;'>对账单</div>" +
			
			"<table class='t-form' style = 'text-left:center;font-size:14px;margin-top:15px'>" +
			"<tbody>" +
			"<tr>" +
			"<td colspan='3'>客户名称："+formatString(accountCheckInfo.customerName)+"</td>" +
			"<td colspan='3' >组织部门："+formatString(accountCheckInfo.orgInfoName)+"</td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='3'>货物名称："+formatString(accountCheckInfo.goodsName)+"</td>" +
			"<td colspan='3' >对账单编号："+formatString(accountCheckInfo.accountCheckId)+"</td>" +
			"</tr>" +
			"</tbody>" +
			"</table>" +
			
			"<table class='t-table' style = 'table-layout: fixed;width:100%;height:260px;text-align: center;border-collapse:collapse;border:1px solid;margin-top:10px'>" +
			"<tbody>" +
			
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>确认金额</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.confirmPrice)+"</td>" +
			"<td style = 'border:1px solid;'>确认发货吨位</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.confirmForwardingTonnage)+"</td>" +
			"<td style = 'border:1px solid;'>确认到货吨位</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.confirmArriveTonnage)+"</td>" +
			"</tr>" +
			
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>应收金额</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.receiveableTotal)+"</td>" +
			"<td style = 'border:1px solid;'>系统发货吨位</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.forwardingTonnage)+"</td>" +
			"<td style = 'border:1px solid;'>系统到货吨位</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.arriveTonnage)+"</td>" +
			"</tr>" +
			
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>单据总数</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.documentsTotal)+"</td>" +
			"<td style = 'border:1px solid;'>出车数</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.outCar)+"</td>" +
			"<td style = 'border:1px solid;'>确认车数</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.confirmOutCar)+"</td>" +
			"</tr>" +
			
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>其它差异</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.otherDifference)+"</td>" +
			"<td style = 'border:1px solid;'>客户抠损</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.lossDifference)+"</td>" +
			"<td style = 'border:1px solid;' colspan='2'></td>" +
			"</tr>" +
			
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>调差金额</td>" +
			"<td style = 'border:1px solid;'>"+formatNumber(accountCheckInfo.differenceIncome)+"</td>" +
			"<td style = 'border:1px solid;'>大写</td>" +
			"<td style = 'border:1px solid;' colspan='3'>"+formatNumber(accountCheckInfo.bigWrite)+"</td>" +
			"</tr>" +
			
			"<tr style = 'border:1px solid;'>" +
			"<td style = 'border:1px solid;'>备注</td>" +
			"<td style = 'border:1px solid;' colspan='5'>"+formatNumber(accountCheckInfo.remarks)+"</td>" +
			"</tr>" +
			
			"</tbody>" +
			"</table>" +
			
			"<table class='t-foot' style = 'width: 100%;text-left: center;font-size:14px;margin-top:10px'>" +
			"<tbody>" +
			"<tr><td style = 'padding-left: 10mm;'>制单人："+formatString(accountCheckInfo.createUserName)+"</td>" +
			"<td></td><td style = 'padding-left: 0mm;'>复核人：</td>" +
			"<td></td><td style = 'padding-left: 0mm;'>收款人：</td>" +
			"<td colspan='4' class='textarea-td'>打印时间："+new Date().toLocaleString()+"</td></tr>" +
			"</tbody>" +
			"</table>" +
			
			"</div>" 
		);
}