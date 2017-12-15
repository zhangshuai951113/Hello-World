// 是否正在请求
var ajaxing = false;
//单据条目数  （与数组长度一致）
var settleInfoTotal = Number($("#out_car").val());
//应收总额
var receivableTotal = Number($("#receivable_total").val());
//应付总额
var payableTotal = Number($("#payable_total").val());
//代开总额
var proxyInvoiceTotalSum = Number($("#proxy_invoice_total").val());
//发货吨位
var forwardingTonnageSum = Number($("#confirm_forwarding_tonnage").val());
//到货吨位
var arriveTonnageSum = Number($("#confirm_arrive_tonnage").val());
//损耗吨位
var lossTonnageSum = Number($("#confirm_loss_tonnage").val());

var selectedIds = new Array();

$(function() {
	// tab页切换
	$(".tab-box .tab-text").bind("click", function() {
		var target = $(this).data("target");
		if (target == "#account-check-info-tab") {
		} else if (target == "#settlement-info-tab") {
			// 查询结算单信息
			searchSettlementInfo(1);
		}
		$(".tab-box .tab-text").removeClass("active");
		$(this).addClass("active");
		$(".tab-content").hide();
		$(target).show();
	});
	
	// 给导入结算单按钮绑定事件
	uploadLoadFile($("#importSettlementBtn"));

});



/**
 * 导入结算单
 */
function uploadLoadFile(button) {

	new AjaxUpload(button,{
   		action: basePath + "/accountCheckInfo/importWaybills",
   		name: 'myfile',
   		data:{'id':$("#hidden_id").val(),'selectedIds':selectedIds.join(',')},
		responseType: 'json',
   		onSubmit : function(file , ext){
   			//文件上传格式校验
   			if (!(ext && /^(xls|xlsx)$/.test(ext.toLowerCase()))){
   				commonUtil.showPopup("提示", "请上传格式为 xls|xlsx 的文件");
   				return;
   			}
   		},
   		//服务器响应成功时的处理函数
   		onComplete :function(file, resultJson){
   			console.log(resultJson);
   			if (resultJson) {
   				if (resultJson.success) {
   	   				// 导入时
   	   				var data = resultJson.data;
   	   				// 选中的id
   	   				selectedIds = resultJson.settlementIdList;
   	   				//单据条目数  （与数组长度一致）
	   	   			settleInfoTotal = Number(data.count);
	   	   			//应收总额
	   	   			receivableTotal = Number(data.receivableTotal);
	   	   			//应付总额
	   	   			payableTotal = Number(data.payableTotal);
	   	   			//代开总额
	   	   			proxyInvoiceTotalSum = Number(data.proxyInvoiceTotalSum);
	   	   			//发货吨位
	   	   			forwardingTonnageSum = Number(data.forwardingTonnageSum);
	   	   			//到货吨位
	   	   			arriveTonnageSum = Number(data.arriveTonnageSum);
	   	   			//损耗吨位
	   	   			lossTonnageSum = Number(data.lossTonnageSum);
   	   				
		   	   		$("#out_car").val(settleInfoTotal);
					$("#documents_total").val(settleInfoTotal);
					$("#receivable_total").val(receivableTotal.toFixed(2));
					$("#payable_total").val(payableTotal.toFixed(2));
					$("#confirm_price").val(receivableTotal.toFixed(2));
					$("#proxy_invoice_total").val(proxyInvoiceTotalSum.toFixed(2));
					//确认发货吨位
					$("#confirm_forwarding_tonnage").val(forwardingTonnageSum.toFixed(2));
					//确认到货吨位
					$("#confirm_arrive_tonnage").val(arriveTonnageSum.toFixed(2));
					//确认损耗吨位
					$("#confirm_loss_tonnage").val(lossTonnageSum.toFixed(2));
					// 发货吨位
					$("#forwarding_tonnage").val(forwardingTonnageSum.toFixed(2));
					// 到货吨位
					$("#arrive_tonnage").val(arriveTonnageSum.toFixed(2));
					// 损耗吨位
					$("#loss_tonnage").val(lossTonnageSum.toFixed(2));
					
					commonUtil.showPopup("提示", resultJson.msg);
   	   			} else {
   	   				commonUtil.showPopup("提示", resultJson.msg);
   	   			}
   			} else {
   				commonUtil.showPopup("提示", "服务器异常，请稍后重试");
   			}
		}
	});
}

