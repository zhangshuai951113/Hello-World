//初始化page
// 主列表
var mainPage = null; 

var ajaxing = false; // 请求是否正在进行中

var pageSelIds = null; // 选中的数据

var selectedIds = null; // 被选中的数据

(function($) {
	//初始化运单列表page页面
	mainPage = $("#mainPage").operationList({
		"current" : 1, //当前目标
		"maxSize" : 4, //前后最大列表
		"itemPage" : 10, //每页显示多少条
		"totalItems" : 0, //总条数
		"chagePage" : function(current) {
			load();
			// 换页时，选中之前已经选中过的行
			if (selectedIds != null && selectedIds.length != 0) {
				$(".sub_main_check").each(function(){
					var id = $(this).attr("data-id");
					if (selectedIds.indexOf(id) != -1) {
						$(this).prop("checked",true);
					}
				});
			}
			
			
		}
	});
	
	// 全选/全不选
	$("body").on("click",".all-main-check",function(){
		if($(".all-main-check").is(":checked")){
			//全选时
			$(".sub_main_check").each(function(){
				// 加change()是为了出发onchange事件
				$(this).prop("checked",true).change();
			});
		}else{
			//全不选时
			$(".sub_main_check").each(function(){
				$(this).prop("checked",false).change();
			});
		}
	});
	
	
	setTimeout(function() {
		//时间调用插件
		$(".date-time").datetimepicker({
			format : "YYYY-MM-DD",
			autoclose : true,
			todayBtn : true,
			todayHighlight : true,
			showMeridian : true,
			pickTime : false
		});
		//允许运单表格拖着
		$("#mainTable").colResizable({
			resizeMode: 'overflow', // overflow
			liveDrag : true,
			gripInnerHtml : "<div class='grip'></div>",
			draggingClass : "dragging"
		});
		// 点击表头排序
		$('#mainTable').tablesort().data('tablesort');
		var i = 0;
		$(".table tr th a").click(function() {
			if (i % 2 == 0) {
				$(".sj").text('升序');
				i++;
			} else {
				$(".sj").text('降序');
				i++;
			}
		});
		$('thead th.number').data('sortBy', function(th, td, sorter) {
			return parseInt(td.text(), 10);
		});
	}, 500);

	
	
	load();
	
	
})(jQuery);

/**
 * 查询
 * 点击查询按钮时，清空选择的记录
 */
function query(){
	// 清空选中的记录
	selectedIds = null;
	// 查询按钮到第一页
	mainPage.setCurrentPage(1);
	
}
function resetEmpty() {
	//清除重置线路
	$("#selectLine").empty();
}

/**
 * 获取主表格的数据
 * @returns
 */
function load(){
	var params = getQueryParams();
	params.page = mainPage.options.current;
	params.rows = mainPage.options.itemPage;

	$.ajax({
		url : basePath + "/reportForm/getProfitAnalysisData",
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
					createTableByData(resp);
				} else {
					commonUtil.showPopup("提示",resp.msg);return;
				}
			} else {
				commonUtil.showPopup("提示","服务异常忙，请稍后重试");return;
			}
		},
		error:function(){ajaxing = false;commonUtil.showPopup("提示","服务请求失败");},
		complete:function(){ajaxing = false;}
	});
}

/**
 * 获取查询参数
 * @returns {___anonymous6602_7457}
 */
