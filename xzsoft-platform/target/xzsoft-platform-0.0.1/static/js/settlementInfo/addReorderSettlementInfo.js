var waybillPage = null;
var formulaPage = null;
var waybillPage = null;
var orgPage = null;
var driverPage = null;
var globalSelectedIds = [];
var couponUseInfoList= {};
var dataObj = {};
(function($) {
//	uploadLoadFile($(".file-btn"));
	// 时间调用插件（精确到时分秒）
	setTimeout(function() {
		$(".date-time-ss").datetimepicker({
			format : "YYYY-MM-DD HH:mm:ss",
			autoclose : true,
			todayBtn : true,
			todayHighlight : true,
			showMeridian : true,
			useSeconds : true
		});
	}, 500);
	//关闭有价券弹框
	$("body").on("click",".coupon-opt-close",function(){
		$("#show-settlement-coupon-data-info").empty();
	});
	//关闭结算公式弹框
//	$("body").on("click",".settlement-formula-opt-close",function(){
//		$("#show-settlement-Formula-data-info").empty();
//	});
	//关闭运单弹框
	$("body").on("click",".waybill-opt-close",function(){
		$("#show-settlement-waybill-data-info").empty();
	});
	//关闭司机弹框
	$("body").on("click",".driver-opt-close",function(){
		$("#show-settlement-driver-data-info").empty();
	});
	//关闭影像弹框
	$("body").on("click",".settlementphoto-opt-close",function(){
		$("#settlementphoto_info_view").empty();
	});
	
	//关闭影像弹框
	$("body").on("click",".mode-close",function(){
		$("#settlementphoto_info_view").empty();
	});
	
	
	//关闭组织部门（项目）弹框
	$("body").on("click",".project-opt-close",function(){
		$("#show-settlement-project-data-info").empty();
	});
	//关闭物流公司（承运方）弹框
	$("body").on("click",".shipper-opt-close",function(){
		$("#show-settlement-shipper-data-info").empty();
	});
	
	if(!$('#userInfoId').val()){
		$('#shipperName').prop('readonly',false);
	}else{
		$('#shipperName').prop('readonly',true);
	}
	if(!$('#shipper').val()){
		$('#drivceCode').prop('readonly',false);
	}else{
		$('#drivceCode').prop('readonly',true);
	}
	if($("#operateType").val() == 1){
		$('.input-disable-select').hide();
		$('.select-input').show();
	}else{
		if($("#scatteredGoods").val() == null || $("#scatteredGoods").val() == ""){
			$('.input-disable-select').prop('readonly',true);
			$('.input-disable-select').show();
			$('.select-input').hide();
		}else{
			$('.input-disable-select').hide();
			$('.select-input').show();
		}
	}
	var proxyModeType = $("#proxyModeType").val();
	var rootWaybillInfoId = $("#rootWaybillInfoId").val();
	if(proxyModeType == 1){
		$("#costPrice").val("0");  //工本费
		$("#carriersDiv").show();
		$("#carriersPriceDiv").show();
		$("#logisticsCompanyDiv").hide();
	}else{
		$("#costPrice").val("1"); //工本费
		$("#carriersDiv").hide();
		$("#carriersPriceDiv").hide();
		$("#logisticsCompanyDiv").show();
	}
	if(rootWaybillInfoId == null || rootWaybillInfoId == ""){
		$("#viewEnclosure").hide();
	}else{
		$("#viewEnclosure").show();
	}
	var charteredType = $("#charteredType").val();
	if (charteredType == 1) {
		$("#charteredPrice").prop('readonly',false);
		$("#customerPrice").prop('readonly',false);
		$("#charteredPriceDiv").show();
		$("#customerPriceDiv").show();
		$("#outputTaxDiv").show();
	} else {
		$("#charteredPrice").prop('readonly',true);
		$("#customerPrice").prop('readonly',true);
		$("#customerPrice").val("");
		$("#charteredPrice").val("");
		$("#outputTax").val("");
		$("#charteredPriceDiv").hide();
		$("#customerPriceDiv").hide();
		$("#outputTaxDiv").hide();
	}
	
	if($("#isExpense").val() == 1){
		$("#expensePriceDiv").show();
		$("#expenseTypeDiv").show();
		$("#couponInfoDiv").hide();
		$("#cardCodesDiv").hide();
	}
	
	
	
	
	//go(1);
})(jQuery);

/**
 * 有价卷选择
 */
function submitSelectCoupon() {
	var selectlist = findAllCheck(".sub_coupon_info_check");
	if(selectlist.length==0) {
	   $.alert("请选择一条数据");
	   return;
	}
	saveIds();
	var couponUseTotalPrice = 0;
	var couponUseInfos = new Array();
	//所有选中有价券卡号
  	var cardCodes = new Array();
  	var couponUseId = null;
  	$.each(globalSelectedIds,function(i,val){
  		couponUseTotalPrice+=eval(couponUseInfoList[val].usePrice);
  		cardCodes.push(couponUseInfoList[val].cardCode);
  		couponUseInfos.push(couponUseInfoList[val]);
  		if(couponUseId == null){
  			couponUseId = val;
  		}
  	})
//	$(".sub_coupon_info_check").each(function() {
//		if ($(this).is(":checked")) {
//			var params = {
//				"couponUseInfoId":$(this).attr("data-id"),
//				"couponInfoId":$(this).attr("data-couponInfoId"),
//				"couponTypeInfoId":$(this).attr("data-couponTypeInfoId"),
//				"taxRate":$(this).attr("data-coupon-taxRate"),
//				"usePrice":$(this).parents("td").next().next().next().next().children().eq(0).val(),
//				"balance":$(this).parents("td").next().next().next().next().next().html()
//			}
//			couponUseTotalPrice+=eval($(this).parents("td").next().next().next().next().children().eq(0).val());
//			couponUseInfos.push(params);
//			cardCodes.push($(this).attr("data-coupon-cardCode"));
//		}
//	});
	cardCodes.join(",");
	$("#taxRate").val(couponUseInfoList[couponUseId].taxRate);
	var couponUseInfoJson = JSON.stringify(couponUseInfos);
	$("#couponUseInfo").val(couponUseInfoJson);
	$("#couponUseTotalPrice").val(couponUseTotalPrice);
	$("#cardCodes").val(cardCodes);
	$("#coupon-data-info").empty();
	globalSelectedIds = [];
	couponUseInfoList = new Array();
//	 var selectlist = findAllCheck(".coupon-check");
//	 if(selectlist.length==0 || selectlist.length>1) {
//	 $.alert("请选择一条数据");
//	 return;
//	 }
//	 $("#selectCoupon").val(selectlist[0].name);
//	 $("#selectCoupon").next("input").val(selectlist[0].id);
//	 $("#couponSelectModal").modal('hide');
}

/**
 * 有价券金额时实时变更
 */
function onInput(obj){
	var usePrice = $(obj).val();
	var balance = $(obj).parents("td").next().html();
	var money = $(obj).parents("td").next().next().html();
	var primarybalance = $(obj).parents("td").next().next().next().next().html();
	if(eval(usePrice) > eval(primarybalance)){
		$(obj).val(0);
		$(obj).parents("td").next().html(primarybalance);
		xjValidate.showTip("使用金额不能大于余额");
		return;
	}
	$(obj).parents("td").next().html(primarybalance-usePrice);
}
/**
 * 结算公式卷选择
 */
//function submitSelectFormula() {
//	var selectlist = findAllCheck(".sub_settlement_formula_check");
//	if(selectlist.length==0 || selectlist.length>1) {
//	   $.alert("请选择一条数据");
//	   return;
//	}
//	$(".sub_settlement_formula_check").each(
//			function() {
//				if ($(this).is(":checked")) {
//					$("#selectFormula").val($(this).attr("data-id"));
//					$("#accountingEntity").val(
//							$(this).attr("data-accounting-entity"));
//					$("#accountingEntityName").val(
//							$(this).attr("data-accounting-entity-str"));
//					return false;
//				}
//			});
//	$("#settlement-formula-data-info").empty();
//	// var selectlist = findAllCheck(".formula-check");
//	// if(selectlist.length==0 || selectlist.length>1) {
//	// $.alert("请选择一条数据");
//	// return;
//	// }
//	// $("#selectFormula").val(selectlist[0].name);
//	// $("#selectFormula").next("input").val(selectlist[0].id);
//	// $("#formulaSelectModal").modal('hide');
//}