/**
 * 导入结算单
 */
function importSettlement(){
	$("#importSettlementBtn").click();
}

//全选/全不选
$("body").on("click", ".all_check", function() {
	// 当前记录选中状态
	var currentStatus = null;	
	if ($(".all_check").is(":checked")) {
		// 全选时
		$(".sub_check").each(function() {
			currentStatus = $(this).is(":checked");
			if (!currentStatus) {
				// 当被全部选中时，此前未被选中的记录参与汇总
				$(this).prop("checked", true);
				settleInfoTotal++;
				if (settleInfoTotal > 50) {
					commonUtil.showPopup("提示", "所选结算单数量不得超过50！");
					return false;
				}
				selectedIds.push(($(this).attr("data-id")));
				//客户运费  汇总到应收总额
				receivableTotal += ($(this).attr("customer-price") == "") ? 0: Number($(this).attr("customer-price"));
				//应付运费  汇总到应付总额
				payableTotal += ($(this).attr("payable-price") == "") ? Number(0): Number($(this).attr("payable-price"));
				//结算单代开总额  汇总到代开总额
				proxyInvoiceTotalSum += ($(this).attr("proxyInvoice-total") == "") ? Number(0): Number($(this).attr("proxyInvoice-total"));
				//发货吨位
				forwardingTonnageSum += ($(this).attr("forwarding-tonnage") == "") ? Number(0): Number($(this).attr("forwarding-tonnage"));
				//到货吨位
				arriveTonnageSum += ($(this).attr("arrive-tonnage") == "") ? Number(0): Number($(this).attr("arrive-tonnage"));
				//损耗吨位
				lossTonnageSum += ($(this).attr("loss-tonnage") == "") ? Number(0): Number($(this).attr("loss-tonnage"));
				
			}
		});
	} else {
		// 全不选时
		$(".sub_check").each(function() {
			// 当被全部取消时，全部记录参与减法运算
			$(this).prop("checked", false);
			settleInfoTotal--;
			//获取当前元素的索引
			var index = $.inArray($(this).attr("data-id"),selectedIds);
			//删除
			selectedIds.splice(index,1);
			//客户运费	从应收总额中抹去
			receivableTotal -= ($(this).attr("customer-price") == "") ? 0: Number($(this).attr("customer-price"));
			//应付运费	从应付总额中抹去
			payableTotal -= ($(this).attr("payable-price") == "") ? 0: Number($(this).attr("payable-price"));
			//结算单代开总额	从代开总额中抹去
			proxyInvoiceTotalSum -= ($(this).attr("proxyInvoice-total") == "") ? 0: Number($(this).attr("proxyInvoice-total"));
			//发货吨位
			forwardingTonnageSum -= ($(this).attr("forwarding-tonnage") == "") ? Number(0): Number($(this).attr("forwarding-tonnage"));
			//到货吨位
			arriveTonnageSum -= ($(this).attr("arrive-tonnage") == "") ? Number(0): Number($(this).attr("arrive-tonnage"));
			//损耗吨位
			lossTonnageSum -= ($(this).attr("loss-tonnage") == "") ? Number(0): Number($(this).attr("loss-tonnage"));
		});
	}
	$.ajax({
		url:basePath+"/accountCheckInfo/findShipperName",
		data:{selectedIds:selectedIds.join(",")},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					$("#out_car").val(settleInfoTotal);
					$("#documents_total").val(settleInfoTotal);
					$("#receivable_total").val(receivableTotal.toFixed(2));
					$("#payable_total").val(payableTotal.toFixed(2));
					$("#confirm_price").val(receivableTotal.toFixed(2));
					$("#proxy_invoice_total").val(proxyInvoiceTotalSum.toFixed(2));
					//确认发货吨位
					$("#confirm_forwarding_tonnage").val(forwardingTonnageSum.toFixed(2));
					//确认到货吨位
					$("#confirm_arrive_tonnage").val(arriveTonnageSum.toFixed(2));
					//确认损耗吨位
					$("#confirm_loss_tonnage").val(lossTonnageSum.toFixed(2));
					// 发货吨位
					$("#forwarding_tonnage").val(forwardingTonnageSum.toFixed(2));
					// 到货吨位
					$("#arrive_tonnage").val(arriveTonnageSum.toFixed(2));
					// 损耗吨位
					$("#loss_tonnage").val(lossTonnageSum.toFixed(2));
				}else{
					commonUtil.showPopup("提示", resp.msg);
					searchSettlementInfo(1);
					return false;
				}
			}else{
				commonUtil.showPopup("提示", "系统异常，请稍后再试!");
				return false;
			}
		}
	});
	
	
});