function getQueryParams(){
	// 运单号
	var waybillId = $.trim($("#m-waybillId").val());
	// 车牌号码
	var carCode = $.trim($("#m-carCode").val());
	// 货物名称
	var goodsName = $.trim($("#m-goodsName").val());
	// 客户名称（委托方）
	var entrustName = $.trim($("#m-entrustName").val());
	// 承运方
	var shipperName = $.trim($("#m-shipperName").val());
	// 拉运起点
	var startPoint = $.trim($("#m-startPoint").val());
	// 拉运终点
	var endPoint = $.trim($("#m-endPoint").val());
	// 组织部门
	var orgName = $.trim($("#m-orgName").val());
	// 发货单号
	var forwardingId = $.trim($("#m-forwardingId").val());
	// 到货单号
	var arrrveId = $.trim($("#m-arrrveId").val());
	// 制单人
	var createUser = $.trim($("#m-createUser").val());
	// 车属单位
	var carOrg = $.trim($("#m-carOrg").val());
	// 核算主体
	var accountingEntity = $.trim($("#m-accountingEntity").val());
	
	// 制单日期（1、2）
	var createTime1 = $.trim($("#m-createTime1").val());
	var createTime2 = $.trim($("#m-createTime2").val());
	// 回单日期（1、2）
	var returnDocTime1 = $.trim($("#m-returnDocTime1").val());
	var returnDocTime2 = $.trim($("#m-returnDocTime2").val());
	// 发货日期（1、2）
	var fordwardingTime1 = $.trim($("#m-fordwardingTime1").val());
	var fordwardingTime2 = $.trim($("#m-fordwardingTime2").val());
	
	// 审核状态
	var settlementStatus = $.trim($("#m-settlementStatus").val());
	// 挂账状态
	var isWriteOff = $.trim($("#m-isWriteOff").val());
	// 是否对账
	var isAccount = $.trim($("#m-isAccount").val());
	// 支付方式
	var payType = $.trim($("#m-payType").val());
	// 收入发票
	var isInvoice = $.trim($("#m-isInvoice").val());
	// 是否补差
	var isRevise = $.trim($("#m-isRevise").val());
	
	// 参数
	var params = {
		"waybillId" : waybillId, 
		"carCode" : carCode,
		"goodsName" : goodsName,
		"entrustName" : entrustName,
		"shipperName" : shipperName,
		"startPoint" : startPoint,
		"endPoint" : endPoint,
		"orgName" : orgName,
		"forwardingId" : forwardingId,
		"arrrveId" : arrrveId,
		"createUser" : createUser,
		"carOrg" : carOrg,
		"accountingEntity" : accountingEntity,
		"createTime1" : createTime1,
		"createTime2" : createTime2,
		"returnDocTime1" : returnDocTime1,
		"returnDocTime2" : returnDocTime2,
		"fordwardingTime1" : fordwardingTime1,
		"fordwardingTime2" : fordwardingTime2,
		"settlementStatus" :settlementStatus,
		"isWriteOff" :isWriteOff,
		"isAccount" :isAccount,
		"payType" :payType,
		"isInvoice" :isInvoice,
		"isRevise" :isRevise
	};	
	return params;
}
/**
 * 页面跳转
 * @param e
 */
function mainPageJump(e){
	var value = $(e).prev().find('input').val();
	mainPage.setCurrentPage(value);
}
/**
 * 创建列表数据
 * @param data
 */