/**
* 分页查询
* @author jiangww 2017年8月10日
* @param number 页数
*/
function pagerGoto(number) {
	//运单
	var waybill = $("#waybill").val();
	//组织部门
	var project = $("#project").val();
	//有价券
	var coupon = $("#coupon").val();
	//承运方
	var contract = $("#contract").val();
	//司机
	var driver = $("#driver").val();
	//调用查询运单方法
	if(waybill != null && waybill != "" && waybill == "1"){
		waybillInfoList(number);
	}
	//调用查询组织部门方法
	if(project != null && project != "" && project == "2"){
		searchProjectInfo(number);
	}
	//调用查询有价券方法
	if(coupon != null && coupon != "" && coupon == "3"){
		//saveIds();
		searchCouponInfo(number);
	}
	//调用查询承运方方法
	if(contract != null && contract != "" && contract == "4"){
		searchContractInfo(number);
	}
	//调用查询司机方法
	if(driver != null && driver != "" && driver == "5"){
		searchDriverInfo(number);
	}
	
}

/**
 * 跳转到某页
 * @author jiangww 2017年8月10日
 */
function btnPagerGoto() {
	//取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	//取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	//数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		commonUtil.showPopup("提示","请输出正确的数字");
		return;
	}
	//跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	//运单
	var waybill = $("#waybill").val();
	//组织部门
	var project = $("#project").val();
	//有价券
	var coupon = $("#coupon").val();
	//承运方
	var contract = $("#contract").val();
	//司机
	var driver = $("#driver").val();
	//调用查询运单方法
	if(waybill != null && waybill != "" && waybill == "1"){
		waybillInfoList(goPage);
	}
	//调用查询组织部门方法
	if(project != null && project != "" && project == "2"){
		searchProjectInfo(goPage);
	}
	//调用查询有价券方法
	if(coupon != null && coupon != "" && coupon == "3"){
		//saveIds();
		searchCouponInfo(goPage);
	}
	//调用查询承运方方法
	if(contract != null && contract != "" && contract == "4"){
		searchContractInfo(goPage);
	}
	//调用查询司机方法
	if(driver != null && driver != "" && driver == "5"){
		searchDriverInfo(goPage);
	}
}

/**
 * 运单编号卷选择
 */
function reOrderSelectWaybill() {
	var selectlist = findAllCheck(".sub_waybill_info_check");
	if(selectlist.length==0 || selectlist.length>1) {
	   $.alert("请选择一条数据");
	   return;
	}
	$(".sub_waybill_info_check").each(function() {
		if ($(this).is(":checked")) {
			$("#waybillId").val($(this).attr("data-waybillId"));
			$("#rootWaybillId").val($(this).attr("data-rootWaybillId"));
			$("#waybillInfoId").val($(this).attr("data-id"));
			$("#rootWaybillInfoId").val($(this).attr("data-rootWaybillInfoId"));
			$("#parentWaybillInfoId").val($(this).attr("data-parentWaybillInfoId"));
			$("#entrust").val($(this).attr("data-shipper"));
			$("#entrustName").val($(this).attr("data-shipperName"));
			$("#accountingEntity").val($(this).attr("data-shipper"));
			$("#goodsInfoId").val($(this).attr("data-goodsInfoId"));
			$("#goodsName").val($(this).attr("data-goodsName"));
			$("#lineInfoId").val($(this).attr("data-lineInfoId"));
			if($(this).attr("data-scatteredGoods") != null && $(this).attr("data-scatteredGoods") != ""){
				$("#endPoints").val($(this).attr("data-endPoints"));
			}
			$("#lineName").val($(this).attr("data-lineName"));
			$("#scatteredGoods").val($(this).attr("data-scatteredGoods"));
			$("#forwardingUnit").val($(this).attr("data-forwardingUnit"));
			$("#consignee").val($(this).attr("data-consignee"));
			$("#projectInfoId").val($(this).attr("data-shipperProject"));
			$("#projectInfoName").val($(this).attr("data-projectName"));
			$("#cooperateStatus").val($(this).attr("data-cooperateStatus"));
			return false;
		}
	});
	var waybillInfoId = $("#waybillInfoId").val();
	var rootWaybillInfoId = $("#rootWaybillInfoId").val();
	var userInfoId = $("#userInfoId").val();
	var driverType = $("#driverInfoType").val();
	var charteredType = $("#charteredType").val();
	var shipper = $("#shipper").val();
	var proxyModeType = $("#proxyModeType").val();
	var forwardingTime = $("#forwardingTime").val();
	if(waybillInfoId != null && waybillInfoId != "" && userInfoId != null && userInfoId != "" 
		&& driverType != null && driverType != "" && forwardingTime != null && forwardingTime != ""){
		if($("#scatteredGoods").val() == null || $("#scatteredGoods").val() == ""){
			searchTransportPriceAndLossDeduction(waybillInfoId,userInfoId,driverType,shipper,forwardingTime);
			if(proxyModeType == 1){
				searchProxy(waybillInfoId,proxyModeType,forwardingTime);
			}
		}
	}
	if(rootWaybillInfoId != null && rootWaybillInfoId != ""){
		$("#viewEnclosure").show();
	}else{
		$("#viewEnclosure").hide();
	}
//	if(waybillInfoId != null){
//		searchFormulaInfo();
//	}
	if($("#scatteredGoods").val() != null && $("#scatteredGoods").val() != ""){
		$('#computeMode').prop('readonly',false);
		$('#deductionTonnage').prop('readonly',false);
		$('#deductionUnitPrice').prop('readonly',false);
		$('#currentTransportPrice').prop('readonly',false);
		$("#projectInfoName").prop('readonly',false);
		$("#computeModeDiv").show();
		$("#deductionModeDiv").show();
		$("#isInvertModeDiv").show();
		$("#scatteredGoodsDiv").show();
		$("#proxyModeDiv").hide();
		$("#proxyModeType").val("0");
		$("#logisticsCompanyDiv").hide();
		$("#shipperName").val("");
		$("#shipper").val("");
		$("#driverInfoName").prop('readonly',false);
		$("#goodsDiv").hide();
		$('.input-disable-select').hide();
		$('.select-input').show();
		$("#projectInfoName").attr("onclick","searchProjectInfo(1)");
//		$("projectInfoName").onclick("searchProjectInfo(1)");
	}else{
		$('#computeMode').prop('readonly',true);
		$('#deductionTonnage').prop('readonly',true);
		$('#deductionUnitPrice').prop('readonly',true);	
		$('#currentTransportPrice').prop('readonly',true);
		$("#projectInfoName").prop('readonly',true);
		$("#goodsDiv").show();
		$("#proxyModeDiv").show();
		$("#scatteredGoodsDiv").hide();
		$("#computeModeDiv").hide();
		$("#deductionModeDiv").hide();
		$("#isInvertModeDiv").hide();
		$('.input-disable-select').show();
		$('.select-input').hide();
		$("#projectInfoName").attr("onclick","");
		if(userInfoId == null || userInfoId == ""){
			$("#shipperName").prop('readonly',false);
		}
		if(proxyModeType == 0){
			$("#logisticsCompanyDiv").show();
		}
	}
	$("#waybill-data-info").empty();
	// var selectlist = findAllCheck(".waybill-check");
	// if(selectlist.length==0 || selectlist.length>1) {
	// $.alert("请选择一条数据");
	// return;
	// }
	// $("#selectWaybill").val(selectlist[0].name);
	// $("#selectWaybill").next("input").val(selectlist[0].id);
	// $("#waybillSelectModal").modal('hide');
}

/**
 * 组织部门选择
 */
function submitSelectOrg() {
	var selectlist = findAllCheck(".sub_project_info_check");
	if(selectlist.length==0 || selectlist.length>1) {
	   $.alert("请选择一条数据");
	   return;
	}
	$(".sub_project_info_check").each(function() {
		if ($(this).is(":checked")) {
			$("#projectInfoId").val($(this).attr("data-id"));
			$("#projectInfoName").val($(this).attr("data-projectName"));
			return false;
		}
	});
	$("#project-data-info").empty();
	// var selectlist = findAllCheck(".org-check");
	// if (selectlist.length == 0 || selectlist.length > 1) {
	// $.alert("请选择一条数据");
	// return;
	// }
	// $("#selectOrg").val(selectlist[0].name);
	// $("#selectOrg").next("input").val(selectlist[0].id);
	// $("#orgSelectModal").modal('hide');
}