// 部分选择判断
$("body").on("click", ".sub_check", function() {
	var isAll = true;
	if ($(this).is(":checked")) {
		$(this).prop("checked", true);
		settleInfoTotal++;
		if (settleInfoTotal > 50) {
			commonUtil.showPopup("提示", "所选结算单数量不得超过50！");
			return false;
		}
		selectedIds.push(($(this).attr("data-id")));
		//客户运费  汇总到应收总额
		receivableTotal += ($(this).attr("customer-price") == "") ? 0: Number($(this).attr("customer-price"));
		//应付运费  汇总到应付总额
		payableTotal += ($(this).attr("payable-price") == "") ? Number(0): Number($(this).attr("payable-price"));
		//结算单代开总额  汇总到代开总额
		proxyInvoiceTotalSum += ($(this).attr("proxyInvoice-total") == "") ? Number(0): Number($(this).attr("proxyInvoice-total"));
		//发货吨位
		forwardingTonnageSum += ($(this).attr("forwarding-tonnage") == "") ? Number(0): Number($(this).attr("forwarding-tonnage"));
		//到货吨位
		arriveTonnageSum += ($(this).attr("arrive-tonnage") == "") ? Number(0): Number($(this).attr("arrive-tonnage"));
		//损耗吨位
		lossTonnageSum += ($(this).attr("loss-tonnage") == "") ? Number(0): Number($(this).attr("loss-tonnage"));
	} else {
		$(this).prop("checked", false);
		settleInfoTotal--;	
		//获取当前元素的索引
		var index = $.inArray($(this).attr("data-id"),selectedIds);
		//删除
		selectedIds.splice(index,1);
		//客户运费  汇总到应收总额
		//客户运费	从应收总额中抹去
		receivableTotal -= ($(this).attr("customer-price") == "") ? 0: Number($(this).attr("customer-price"));
		//应付运费	从应付总额中抹去
		payableTotal -= ($(this).attr("payable-price") == "") ? 0: Number($(this).attr("payable-price"));
		//结算单代开总额	从代开总额中抹去
		proxyInvoiceTotalSum -= ($(this).attr("proxyInvoice-total") == "") ? 0: Number($(this).attr("proxyInvoice-total"));
		//发货吨位
		forwardingTonnageSum -= ($(this).attr("forwarding-tonnage") == "") ? Number(0): Number($(this).attr("forwarding-tonnage"));
		//到货吨位
		arriveTonnageSum -= ($(this).attr("arrive-tonnage") == "") ? Number(0): Number($(this).attr("arrive-tonnage"));
		//损耗吨位
		lossTonnageSum -= ($(this).attr("loss-tonnage") == "") ? Number(0): Number($(this).attr("loss-tonnage"));
	}

	$(".sub_check").each(function() {
		if (!$(this).prop("checked")) {
			isAll = false;
		}
	});
	/*$.ajax({
		url:basePath+"/accountCheckInfo/findShipperName",
		data:{selectedIds:selectedIds.join(",")},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			if(resp){
				
			}else{
				commonUtil.showPopup("提示", "系统异常，请稍后再试!");
				return false;
			}
		}
	});*/
	$(".all_check").prop("checked", isAll);
		$.ajax({
			url:basePath+"/accountCheckInfo/findShipperName",
			data:{selectedIds:selectedIds.join(",")},
			dataType:"JSON",
			type:"POST",
			async:false,
			success:function(resp){
				if(resp){
					if(resp.success){
						$("#out_car").val(settleInfoTotal);
						$("#documents_total").val(settleInfoTotal);
						$("#receivable_total").val(receivableTotal.toFixed(2));
						$("#payable_total").val(payableTotal.toFixed(2));
						$("#confirm_price").val(receivableTotal.toFixed(2));
						$("#proxy_invoice_total").val(proxyInvoiceTotalSum.toFixed(2));
						//确认发货吨位
						$("#confirm_forwarding_tonnage").val(forwardingTonnageSum.toFixed(2));
						//确认到货吨位
						$("#confirm_arrive_tonnage").val(arriveTonnageSum.toFixed(2));
						//确认损耗吨位
						$("#confirm_loss_tonnage").val(lossTonnageSum.toFixed(2));
						// 发货吨位
						$("#forwarding_tonnage").val(forwardingTonnageSum.toFixed(2));
						// 到货吨位
						$("#arrive_tonnage").val(arriveTonnageSum.toFixed(2));
						// 损耗吨位
						$("#loss_tonnage").val(lossTonnageSum.toFixed(2));
					}else{
						$("#out_car").val("");
						$("#documents_total").val("");
						$("#receivable_total").val("");
						$("#payable_total").val("");
						$("#confirm_price").val("");
						$("#proxy_invoice_total").val("");
						//发货吨位
						$("#confirm_forwarding_tonnage").val("");
						//到货吨位
						$("#confirm_arrive_tonnage").val("");
						//损耗吨位
						$("#confirm_loss_tonnage").val("");
						// 发货吨位
						$("#forwarding_tonnage").val("");
						// 到货吨位
						$("#arrive_tonnage").val("");
						// 损耗吨位
						$("#loss_tonnage").val("");
						
						commonUtil.showPopup("提示", resp.msg);
						return false;
					}
				}else{
					commonUtil.showPopup("提示", "系统异常，请稍后再试!");
					return false;
				}
			}
		});
	
});