function createTableByData(resp){
	var list = resp.list;
	var total = resp.total;
	if (total == null || total == '' || total == undefined) {
		total = 0;
	}
	var mapSum = resp.mapSum;
	//
	var html = '';
	for (var i = 0;i < list.length; i++) {
		var item = list[i];
		html += '<tr class="table-body ">';
		html += '<td>';
		html += '<label class="i-checks"> ';
		html += '<input class="sub_main_check" type="checkbox" data-id="'+item.id+'" onchange="recordSelected(this)">';
		html += '</label>';
		html += '</td>';
		html += '<td>'+numberFormat(item.serial_number)+'</td>'; // 序号
		html += '<td>'+numberFormat(item.settlement_id)+'</td>'; // 结算单号 settlement_id
		html += '<td>'+numberFormat(item.grossProfitRate)+'</td>'; //毛利率
		html += '<td>'+numberFormat(item.fuel_rate)+'</td>'; //毛利率燃料费占比 （燃料费/运费）百分比形式	
		html += '<td>'+numberFormat(item.waybill_id)+'</td>'; //运单编号
		html += '<td>'+formatValue(item.goods_name)+'</td>'; //货物 goods_info_id scattered_goods
		html += '<td>'+dateFormat(item.forwarding_time,'yyyy-MM-dd')+'</td>'; //发货日期
		html += '<td>'+numberFormat(item.forwarding_tonnage)+'</td>'; //实际发货吨位 - 发货吨位
		html += '<td>'+numberFormat(item.arrive_tonnage)+'</td>'; //实际到货吨位 - 到货吨位
		html += '<td>'+numberFormat(item.current_transport_price)+'</td>'; //客户运价-当前运价
		html += '<td>'+numberFormat(item.customer_price)+'</td>'; //客户运费
		html += '<td>'+numberFormat(item.income_tax)+'</td>'; //进项税
		html += '<td>'+numberFormat(item.actual_income)+'</td>'; //实际收入
		html += '<td>'+numberFormat(item.output_tax)+'</td>'; //销项税
		html += '<td>'+numberFormat(item.withholding_tax)+'</td>'; //代扣税
		html += '<td>'+numberFormat(item.transport_price_income_tax)+'</td>'; //运费进项税
		html += '<td>'+numberFormat(item.coupon_income_tax)+'</td>'; //有价卷进项税
//		html += '<td>'+''+'</td>'; //燃油进项税
//		html += '<td>'+''+'</td>'; //燃气进项税
		
		html += '<td>'+numberFormat(item.coupon_use_total_price)+'</td>'; //燃料费---有价卷金额
//		html += '<td>'+''+'</td>'; //燃料种类
		html += '<td>'+''+'</td>'; //客户损耗扣款
		html += '<td>'+formatValue(item.entrust_name)+'</td>'; //客户名称
		html += '<td>'+formatValue(item.shipper_name)+'</td>'; //承运方 shipper
		html += '<td>'+formatValue(item.car_code)+'</td>'; //车牌号
		html += '<td>'+formatValue(item.start_point)+'</td>'; //起点 start_point
		html += '<td>'+formatValue(item.end_point)+'</td>'; //终点 end_point
		html += '<td>'+numberFormat(item.loss_tonnage)+'</td>'; //损耗吨位
		html += '<td>'+numberFormat(item.deduction_tonnage)+'</td>'; //扣款吨位
		html += '<td>'+numberFormat(item.current_transport_price)+'</td>'; //司机运价
		html += '<td>'+numberFormat(item.payable_price)+'</td>'; //司机运费
		html += '<td>'+numberFormat(item.transport_price_cost)+'</td>'; //运费成本
		html += '<td>'+numberFormat(item.deduction_price)+'</td>'; //损耗扣款
		html += '<td>'+numberFormat(item.other_price)+'</td>'; //其它扣款
		html += '<td>'+numberFormat(item.payable_price)+'</td>'; //应付运费
		html += '<td>'+formatValue(item.is_revise_name)+'</td>'; //是否补差
		html += '<td>'+formatValue(item.is_account_name)+'</td>'; //是否对账
		html += '<td>'+formatValue(item.make_user_name)+'</td>'; //制单人  item.make_user
		html += '<td>'+dateFormat(item.make_time,'yyyy-MM-dd')+'</td>'; //制单日期
		html += '<td>'+dateFormat(item.make_time,'yyyy-MM-dd')+'</td>'; //回单日期
		html += '<td>'+formatValue(item.project_org_name)+'</td>'; //组织部门 project_info_id
		html += '<td>'+formatValue(item.accounting_entity_name)+'</td>'; //核算主体 accounting_entity
		html += '<td>'+formatValue(item.forwarding_unit)+'</td>'; //发货单位
		html += '<td>'+formatValue(item.consignee)+'</td>'; //收货单位
		html += '<td>'+formatValue(item.forwarding_id)+'</td>'; //发货单号 item.forwarding_id
		html += '<td>'+formatValue(item.arrive_id)+'</td>'; //到货单号 item.arrive_id
//		html += '<td>'+''+'</td>'; //成本发票号码
//		html += '<td>'+''+'</td>'; //收入发票号码
		html += '<td>'+numberFormat(item.highway_toll)+'</td>'; //公路通行费
		html += '<td>'+numberFormat(item.super_highway_toll)+'</td>'; //高速公路通行费
		html += '<td>'+numberFormat(item.other_toll)+'</td>'; //其他通行费
		html += '<td>'+numberFormat(item.highway_inputTax)+'</td>'; //公路进项税
		html += '<td>'+numberFormat(item.super_highway_inputTax)+'</td>'; //高速公路进项税
		html += '<td>'+formatValue(item.car_org)+'</td>'; //车属单位
		html += '</tr>';
	}
	
	$("#mainTableTbody").html(html);
	mainPage.setTotalItems(total);
	$("#mainTableTotal").text(total);
	
	// 统计行
	//console.log(mapSum);
	if (mapSum != null) {
		var sumTr = '';
		sumTr += '<tr id="last-tr" class="table-body" bgcolor="#FDF5E6">';
		//sumTr += '<td></td>'; // 复选框（空）
		sumTr += '<td colspan="2">合计(所有数据)</td>'; // 序号
		sumTr += '<td></td>'; //结算单号
		sumTr += '<td></td>'; //毛利率
		sumTr += '<td></td>'; //燃料费占比 （燃料费/运费）百分比形式	
		sumTr += '<td></td>'; //运单编号
		sumTr += '<td></td>'; //货物 goods_info_id scattered_goods
		sumTr += '<td></td>'; //发货日期
		sumTr += '<td>'+numberFormat(mapSum.forwarding_tonnage_sum)+'</td>'; //实际发货吨位 - 发货吨位
		sumTr += '<td>'+numberFormat(mapSum.arrive_tonnage_sum)+'</td>'; //实际到货吨位 - 到货吨位
		sumTr += '<td></td>'; //客户运价-当前运价
		sumTr += '<td>'+numberFormat(mapSum.customer_price_sum)+'</td>'; //客户运费
		sumTr += '<td></td>'; //进项税
		sumTr += '<td>'+numberFormat(mapSum.actual_income_sum)+'</td>'; //实际收入
		sumTr += '<td>'+numberFormat(mapSum.output_tax_sum)+'</td>'; //销项税
		sumTr += '<td>'+numberFormat(mapSum.withholding_tax_sum)+'</td>'; //代扣税
		sumTr += '<td>'+numberFormat(mapSum.transport_price_income_tax_sum)+'</td>'; //运费进项税
		
		sumTr += '<td>'+numberFormat(mapSum.coupon_income_tax_sum)+'</td>'; //燃油进项税
//		sumTr += '<td>'+''+'</td>'; //燃油进项税
//		sumTr += '<td>'+''+'</td>'; //燃气进项税
		
		sumTr += '<td>'+numberFormat(mapSum.coupon_use_total_price_sum)+'</td>'; //燃料费
//		sumTr += '<td>'+''+'</td>'; //燃料种类
		sumTr += '<td>'+''+'</td>'; //客户损耗扣款
		sumTr += '<td></td>'; //客户名称
		sumTr += '<td></td>'; //承运方 shipper
		sumTr += '<td></td>'; //车牌号
		sumTr += '<td></td>'; //起点 line_info_id
		sumTr += '<td></td>'; //终点 line_info_id end_points
		sumTr += '<td>'+numberFormat(mapSum.loss_tonnage_sum)+'</td>'; //损耗吨位
		sumTr += '<td>'+numberFormat(mapSum.deduction_tonnage_sum)+'</td>'; //扣款吨位
		sumTr += '<td></td>'; //司机运价
		sumTr += '<td>'+numberFormat(mapSum.payable_price_sum)+'</td>'; //司机运费
		sumTr += '<td>'+numberFormat(mapSum.transport_price_cost_sum)+'</td>'; //运费成本
		sumTr += '<td>'+numberFormat(mapSum.deduction_price_sum)+'</td>'; //损耗扣款
		sumTr += '<td>'+numberFormat(mapSum.other_price_sum)+'</td>'; //其它扣款
		sumTr += '<td>'+numberFormat(mapSum.payable_price_sum)+'</td>'; //应付运费
		sumTr += '<td></td>'; //是否补差
		sumTr += '<td></td>'; //是否对账
		sumTr += '<td></td>'; //制单人  item.make_user
		sumTr += '<td></td>'; //制单日期
		sumTr += '<td></td>'; //回单日期
		sumTr += '<td></td>'; //组织部门 project_info_id
		sumTr += '<td></td>'; //核算主体 accounting_entity
		sumTr += '<td></td>'; //发货单位
		sumTr += '<td></td>'; //收货单位
		sumTr += '<td></td>'; //发货单号 item.forwarding_id
		sumTr += '<td></td>'; //到货单号 item.arrive_id
//		sumTr += '<td></td>'; //成本发票号码
//		sumTr += '<td></td>'; //收入发票号码
		sumTr += '<td>'+numberFormat(mapSum.highway_toll_sum)+'</td>'; //公路通行费
		sumTr += '<td>'+numberFormat(mapSum.super_highway_toll_sum)+'</td>'; //高速公路通行费
		sumTr += '<td>'+numberFormat(mapSum.other_toll_sum)+'</td>'; //其他通行费
		sumTr += '<td>'+numberFormat(mapSum.highway_inputTax_sum)+'</td>'; //公路进项税
		sumTr += '<td>'+numberFormat(mapSum.super_highway_inputTax_sum)+'</td>'; //高速公路进项税
		sumTr += '<td></td>'; //车属单位
		sumTr += '</tr>';
		//html += sumTr;
		
		$("#mainTableTfoot").html(sumTr);
	}
	
//	$("#mainTableTbody").html(html);
//	mainPage.setTotalItems(total);
//	$("#mainTableTotal").text(total);
}