/**
 * 车牌号选择
 */
function submitSelectDriver() {
	var selectlist = findAllCheck(".sub_driver_info_check");
	if(selectlist.length==0 || selectlist.length>1) {
	   $.alert("请选择一条数据");
	   return;
	}
	$(".sub_driver_info_check").each(function() {
		if ($(this).is(":checked")) {
			$("#userInfoId").val($(this).attr("data-id"));
			$("#driverInfoName").val($(this).attr("data-driver-name"));
			$("#driverInfoType").val($(this).attr("data-driver-type"));
			$("#drivceCode").val($(this).attr("data-car-code"));
			$("#carPart").val($(this).attr("data-car-type"));
			return false;
		}
	});
	$("#driver-data-info").empty();
//	if ($("#userInfoId").val() != null && $("#userInfoId").val() != "") {
//		$('#shipperName').prop('readonly', true);
//	} else {
//		$('#shipperName').prop('readonly', false);
//	}
//	
	var waybillInfoId = $("#waybillInfoId").val();
	var userInfoId = $("#userInfoId").val();
	var driverType = $("#driverInfoType").val();
	var shipper = $("#shipper").val();
	var forwardingTime = $("#forwardingTime").val();
	if(waybillInfoId != null && waybillInfoId != "" && userInfoId != null && userInfoId != "" && 
			driverType != null && driverType != "" && forwardingTime != null && forwardingTime != ""){
		if($("#scatteredGoods").val() == null || $("#scatteredGoods").val() == ""){
			searchTransportPriceAndLossDeduction(waybillInfoId,userInfoId,driverType,shipper,forwardingTime);
		}
	}
	if(driverType != null && driverType != "" && driverType != 2){
		$("#carriersDiv").hide();
		$("#carriersPriceDiv").hide();
		$("#proxyName").val("");
		$("#proxy").val("");
		$("#proxyInvoiceTotal").val("");
		$("#proxyModeType").val("0");
	}
	// var selectlist = findAllCheck(".driver-check");
	// if (selectlist.length == 0 || selectlist.length > 1) {
	// $.alert("请选择一条数据");
	// return;
	// }
	// $("#selectDriver").val(selectlist[0].name);
	// $("#drivceCode").val(selectlist[0].code);
	// $("#selectDriver").next("input").val(selectlist[0].id);
	// $("#driverSelectModal").modal('hide');
}

/**
 * 承运方选择
 */
function reOrderSelectContract() {
	var selectlist = findAllCheck(".sub_contract_info_check");
	if(selectlist.length==0 || selectlist.length>1) {
	   $.alert("请选择一条数据");
	   return;
	}
	$(".sub_contract_info_check").each(function() {
		if ($(this).is(":checked")) {
			$("#shipper").val($(this).attr("data-shipper"));
			$("#shipperName").val($(this).attr("data-name"));
			return false;
		}
	});
	$("#shipper-data-info").empty();
//	if ($("#shipper").val() != null && $("#shipper").val() != "") {
//		$('#drivceCode').prop('readonly', true);
//	} else {
//		$('#drivceCode').prop('readonly', false);
//	}
	var waybillInfoId = $("#waybillInfoId").val();
	var userInfoId = $("#userInfoId").val();
	var driverType = $("#driverInfoType").val();
	var shipper = $("#shipper").val();
	var forwardingTime = $("#forwardingTime").val();
	if(waybillInfoId != null && waybillInfoId != "" && shipper != null && shipper != "" && forwardingTime != null && forwardingTime != ""){
		if($("#scatteredGoods").val() == null || $("#scatteredGoods").val() == ""){
			searchTransportPriceAndLossDeduction(waybillInfoId,userInfoId,driverType,shipper,forwardingTime);
		}
	}
	// var selectlist = findAllCheck(".driver-check");
	// if (selectlist.length == 0 || selectlist.length > 1) {
	// $.alert("请选择一条数据");
	// return;
	// }
	// $("#selectDriver").val(selectlist[0].name);
	// $("#drivceCode").val(selectlist[0].code);
	// $("#selectDriver").next("input").val(selectlist[0].id);
	// $("#driverSelectModal").modal('hide');
}

/**
 * 发货时间时触发
 */
function forwardingTimeOnchange(){
	var waybillInfoId = $("#waybillInfoId").val();
	var userInfoId = $("#userInfoId").val();
	var driverType = $("#driverInfoType").val();
	var shipper = $("#shipper").val();
	var forwardingTime = $("#forwardingTime").val();
	var proxyModeType = $("#proxyModeType").val();
	if(waybillInfoId != null && waybillInfoId != "" && forwardingTime != null && forwardingTime != ""){
		if($("#scatteredGoods").val() == null || $("#scatteredGoods").val() == ""){
			if((shipper != null && shipper != "") || (userInfoId != null && userInfoId != "" && driverType != null && driverType != "")){
				searchTransportPriceAndLossDeduction(waybillInfoId,userInfoId,driverType,shipper,forwardingTime);
			}
			if(proxyModeType == 1){
				searchProxy(waybillInfoId,proxyModeType,forwardingTime);
			}
		}
	}
}

/**
 * 是否包车触发
 */
function selectChartered() {
	var charteredType = $("#charteredType").val();
	if (charteredType == 1) {
		$("#charteredPrice").prop('readonly',false);
		$("#customerPrice").prop('readonly',false);
		$("#customerPrice").val("");
		$("#charteredPriceDiv").show();
		$("#customerPriceDiv").show();
		$("#outputTaxDiv").show();
	} else {
		$("#charteredPrice").prop('readonly',true);
		$("#customerPrice").prop('readonly',true);
		$("#customerPrice").val("");
		$("#charteredPrice").val("");
		$("#outputTax").val("");
		$("#charteredPriceDiv").hide();
		$("#customerPriceDiv").hide();
		$("#outputTaxDiv").hide();
		var waybillInfoId = $("#waybillInfoId").val();
		var charteredType = $("#charteredType").val();
		if(waybillInfoId != null && waybillInfoId != "" && charteredType != null && charteredType != "" && charteredType == 0){
			computeCustomerPrice();
		}
	}
}

/**
 * 是否代理触发
 */
function selectProxyMode() {
	var proxyModeType = $("#proxyModeType").val();
	var waybillInfoId = $("#waybillInfoId").val();
	var forwardingTime = $("#forwardingTime").val();
	var driverInfoType = $("#driverInfoType").val();
	if (proxyModeType == 0) {
		if($("#userInfoId").val() != null && $("#userInfoId").val() != ""){
			$("#shipperName").prop('readonly',true);
		}else{
			$("#shipperName").prop('readonly',false);
		}
		if($("#shipper").val() != null && $("#shipper").val() != ""){
			$("#driverInfoName").prop("readonly",true);
		}else{
			$("#driverInfoName").prop("readonly",false);
		}
		$("#proxyName").val("");
		$("#proxy").val("");
		$("#proxyInvoiceTotal").val("");
		$("#payablePrice").val("");
		$("#otherTaxPrice").val("");
		$("#transportPriceIncomeTax").val("");
		$("#incomeTax").val("");
		$("#transportPriceCost").val("");
		$("#logisticsCompanyDiv").show();
		$("#carriersDiv").hide();
		$("#carriersPriceDiv").hide();
		$("#costPrice").val("1");  //工本费
		
	} else {
		if(waybillInfoId != null && waybillInfoId != "" && forwardingTime != null && forwardingTime != ""){
			searchProxy(waybillInfoId,proxyModeType,forwardingTime);
		}
		if(driverInfoType == 1){
			$("#driverInfoName").val("");
			$("#userInfoId").val("");
			$("#driverInfoType").val("");
		}
		$("#shipperName").prop('readonly',true);
		$("#shipperName").val("");
		$("#shipper").val("");
		$('#driverInfoName').prop('readonly',false);
		$("#payablePrice").val("");
		$("#otherTaxPrice").val("");
		$("#transportPriceIncomeTax").val("");
		$("#incomeTax").val("");
		$("#transportPriceCost").val("");
		$("#logisticsCompanyDiv").hide();
		$("#carriersDiv").show();
		$("#carriersPriceDiv").show();
		$("#costPrice").val("0");  //工本费
	}
}

/**
 * jiangww 2017-09-13 是否报销触发
 */
