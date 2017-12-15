// 是否正在请求
var ajaxing = false;
//单据条目数  （与数组长度一致）
var settleInfoTotal = Number($("#out_car").val());
//应收总额
var receivableTotal = Number($("#receivable_total").val());
//应付总额
//var payableTotal = Number($("#payable_total").val());
//代开总额
//var proxyInvoiceTotalSum = Number($("#proxy_invoice_total").val());
//发货吨位
var forwardingTonnageSum = Number($("#confirm_forwarding_tonnage").val());
//到货吨位
var arriveTonnageSum = Number($("#confirm_arrive_tonnage").val());
//损耗吨位
var lossTonnageSum = Number($("#confirm_loss_tonnage").val());

var selectedIds = new Array();

// 运单工具条
var waybillPage = null;

// 当前选中的数据
var currentSelectedIds = new Array();

$(function() {
	
	// 初始化运单列表page页面
	waybillPage = $("#waybillPage").operationList({
		"current" : 1, // 当前目标
		"maxSize" : 4, // 前后最大列表
		"itemPage" : 10, // 每页显示多少条
		"totalItems" : 0, // 总条数
		"chagePage" : function(current) {
			// 调用ajax请求拿最新数据
			loadWaybillList(current);
			
			
			// 换页时，选中之前已经选中过的行
			if (currentSelectedIds != null && currentSelectedIds.length != 0) {
				$(".sub_check").each(function(){
					var id = $(this).attr("data-id");
					if (currentSelectedIds.indexOf(id) != -1) {
						$(this).prop("checked",true);
					}
				});
			}
		}
	});
	
	// tab页切换
	$(".tab-box .tab-text").bind("click", function() {
		var target = $(this).data("target");
		if (target == "#account-check-info-tab") {
			
			if (selectedIds == null || selectedIds.length == 0) {
				selectedIds = currentSelectedIds;
			} else {
				selectedIds = mergingArraysAndRemovingDuplicates(selectedIds,currentSelectedIds);
				$("#settlementinfoids").val(selectedIds.join(","));
			}
			// 验证所选运单的委托方货物是否一样。。。。。。没有记录所选数据详细信息，没法完全验证
			var entrustList = [];
			var goodsInfoIdList = [];
			$(".sub_check").each(function() {
				var checked = $(this).is(":checked");
				if (checked) {
					var entrust = $(this).attr("data-entrust");
					var goodsInfoId = $(this).attr("data-goodsInfoId");
					if (entrustList.indexOf(entrust) == -1) {
						entrustList.push(entrust);
					}
					if (goodsInfoIdList.indexOf(goodsInfoId) == -1) {
						goodsInfoIdList.push(goodsInfoId);
					}
				}
			});
			if (entrustList.length > 1 || goodsInfoIdList.length > 1) {
				commonUtil.showPopup("提示", "请选择委托方、货物一样的数据");
   				return;
			}
			// 计算数据，并给表单赋值
			if (!(currentSelectedIds == null || currentSelectedIds.length == 0)) {
				var accountCheckInfoId = $("#hidden_id").val();
				calculateRelatedData(accountCheckInfoId, currentSelectedIds);
			}
			
			
		} else if (target == "#waybill-info-tab") {
			// 查询运单信息
			loadWaybillList(1);
			// 初始化选择的记录
			currentSelectedIds = [];
		}
		$(".tab-box .tab-text").removeClass("active");
		$(this).addClass("active");
		$(".tab-content").hide();
		$(target).show();
	});
	
	// 时间插件
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
	
	// 允许表格拖拽
	$("#waybillTable").colResizable({
		liveDrag : true,
		gripInnerHtml : "<div class='grip'></div>",
		draggingClass : "dragging",
		resizeMode: 'overflow'
	});
	
	// 绑定导入运单按钮
	uploadLoadFile($("#importWaybillBtn"));
});

/**
 * 导入运单
 */
function uploadLoadFile(button) {

	new AjaxUpload(button,{
   		action: basePath + "/accountCheckInfo/importWaybills",
   		name: 'myfile',
   		data:{'accuontCheckInfoId':$("#hidden_id").val(),'selectedIds':selectedIds.join(',')},
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
   			if (resultJson) {
   				if (resultJson.success) {
   	   				// 导入时
   					var accountCheckInfo = resultJson.accountCheckInfo;
   					var waybillInfoIdString = resultJson.waybillInfoIdString;
   					selectedIds = waybillInfoIdString.split(","); 					
					// 确认账款
					$("#confirm_price").val(accountCheckInfo.receivableTotal);
					// 确认发货吨位
					$("#confirm_forwarding_tonnage").val(accountCheckInfo.forwardingTonnage);
					// 确认到货吨位
					$("#confirm_arrive_tonnage").val(accountCheckInfo.arriveTonnage);
					// 确认损耗吨位
					$("#confirm_loss_tonnage").val(accountCheckInfo.lossTonnage);
					// 确认出车次数
					$("#confirm_out_car").val(accountCheckInfo.outCar);
					// 应收总额
					$("#receivable_total").val(accountCheckInfo.receivableTotal);
					// 应付总额
					$("#payable_total").val(0);
					// 代开总额
					$("#proxy_invoice_total").val(0);
					// 出车数
					$("#out_car").val(accountCheckInfo.outCar);
					// 单据总数
					$("#documents_total").val(accountCheckInfo.documentsTotal);
					// 发货吨位
					$("#forwarding_tonnage").val(accountCheckInfo.forwardingTonnage);
					// 到货吨位
					$("#arrive_tonnage").val(accountCheckInfo.arriveTonnage);
					// 损耗吨位
					$("#loss_tonnage").val(accountCheckInfo.lossTonnage);
					
					commonUtil.showPopup("提示", "导入成功");
   	   			} else {
   	   				commonUtil.showPopup("提示", resultJson.msg);
   	   			}
   			} else {
   				commonUtil.showPopup("提示", "服务器异常，请稍后重试");
   			}
		}
	});
}