/**
 * 根据页数查询审批通过的结算单信息
 * @param number
 */
function searchSettlementInfo(number) {
	
	// 请求url
	var url = basePath
			+ "/accountCheckInfo/listSettlementInfo #settlement_info_list";
	$("#search_settlement_info").load(url, {
		"page" : number,
		"rows" : 10,
		"settlementId" : $("#settlementId").val(),
		"waybillId":$("#waybillId").val(),
		"shipperName" : $("#shipperName").val(),
		"carCode":$("#carCode").val(),
		"goodsName":$("#goodsName").val(),
		"forwardingUnit":$("#forwardingUnit").val(),
		"consignee":$("#consignee").val(),
		"entrustName":$("#entrustName").val(),
		"createTimeStart":$("#createTimeStart").val(),
		"createTimeEnd":$("#createTimeEnd").val()
	}, function() {
		
		// 时间调用插件
		setTimeout(function() {
			$(".date-time").datetimepicker({
				format : "YYYY-MM-DD",
				autoclose : true,
				todayBtn : true,
				todayHighlight : true,
				showMeridian : true,
				pickTime : false
			});
		}, 500);
		
		// 允许表格拖着
		setTimeout(function(){
			$("#tablefdfdfDrag").colResizable({
				liveDrag : true,
				gripInnerHtml : "<div class='grip'></div>",
				draggingClass : "dragging",
				resizeMode: 'overflow'
			});
		},500);
		
		
		// 数据较多，增加滑动
		$.mCustomScrollbar.defaults.scrollButtons.enable = true;
		$.mCustomScrollbar.defaults.axis = "yx";
		$(".iscroll").css("min-height", "55px");
		$(".iscroll").mCustomScrollbar({
			theme : "minimal-dark"
		});
		
		//标识选中的记录
		var isAllChecked= true;
		$(".sub_check").each(function() {
			var index = $.inArray($(this).attr("data-id"),selectedIds);
			if (index != -1) {
				$(this).prop("checked",true);
			}else{
				isAllChecked = false;
			}
		});
		$(".all_check").prop("checked",isAllChecked);
	});
	
}

function resetButton(){
	setTimeout(function(){
		searchSettlementInfo(1);
	},100);
}