// 货物名称
function getGoodsName(goods_name,scattered_goods){
	if (isEmpty(goods_name)) {
		if (isEmpty(scattered_goods)) {
			return '';
		} else {
			return scattered_goods;
		}
	} else {
		return goods_name;
	}
}
// 起点
function getStartPoint(end_points,line_start_point,location_start_point){
	if (isEmpty(end_points)) {
		return formatValue(line_start_point);
	} else {
		return formatValue(location_start_point);
	}
}
// 终点
function getEndPoint(end_points,line_end_point,location_end_point){
	if (isEmpty(end_points)) {
		return formatValue(line_end_point);
	} else {
		return formatValue(location_end_point);
	}
}
// 是否补差
function getIsRevise(is_revise){
	if (is_revise == 1 ) {
		return '是';
	} else {
		return '否';
	}
}
// 是否对账
function getIsAccount(is_account){
	if (is_account == 1) {
		return '是';
	}  else {
		return '否';
	}
}

// 统计数据
function sumSelectedData(){
	// 记录当前选中的数据（页码和数据id）
	if (selectedIds == null || selectedIds.length == 0) {
		commonUtil.showPopup("提示","请选择数据");
		return ;
	}

	var params = {
		"ids" : selectedIds.join(",")
	};
	$.ajax({
		url : basePath + "/reportForm/getProfitAnalysisDataByIds",
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
					// 先删除原先最后一行数据
					//$("#last-tr").remove();
				
					// 统计的数据
					var mapSum = resp.sumMap;
					if (mapSum != null) {
						// 统计行
						var sumTr = '';
						sumTr += '<tr id="last-tr" class="table-body" bgcolor="#FDF5E6">';
						//sumTr += '<td></td>'; // 复选框（空）
						sumTr += '<td colspan="2">合计(当前选中)</td>'; // 序号
						sumTr += '<td></td>'; // 结算单号
						sumTr += '<td></td>'; // 毛利率
						sumTr += '<td></td>'; //燃料费占比 （燃料费/运费）百分比形式	
						sumTr += '<td></td>'; //运单编号
						sumTr += '<td></td>'; //货物 goods_info_id scattered_goods
						sumTr += '<td></td>'; //发货日期
						sumTr += '<td>'+numberFormat(mapSum.forwarding_tonnage_sum)+'</td>'; //实际发货吨位 - 发货吨位
						sumTr += '<td>'+numberFormat(mapSum.arrive_tonnage_sum)+'</td>'; //实际到货吨位 - 到货吨位
						sumTr += '<td></td>'; //客户运价-当前运价
						sumTr += '<td>'+numberFormat(mapSum.customer_price_sum)+'</td>'; //客户运费
						sumTr += '<td></td>'; //进项税
						sumTr += '<td>'+numberFormat(mapSum.actual_income_sum)+'</td>'; //实际收入
						sumTr += '<td>'+numberFormat(mapSum.output_tax_sum)+'</td>'; //销项税
						sumTr += '<td>'+numberFormat(mapSum.withholding_tax_sum)+'</td>'; //代扣税
						sumTr += '<td>'+numberFormat(mapSum.transport_price_income_tax_sum)+'</td>'; //运费进项税
						sumTr += '<td>'+numberFormat(mapSum.coupon_income_tax_sum)+'</td>'; //有价卷进项税
//						sumTr += '<td>'+''+'</td>'; //燃油进项税
//						sumTr += '<td>'+''+'</td>'; //燃气进项税
						sumTr += '<td>'+numberFormat(mapSum.coupon_use_total_price_sum)+'</td>'; //燃料费
//						sumTr += '<td>'+''+'</td>'; //燃料种类
						sumTr += '<td>'+''+'</td>'; //客户损耗扣款
						sumTr += '<td></td>'; //客户名称
						sumTr += '<td></td>'; //承运方 shipper
						sumTr += '<td></td>'; //车牌号
						sumTr += '<td></td>'; //起点 line_info_id
						sumTr += '<td></td>'; //终点 line_info_id end_points
						sumTr += '<td>'+numberFormat(mapSum.loss_tonnage_sum)+'</td>'; //损耗吨位
						sumTr += '<td>'+numberFormat(mapSum.deduction_tonnage_sum)+'</td>'; //扣款吨位
						sumTr += '<td></td>'; //司机运价
						sumTr += '<td>'+numberFormat(mapSum.payable_price_sum)+'</td>'; //司机运费
						sumTr += '<td>'+numberFormat(mapSum.transport_price_cost_sum)+'</td>'; //运费成本
						sumTr += '<td>'+numberFormat(mapSum.deduction_price_sum)+'</td>'; //损耗扣款
						sumTr += '<td>'+numberFormat(mapSum.other_price_sum)+'</td>'; //其它扣款
						sumTr += '<td>'+numberFormat(mapSum.payable_price_sum)+'</td>'; //应付运费
						sumTr += '<td></td>'; //是否补差
						sumTr += '<td></td>'; //是否对账
						sumTr += '<td></td>'; //制单人  item.make_user
						sumTr += '<td></td>'; //制单日期
						sumTr += '<td></td>'; //回单日期
						sumTr += '<td></td>'; //组织部门 project_info_id
						sumTr += '<td></td>'; //核算主体 accounting_entity
						sumTr += '<td></td>'; //发货单位
						sumTr += '<td></td>'; //收货单位
						sumTr += '<td></td>'; //发货单号 item.forwarding_id
						sumTr += '<td></td>'; //到货单号 item.arrive_id
//						sumTr += '<td></td>'; //成本发票号码
//						sumTr += '<td></td>'; //收入发票号码
						sumTr += '<td>'+numberFormat(mapSum.highway_toll_sum)+'</td>'; //公路通行费
						sumTr += '<td>'+numberFormat(mapSum.super_highway_toll_sum)+'</td>'; //高速公路通行费
						sumTr += '<td>'+numberFormat(mapSum.other_toll_sum)+'</td>'; //其他通行费
						sumTr += '<td>'+numberFormat(mapSum.highway_inputTax_sum)+'</td>'; //公路进项税
						sumTr += '<td>'+numberFormat(mapSum.super_highway_inputTax_sum)+'</td>'; //高速公路进项税
						sumTr += '<td></td>'; //车属单位
						sumTr += '</tr>';
						//console.log(sumTr);
						
						$("#mainTableTfoot").html(sumTr);
						//$("#mainTableTbody").append(sumTr);
					}
					
				} else {
					commonUtil.showPopup("提示",resp.msg);return;
				}
			} else {
				commonUtil.showPopup("提示","查询计划信息服务异常忙，请稍后重试");return;
			}
		},
		error:function(){ajaxing = false;commonUtil.showPopup("提示","服务请求失败");},
		complete:function(){ajaxing = false;}
	});
}