//全选/全不选
$("body").on("click", ".all_check", function() {
	if ($(".all_check").is(":checked")) {
		// 全选时
		$(".sub_check").each(function() {
			$(this).prop("checked", true).change();
		});
	} else {
		// 全不选时
		$(".sub_check").each(function() {
			$(this).prop("checked", false).change();
		});
	}
});


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
 * 加载运单列表数据
 * num 页数
 */
function loadWaybillList(num){
	// 获取参数
	var params = $("#waybillQueryForm").serialize();
	//params = params + '&page=' + num + '&rows=' + waybillPage.options.itemPage;
	params = params + '&' + $.param({'page':num,'rows':waybillPage.options.itemPage});

	$.ajax({
		url : basePath + "/accountCheckInfo/getWaybillListForAccount",
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
					var list = resp.list;
					var count = resp.count;
					var length = list.length;
					if (length == null || length == undefined || length == ''){
						length = 0;
					}
					var html = '';
					for (var i = 0; i < length; i++) {
						var waybill = list[i];
						html += '<tr class="table-body">';
						html += '<td>';
						html += '<label class="i-checks"> ';
						html += '<input class="sub_check" type="checkbox" onchange="recordSelected(this)" data-id="'+numberFormat(waybill.id)+'" data-entrust="'+numberFormat(waybill.entrust)+'" data-goodsInfoId="'+numberFormat(waybill.goodsInfoId)+'" >';
						html += '</label>';
						html += '</td>';
						html += '<td>'+stringFormat(waybill.waybill_id) +'</td>'; // 运单号
						html += '<td>'+dateFormat(waybill.plan_transport_date)+'</td>'; // 计划拉运日期
						html += '<td>'+numberFormat(waybill.plan_transport_amount)+'</td>'; // 计划拉运量
						html += '<td>'+stringFormat(waybill.entrust_name)+'</td>'; // 委托方
						html += '<td>'+stringFormat(waybill.goods_name)+'</td>'; // 货物
						html += '<td>'+stringFormat(waybill.start_point_name)+'</td>'; // 线路起点
						html += '<td>'+stringFormat(waybill.end_point_name)+'</td>'; // 线路终点
						html += '<td>'+stringFormat(waybill.forwarding_unit)+'</td>'; // 发货单位
						html += '<td>'+stringFormat(waybill.consignee)+'</td>'; // 到货单位
						html += '<td>'+numberFormat(waybill.current_transport_price)+'</td>'; // 运价
						html += '<td>'+dateFormat(waybill.forwarding_date)+'</td>'; // 发货日期
						html += '<td>'+dateFormat(waybill.arriving_date)+'</td>'; // 发货日期
						html += '<td>'+numberFormat(waybill.forwarding_tonnage)+'</td>'; // 发货日期
						html += '<td>'+numberFormat(waybill.arriving_tonnage)+'</td>'; // 发货日期
						html += '</tr>';
					}
					$("#waybillTbody").html(html);
					waybillPage.setTotalItems(count);
					$("#waybillNum").text(count);
					
				} else {
					commonUtil.showPopup("提示",resp.msg);
				}
			} else {
				commonUtil.showPopup("提示","服务异常忙，请稍后重试");
			}
		},
		error:function(){commonUtil.showPopup("提示","服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	
}
/**
 *运单page页跳转
 */
function waybillListJump(e){
	var value = $(e).prev().find('input').val();
	waybillPage.setCurrentPage(value);
}

/**
 * 保存对账信息
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
	//11、运单id集合（变量名无所谓了）
	var settlementInfoIds = selectedIds.join(",");
	$("#settlementinfoids").val(settlementInfoIds);

	$.ajax({
		url : basePath + "/accountCheckInfo/saveWaybillAccount",
		async : false,
		type : "POST",
		data : $('#account_check_info_form').serialize(),
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){commonUtil.showPopup("提示","请求进行中，请稍候......");return false;}else{ajaxing=true;}
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
 * 减法函数，用来得到精确的减法结果
 * 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
 * 调用：accSub(arg1,arg2)
 * 返回值：arg1减去arg2的精确结果
 **/
function accSub(arg1, arg2) {
    var r1, r2, m, n;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
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


//处理数字
function numberFormat(value){
	if (isEmpty(value)) {
		return 0;
	} else {
		return value;
	}
}
//处理空字符串的显示形式
function stringFormat(value){
	if (isEmpty(value)) {
		return '';
	} else {
		return value;
	}
}
/**
* 字符串是否为空
* @param str
* @returns
*/
function isEmpty(str){
	if (str == null || str == undefined || str == '') {
		return true;
	} else {
		return false;
	}
}
//格式化日期
function dateFormat(time, format){
	if (time == null || time == '' || time == undefined) {
		return '';
	}
	if (format == null || format == '' || fromat == undefined) {
		format = 'yyyy-MM-dd';
	}
	var t = new Date(time);
	var tf = function(i) {
		return (i < 10 ? '0' : '') + i
	};
	return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a) {
		switch (a) {
		case 'yyyy':
			return tf(t.getFullYear());
			break;
		case 'MM':
			return tf(t.getMonth() + 1);
			break;
		case 'mm':
			return tf(t.getMinutes());
			break;
		case 'dd':
			return tf(t.getDate());
			break;
		case 'HH':
			return tf(t.getHours());
			break;
		case 'ss':
			return tf(t.getSeconds());
			break;
		}
	});
}