function selectExpense(){
	var isExpense = $("#isExpense").val();
	//如是否报销为否则清空报销字段数据和展示有价券信息
	if(isExpense == 0){
		$("#expensePrice").val("");
		$("#expenseType").val("");
		$("#couponInfoDiv").show();
		$("#expensePriceDiv").hide();
		$("#expenseTypeDiv").hide();
	}else{
		//如是否报销为是则清空有价券字段数据和展示报销信息
		$("#couponInfoName").val("");
		$("#couponUseInfo").val("");
		$("#cardCodes").val("");
		$("#couponUseTotalPrice").val("0");
		$("#expenseType").val("1");
		$("#couponInfoDiv").hide();
		$("#cardCodesDiv").hide();
		$("#expensePriceDiv").show();
		$("#expenseTypeDiv").show();
	}
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
				"name" : $(this).attr("data-name"),
				"code" : $(this).attr("data-code")
			}
			checkList.push(params);
		}
	});
	return checkList;
}

/**
 * 绑定上传事件的dom对象
 * @author liumin
 */
function uploadLoadFile(btn) {
	// NOTE 部署环境删除地址
	new AjaxUpload(btn, {
		action : basePath + '/upload/imageUpload',
		name : 'myfile',
		dataType : 'json',
		onSubmit : function(file, ext) {
			// 文件上传格式校验
			if (!(ext && /^(jpg|png|bmp|docx|doc|pdf|xls|xlsx)$/.test(ext
					.toLowerCase()))) {
				xjValidate.showPopup(
						"请上传格式为 jpg|png|bmp|docx|doc|pdf|xls|xlsx 的文件","提示");
				return;
			}
		},
		// 服务器响应成功时的处理函数
		onComplete : function(file, resultJson) {
			if (resultJson) {
				resultJson = $.parseJSON(resultJson);
				// 是否成功
				var isSuccess = resultJson.isSuccess;
				// 上传附件URL
				var uploadUrl = resultJson.uploadUrl;
				if (isSuccess == "true") {
					// 附件类型
					var fileType = btn.attr("file-type");
					var fileText = btn.attr("file-text");
					$("#" + fileType).val(uploadUrl);
					$("#" + fileText).val(file);
				} else {
					xjValidate.showPopup(resultJson.errorMsg,"提示");
					return;
				}
			} else {
				xjValidate.showPopup("服务器异常，请稍后重试","提示");
				return;
			}
		}
	});
}

/**
 * 根据页数查询结算运单信息
 * @author jiangweiwei 2017年7月11日
 * @param number 页数
 */
function searchWaybillInfo() {
//	var waybillInput = $.trim($("#waybillInput").val());
//	var goodsNameQuery = $.trim($("#goodsNameQuery").val());
//	var scatteredGoodsQuery = $.trim($("#scatteredGoodsQuery").val());
//	var makeStartTime = $("#makeStartTime").val();
//	var makeEndTime = $("#makeEndTime").val();
//	var forwardingUnitQuery = $.trim($("#forwardingUnitQuery").val());
//	var consigneeQuery = $.trim($("#consigneeQuery").val());
//	var entrustNameQuery = $.trim($("#entrustNameQuery").val());
//	var shipperQuery = $.trim($("#shipperQuery").val());
//	var waybillInfoId = $("#waybillInfoId").val();
//	if(waybillInfoId != null && waybillInfoId != ""){
//		$("#waybillInfoIdTemp").val(waybillInfoId);
//	}
	// 请求地址
	var url = basePath
			+ "/settlementInfo/showSettlementWaybillInfoPage #waybill-data-info";
	$("#show-settlement-waybill-data-info").load(url, {
//		"page" : number,
//		"rows" : 10,
//		"waybillInput" : waybillInput,
//		"goodsNameQuery" : goodsNameQuery,
//		"scatteredGoodsQuery" : scatteredGoodsQuery,
//		"makeStartTime" : makeStartTime,
//		"makeEndTime" : makeEndTime,
//		"forwardingUnitQuery" : forwardingUnitQuery,
//		"consigneeQuery" : consigneeQuery,
//		"entrustNameQuery" : entrustNameQuery,
//		"shipperQuery" : shipperQuery
	}, function() {
		waybillInfoList(1);
		//时间调用插件
//	    setTimeout(function () {
//	      $(".date-time").datetimepicker({
//	        format: "YYYY-MM-DD",
//	        autoclose: true,
//	        todayBtn: true,
//	        todayHighlight: true,
//	        showMeridian: true,
//	        pickTime: false
//	      });
//	    }, 500)
//		//允许表格拖着
//			$("#tableDrag").colResizable({
//				  liveDrag:true, 
//				  partialRefresh:true,
//				  gripInnerHtml:"<div class='grip'></div>", 
//				  draggingClass:"dragging",
//				  resizeMode: 'overflow'
//			});
//		    //结算数据较多，增加滑动
//		    $(".iscroll").css("min-height", "55px");
//		    $(".iscroll").mCustomScrollbar({
//		      theme: "minimal-dark"
//		    });
	})
}

/**
 * 根据运单号、货物、零散货物、制单日期、发货单位、到货单位、委托方、承运方和分页查询运单信息
 * @author jiangweiwei 2017年10月23日
 * @param number 页数
 */
function waybillInfoList(number){
	//运单号
	var waybillInput = $.trim($("#waybillInput").val());
	//货物
	var goodsNameQuery = $.trim($("#goodsNameQuery").val());
	//零散货物
	var scatteredGoodsQuery = $.trim($("#scatteredGoodsQuery").val());
	//制单日期开始
	var makeStartTime = $("#makeStartTime").val();
	//制单日期结束
	var makeEndTime = $("#makeEndTime").val();
	//发货单位
	var forwardingUnitQuery = $.trim($("#forwardingUnitQuery").val());
	//到货单位
	var consigneeQuery = $.trim($("#consigneeQuery").val());
	//委托方
	var entrustNameQuery = $.trim($("#entrustNameQuery").val());
	//承运方
	var shipperQuery = $.trim($("#shipperQuery").val());
	var waybillInfoId = $("#waybillInfoId").val();
	if(waybillInfoId != null && waybillInfoId != ""){
		$("#waybillInfoIdTemp").val(waybillInfoId);
	}
	// 请求地址
	var url = basePath
			+ "/settlementInfo/listSettlementWaybillInfo #waybill-info-data";
	$("#search_waybill_info").load(url, {
		"page" : number,
		"rows" : 10,
		"waybillInput" : waybillInput,
		"goodsNameQuery" : goodsNameQuery,
		"scatteredGoodsQuery" : scatteredGoodsQuery,
		"makeStartTime" : makeStartTime,
		"makeEndTime" : makeEndTime,
		"forwardingUnitQuery" : forwardingUnitQuery,
		"consigneeQuery" : consigneeQuery,
		"entrustNameQuery" : entrustNameQuery,
		"shipperQuery" : shipperQuery
	}, function() {
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
		//允许表格拖着
			$("#tableDrag").colResizable({
				  liveDrag:true, 
				  partialRefresh:true,
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  resizeMode: 'overflow'
			});
		    //结算数据较多，增加滑动
		    $(".iscroll").css("min-height", "55px");
		    $(".iscroll").mCustomScrollbar({
		      theme: "minimal-dark"
		    });
	})
}

/**
 * 根据页数查询有价券信息
 * @author jiangweiwei 2017年7月13日
 * @param number 页数
 */
function searchCouponInfo(number) {
	//运单信息表主键ID
	var waybillInfoId = $("#waybillInfoId").val();
	if(waybillInfoId == null || waybillInfoId == ""){
		xjValidate.showPopup("请先选择运单！","提示");
		return;
	}
	var operateType = $("#operateType").val();
	//有价券卡号
	var cardCode = $("#cardCode").val();
	//有价券类型
	var couponType = $("#couponType").val();
	//委托方
	var entrust = $("#entrust").val();
	saveIds();
	// 请求地址
	var url = basePath
			+ "/settlementInfo/showSettlementCouponInfoPage #coupon-data-info";
	$("#show-settlement-coupon-data-info").load(url, {
		"page" : number,
		"rows" : 10,
		"operateType" : operateType,
		"cardCode" : cardCode,
		"couponType" : couponType,
		"waybillInfoId" : waybillInfoId,
		"entrust" : entrust
	}, function() {
		//允许表格拖着
			$("#tableDrag").colResizable({
				  liveDrag:true, 
				  partialRefresh:true,
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  resizeMode: 'overflow'
			});
		    //结算数据较多，增加滑动
		    $(".iscroll").css("min-height", "55px");
		    $(".iscroll").mCustomScrollbar({
		      theme: "minimal-dark"
		    });
		    $('.sub_coupon_info_check').each(function(index, item){
				var dataId = $(item).attr('data-id');
				if(globalSelectedIds.indexOf(dataId) > -1){
					$(this).attr("checked",'true');
				}
			});
//		    $('.sub_coupon_info_check').each(function(index, item){
//				var dataId = $(item).attr('data-id');
//				if($(item).is(':checked')){
//					if(globalSelectedIds.indexOf(dataId) > -1){
//						$(item).parents("td").next().next().next().next().children().eq(0).val(couponUseInfoList[dataId].usePrice);
//						$(item).parents("td").next().next().next().next().next().val(couponUseInfoList[dataId].usePrice-eval(couponUseInfoList[dataId].balance));
//					}
//				}
//			});
	})
}