/**
 * 导出数据
 */
function exportData(){
	// 若有选中记录则导出选中的记录，没有则导出全部数据
	
	if (selectedIds == null || selectedIds.length == 0) {
		// 查询所有数据的id
		var params = getQueryParams();
		$.ajax({
			url : basePath + "/reportForm/getProfitAnalysisDataIds",
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
						console.log(resp);
						var list = resp.list;
						$("#ids").val(list.join(','));
						var url = basePath + "/reportForm/exportProfitAnalysis";
					    $('#exportData').attr('action', url);
					    $('#exportData').submit();
					} else {
						commonUtil.showPopup("提示",resp.msg);return;
					}
				} else {
					commonUtil.showPopup("提示","服务异常忙，请稍后重试");return;
				}
			},
			error:function(){ajaxing = false;commonUtil.showPopup("提示","服务请求失败");},
			complete:function(){ajaxing = false;}
		});
		
	} else {
		$("#ids").val(selectedIds.join(','));
		var url = basePath + "/reportForm/exportProfitAnalysis";
	    $('#exportData').attr('action', url);
	    $('#exportData').submit();
	}
	
}
/**
 * 查找选择
 */
//function findAllCheck(element) {
//	var checkList = new Array();
//	$(element).each(function() {
//		if ($(this).is(":checked")) {
//			var params = {
//				"id" : $(this).attr("data-id"),
//				"name" : $(this).attr("data-name")
//			}
//			checkList.push(params);
//		}
//	});
//	return checkList;
//}
/**
 * 值查找id
 * @param element
 * @returns {Array}
 */