/*
 * 绑定损耗差异输入框
 */
$("#loss_difference").on("change",function() {
					var lossDifference = ($(this).val() == "") ? Number(0) : Number($(this).val());
					var otherDifference = ($("#other_difference").val() == "") ? Number(0) : Number($("#other_difference").val());
					var incomeTaxRate = ($("#income_tax_rate").val() == "") ? Number(0)	: Number($("#income_tax_rate").val());
					// 根据公式计算 (差异收入=（损耗差异+其他差异）*收入税率)
					var differenceIncome = accMul(accAdd(lossDifference,otherDifference), incomeTaxRate);
					$("#difference_income").val(differenceIncome.toFixed(4));
				});
/*
 * 绑定其它差异输入框
 */
$("#other_difference").on("change",	function() {
					var otherDifference = ($(this).val() == "") ? Number(0)	: Number($(this).val());
					var lossDifference = ($("#loss_difference").val() == "") ? Number(0) : Number($("#loss_difference").val());
					var incomeTaxRate = ($("#income_tax_rate").val() == "") ? Number(0) : Number($("#income_tax_rate").val());
					// 根据公式计算 (差异收入=（损耗差异+其他差异）*收入税率)
					var differenceIncome = accMul(accAdd(lossDifference, otherDifference), incomeTaxRate);
					$("#difference_income").val(differenceIncome.toFixed(4));

				});
/*
 * 绑定收入税率输入框
 */
$("#income_tax_rate").on("change",function() {
					var incomeTaxRate = ($(this).val() == "") ? Number(0) : Number($(this).val());
					var otherDifference = ($("#other_difference").val() == "") ? Number(0) : Number($("#other_difference").val());
					var lossDifference = ($("#loss_difference").val() == "") ? Number(0) : Number($("#loss_difference").val());
					// 根据公式计算 (差异收入=（损耗差异+其他差异）*收入税率)
					var differenceIncome = accMul(accAdd(lossDifference,otherDifference), incomeTaxRate);
					$("#difference_income").val(differenceIncome.toFixed(4));
				});

/**
 * 获取所有选中的合同ID
 * @author zhangya 2017年5月26日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckedAccountCheckInfoIds() {
	// 所有选中合同ID
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
 * @param number  页数
 */
function pagerGoto(number) {
	searchSettlementInfo(number);
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
	searchSettlementInfo(goPage);
}

// 上传图片初始化
//$('.upload_img').each(function() {
//	uploadLoadFile($(this));
//});

/**
 * 编辑审核信息提交
 * @param accountCheckInfoId
 * @author zhangya 2017年5月22日
 */