//将当前选中的ids存到全局数据globalSelectedIds
function saveIds(){
	var	curArr = [];
	$('.sub_coupon_info_check').each(function(index, item){
		var dataId = $(item).attr('data-id');
		var couponInfoId = $(item).attr('data-couponInfoId');
		var couponTypeInfoId = $(item).attr('data-couponTypeInfoId');
		var taxRate = $(item).attr('data-coupon-taxRate');
		var usePrice = $(item).parents("td").next().next().next().next().children().eq(0).val();
		var balance = $(item).parents("td").next().next().next().next().next().html();
		var cardCode = $(item).attr("data-coupon-cardCode");
		if($(item).is(':checked')){
			globalSelectedIds.push(dataId);
			var params = {
				"couponUseInfoId":dataId,
				"couponInfoId":couponInfoId,
				"couponTypeInfoId":couponTypeInfoId,
				"taxRate":taxRate,
				"usePrice":usePrice,
				"balance":balance,
				"cardCode":cardCode
			}
			couponUseInfoList[dataId]=params;
		}else{
			if(globalSelectedIds.indexOf(dataId) > -1){
				globalSelectedIds.splice(globalSelectedIds.indexOf(dataId + ''),1);
				delete couponUseInfoList[dataId];
			}
		}
	});
	globalSelectedIds = arrUnique(globalSelectedIds);
//	couponUseInfoList = arrObjUnique(couponUseInfoList);
	console.log(globalSelectedIds)
}

//数组去重
function arrUnique(arr){
	var res = [], hash = {};
	for(var i=0; i<arr.length; i++){
		if(!hash[arr[i]]){
			res.push(arr[i]);
			hash[arr[i]] = true;
		}
	}
	return res;
}

//数组对像去重
function arrObjUnique(arr){
	var result = [], hash = {};
    for (var i = 0; i<arr.length; i++) {
        var _key = arr[i].couponUseInfoId; 
        if (!hash[_key]) {
            result.push(arr[i]);  
            hash[_key] = true;
        }
    }
    
    console.log(result)
    return result;
}

/**
 * 根据页数查询承运方信息
 * @author jiangweiwei 2017年7月15日
 * @param number 页数
 */
function searchContractInfo(number) {
	if ($("#userInfoId").val() != null && $("#userInfoId").val() != "" || $("#proxyModeType").val() == 1) {
		return;
	} else {
		// 请求地址
		var url = basePath
				+ "/settlementInfo/showContractInfoPage #shipper-data-info";
		$("#show-settlement-shipper-data-info").load(url, {
			"page" : number,
			"rows" : 10
		}, function() {
			//允许表格拖着
			$("#tableDrag").colResizable({
				  liveDrag:true, 
				  partialRefresh:true,
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  resizeMode: 'overflow'
			});
		    //结算数据较多，增加滑动
		    $(".iscroll").css("min-height", "55px");
		    $(".iscroll").mCustomScrollbar({
		      theme: "minimal-dark"
		    });
		})
	}
}

/**
 * 根据页数查询司机信息
 * @author jiangweiwei 2017年7月13日
 * @param number 页数
 */
function searchDriverInfo(number) {
	if ($("#shipper").val() != null && $("#shipper").val() != "") {
		return;
	} else {
		// 司机类型
//		var driverType = $("#driverType").val();
		// 车牌号
		var carCode = $("#carCode").val();
		// 是否代理
		var proxyModeType = $("#proxyModeType").val();
		// 请求地址
		var url = basePath
				+ "/settlementInfo/showSettlementDriverInfoPage #driver-data-info";
		$("#show-settlement-driver-data-info").load(url, {
			"page" : number,
			"rows" : 10,
//			"driverType" : driverType,
			"carCode" : carCode,
			"proxyModeType" : proxyModeType
		}, function() {
//				$('#driverType option[value='+driverType+']').prop('selected','selected');
				//允许表格拖着
				$("#tableDrag").colResizable({
					  liveDrag:true, 
					  partialRefresh:true,
					  gripInnerHtml:"<div class='grip'></div>", 
					  draggingClass:"dragging",
					  resizeMode: 'overflow'
				});
			    //结算数据较多，增加滑动
			    $(".iscroll").css("min-height", "55px");
			    $(".iscroll").mCustomScrollbar({
			      theme: "minimal-dark"
			    });
		})
		
	}
}

/**
 * 根据页数查询组织部门（项目）信息
 * @author jiangweiwei 2017年7月13日
 * @param number 页数
 */
function searchProjectInfo(number) {
	var projectName = $("#projectName").val();
	// 请求地址
	var url = basePath
			+ "/settlementInfo/showSettlementProjectInfoPage #project-data-info";
	$("#show-settlement-project-data-info").load(url, {
		"page" : number,
		"rows" : 10,
		"projectName" : projectName
	}, function() {
		//允许表格拖着
		$("#tableDrag").colResizable({
			  liveDrag:true, 
			  partialRefresh:true,
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging",
			  resizeMode: 'overflow'
		});
	    //结算数据较多，增加滑动
	    $(".iscroll").css("min-height", "55px");
	    $(".iscroll").mCustomScrollbar({
	      theme: "minimal-dark"
	    });
	})
}

/**
 * 根据页数查询结算公式信息
 * @author jiangweiwei 2017年7月13日
 * @param number
 *            页数
 */
//function searchFormulaInfo() {
//	var waybillInfoId = $("#waybillInfoId").val();
//	if(waybillInfoId == null || waybillInfoId == ""){
//		xjValidate.showPopup("请选择运单","提示");
//		return;
//	}
//	$.ajax({
//		type : "POST",
//		url	: basePath+"/settlementInfo/showSettlementFormulaPage",
//		data : {"waybillInfoId":waybillInfoId},
//		success	: function(dataStr){
//			if(dataStr){
//				var settlementFormulaDetailPo = dataStr.settlementFormulaDetailPo;
//				if(settlementFormulaDetailPo){
//					$("#selectFormula").val(settlementFormulaDetailPo.id);
//					$("#accountingEntityName").val(settlementFormulaDetailPo.accountingEntityStr);
//					$("#accountingEntity").val(settlementFormulaDetailPo.accountingEntity);
//				}
//			}
//		}
//	});
//}

/**
 *根据登录用户主机构ID、登录用户组织机构ID、所选运单货物、线路、发货单位、到货单位和计划拉运日期查询代理方信息
 * @author jiangweiwei 2017年7月15日
 */
function searchProxy(waybillInfoId,proxyModeType,forwardingTime){
	$.ajax({
		type : "POST",
		url	: basePath+"/settlementInfo/searchProxy",
		data : {"waybillInfoId":waybillInfoId,"proxyModeType":proxyModeType,"forwardingTime":forwardingTime},
		success	: function(dataStr){
			if(dataStr){
				var transportPrice = dataStr.transportPrice;
				var isSuccess = dataStr.success;
				if(isSuccess){
					if(transportPrice){
						$("#proxyName").val(transportPrice.proxyName);
						$("#proxy").val(transportPrice.proxy);
					}
				}
			}
		}
	});
}

/**
 *根据登录用户主机构ID、登录用户组织机构ID、所选运单货物、线路、发货单位、到货单位和发货时间查询外协司机运价和外协司机损耗扣款信息
 * @author jiangweiwei 2017年7月15日
 */