function findAllCheckIds(element){
	var checkList = new Array();
	$(element).each(function() {
		if ($(this).is(":checked")) {
			checkList.push($(this).attr("data-id"));
		}
	});
	return checkList;
}
/**
 * 记录选中的数据
 */
function recordSelected(e){
	var checked = $(e).prop("checked");
	var id = $(e).attr("data-id");
	
	if (selectedIds == null) {
		selectedIds = [];
	}
	if (checked) {
		if (selectedIds.indexOf(id) != -1) {
			// 存在，什么都不做
		} else {
			selectedIds.push(id);
		}
	} else {
		var index = selectedIds.indexOf(id);
		if (index != -1) {
			// 存在,移除
			selectedIds.splice(index,1);
		}
	}
}
/**
 * 验证数字，保留4位小数
 * @param value  传入的this
 */
function clearNoNum(obj) {
	obj.value = obj.value.toString();
	obj.value = obj.value.replace(/[^\d.]/g, "");
	obj.value = obj.value.replace(/\.{2,}/g, ".");
	obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$",".");
	var decimalRe = /^(\-)*(\d+)\.(\d{4}).*$/;
	obj.value = obj.value.replace(decimalRe, '$1$2.$3');
	if (obj.value.indexOf(".") < 0 && obj.value != "") {
		obj.value = parseFloat(obj.value);
	}
}

// 处理数字
function numberFormat(value){
	if (isEmpty(value)) {
		return 0;
	} else {
		return value;
	}
}
// 处理空字符串的显示形式
function formatValue(value){
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
    var t = new Date(time);
    var tf = function(i){return (i < 10 ? '0' : '') + i};
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
        switch(a){
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
    })
}