function auditWin(accountCheckInfoId) {
	$.confirm({
				title : '请您填写备注信息:',
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
							var opinion = this.$content.find('#auditOpinion').val();
							if (!opinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							// 提交审核信息
							accountCheckInfoAudit(accountCheckInfoId, opinion,1)
						}
					},
					formSubmit1 : {
						text : '不通过',
						btnClass : 'btn-red',
						action : function() {
							var opinion = this.$content.find('#auditOpinion').val();
							if (!opinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							// 提交审核信息
							accountCheckInfoAudit(accountCheckInfoId, opinion,2);
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
 * @param accountCheckInfoIds 对账信息ID
 * @param opinion 审核意见
 * @param restul 审核结果
 * @returns
 */
function accountCheckInfoAudit(accountCheckInfoIds, opinion, result) {
	var auditInfo = {
		"opinion" : opinion,
		"result" : result,
		"accountCheckInfoIds" : accountCheckInfoIds
	};
	// 提交主机构审核意见信息
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
 * 提交对账信息
 * @author zhangya
 */
function saveAccountCheckInfo() {
	// 1、对账单编号校验
	var accountCheckId = $.trim($("#account_check_id").val());
	if (accountCheckId == undefined || accountCheckId == "") {
		commonUtil.showPopup("提示", "对账单编号不能为空");
		return;
	}

	// 2、确认账款校验
	var confirmPrice = $.trim($("#confirm_price").val());
	if (confirmPrice == undefined || confirmPrice == "") {
		commonUtil.showPopup("提示", "确认账款不能为空");
		return;
	}
	// 3、确认到货吨位校验
	var confirmArriveTonnage = $.trim($("#confirm_arrive_tonnage").val());
	if (confirmArriveTonnage == undefined || confirmArriveTonnage == "") {
		commonUtil.showPopup("提示", "确认到货吨位不能为空");
		return;
	}

	// 4、确认损耗吨位校验
	var confirmLossTonnage = $.trim($("#confirm_loss_tonnage").val());
	if (confirmLossTonnage == undefined || confirmLossTonnage == "") {
		commonUtil.showPopup("提示", "确认损耗吨位不能为空");
		return;
	}

	// 5、确认出车次数校验
	var confirmOutCar = $.trim($("#confirm_out_car").val());
	if (confirmOutCar == undefined || confirmOutCar == "") {
		commonUtil.showPopup("提示", "确认出车次数不能为空");
		return;
	}

	// 6、确认发货吨位校验
	var confirmForwardingTonnage = $.trim($("#confirm_forwarding_tonnage")
			.val());
	if (confirmForwardingTonnage == undefined || confirmForwardingTonnage == "") {
		commonUtil.showPopup("提示", "确认发货吨位不能为空");
		return;
	}
	// 7、损耗差异校验
	var lossDifference = $.trim($("#loss_difference").val());
	if (lossDifference == undefined || lossDifference == "") {
		commonUtil.showPopup("提示", "损耗差异不能为空");
		return;
	}
	// 8、其它差异校验
	var otherDifference = $.trim($("#other_difference").val());
	if (otherDifference == undefined || otherDifference == "") {
		commonUtil.showPopup("提示", "其它差异不能为空");
		return;
	}
	// 9、收入税率校验
	var incomeTaxRate = $.trim($("#income_tax_rate").val());
	if (incomeTaxRate == undefined || incomeTaxRate == "") {
		commonUtil.showPopup("提示", "收入税率不能为空");
		return;
	}
	// 10、差异收入校验
	var differenceIncome = $.trim($("#difference_income").val());
	if (differenceIncome == undefined || differenceIncome == "") {
		commonUtil.showPopup("提示", "差异收入不能为空");
		return;
	}
	//11、结算单ID
	var settlementInfoIds = selectedIds.join(",");
	$("#settlementinfoids").val(settlementInfoIds);

	$.ajax({
		url : basePath + "/accountCheckInfo/saveAccountInfo",
		async : false,
		type : "POST",
		data : $('#account_check_info_form').serialize(),
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){ommonUtil.showPopup("提示","请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(dataStr) {
			ajaxing = false;
			if (dataStr) {
				if (dataStr.success) {
					commonUtil.showPopup("提示", "保存成功");
					window.location.href= basePath +"/accountCheckInfo/showAccountCheckInfoPage";
				} else {
					if(dataStr.flag==1){
						$('#account_check_id').val(dataStr.accountCheckId);
					}
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存合同信息服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){ajaxing = false;commonUtil.showPopup("提示","服务请求失败");},
		complete:function(){ajaxing = false;}
	});
}



/**
 * 加法函数，用来得到精确的加法结果
 * 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
 * 调用：accAdd(arg1,arg2)
 * @param arg1
 * @param arg2
 * @returns arg1加上arg2的精确结果
 */
function accAdd(arg1, arg2) {
	var r1, r2, m;
	try {
		r1 = arg1.toString().split(".")[1].length
	} catch (e) {
		r1 = 0
	}
	try {
		r2 = arg2.toString().split(".")[1].length
	} catch (e) {
		r2 = 0
	}
	m = Math.pow(10, Math.max(r1, r2))
	return (arg1 * m + arg2 * m) / m
}
/**
 * 乘法函数，用来得到精确的乘法结果
 * 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
 * @param arg1
 * @param arg2
 * @returns arg1乘以arg2的精确结果
 */
function accMul(arg1, arg2) {
	var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
	try {
		m += s1.split(".")[1].length
	} catch (e) {
	}
	try {
		m += s2.split(".")[1].length
	} catch (e) {
	}
	return Number(s1.replace(".", "")) * Number(s2.replace(".", ""))/ Math.pow(10, m)
}