function searchTransportPriceAndLossDeduction(waybillInfoId,userInfoId,driverType,shipper,forwardingTime){
	$.ajax({
		type : "POST",
		url	: basePath+"/settlementInfo/searchTransportPriceAndLossDeduction",
		data : {"waybillInfoId":waybillInfoId,"userInfoId":userInfoId,"driverType":driverType,"shipper":shipper,"forwardingTime":forwardingTime},
		success	: function(dataStr){
			if(dataStr){
				var settlementInfo = dataStr.settlementInfo;
				var isSuccess = dataStr.success;
				if(isSuccess){
					if(settlementInfo){
						if(settlementInfo.waybillClassify != 2){
							$("#currentTransportPrice").val(settlementInfo.currentTransportPrice);
							$("#deductionTonnage").val(settlementInfo.deductionTonnage);
							$("#deductionUnitPrice").val(settlementInfo.deductionUnitPrice);
							$('.input-disable-select').show();
							$('.select-input').hide();
							//定损方式
							$("#deductionMode").val("");
							$("#deductionModeInput").val(settlementInfo.deductionMode);
							if(settlementInfo.deductionMode == 1){
								$("#deductionModeName").val("按比例");
							}else if(settlementInfo.deductionMode == 2){
								$("#deductionModeName").val("按吨位");
							}else{
								$("#deductionModeName").val("未知");
							}
							//计算方式
							$("#computeMode").val("");
							$("#computeModeInput").val(settlementInfo.computeMode);
							if(settlementInfo.computeMode == 1){
								$("#computeModeName").val("发货吨位");
							}else if(settlementInfo.computeMode == 2){
								$("#computeModeName").val("到货吨位");
							}else if(settlementInfo.computeMode == 3){
								$("#computeModeName").val("最小吨位");
							}else{
								$("#computeModeName").val("未知");
							}
							//是否倒扣
							$("#isInvert").val("");
							$("#isInvertInput").val(settlementInfo.isInvert);
							if(settlementInfo.isInvert == 0){
								$("#isInvertName").val("否");
							}else if(settlementInfo.isInvert == 1){
								$("#isInvertName").val("是");
							}else{
								$("#isInvertName").val("未知");
							}
						}
					}
				}
			}
		}
	});
}

/**
 * 计算代开总额、扣损吨位、扣损金额、承运方运费、应付运费、其他税费、运费进项税、进项税、运费成本、本次付款、客户运费
 * @author jiangweiwei 2017年7月15日
 */
function reOrderSettlementCompute(){
	$.ajax({
		url	: basePath + "/settlementInfo/reOrderSettlementCompute",
		asyn : false,
		type : "POST",
		data : $('#sub_re_order_settlement_info_form').serialize(),
		dataType : "json",
		success : function(dataStr){
			if(dataStr){
				var settlementInfo = dataStr.settlementInfo;
				var isSuccess = dataStr.success;
				var msg = dataStr.msg;
				if(isSuccess){
					if(settlementInfo){
						//代开总额
						$("#proxyInvoiceTotal").val(settlementInfo.proxyInvoiceTotal);
						//扣损吨位
						$("#lossTonnage").val(settlementInfo.lossTonnage);
						//扣损金额
						$("#deductionPrice").val(settlementInfo.deductionPrice);
						//承运方运费
						$("#shipperPrice").val(settlementInfo.shipperPrice);
						//应付运费
						$("#payablePrice").val(settlementInfo.payablePrice);
						//其他税费
						$("#otherTaxPrice").val(settlementInfo.otherTaxPrice);
						//运费进项税
						$("#transportPriceIncomeTax").val(settlementInfo.transportPriceIncomeTax);
						//进项税
						$("#incomeTax").val(settlementInfo.incomeTax);
						//公路进项税
						$("#highwayInputTax").val(settlementInfo.highwayInputTax);
						//高速公路进项税
						$("#superHighwayInputTax").val(settlementInfo.superHighwayInputTax);
						//运费成本
						$("#transportPriceCost").val(settlementInfo.transportPriceCost);
						//本次付款
						$("#thisPayPrice").val(settlementInfo.thisPayPrice);
						//客户运费
						$("#customerPrice").val(settlementInfo.customerPrice);
						//实付金额
						$("#actualPaymentPrice").val(settlementInfo.actualPaymentPrice);
						//销项税
						$("#outputTax").val(settlementInfo.outputTax);
					}
					$.confirm({
						title : "提示",
						content : "是否保存结算信息？",
						buttons : {
							'保存' : function() {
								addOrUpdateReOrderSettlementInfo();
							},
							'取消' : function() {
									
							}
						}
					});
				}else{
					//xjValidate.showTip(msg);
					xjValidate.showPopup(msg,"提示");
	   				return;
				}
			}
		}
		
	});
  }

/**
 * 新增/编辑结算信息
 * @author jiangweiwei 2017年7月21日
 */
function addOrUpdateReOrderSettlementInfo(){
	var reOrderSettlementPhoto = sessionStorage.getItem("reOrderSPhoto");
	$("#reOrderSPhoto").val(reOrderSettlementPhoto);
	var waybillInfoId = $("#waybillInfoId").val();
	if(waybillInfoId == null || waybillInfoId == ""){
		xjValidate.showPopup("请选择运单！","提示");
		return;
	}
	$.ajax({
		url	: basePath + "/settlementInfo/addOrUpdateReOrderSettlementInfo",
		asyn : false,
		type : "POST",
		data : $('#sub_re_order_settlement_info_form').serialize(),
		dataType : "json",
		success : function(dataStr){
			if(dataStr){
				if(dataStr.success){
//					//关闭弹框
//					$("#show_settlementIn_addOrUpdate_info").empty();
//					//刷新页面
//					window.location.href = basePath+"/settlementInfo/showReOrderSettlementInfoListPage";
					if(operateType == "1"){
						$("#rootWaybillId").val("");
						$("#waybillId").val("");
						$("#settlementId").val("");
						$("#waybillInfoId").val("");
						$("#waybillInfoIdTemp").val("");
						$("#rootWaybillInfoId").val("");
						$("#parentWaybillInfoId").val("");
						$("#cooperateStatus").val("");
					}
					xjValidate.showPopup(dataStr.msg,"提示");
				}else{
					xjValidate.showPopup(dataStr.msg,"提示");
	   				return;
				}
			}else{
				xjValidate.showPopup("保存结算信息服务异常忙，请稍后重试","提示");
				return;
			}
		}
		
	});
}
/**
 * 计算并保存结算信息
 * @author jiangweiwei 2017年7月26日
 */