/**
 * 复选框的值改变时，触发的事件
 * @param e
 */
function recordSelected(e){
	var checked = $(e).prop("checked");
	var id = $(e).attr("data-id");
	
	if (currentSelectedIds == null) {
		currentSelectedIds = [];
	}
	if (checked) {
		if (currentSelectedIds.indexOf(id) != -1) {
			// 存在，什么都不做
		} else {
			currentSelectedIds.push(id);
		}
	} else {
		var index = currentSelectedIds.indexOf(id);
		if (index != -1) {
			// 存在,移除
			currentSelectedIds.splice(index,1);
		}
	}
	
}

/**
 * 运单导出
 */
function exportWaybill(){
	// 获取被选中的id currentSelectedIds
	if (currentSelectedIds == null || currentSelectedIds.length == 0) {
		commonUtil.showPopup("提示","请选择数据");
		return;
	}
	var params = $.param({'waybillInfoIds':currentSelectedIds.join(",")});
	var url = basePath + "/accountCheckInfo/exportWaybill" + "?" + params;
    $('#submitForm').attr('action', url);
    $('#submitForm').submit();	
}

/**
 * 计算相关数据
 * @param waybillInfoIdList
 */
function calculateRelatedData(accountCheckInfoId,waybillInfoIds){
	var params = {
		"accountCheckInfoId" : accountCheckInfoId,
		"waybillInfoIds" : waybillInfoIds.join(",")
	};
	console.log(params);
	$.ajax({
		url : basePath + "/accountCheckInfo/calculateRelatedDataForWaybillAccount",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){commonUtil.showPopup("提示","请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(resp) {
			ajaxing = false;
			if (resp) {
				if (resp.success) {
					var accountCheckInfo = resp.accountCheckInfo;
					console.log(accountCheckInfo);
					// 确认账款
					$("#confirm_price").val(accountCheckInfo.receivableTotal);
					// 确认发货吨位
					$("#confirm_forwarding_tonnage").val(accountCheckInfo.forwardingTonnage);
					// 确认到货吨位
					$("#confirm_arrive_tonnage").val(accountCheckInfo.arriveTonnage);
					// 确认损耗吨位
					$("#confirm_loss_tonnage").val(accountCheckInfo.lossTonnage);
					// 确认出车次数
					$("#confirm_out_car").val(accountCheckInfo.outCar);
					// 应收总额
					$("#receivable_total").val(accountCheckInfo.receivableTotal);
					// 应付总额
					$("#payable_total").val(0);
					// 代开总额
					$("#proxy_invoice_total").val(0);
					// 出车数
					$("#out_car").val(accountCheckInfo.outCar);
					// 单据总数
					$("#documents_total").val(accountCheckInfo.documentsTotal);
					// 发货吨位
					$("#forwarding_tonnage").val(accountCheckInfo.forwardingTonnage);
					// 到货吨位
					$("#arrive_tonnage").val(accountCheckInfo.arriveTonnage);
					// 损耗吨位
					$("#loss_tonnage").val(accountCheckInfo.lossTonnage);
				} else {
					commonUtil.showPopup("提示",resp.msg);
				}
			} else {
				commonUtil.showPopup("提示","服务异常忙，请稍后重试");
			}
		},
		error:function(){ajaxing = false;commonUtil.showPopup("提示","服务请求失败");},
		complete:function(){ajaxing = false;}
	});
}

/**
 * 合并数组并去除重复项
 */
function mergingArraysAndRemovingDuplicates(arr1,arr2){
	var arr3 = [].concat(arr1);
	for (var i = 0; i < arr2.length; i++) {
		var id = arr2[i];
		if (arr3.indexOf(id) == -1) {
			arr3.push(id);
		}
	}
	return arr3;
}