function reOrderSettlementComputeAndHold(){
	//有价券领用编号
	var couponUseInfoId = $("#couponUseInfoId").val();
	//有价券领用金额
	var money = $("#money").val();
	//有价券进项税
	var taxRate = $("#taxRate").val();
	//结算公式明细编号
	var settlementFormulaDetailId = $("#selectFormula").val();
	//结算公式编号
	var settlementFormulaId = $("#settlementFormulaId").val();
	//企业代扣税税率
	var withholdingTaxRate = $("#withholdingTaxRate").val();
	//司机运费进项税税率（%）
	var incomeTaxRate = $("#incomeTaxRate").val();
	//运单编号
	var waybillInfoId = $("#waybillInfoId").val();
	//运单号
	var waybillId = $("#waybillId").val();
	//计划拉运日期
	var planTransportDate = $("#planTransportDate").val();
	//司机表用户信息表ID
	var userInfoId = $("#userInfoId").val();
	//司机类型
	var driverInfoType = $("#driverInfoType").val();
	//组织部门（所属项目）
	var projectInfoId = $("#projectInfoId").val();
	//物流公司（承运方）
	var shipper = $("#shipper").val();
	//是否包车
	var charteredType = $("#charteredType").val();
	//是否代理
	var proxyModeType = $("#proxyModeType").val();
	//计算方式
	var computeMode = $("#computeMode").val();
	var computeModeInput = $("#computeModeInput").val();
	//定损方式
	var deductionMode = $("#deductionMode").val();
	var deductionModeInput = $("#deductionModeInput").val();
	//是否倒扣
	var isInvert = $("#isInvert").val();
	var isInvertInput = $("#isInvertInput").val();
	//委托方
	var entrust = $("#entrust").val();
	//货物
	var goodsInfoId = $("#goodsInfoId").val();
	//零散货物
	var scatteredGoods = $("#scatteredGoods").val();
	//发货吨位
	var forwardingTonnage = $("#forwardingTonnage").val();
	//毛重吨位
	var roughWeightTonnage = $("#roughWeightTonnage").val();
	//到货吨位
	var arriveTonnage = $("#arriveTonnage").val();
	//结算吨位
	var settlementTonnage = $("#settlementTonnage").val();
	//发货单号
	var forwardingId = $("#forwardingId").val();
	//到货单号
	var arriveId = $("#arriveId").val();
	//司机运单号
	var driverWaybillId = $("#driverWaybillId").val();
	//保险费
	var insurancePrice = $("#insurancePrice").val();
	//包车运费
	var charteredPrice = $("#charteredPrice").val();
	//预付款
	var advancePrice = $("#advancePrice").val();
	//工本费
	var costPrice = $("#costPrice").val();
	//代扣税
	var withholdingTax = $("#withholdingTax").val();
	//单车保险
	var singleCarInsurance = $("#singleCarInsurance").val();
	//其它扣款
	var otherPrice = $("#otherPrice").val();
	//回单人
	var returnSingleUser = $("#returnSingleUser").val();
	//扣款吨位
	var deductionTonnage = $("#deductionTonnage").val();
	//扣损单价
	var deductionUnitPrice = $("#deductionUnitPrice").val();
	//当前运价
	var currentTransportPrice = $("#currentTransportPrice").val();
	//发货时间
	var forwardingTime = $("#forwardingTime").val();
	//到货时间
	var arriveTime = $("#arriveTime").val();
	//备注
	var remarks = $("#remarks").val();
	//核算主体
	var accountingEntity = $("#accountingEntity").val();
	//代理方
	var proxy = $("#proxy").val();
	//代开总额
	var deductionPrice = $("#deductionPrice").val();
	//车牌号码
	var drivceCode = $("#drivceCode").val();
	//扣损吨位
	var lossTonnage = $("#lossTonnage").val();
	//扣损金额
	var deductionPrice = $("#deductionPrice").val();
	//客户运费
	var customerPrice = $("#customerPrice").val();
	//承运方运费
	var shipperPrice = $("#shipperPrice").val();
	//应付运费
	var payablePrice = $("#payablePrice").val();
	//其他税费
	var otherTaxPrice = $("#otherTaxPrice").val();
	//运费进项税
	var transportPriceIncomeTax = $("#transportPriceIncomeTax").val();
	//进项税
	var incomeTax = $("#incomeTax").val();
	//运费成本
	var transportPriceCost = $("#transportPriceCost").val();
	//本次付款
	var thisPayPrice = $("#thisPayPrice").val();
	//发货单位
	var forwardingUnit = $("#forwardingUnit").val();
	//到货单位
	var consignee = $("#consignee").val();
	//附件
	var fileText = $("#fileText").val();
	var check = xjValidate.checkForm();
	if(check == false){
		xjValidate.showPopup("数据错误","存在不合法数据请检查")
		return;
	}
	if(waybillInfoId == null || waybillInfoId == ""){
		xjValidate.showPopup("请选择运单","提示");
		return;
	}
	if(projectInfoId == null || projectInfoId == ""){
		xjValidate.showPopup("请选择组织部门","提示");
		return;
	}
	if(proxyModeType == null || proxyModeType == ""){
		xjValidate.showPopup("请选择代理模式","提示");
		return;
	}
	if(charteredType == null || charteredType == ""){
		xjValidate.showPopup("请选择包车模式","提示");
		return;
	}
//	if(driverInfoType != 1){
//		if(goodsInfoId != null && goodsInfoId != ""){
//			if((computeModeInput == null || computeModeInput == "") && charteredType == "0"){
//				xjValidate.showPopup("请选择计算方式","提示");
//				return;
//			}
//			if(deductionModeInput == null || deductionModeInput == ""){
//				xjValidate.showPopup("请选择定损方式","提示");
//				return;
//			}
//			if(isInvertInput == null || isInvertInput == ""){
//				xjValidate.showPopup("请选择是否倒扣","提示");
//				return;
//			}
//		}else{
//			if(computeMode == null || computeMode == ""){
//				xjValidate.showPopup("请选择计算方式","提示");
//				return;
//			}
//			if(deductionMode == null || deductionMode == ""){
//				xjValidate.showPopup("请选择定损方式","提示");
//				return;
//			}
//			if(isInvert == null || isInvert == ""){
//				xjValidate.showPopup("请选择是否倒扣","提示");
//				return;
//			}
//		}
//	}
	if(entrust == null || entrust == ""){
		xjValidate.showPopup("委托方为必填","提示");
		return;
	}
	if((userInfoId == null || userInfoId == "") && (shipper == null || shipper == "")){
		xjValidate.showPopup("司机和物流公司必须选择一项","提示");
		return;
	}
	if(proxyModeType==1){
		var proxy = $("#proxy").val().trim();
		if(proxy==''){
			xjValidate.showPopup("承运商为空,请检查代理运价设置!","提示");
			return;
		} 
	}
	reOrderSettlementCompute();
}

/**
 * 根据运单信息表主键ID查询司机装货、在途和卸货照片
 * @author jiangweiwei 2017年7月13日
 * @param number 页数
 */
function searchDriverImg() {
		// 运单信息表主键ID
		var waybillInfoId = $("#waybillInfoId").val();
		// 请求地址
		var url = basePath
				+ "/settlementInfo/showDriverImg #driver-img-info";
		$("#show-driver-img-info").load(url, {
			"waybillInfoId" : waybillInfoId
		}, function() {
		})
}

function settlementphoto(){
//	window.open(basePath+"/settlementInfo/settlementphoto");
	$("#form_settlement_photo_opt").attr("action",basePath+"/settlementInfo/settlementphoto");
  	$("#form_settlement_photo_opt").submit();
}

//查看附件
function viewAttachment(){
	$("#unloadingDiv").empty();
	$("#unloadingDiv").html("");
	$("#loadingDiv").empty();
	$("#loadingDiv").html("");
	$("#onpassageDiv").empty();
	$("#onpassageDiv").html("");
	 var rootWaybillInfoId = $("#rootWaybillInfoId").val();  
	 //查看附件
	$.ajax({
    	url:basePath+"/settlementInfo/findEnclosure",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"rootWaybillInfoId":rootWaybillInfoId},
        dataType:'json',//数据传输格式：json
        success:function(data){
        	var jsonAll = data;
        	var jsonLoading = jsonAll.loadingImgList;
        	var jsonOnpassage = jsonAll.onpassageImgList;
        	var jsonUnloading = jsonAll.unloadingImgList;
        	var imgUrl = "";
        	if(jsonLoading != null && jsonLoading.length >0){
        		$.each(jsonLoading,function(i, val) {
        			if(val == "" || val == null){
        				imgUrl = basePath+"/static/images/common/timg.jpg";
        			}else{
        				imgUrl = fastdfsServer+"/"+val;
        			}
        			$("#loadingDiv").append("<div class='group-img'>" +
        					"<div class='view-img'>" +
        					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
        					"</div>" +
        					"</div>" );
	    		})
        	}else{
        		imgUrl = basePath+"/static/images/common/timg.jpg";
        		$("#loadingDiv").append("<div class='group-img'>" +
    					"<div class='view-img'>" +
    					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
    					"</div>" +
    					"</div>" );
        	}
//        	if(jsonOnpassage != null && jsonLoading.length >0){
//        		$.each(jsonOnpassage,function(i, val) {
//        			if(val == "" || val == null){
//        				imgUrl = basePath+"/static/images/common/timg.jpg";
//        			}else{
//        				imgUrl = fastdfsServer+"/"+val;
//        			}
//        			$("#onpassageDiv").append("<div class='group-img'>" +
//        					"<div class='view-img'>" +
//        					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
//        					"</div>" +
//        					"</div>" );
//	    		})
//        	}else{
//        		imgUrl = basePath+"/static/images/common/timg.jpg";
//        		$("#onpassageDiv").append("<div class='group-img'>" +
//    					"<div class='view-img'>" +
//    					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
//    					"</div>" +
//    					"</div>" );
//        	}
        	
        	if(jsonUnloading != null  && jsonLoading.length >0){
        		$.each(jsonUnloading,function(i, val) {
        			if(val == "" || val == null){
        				imgUrl = basePath+"/static/images/common/timg.jpg";
        			}else{
        				imgUrl = fastdfsServer+"/"+val;
        			}
        			$("#unloadingDiv").append("<div class='group-img'>" +
        					"<div class='view-img'>" +
        					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
        					"</div>" +
        					"</div>" );
	    		})
        	}else{
        		imgUrl = basePath+"/static/images/common/timg.jpg";
        		$("#unloadingDiv").append("<div class='group-img'>" +
    					"<div class='view-img'>" +
    					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
    					"</div>" +
    					"</div>" );
        	}
        	$("#lookDocModal").modal('show');
        	}
        });
	
	//图片预览
	$('.view-img').viewer({
		title:false
	});
}

function addTempCarInfoPage(){
	$("#form_temp_carInfo_opt").attr("action",basePath+"/carInfo/addOrEditTempCarInfoPage");
  	$("#form_temp_carInfo_opt").submit();
}

function addTempDriverInfoPage(){
	//进入添加企业临时司机
	 var url=basePath+'/driverInfo/addTDriverModel';
	 $("#show_department_info").load(url,function(){
		//上传图片初始化
			$('.upload_img').each(function(){
				uploadLoadFile($(this));
			})
	 });
}

//点击X关闭模态框
function modeClose(){
	$("#show_department_info").html("");
}

//点击取消关闭模态框
function closeButton(){
	$("#show_department_info").html("");
}

/**
 * 绑定上传事件的dom对象
 * @author chengzhihuan 2017年5月18日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn,{
   		action: basePath + '/upload/imageUpload',
   		name: 'myfile',
		dataType: 'json',
   		onSubmit : function(file , ext){
   			//文件上传格式校验
   			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))){
   				$.alert("请上传格式为 jpg|png|bmp 的图片!");
   				return;
   			}
   		},
   		//服务器响应成功时的处理函数
   		onComplete :function(file, resultJson){
   			if(resultJson){
   				resultJson = $.parseJSON(resultJson);
   				//是否成功
   				var isSuccess = resultJson.isSuccess;
   				//上传图片URL
   				var uploadUrl = resultJson.uploadUrl;
   				if(isSuccess=="true"){
   					//图片类型
   					var imgType = btn.attr("img-type");
					btn.attr("src",fastdfsServer+"/"+uploadUrl);
					$("#"+imgType).val(uploadUrl);
   				}else{
   					$.alert(resultJson.errorMsg);
   	   				return;
   				}
   			}else{
   				$.alert("服务器异常，请稍后重试");
   				return;
   			}
		}
	});
}

//添加企业临时司机
function addTDriver(){
	
	//判断司机姓名是否为空
	var driverName=$.trim($("#tDriverName").val());
	if(driverName==undefined || driverName==""){
		 xjValidate.showTip("司机名称不能为空!");
		return false;
	}
	//司机姓名长度校验
	if(driverName.length>100){
		 xjValidate.showTip("司机名称的长度不能超过50个字符!");
		return false;
	}
	//校验手机号是否为空
	var mobilePhone=$.trim($("#tMobilePhone").val());
	if(mobilePhone==undefined || mobilePhone==""){
		 xjValidate.showTip("请输入手机号码!");
		return false;
	}
	//验证手机号码是否符合规则
	var myreg = /^1[34578]\d{9}$/; 
	if(!myreg.test(mobilePhone)){
		 xjValidate.showTip("请输入正确的手机号码!");
		return false;
	}
	/*//校验身份证号是否为空
	var idCard=$.trim($("#tIdCard").val());
	if(idCard==undefined || idCard==""){
		 xjValidate.showTip("身份证号码不能为空!");
		return false;
	}
	//校验身份证号码是否符合规范
	var myreg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	var re = new RegExp(myreg);
	if(!re.test(idCard)){
		 xjValidate.showTip("请输入正确的身份证号码!");
		return false;
	}
	//校验驾驶证编号是否为空
	var drivingLicense=$.trim($("#tDrivingLicense").val());
	if(drivingLicense==undefined || drivingLicense==""){
		 xjValidate.showTip("驾驶证编号不能为空!");
		return false;
	}
	//校验驾驶证编号长度
	if(drivingLicense.length>100){
		 xjValidate.showTip("驾驶证编号的长度不能超过50个字符!");
		return false;
	}*/
	/*//校验开户行是否为空
	var openingBank=$.trim($("#tOpeningBank").val());
	if(openingBank==undefined || openingBank==""){
		 xjValidate.showTip("开户行不能为空!");
		return false;
	}
	//校验开户行长度
	if(openingBank.length>100){
		 xjValidate.showTip("开户行的长度不能超过50个字符!");
	}
	//校验开户名是否为空
	var accountName=$.trim($("#tAccountName").val());
	if(accountName==undefined || accountName==""){
		 xjValidate.showTip("开户名不能为空!");
		return false;
	}
	//校验银行账号是否为空
	var bankAccount=$.trim($("#tBankAccount").val());
	if(bankAccount==undefined || bankAccount==""){
		 xjValidate.showTip("银行账号不能为空!");
		return false;
	}*/
	
	/*//校验银行账号是否为数字
	var myreg1 = "^[0-9]*$";
	var re = new RegExp(myreg1);
	if(!re.test(bankAccount)){
		 xjValidate.showTip("银行账号不能为空!");
		return false;
	}
	
	//检验银行长号长度
	if(bankAccount.length>40){
		 xjValidate.showTip("银行账号的长度不能超过20个字符!");
	}*/
	
	/*//获得当前选择组织机构信息
	var tDriverParentOrgInfoId=$.trim($("#tDriverParentOrgInfoId").val());
	if(tDriverParentOrgInfoId==undefined || tDriverParentOrgInfoId==""){
		xjValidate.showTip("所属组织必须选择!");
		return false;
	}*/
	
	//校验身份证正面附件是否为空  
	var idCardImage=$.trim($("#idCardImage").val());
	if(idCardImage==undefined || idCardImage==""){
		 xjValidate.showTip("请上传身份证正面附件!");
		return false;
	}
	/*//检验身份证反面附件
	var idCardImageCopy=$.trim($("#idCardImageCopy").val());
	if(idCardImageCopy==undefined || idCardImageCopy==""){
		 xjValidate.showTip("请上传身份证反面附件!");
		return false;
	}
	//校验司机驾驶证正面附件
	var driverLicenseImg=$.trim($("#driverLicenseImg").val());
	if(driverLicenseImg==undefined || driverLicenseImg==""){
		 xjValidate.showTip("请上传驾驶证正面附件!");
		return false;
	}
	//校验司机驾驶证反面附件
	var driverLicenseImgCopy=$.trim($("#driverLicenseImgCopy").val());
	if(driverLicenseImgCopy==undefined || driverLicenseImgCopy==""){
		 xjValidate.showTip("请上传身份证反面附件!");
		return false;
	}*/
	//验证通过
	$.ajax({
		url:basePath
		+ "/driverInfo/addTDriverInfo",
		data:$("#tDriver_form").serialize(),
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					xjValidate.showPopup(resp.msg,"提示",true);
					$("#show_department_info").html("");
					searchDriverInfo(1);
				}else{
					xjValidate.showTip(resp.msg);
				}
			}else{
				xjValidate.showPopup("新增企业临时司机异常!","提示",true);
			}
			
		}
	});
}

/**
 * 影像页面
 */
function settlementphoto(){
	
	
//	// 请求地址
//	var url = basePath
//			+ "/settlementInfo/addSettlementPhotoInfoPage #photo-data-info";
//	
//	$("#settlementphoto_info_view").load(url, {}, function() {
//		
//		
//	});
	//EThumbnails.ClearDisplay(true);
	$("#settlementPhotoModal").modal('show');
}


function submitSelectPhhot(){
/*	//$("#settlementphoto_info_view").empty();
	EThumbnails.ClearDisplay(true);*/
	
	$("#settlementPhotoModal").modal('hide');
	
}

/**
 * 有价券清除
 * jiangweiwei 2017年11月3日
 */
function cleanCouponInfo(){
	$("#couponUseTotalPrice").val("");
	$("#couponUseInfo").val("");
	$("#taxRate").val("");
	$("#couponIncomeTax").val("");
	$("#cardCodes").val("");
	$("#coupon-data-info").empty();
}




/**
 * 是否包车触发
 */
function selectSub() {
	var subChartered = $("#subChartered").val();
	if (subChartered == 1) { //转包
		$("#userInfoId").val("");
		$("#driverInfoName").val("");
		$("#driverInfoType").val("");
		$("#drivceCode").val("");
		$("#carPart").val("");
		
		$("#drivceCode").prop('readonly',true);
		$("#shipperName").prop('readonly',false);
	
		
	} else {
		$("#shipperName").val("");
		$("#shipper").val("");
		$("#drivceCode").prop('readonly',false);
		$("#shipperName").prop('readonly',true);
	
	}
}







