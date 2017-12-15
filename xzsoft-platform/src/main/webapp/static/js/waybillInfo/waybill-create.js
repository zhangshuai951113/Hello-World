
//初始化page
// 计划信息列表  工具条
var planInfoPageToolBar = null; 
//日计划信息列表（计划拆分） 工具条
var transportDayPlanPageToolBar = null; 
//日计划信息列表（运单生成） 工具条
//var transportDayPlanPageToolBar2 = null;
//运单信息列表 工具条
var waybillListPage = null;
//线路信息列表
var linePage = null;

//操作类型 'add' 'edit' 
var tempOpType = 'add'; 
// 计划id
var tempPlanInfoId = null;
// 日计划id
var tempTransportDayPlanId = null;
// 运单id
var tempWaybillId = null;
// 司机角色
var tempDriverUserRole = null;




// 临时id
var tempPlanId; // 临时计划信息id

var ajaxing = false; // 请求是否正在进行中
(function($) {
	//初始化运单列表page页面
	planInfoPageToolBar = $("#planInfoPageToolBar").operationList({
		"current" : 1, //当前目标
		"maxSize" : 4, //前后最大列表
		"itemPage" : 10, //每页显示多少条
		"totalItems" : 0, //总条数
		"chagePage" : function(current) {
			loadPlanInfoList();
		}
	});
	
	// 加载计划信息数据
	loadPlanInfoList();

	$("body").on("click", ".sub-auth-check", function() {
		var index = $(this).attr("data-id");
		$(".sub-auth-check").each(function() {
			if ($(this).attr("data-id") != index){
				$(this).prop("checked", false);
			}
		});
		
	});
	
	//时间调用插件
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

	//允许运单表格拖着
//	$("table").colResizable({
//		resizeMode: 'overflow',
//		liveDrag : true,
//		gripInnerHtml : "<div class='grip'></div>",
//		draggingClass : "dragging",
//		postbackSafe : true
//	});
//	$(".table-ellipsis").colResizable({
//		resizeMode: 'overflow',
//		liveDrag : true,
//		gripInnerHtml : "<div class='grip'></div>",
//		draggingClass : "dragging"
//	});
	
	$("#tableDrag").colResizable({
		resizeMode: 'overflow',
		liveDrag : true,
		gripInnerHtml : "<div class='grip'></div>",
		draggingClass : "dragging"
	});
	

	//运单表格数据较多，增加滑动
	$(".iscroll").css("min-height", "55px");
	$(".iscroll").mCustomScrollbar({
		theme : "minimal-dark"
	});
	
	// 司机内部和外部tab切换
	$("body").on("click", ".driver-tab", function(e) {
		// 改变状态
		$(".driver-tab").removeClass("active");
		$(this).addClass("active");
		// 隐藏表格
		var target = $(this).data("target");
		$(".driver-content").hide();
		$(target).show();
		// 清除搜索数据
		$("#driver-from")[0].reset();
		// 调用ajax请求
		// 设置总数和page页面
		driverPage.setTotalItems(20);
		$("#driverNum").text(20);
		driverPage.setCurrentPage(1);
	});
	
})(jQuery);


/**
 * 加载计划信息列表
 */
function loadPlanInfoList() {
	// 计划名称
	var planInfoName = $.trim($("#planInfoName").val());
	// 货物
	var goodsInfoName = $.trim($("#goodsInfoName").val());
	// 委托方
	var entrustName = $.trim($("#entrustName").val());
	// 承运方
	var shipperName = $.trim($("#shipperName").val());
	// 发货单位
	var forwardingUnit = $.trim($("#forwardingUnit").val());
	// 到货单位
	var consignee = $.trim($("#consignee").val());
	// 线路
	var lineInfoId = $.trim($("#lineInfoId").val());
	// 起始日期
	var startDate1 = $.trim($("#startDate1").val());
	var startDate2 = $.trim($("#startDate2").val());
	// 结束日期
	var endDate1 = $.trim($("#endDate1").val());
	var endDate2 = $.trim($("#endDate2").val());
	// 计划类型
	var planType = $.trim($("#planType").val());
	// 协同状态
	var cooperateStatus = $.trim($("#cooperateStatus").val());

	var params = {
		"planInfoName" : planInfoName,
		"goodsInfoName" : goodsInfoName,
		"entrustName" : entrustName,
		"shipperName" : shipperName,
		"forwardingUnit" : forwardingUnit,
		"consignee" : consignee,
		"lineInfoId" : lineInfoId,
		"startDate1" : startDate1,
		"startDate2" : startDate2,
		"endDate1" : endDate1,
		"endDate2" : endDate2,
		"planType" : planType,
		"cooperateStatus" : cooperateStatus,
		"page" : planInfoPageToolBar.options.current,
		"rows" : planInfoPageToolBar.options.itemPage
	};
	
	$.ajax({
		url : basePath + "/waybillInfo/selectPlanInfosByParams",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing = true}
		},
		success : function(resp){
			if (resp) {
				if (resp.success) {
					var total = resp.total;
					var list = resp.list;
					var length = 0;
					if (list == null || list == undefined || list.length == null || list.length == undefined) {
						length = 0;
					} else {
						length = list.length;		
					}
					var html = '';
					for(var i = 0; i < length; i++){
						var info = list[i];
						html += '<tr class="table-body">';
						html += '<td>';
				        html += '<label class="i-checks">';
				        html += '<input class="sub-auth-check" type="radio" data-id="'+info.id+'">';  
				        html += '</label>'; 
				        html += '<td>'+valueIsEmpty(info.id)+'</td>';
				        html += '<td>'+valueIsEmpty(info.planName)+'</td>';
				        html += '<td>'+valueIsEmpty(info.entrustName)+'</td>';
				        html += '<td>'+valueIsEmpty(info.shipperName)+'</td>';
				        html += '<td>'+valueIsEmpty(info.goodsName)+'</td>';
				        html += '<td>'+valueIsEmpty(info.lineName)+'</td>';
				        html += '<td>'+valueIsEmpty(info.forwardingUnit)+'</td>';
				        html += '<td>'+valueIsEmpty(info.consignee)+'</td>';
				        html += '<td>'+valueIsEmpty(info.planSum)+'</td>';
				        html += '<td>'+valueIsEmpty(info.splitSum)+'</td>';
				        html += '<td>'+valueIsEmpty(info.remainingSum)+'</td>';
				        html += '<td>'+new Date(info.startDate).Format("yyyy-MM-dd")+'</td>';
				        html += '<td>'+new Date(info.endDate).Format("yyyy-MM-dd")+'</td>';
				        html += '<td>'+planTypeChange(info.planType)+'</td>';
				        html += '<td>'+planStatusChange(info.planStatus)+'</td>';
				        html += '<td>'+planCooperateStatusChange(info.cooperateStatus)+'</td>';
				        html += '</tr>';
					}
					$("#tbody-planInfoList").html(html);
					planInfoPageToolBar.setTotalItems(total);
					$("#planInfoTotal").text(total);
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {
				xjValidate.showTip('服务请求忙，请稍后重试');
			}
			
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
}
/**
 * 计划信息列表
 * @param e
 */
function planInfoListJump(e){
	var value = $(e).prev().find('input').val();
	planInfoPageToolBar.setCurrentPage(value);
}

///////////计划拆分start
/**
 * 显示计划拆分页面 , 日计划列表
 */
function showSplitPlanModal(){
	var selectlist = findAllCheck(".sub-auth-check");
	if (selectlist.length != 1 ) {
		xjValidate.showTip("请选择数据");
		return;
	}
	var planInfoId = selectlist[0].id;
	$.ajax({
		url : basePath + "/waybillInfo/getPlanInfoById",
		async : false,
		type : "POST",
		data : {"id":planInfoId},
		dataType : "json",
		beforeSend:function(){
			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing = true}
		},
		success : function(resp) {
			console.log(resp);
			if (resp) {
				if (resp.success) {
					var info = resp.data;

					$("#plan_id").val(info.id);
					$("#plan_planName").val(info.planName);
					
					$("#plan_entrustName").val(info.entrustName);
					$("#plan_shipperName").val(info.shipperName);
					$("#plan_goodsName").val(info.goodsName);
					$("#plan_lineName").val(info.lineName);
					$("#plan_forwardingUnit").val(info.forwardingUnit);
					$("#plan_consignee").val(info.consignee);
					
					$("#plan_planSum").val(info.planSum);
					$("#plan_splitSum").val(info.splitSum);
					$("#plan_remainingSum").val(info.remainingSum);
					$("#plan_startDate").val(new Date(info.startDate).Format("yyyy-MM-dd"));
					$("#plan_endDate").val(new Date(info.endDate).Format("yyyy-MM-dd"));
					$("#transportDayPlanListModel").modal("show");
					//全选/全不选
					$("body").on("click",".all_transportDayPlan_check",function(){
						if($(".all_transportDayPlan_check").is(":checked")){
							//全选时
							$(".sub_transportDayPlan_check").each(function(){
								$(this).prop("checked",true);
							});
						}else{
							//全不选时
							$(".sub_transportDayPlan_check").each(function(){
								$(this).prop("checked",false);
							});
						}
					});
					
					//初始化运单列表page页面
					transportDayPlanPageToolBar = $("#transportDayPlanPageToolBar").operationList({
						"current" : 1, //当前目标
						"maxSize" : 4, //前后最大列表
						"itemPage" : 10, //每页显示多少条
						"totalItems" : 0, //总条数
						"chagePage" : function(current) {
							//调用ajax请求拿最新数据
							loadTransportDayPlanList();
						}
					});
					
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {xjValidate.showTip("服务异常忙，请稍后重试");}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	// 加载日计划数据
	loadTransportDayPlanList();
}

/**
 * 加载日计划信息
 */
function loadTransportDayPlanList(){
	// 计划id
	var planInfoId = $.trim($("#plan_id").val());
	var page = transportDayPlanPageToolBar.options.current;
	var rows = transportDayPlanPageToolBar.options.itemPage;
	
	

	var params = {
		"planInfoId" : planInfoId,
		"page" : page,
		"rows" : rows
	};
	// 查询数据
	$.ajax({
		url : basePath + "/waybillInfo/selectTransportDayPlansByPlanId",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true}
		},
		success : function(resp) {
			if (resp) {
				if (resp.success) {
					// 处理数据
					var total = resp.total;
					var list = resp.list;
					if (list == null || list == undefined || list.length == null || list.length == undefined) {
						length = 0;
					} else {
						length = list.length;		
					}
					var html = '';
					for(var i = 0; i < length; i++){
						var info = list[i];
						html += '<tr class="table-body ">';
						html += '<td>';
						html += '<label class="i-checks"> ';
						html += '<input data-id="'+info.id+'" class="sub_transportDayPlan_check" type="checkbox">';
						html += '</label>';
						html += '</td>';
						html += '<td>'+info.id+'</td>';
						html += '<td>'+new Date(info.planDate).Format("yyyy-MM-dd")+'</td>';
						html += '<td>'+info.transportAmount+'</td>';
						html += '<td>'+info.formationAmount+'</td>';
						html += '<td>'+info.transportAmountDifference+'</td>';
						html += '<td>'+info.waybillAmount+'</td>';
						html += '</tr>';
					} 
					$("#tbody-transportDayPlanList").html(html);
					$("#transportDayPlanTotal").text(total);
					transportDayPlanPageToolBar.setTotalItems(total);
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});

	
	
}

/**
 * 日计划信息列表跳转页面
 * @param e
 */
function transportDayPlanListJump(e){
	var value = $(e).prev().find('input').val();
	transportDayPlanPageToolBar.setCurrentPage(value);
}

/**
 * 显示日计划新增界面
 * op 操作类型  'add' 'edit'
 */
function showTransportDayPlanAddOrEditModel(op){
	// tempOpType 全局操作类型
	tempOpType = op;
	if (op == 'add') {
		// 计划开始日期
		var planStartDate = $.trim($("#plan_startDate").val());
		// 计划结束日期
		var planEndDate = $.trim($("#plan_endDate").val());
		$("#transportDayPlanAddOrEditModel").modal("show");
		$("#tranAddOrEditModelTitle").html('日计划-新增');
		$("#transport_startDate").val(planStartDate);
		$("#transport_endDate").val(planEndDate);
		$("#transport_planDate").val('');
		$("#transport_transportAmount").val('');
		$("#div_transport_startDate").show();
		$("#div_transport_endDate").show();
		$("#div_transport_planDate").hide();
		
	} else 
	if (op == 'edit') {
		var selectList = findAllCheck(".sub_transportDayPlan_check");
		if (selectList.length == 0 || selectList.length > 1) {
			xjValidate.showTip("请选择一条数据");
			return;
		}
		var id = selectList[0].id;
		$.ajax({
			url : basePath + "/waybillInfo/getTransportDayPlanById",
			async : false,
			type : "POST",
			data : {"id" : id},
			dataType : "json",
			beforeSend:function(){
				if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing = true}
			},
			success : function(resp) {
				if (resp) {
					if (resp.success) {
						var info = resp.data;
						$("#transportDayPlanAddOrEditModel").modal("show");
						$("#tranAddOrEditModelTitle").html('日计划-修改');
						$("#transport_id").val(id);
						$("#transport_planDate").val(new Date(info.planDate).Format("yyyy-MM-dd"));
						$("#transport_transportAmount").val(valueIsEmpty(info.transportAmount));
						$("#div_transport_startDate").hide();
						$("#div_transport_endDate").hide();
						$("#div_transport_planDate").show();
					} else {
						xjValidate.showTip(resp.msg);
					}
				} else {
					xjValidate.showTip("服务异常忙，请稍后重试");
				}
			},
			error:function(){xjValidate.showTip("服务请求失败");},
			complete:function(){ajaxing = false;}
		});
	}
}
 
/**
 * 日计划新增或修改界面保存
 */
function transportDayPlanSave(){
	// 日计划id
	var id = $.trim($("#transport_id").val());
	// 计划id
	var planInfoId = $.trim($("#plan_id").val());
	// 日计划-开始日期
	var tranStartDate = $.trim($("#transport_startDate").val());
	// 日计划-结束日期
	var tranEndDate = $.trim($("#transport_endDate").val());
	// 日计划日期
	var planDate = $.trim($("#transport_planDate").val());
	// 日计划运量
	var transportAmount = $.trim($("#transport_transportAmount").val());
	// 计划开始日期
	var planStartDate = $.trim($("#plan_startDate").val());
	// 计划结束日期
	var planEndDate = $.trim($("#plan_endDate").val());
	// 计划未拆分运量
	var noSplitAmount = $.trim($("#plan_remainingSum").val());
	
	// 验证
	if (tempOpType == 'add') {
		// 验证：新增时，开始日期和结束日期不能为空
		if (tranStartDate == null || tranStartDate == '' || tranStartDate == undefined){
			xjValidate.showTip('开始日期不能为空');
			return false;
		} 
		if (tranEndDate == null || tranEndDate == '' || tranEndDate == undefined){
			xjValidate.showTip('结束日期不能为空');
			return false;
		} 
		// 验证：开始日期不能小于计划开始日期，结束日期不能小于计划结束日期
		var value = compareDate(tranStartDate,planStartDate);
		if (value == -1) {
			xjValidate.showTip('开始日期不能小于计划开始日期');
			return false;
		}
		value = compareDate(tranEndDate,planEndDate);
		if (value == 1) {
			xjValidate.showTip('结束日期不能小于计划结束日期');
			return false;
		}
		// 验证：开始日期是否小于或等于结束日期
		value = compareDate(tranStartDate,tranEndDate);
		if (value == 1) {
			xjValidate.showTip('开始日期必须小于或等于结束日期');
			return false;
		}
		
	}
	if (tempOpType == 'edit') {
		// 验证：修改是日期不能为空
		if (planDate == null || planDate == '' || planDate == undefined){
			xjValidate.showTip('日期不能为空');
			return false;
		} 
	}
	// 验证：日计划运量不能为空或0
	if (transportAmount == null || transportAmount == '' || transportAmount == undefined || transportAmount == 0){
		xjValidate.showTip('日计划运量不能为空或0');
		return false;
	}
	
	var params = {
		"id" : id,
		"planInfoId" : planInfoId,
		"tranStartDate" : tranStartDate,
		"tranEndDate" : tranEndDate,
		"planDate" : planDate,
		"transportAmount" : transportAmount,
		"opType" : tempOpType
	};
	$.ajax({
		url : basePath + "/waybillInfo/saveTransportDayPlan",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true}
		},
		success : function(resp) {
			if (resp) {
				if (resp.success) {
					xjValidate.showTip("保存成功");
					$("#transportDayPlanAddOrEditModel").modal("hide");
				} else {
					xjValidate.showTip(resp.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	// 刷新日计划列表
	loadTransportDayPlanList();
	// 刷新计划列表
	loadPlanInfoList();
	// 刷新form数据
	$.ajax({
		url : basePath + "/waybillInfo/getPlanInfoById",
		async : false,
		type : "POST",
		data : {"id":planInfoId},
		dataType : "json",
		beforeSend:function(){
			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing = true}
		},
		success : function(resp) {
			if (resp) {
				if (resp.success) {
					var info = resp.data;
					$("#plan_id").val(info.id);
					$("#plan_planName").val(info.planName);
					$("#plan_planSum").val(info.planSum);
					$("#plan_splitSum").val(info.splitSum);
					$("#plan_remainingSum").val(info.remainingSum);
					$("#plan_startDate").val(new Date(info.startDate).Format("yyyy-MM-dd"));
					$("#plan_endDate").val(new Date(info.endDate).Format("yyyy-MM-dd"));
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {xjValidate.showTip("服务异常忙，请稍后重试");}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	
}

/**
 * 删除日计划
 */
function deleteTransportDayPlan(){
	var selectList = findAllCheck(".sub_transportDayPlan_check");
	if (selectList.length == 0 ) {
		xjValidate.showTip("请选择数据");
		return;
	}
	var ids = '';
	$.each(selectList,function(index,item){
		if (index == 0) {
			ids = item.id;
		} else {
			ids = ids + ',' + item.id;
		}
	});

	// 删除数据
	$.ajax({
		url : basePath + "/waybillInfo/deleteTransportDayPlan",
		async : false,
		type : "POST",
		data : {"ids":ids},
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(resp) {
			if (resp) {
				if (resp.success) {
					xjValidate.showTip("删除成功");
				} else {
					xjValidate.showTip(resp.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	// 刷新日计划列表
	loadTransportDayPlanList();
	// 刷新计划列表
	loadPlanInfoList();
	// 刷新form数据
	var planInfoId = $.trim($("#plan_id").val());
	$.ajax({
		url : basePath + "/waybillInfo/getPlanInfoById",
		async : false,
		type : "POST",
		data : {"id":planInfoId},
		dataType : "json",
		beforeSend:function(){
			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing = true}
		},
		success : function(resp) {
			if (resp) {
				if (resp.success) {
					var info = resp.data;
					$("#plan_id").val(info.id);
					$("#plan_planName").val(info.planName);
					$("#plan_planSum").val(info.planSum);
					$("#plan_splitSum").val(info.splitSum);
					$("#plan_remainingSum").val(info.remainingSum);
					$("#plan_startDate").val(new Date(info.startDate).Format("yyyy-MM-dd"));
					$("#plan_endDate").val(new Date(info.endDate).Format("yyyy-MM-dd"));
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {xjValidate.showTip("服务异常忙，请稍后重试");}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	
}

///////////计划拆分end





/**
 *运单page页跳转
 */
/*
function waybillPageSlect(e) {
	var value = $(e).prev().find('input').val();
	waybillPage.setCurrentPage(value);
}
*/
function resetEmpty() {
	//清除重置线路
	$("#selectLine").empty();
}









////////////////////运单生成  start////////////////////////
/**
 * 显示日计划列表（点击运单生成按钮时，弹出的页面）
 */
//function showWaybillCreateTransportDayPlanListModel(){
//	var selectlist = findAllCheck(".sub-auth-check");
//	if (selectlist.length != 1 ) {
//		xjValidate.showTip("请选择一条数据数据");
//		return;
//	}
//	// 用变量记录计划id
//	tempPlanInfoId = selectlist[0].id;
//	// 显示页面
//	$("#waybillCreateTransportDayPlanListModel").modal("show");
//
//	//全选/全不选
//	$("body").on("click",".all_transportDayPlan2_check",function(){
//		if($(".all_transportDayPlan2_check").is(":checked")){
//			//全选时
//			$(".sub_transportDayPlan2_check").each(function(){
//				$(this).prop("checked",true);
//			});
//		}else{
//			//全不选时
//			$(".sub_transportDayPlan2_check").each(function(){
//				$(this).prop("checked",false);
//			});
//		}
//	});
//	
//	transportDayPlanPageToolBar2 = $("#transportDayPlanPageToolBar2").operationList({
//		"current" : 1, //当前目标
//		"maxSize" : 4, //前后最大列表
//		"itemPage" : 10, //每页显示多少条
//		"totalItems" : 0, //总条数
//		"chagePage" : function(current) {
//			loadTransportDayPlanList2();
//		}
//	});
//	
//	// 加载日计划数据
//	loadTransportDayPlanList2();
//}

/**
 * 加载日计划数据
 */
//function loadTransportDayPlanList2(){
//	var planInfoId = tempPlanInfoId;
//	var page = transportDayPlanPageToolBar2.options.current;
//	var rows = transportDayPlanPageToolBar2.options.itemPage;
//	
//	var params = {
//		"planInfoId" : planInfoId,
//		"page" : page,
//		"rows" : rows
//	};
//	$.ajax({
//		url : basePath + "/waybillInfo/selectTransportDayPlansByPlanId",
//		async : false,
//		type : "POST",
//		data : params,
//		dataType : "json",
//		beforeSend:function(){
//			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true}
//		},
//		success : function(resp) {
//			console.log(resp);
//			if (resp) {
//				if (resp.success) {
//					// 处理数据
//					var total = resp.total;
//					var list = resp.list;
//					if (list == null || list == undefined || list.length == null || list.length == undefined) {
//						length = 0;
//					} else {
//						length = list.length;		
//					}
//					var html = '';
//					for(var i = 0; i < length; i++){
//						var info = list[i];
//						html += '<tr class="table-body ">';
//						html += '<td>';
//						html += '<label class="i-checks"> ';
//						html += '<input data-id="'+info.id+'" class="sub_transportDayPlan2_check" type="checkbox">';
//						html += '</label>';
//						html += '</td>';
//						html += '<td>'+info.id+'</td>';
//						html += '<td>'+new Date(info.planDate).Format("yyyy-MM-dd")+'</td>';
//						html += '<td>'+info.transportAmount+'</td>';
//						html += '<td>'+info.formationAmount+'</td>';
//						html += '<td>'+info.transportAmountDifference+'</td>';
//						html += '<td>'+info.customerTransportPrice+'</td>';
//						html += '<td>'+info.waybillAmount+'</td>';
//						html += '</tr>';
//					} 
//					$("#tbody-transportDayPlanList2").html(html);
//					$("#transportDayPlanTotal2").text(total);
//					transportDayPlanPageToolBar2.setTotalItems(total);
//				} else {
//					xjValidate.showTip(data.msg);
//				}
//			} else {
//				xjValidate.showTip("服务异常忙，请稍后重试");
//			}
//		},
//		error:function(){xjValidate.showTip("服务请求失败");},
//		complete:function(){ajaxing = false;}
//	});
//
//	
//	
//}

/**
 * 日计划信息列表跳转页面
 * @param e
 */
//function transportDayPlanListJump2(e){
//	var value = $(e).prev().find('input').val();
//	transportDayPlanPageToolBar2.setCurrentPage(value);
//}

/**
 * 显示运单生成模态窗口
 */
function showWaybillCreateModel(){
	var selectList = findAllCheck(".sub_transportDayPlan_check");
	if (selectList.length == 0 || selectList.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	tempTransportDayPlanId = selectList[0].id;
	$("#waybillCreateModal").modal("show");
	// 默认值
	$("#waybillCreateModal_createType").val(1);
	$("#waybillCreateModal_YSCC").show();
	$("#waybillCreateModal_DCZDYL").hide();
}

function waybillCreateModalshowF(e){
	var value = $(e).val();
	if (value == 1) {
		$("#waybillCreateModal_YSCC").show();
		$("#waybillCreateModal_DCZDYL").hide();
	} else {
		$("#waybillCreateModal_YSCC").hide();
		$("#waybillCreateModal_DCZDYL").show();
	}
}

/**
 * waybillCreateModal  保存按钮
 */
function waybillCreateModalSave(){
	// 运输日计划表transport_day_plan id  tempTransportDayPlanId
	// 生成方式
	var createType = $("#waybillCreateModal_createType").val();
	// 运输车次
	var transportNum = $("#waybillCreateModal_transportNum").val();
	// 单车最低运量
	var minTransportAmount = $("#waybillCreateModal_minTransportNum").val();
	
	// 验证
	if (createType == 1 && transportNum == '') {
		xjValidate.showTip("请填写运输车次");
		return false;
	}
	if (createType == 2 && minTransportAmount == '') {
		xjValidate.showTip("请填写单车最低运量");
		return false;
	}

	var params = {
		"transportDayPlanId":tempTransportDayPlanId,
		"createType":createType,
		"transportNum":transportNum,
		"minTransportAmount":minTransportAmount
	};
	
	$.ajax({
		url : basePath + "/waybillInfo/saveWaybillInfo",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true}
		},
		success : function(data) {
			if (data) {
				if (data.success) {
					xjValidate.showTip(data.msg);
					$("#waybillCreateModal").modal("hide");
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	// 刷新日计划列表
	loadTransportDayPlanList();
}


/**
 * 运单列表信息transport
 */
function showWaybillListModel() {
	var selectList = findAllCheck(".sub_transportDayPlan_check");
	if (selectList.length == 0 || selectList.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	tempTransportDayPlanId = selectList[0].id;
	
	$("#waybillListModal").modal("show");
	
	//全选/全不选
	$("body").on("click",".all-waybill-check",function(){
		if($(".all-waybill-check").is(":checked")){
			//全选时
			$(".sub-waybill-check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub-waybill-check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	
	//初始运单列表信息page页面
	waybillListPage = $("#waybillListPage").operationList({
		"current" : 1, //当前目标
		"maxSize" : 4, //前后最大列表
		"itemPage" : 10, //每页显示多少条
		"totalItems" : 0, //总条数
		"chagePage" : function(current,itemPage) {
			//调用ajax请求拿最新数据
			loadWaybillList();
		}
	});
	loadWaybillList();
}

/**
 * 根据日计划id，查询运单信息
 */
function loadWaybillList(){
	var params = {
		"transportDayPlanId" : tempTransportDayPlanId,
		"page" : waybillListPage.options.current,
		"rows" : waybillListPage.options.itemPage
	};
	$.ajax({
		url : basePath + "/waybillInfo/selectWaybillInfosByTransportDayPlanId",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true}
		},
		success : function(resp) {
			console.log(resp);
			if (resp) {
				if (resp.success) {
					var list = resp.list;
					var total = resp.total;
					if (list == null || list == '' || list == undefined) {
						list.length = 0
					}
					var html = '';
					for(var i = 0; i < list.length; i++){
						var info = list[i];
						html += '<tr class="table-body ">';
						html += '	<td>';
						html += '		<label class="i-checks"> ';
						html += '			<input data-id="'+info.id+'" class="sub-waybill-check" type="checkbox" >';
						html += '		</label>';
						html += '	</td>';
						html += '	<td>'+valueFormat(info.rootWaybillId)+'</td>';
						html += '	<td>'+new Date(info.planTransportDate).Format("yyyy-MM-dd")+'</td>';
						html += '	<td>'+info.planTransportAmount+'</td>';
						html += '	<td>'+waybillTypeChange(info.waybillType)+'</td>';
						html += '	<td>'+waybillStatusChange(info.waybillStatus)+'</td>';
						html += '</tr>';
						
					}
					$("#waybillListModal_tbody").html(html);
					//设置运单列表信息总页面
					waybillListPage.setTotalItems(total);
					$("#waybillListNum").text(total);
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
}

/**
 * 运单信息列表跳转页面
 * @param e
 */
function waybillInfoListJump(e){
	var value = $(e).prev().find('input').val();
	waybillListPage.setCurrentPage(value);
}



/**
 * 弹出修改运单信息界面
 */
function showWaybillUpdateModal(){
	var selectList = findAllCheck(".sub-waybill-check");
	if (selectList.length == 0 || selectList.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	tempWaybillId = selectList[0].id;
	
	// 弹出修改运单信息界面
	$("#waybillUpdateModal").modal("show");
	$('#waybillUpdateModal_planTransportAmount').val('');
	
}

/**
 * 修改运单信息界面-保存
 */
function waybillUpdateModalSave(){
	var waybillInfoId = tempWaybillId;
	var planTransportAmount = $.trim($('#waybillUpdateModal_planTransportAmount').val());
	
	var params = {
		"id" : waybillInfoId,
		"planTransportAmount" : planTransportAmount
	};
	
	$.ajax({
		url : basePath + "/waybillInfo/updateWaybillInfo",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true}
		},
		success : function(data) {
			ajaxing = false;
			if (data) {
				if (data.success) {
					xjValidate.showTip(data.msg);
					$("#waybillUpdateModal").modal("hide");
					
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	// 修改成功后
	// 重新刷新运单
	loadWaybillList();
	// 刷新日计划列表
	loadTransportDayPlanList();
	//loadTransportDayPlanList2();
}


/**
 * 删除运单
 */
function waybillListModalDelete(){
	var selectlist = findAllCheck(".sub-waybill-check");
	if (selectlist.length == 0 ) {
		xjValidate.showTip("请选择数据");
		return;
	}
	var ids = '';
	for (var i = 0; i < selectlist.length; i++){
		if (i == 0) {
			ids = selectlist[i].id;
		} else {
			ids = ids + ',' + selectlist[i].id;
		}
	}
	// 删除
	$.ajax({
		url : basePath + "/waybillInfo/deleteWaybillInfo",
		async : false,
		type : "POST",
		data : {"ids":ids},
		dataType : "json",
		beforeSend:function(){
			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true}
		},
		success : function(data) {
			if (data) {
				if (data.success) {
					xjValidate.showTip(data.msg);
					
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("删除运单信息服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	
	// 删除成功后
	// 重新刷新运单
	loadWaybillList();
	// 刷新日计划列表
	loadTransportDayPlanList();
	//loadTransportDayPlanList2();
}



/**
 * 运价拆分保存 (先保留)
 */
function splitPlanModalSave(e){
	var transportDays = $("#transport_days").val();
	if (transportDays == '' ||transportDays == null || transportDays == undefined) {
		xjValidate.showTip("请填写运输天数");
		return false;
	}
	if (!checkF0zzs(transportDays)){
		xjValidate.showTip("请输入正整数");
		return false;
	}
	// tempPlanId 
	if (ajaxing) {
		return false;
	}
	$.ajax({
		url : basePath + "/waybillInfo/splitPlan",
		async : false,
		type : "POST",
		data : {"transportDays":transportDays,"planId":tempPlanId},
		dataType : "json",
		beforeSend : function(){
			ajaxing = true;
		},
		success : function(data) {
			ajaxing = false;
			if (data) {
				if (data.success) {
					$("#splitPlanModal").modal("hide");
					xjValidate.showTip(data.msg);
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
			}
			
		},
		complete:function(){
			ajaxing = false;
		},
		error:function(){
			xjValidate.showTip("error:服务异常忙，请稍后重试");
			ajaxing = false;
		}
	});
}




/**
 * 添加线路弹出框
 */
function lineSelect() {
	$("#lineSelectModal").modal('show');
	//初始线路列表page页面
	linePage = $("#linePage").operationList({
		"current" : 1, //当前目标
		"maxSize" : 4, //前后最大列表
		"itemPage" : 10, //每页显示多少条
		"totalItems" : 0, //总条数
		"chagePage" : function(current) {
			//调用ajax请求拿最新数据
			getLineList();
		}
	});
	getLineList();
}

/**
 *线路page页跳转
 */
function linePageSlect(e) {
	var value = $(e).prev().find('input').val();
	linePage.setCurrentPage(value);
}

/**
 *线路选择
 */
function submitSelectLine() {
	var selectlist = findAllCheck(".line-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	$("#selectLine").text(selectlist[0].name);
	$("#selectLine").next("input").val(selectlist[0].id);
	$("#lineSelectModal").modal('hide');
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
 * 验证数字，保留4位小数
 * @param value  传入的this
 */
function clearNoNum(obj) {
	obj.value = obj.value.toString();
	obj.value = obj.value.replace(/[^\d.]/g, "");
	obj.value = obj.value.replace(/\.{2,}/g, ".");
	obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$",
			".");
	var decimalRe = /^(\-)*(\d+)\.(\d{4}).*$/;
	obj.value = obj.value.replace(decimalRe, '$1$2.$3');
	if (obj.value.indexOf(".") < 0 && obj.value != "") {
		obj.value = parseFloat(obj.value);
	}
}


//计划类型（1：物流计划 2：自营计划）
function planTypeChange(value){
	if (value == 1){
		return '物流计划';
	} else if (value == 2) {
		return '自营计划';
	} else {
		return '';
	}
}
// 计划状态（1：新建 2：审核中 3：审核通过 4：审核驳回 5：已派发 6：已撤回）
function planStatusChange(temp){
	if (temp == 1){
		return '新建';
	} else if (temp == 2) {
		return '审核中';
	} else if (temp == 3) {
		return "审核通过";
	} else if (temp == 4) {
		return "审核驳回";
	} else if (temp == 5) {
		return "已派发";
	} else if (temp == 6) {
		return "已撤回";
	} else {
		return "";
	}
}
// 协同状态(1：上下游协同 2：下游不协同 3：上游不协同)
function planCooperateStatusChange(temp){
	if (temp == 1){
		return '上下游协同';
	} else if (temp == 2) {
		return '下游不协同';
	} else if (temp == 3) {
		return '上游不协同';
	} else {
		return '';
	}
}
// 是否拆分计划（0：否 1：是）
function isSplitPlan(temp){
	if (temp == 0){
		return '否';
	} else if (temp == 1) {
		return '是';
	} else {
		return '';
	}
}
/**
 * 运单状态（1：新建 2：已派发 3：已撤回 4：已拒绝 5：已接单 6：已装货 7：在途 8：已卸货 9：已挂账 10：已发布 11:已回收报价）
 */
function waybillStatusChange(value) {
	var valueName = '';
	switch (value) {
		case 1: valueName = '新建'; break;
		case 2: valueName = '已派发'; break;
		case 3: valueName = '已撤回'; break;
		case 4: valueName = '已拒绝'; break;
		case 5: valueName = '已接单'; break;
		case 6: valueName = '已装货'; break;
		case 7: valueName = '在途'; break;
		case 8: valueName = '已卸货'; break;
		case 9: valueName = '已挂账'; break;
		case 10: valueName = '已发布'; break;
		case 11: valueName = '已回收报价'; break;
		default: valueName = '';
	}
	return valueName;
}
/**
 * 处理空字符串
 * @param str
 * @returns
 */
function valueIsEmpty(str){
	if (str == null || str == undefined || str == '') {
		return '';
	} else {
		return str;
	}
}


// 运单类型（1：物流运单 2：自营运单 3：代理运单 4：转包运单）大宗货物运单时使用
function waybillTypeChange(temp){
	if (temp == 1) {
		return "物流运单";
	} else if (temp == 2) {
		return "自营运单";
	} else if (temp == 1) {
		return "代理运单";
	} else if (temp == 4) {
		return "转包运单";
	} else {
		return "未知类型";
	}
}

/**
 * 查询线路信息
 */
function getLineList(){
	// 起点
	var startPoints = $.trim($("#lineSelectModal_startPoints").val());
	// 终点
	var endPoints = $.trim($("#lineSelectModal_endPoints").val());
	
	var params = {
		"startPoints" : startPoints,
		"endPoints" : endPoints,
		"page" : linePage.options.current,
		"rows" : linePage.options.itemPage
	};
	$.ajax({
		url : basePath + "/waybillInfo/getLineList",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if (ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing = true}
		},
		success : function(data) {
			if (data) {
				if (data.success) {
					var rows = data.list;
					var html = '';
					for(var i = 0; i < rows.length; i++){
						var info = rows[i];
						html += '<tr class="table-body ">';
						html += '<td>';
						html += '<label class="i-checks"> ';
						html += '	<input data-id="'+info.id+'" data-name="'+info.lineName+'" data-km="50" class="line-check" type="checkbox">';
						html += '</label>';
						html += '</td>';
						html += '<td>'+valueIsEmpty(info.lineName)+'</td>';
						html += '<td>'+valueIsEmpty(info.startPoints)+'</td>';
						html += '<td>'+valueIsEmpty(info.endPoints)+'</td>';
						html += '<td>'+valueIsEmpty(info.distance)+'</td>';
						html += '<td>'+valueIsEmpty(info.days)+'</td>';
						html += '</tr>';
					}
					$("#lineSelectModal_tbody").html(html);
					//设置线路总页面
					linePage.setTotalItems(data.total);
					$("#lineNum").text(data.total);
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
}

//////////////////////运单派发

/**
 * 企业货主派发
 */
function businessOwnerDistribute() {
	// 请选择一条数据
	var selectlist = findAllCheck(".sub-waybill-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	tempWaybillId = selectlist[0].id;

	$.ajax({
		url : basePath + "/waybillInfo/businessOwnerDistribute",
		async : false,
		type : "POST",
		data : { "id" : tempWaybillId },
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(data) {
			if (data) {
				if (data.success) {
					
					xjValidate.showTip(data.msg);
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {
				xjValidate.showTip("企业货主派发服务异常忙，请稍后重试");
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	// 重新刷新运单
	loadWaybillList();
}

/**
 * 派发司机弹出框
 */
function distributeDriver() {
	// 司机派发直接选择distributeDriver，代理派发需要代理司机选择 distributeProxy
	fromDriver = 'distributeDriver';

	// 请选择一条数据
	var selectlist = findAllCheck(".sub-waybill-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	tempWaybillId = selectlist[0].id;

	var data = getWaybillStatusById(tempWaybillId);
	if (data == null || data == '' || data == undefined) {
		xjValidate.showTip("服务请求失败");
		return false;
	}

	if (data.success) {
		var waybillStatus = data.waybillStatus;
		if (waybillStatus == 1 || waybillStatus == 3 || waybillStatus == 4) {
			// 有两种选择，一种来自司机派发选择，一种来自代理派发
			$("#driverListModal").modal('show');
			// 初始司机列表page页面
			driverPage = $("#driverPage").operationList({
				"current" : 1, // 当前目标
				"maxSize" : 4, // 前后最大列表
				"itemPage" : 10, // 每页显示多少条
				"totalItems" : 0, // 总条数
				"chagePage" : function(current) {
					// 调用ajax请求拿最新数据
					getDriver(1);
					getDriver(2);
				}
			});
			// 加载司机信息
			getDriver(1);
			getDriver(2);

		} else {
			xjValidate.showTip("运单已派发");
		}
	} else {
		xjValidate.showTip(data.msg);
		return false;
	}
	
}

function distributeDriver2(waybillId) {
	tempWaybillId = waybillId;
	// 验证是否是新建状态
	$.ajax({
		url : basePath + "/waybillInfo/waybillIsNew",
		async : false,
		type : "POST",
		data : { "id" : tempWaybillId },
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(data) {
			ajaxing = false;
			if (data) {
				if (data.success) {
					if (data.waybillStatus == 1 || data.waybillStatus == 3 || data.waybillStatus == 4) {
						// 有两种选择，一种来自司机派发选择，一种来自代理派发
						$("#driverListModal").modal('show');
						// 初始司机列表page页面
						driverPage = $("#driverPage").operationList({
							"current" : 1, // 当前目标
							"maxSize" : 4, // 前后最大列表
							"itemPage" : 10, // 每页显示多少条
							"totalItems" : 0, // 总条数
							"chagePage" : function(current) {
								// 调用ajax请求拿最新数据
								if (fromDriver == 'distributeDriver') {
									getDriver(1);
									getDriver(2);
								}
								if (fromDriver == 'distributeProxy') {
									getDriver(3);
									getDriver(2);
								}

							}
						});
						// 加载司机信息
						if (fromDriver == 'distributeDriver') {
							getDriver(1);
							getDriver(2);
						}
						if (fromDriver == 'distributeProxy') {
							getDriver(3);
							getDriver(2);
						}

					} else {
						xjValidate.showTip("运单已派发");
					}
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("运单派发服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){
			ajaxing = false;
			xjValidate.showTip("服务请求失败");
		}
	});
	

}


function getDriverForBtn() {
	if (fromDriver == 'distributeDriver') {
		getDriver(1);
		getDriver(2);
	} else if (fromDriver == 'distributeProxy') {
		getDriver(3);
		getDriver(2);
	}
}
/**
 * 司机page页跳转
 */
function driverPageSlect(e) {
	var value = $(e).prev().find('input').val();
	driverPage.setCurrentPage(value);
}

/**
 * 司机选择
 */
function submitSelectDriver() {
	// 有两种选择，一种来自司机派发选择，一种来自代理派发
	var selectlist = findAllCheck(".driver-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	// 司机id
	var driverInfoId = selectlist[0].id;
	// 运单id
	var waybillId = tempWaybillId;
	// 司机角色
	var driverUserRole = 1;
	var flag = $("#driver-inside").is(":visible");
	if (fromDriver == "distributeDriver") {
		if (flag) {
			driverUserRole = 1;
		} else {
			driverUserRole = 2;
		}
	}
	// 控制运价框是否显示
	if (fromDriver == "distributeProxy") {
		if (flag) {
			driverUserRole = 3;
		} else {
			driverUserRole = 2;
		}
	}
	
	if (fromDriver == "distributeDriver") {
		var params = {
			"waybillInfoId" : waybillId,
			"driverInfoId" : driverInfoId,
			"driverUserRole" : driverUserRole
		};
		// 司机派发处理
		$.ajax({
			url : basePath + "/waybillInfo/logisticsDistributeDriver",
			asyn : false,
			type : "POST",
			data : params,
			dataType : "json",
			beforeSend:function(){
				if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
			},
			success : function(data) {
				ajaxing = false;
				if (data) {
					if (data.success) {
						xjValidate.showTip('派发成功');
						// 重新加载运量列表
						loadWaybillList();
					} else {
						xjValidate.showTip(data.msg);
						return;
					}
				} else {
					xjValidate.showTip("派发司机服务异常忙，请稍后重试");
					return;
				}
			},
			error:function(){
				ajaxing = false;
				xjValidate.showTip("服务请求失败");
			}
		});
	} else if (fromDriver == "distributeProxy") {
		// 代理派发处理
		$("#selectDriver").text(selectlist[0].name);
		$("#selectDriver").next("input").val(selectlist[0].id);
		tempDriverUserRole = driverUserRole;
	}
	$("#driverListModal").modal('hide');
}

/**
 * 派发物流公司弹出框
 */
function distributeLogistics() {
	// 请选择一条数据
	var selectlist = findAllCheck(".sub-waybill-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	tempWaybillId = selectlist[0].id;
	// 判断运单是否是可以派发
	var data = getWaybillStatusById(tempWaybillId);
	if (data == null || data == '' || data == undefined) {
		xjValidate.showTip("服务请求失败");
		return;
	}
	if (data.success) {
		var status = data.waybillStatus;
		if (status == 1 || status == 3 || status == 4) {
			$("#logisticsListModal").modal('show');
			// 初始物流列表page页面
			logisticsPage = $("#logisticsPage").operationList({
				"current" : 1, // 当前目标
				"maxSize" : 4, // 前后最大列表
				"itemPage" : 10, // 每页显示多少条
				"totalItems" : 0, // 总条数
				"chagePage" : function(current) {
					// 调用ajax请求拿最新数据
					getContractInfos();
				}
			});
			getContractInfos();
		} else {
			xjValidate.showTip("运单已派发");
		}
	} else {
		xjValidate.showTip(data.msg);
		return;
	}
	//distributeLogistics2(selectlist[0].id);
}

function distributeLogistics2(id) {
	tempWaybillId = id;
	// 验证是否是新建状态
	$.ajax({
		url : basePath + "/waybillInfo/waybillIsNew",
		asyn : false,
		type : "POST",
		data : {
			"id" : id
		},
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(data) {
			if (data) {
				if (data.success) {
					if (data.waybillStatus == 1 || data.waybillStatus == 3
							|| data.waybillStatus == 4) {
						$("#logisticsListModal").modal('show');
						// 初始物流列表page页面
						logisticsPage = $("#logisticsPage").operationList({
							"current" : 1, // 当前目标
							"maxSize" : 4, // 前后最大列表
							"itemPage" : 10, // 每页显示多少条
							"totalItems" : 0, // 总条数
							"chagePage" : function(current) {
								// 调用ajax请求拿最新数据
								getContractInfos();
							}
						});
						getContractInfos();
					} else {
						xjValidate.showTip("运单已派发");
					}
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("运单派发服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});

}

/**
 * 物流公司page页跳转
 */
function logisticsPageSelect(e) {
	var value = $(e).prev().find('input').val();
	logisticsPage.setCurrentPage(value);
}
function logisticsPageQuery() {
	logisticsPage.setCurrentPage(1);
}
/**
 * 物流公司选择
 */
function submitSelectLogistics() {
	var selectlist = findAllCheck(".logistics-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	var contractInfoId = selectlist[0].id;
	$.ajax({
		url : basePath + "/waybillInfo/logisticsDistributedlogisticsCompany",
		asyn : false,
		type : "POST",
		data : {
			"waybillInfoId" : tempWaybillId,
			"contractInfoId" : contractInfoId
		},
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(data) {
			ajaxing = false;
			if (data) {
				if (data.success) {
					xjValidate.showTip(data.msg);
					$("#logisticsListModal").modal('hide');
					waybillPageQuery(1);
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("派发物流公司服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
	
}

/**
 * 派发代理弹出框
 */
function proxyDistribute() {
	fromDriver = 'distributeProxy';
	// 请选择一条数据
	var selectlist = findAllCheck(".sub-waybill-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	tempWaybillId = selectlist[0].id;
	
	// 获取运单状态判断运单是否可以派发
	var data = getWaybillStatusById(tempWaybillId);
	if (data == null || data == '' || data == undefined) {
		xjValidate.showTip("服务请求失败");
		return false;
	}
	if (data.success) {
		var waybillStatus = data.waybillStatus;
		if (waybillStatus == 1 || waybillStatus == 3 || waybillStatus == 4) {
			// 有两种选择，一种来自司机派发选择，一种来自代理派发
			$("#proxyDistributeModal").modal('show');
			$("#selectProxy").text('');
			$("#proxyDistributeModal_transportPriceId").val('');
			$("#selectDriver").text('');
			$("#proxyDistributeModal_driverInfoId").val('');

		} else {
			xjValidate.showTip("运单已派发");
		}
	} else {
		xjValidate.showTip(data.msg);
		return false;
	}
	//proxyDistribute2(selectlist[0].id);
}
/**
 * 显示司机窗口-代理派发
 */
function showDriverModelFormProxy(){
	fromDriver == 'distributeProxy';
	var params = {
		"id" : 	tempWaybillId
	};
	$("#driverListModal").modal('show');
	// 初始司机列表page页面
	driverPage = $("#driverPage").operationList({
		"current" : 1, // 当前目标
		"maxSize" : 4, // 前后最大列表
		"itemPage" : 10, // 每页显示多少条
		"totalItems" : 0, // 总条数
		"chagePage" : function(current) {
				getDriver(3);
				getDriver(2);
		}
	});
	// 加载司机信息
	getDriver(3);
	getDriver(2);
}
function proxyDistribute2(id) {
	tempWaybillId = id;

	// 验证是否是新建状态
	$.ajax({
		url : basePath + "/waybillInfo/waybillIsNew",
		asyn : false,
		type : "POST",
		data : {
			"id" : id
		},
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(data) {
			if (data) {
				if (data.success) {
					if (data.waybillStatus == 1 || data.waybillStatus == 3 || data.waybillStatus == 4) {
						$("#proxyDistributeModal").modal('show');
						$("#selectProxy").text('');
						$("#proxyDistributeModal_transportPriceId").val('');
						$("#selectDriver").text('');
						$("#proxyDistributeModal_driverInfoId").val('');
					} else {
						xjValidate.showTip("运单已派发");
					}
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("运单派发服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
}

/**
 * 派发代理公司列表弹出框
 */
function proxyList() {
	$("#proxyListModal").modal('show');
	// 初始派发代理公司列表page页面
	proxyPage = $("#proxyPage").operationList({
		"current" : 1, // 当前目标
		"maxSize" : 4, // 前后最大列表
		"itemPage" : 10, // 每页显示多少条
		"totalItems" : 0, // 总条数
		"chagePage" : function(current) {
			// 调用ajax请求拿最新数据
			getProxy();
		}
	});
	getProxy();
}

/**
 * 派发代理公司page页跳转
 */
function proxyPageSlect(e) {
	var value = $(e).prev().find('input').val();
	proxyPage.setCurrentPage(value);
}

/**
 * 派发代理公司选择
 */
function submitSelectProxy() {
	var selectlist = findAllCheck(".proxy-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	$("#selectProxy").text(selectlist[0].name);
	$("#selectProxy").next("input").val(selectlist[0].id);
	$("#proxyListModal").modal('hide');
}
/**
 * 代理派发
 */
function proxyDistributeModalSave() {
	// 运单号
	var waybillInfoId = tempWaybillId;
	// 运价表id
	var transportPriceId = $.trim($("#proxyDistributeModal_transportPriceId")
			.val());
	// 司机id
	var driverInfoId = $.trim($("#proxyDistributeModal_driverInfoId").val());

	// 司机角色 (被激活的页签)
	var driverUserRole = tempDriverUserRole;
	if (commonIsEmpty(transportPriceId)) {
		xjValidate.showTip("请选择代理方");
		return false;
	}
	if (commonIsEmpty(proxyDistributeModal_driverInfoId)) {
		xjValidate.showTip("请选择司机");
		return false;
	}

	var params = {
		"waybillInfoId" : waybillInfoId,
		"transportPriceId" : transportPriceId,
		"driverInfoId" : driverInfoId,
		"driverUserRole" : driverUserRole
	};

	$.ajax({
		url : basePath + "/waybillInfo/logisticsProxyDistributed",
		asyn : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(data) {
			ajaxing = false;
			if (data) {
				if (data.success) {
					xjValidate.showTip(data.msg);
					$("#proxyDistributeModal").modal('hide');
					waybillPageQuery(1);
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("代理派发服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});
}



/**
 * 显示派发到平台窗口
 */
function showDistributePlatformModel(){
	// 请选择一条数据
	var selectlist = findAllCheck(".sub-waybill-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	tempWaybillId = selectlist[0].id;
	
	// 判断运单是否可以派发
	var data = getWaybillStatusById(tempWaybillId);
	if (data == null || data == '' || data == undefined) {
		xjValidate.showTip("服务请求失败");
		return false;
	}
	if (data.success) {
		var status = data.waybillStatus;
		if (status == 1 || status == 3 || status == 4) {
			// 有两种选择，一种来自司机派发选择，一种来自代理派发
			$("#distributePlatformModal").modal('show');
			$("#distributePlatformModal_offerEndDate").val('');
		} else {
			xjValidate.showTip("运单已派发");
		}
	} else {
		xjValidate.showTip(data.msg);
		return false;
	}
}
/**
 * 派发平台保存
 */
function distributePlatformModalSave(){
	// 报价截止日期
	var offerEndDate = $.trim($("#distributePlatformModal_offerEndDate").val());
	if (offerEndDate == '' || offerEndDate == null || offerEndDate == undefined) {
		xjValidate.showTip('请选择报价截止日期');
		return false;
	}
	var params = {
		"waybillInfoId" : tempWaybillId,
		"offerEndDate" : offerEndDate
	};
	$.ajax({
		url : basePath + "/waybillInfo/distributePlatform",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(resp) {
			ajaxing = false;
			if (resp) {
				if (resp.success) {
					$("#distributePlatformModal").modal('hide');
					xjValidate.showTip("派发成功");
					// 刷新运单界面
					loadWaybillList();
				} else {
					//xjValidate.showTip(resp.msg);
					commonUtil.showPopup("提示", resp.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
				
			}
		},
		error:function(){
			ajaxing = false;
			xjValidate.showTip("服务请求失败");
		}
	});
	
}



/**
 * 
 * 获得司机 1：内部司机 2：外部司机 3:企业临时司机
 * 
 * @param id
 */
function getDriver(driverUserRole) {

	// 司机姓名
	var name = $.trim($("#driverListModalName").val());
	// 手机号码
	var phone = $.trim($("#driverListModalPhone").val());
	// 车牌号码
	var carCode = $.trim($("#driverListModalCarCode").val());

	var url = null;
	var params = null;
	if (driverUserRole == 1) {
		url = basePath + "/waybillInfo/selectInternalDriver";
		// 司机类型为“企业内部司机”，司机状态为“已分配”，是否启用为“是”的数据
		params = {
			"driverName" : name,
			"mobilePhone" : phone,
			"carCode" : carCode,
			"page" : driverPage.options.current,
			"rows" : driverPage.options.itemPage,
			"driverType" : 1
		};
	} else if (driverUserRole == 2) {
		url = basePath + "/waybillInfo/selectOutsideDriver";
		// 合作伙伴角色为“司机”，启用状态为“启用”的数据。 合作伙伴
		params = {
			"driverName" : name,
			"mobilePhone" : phone,
			"carCode" : carCode,
			"page" : driverPage.options.current,
			"rows" : driverPage.options.itemPage
		};
	} else if (driverUserRole == 3) {
		url = basePath + "/waybillInfo/selectInternalDriver";
		// 司机类型为“企业临时司机”，司机状态为“已分配”，是否启用为“是”的数据
		params = {
			"driverName" : name,
			"mobilePhone" : phone,
			"carCode" : carCode,
			"page" : driverPage.options.current,
			"rows" : driverPage.options.itemPage,
			"driverType" : 2
		};
	}
	$.ajax({
		url : url,
		asyn : false,
		type : "POST",
		data : params,
		dataType : "json",
		success : function(data) {
			if (data) {
				if (data.success) {
					var rows = data.dirverInfoPager.rows;
					var html = '';
					for (var i = 0; i < rows.length; i++) {
						var info = rows[i];
						html += '<tr class="table-body ">';
						html += '<td>';
						html += '<label class="i-checks">';
						html += '<input data-id="'+ info.id+ '" data-name="'+ valueIsEmpty(info.driverName)+ '" class="driver-check" type="checkbox">';
						html += '</label>';
						html += '</td>';
						html += '<td>' + valueIsEmpty(info.driverName)+ '</td>';
						html += '<td>' + valueIsEmpty(info.mobilePhone)+ '</td>';
						html += '<td>' + valueIsEmpty(info.carCode)+ '</td>';
						html += '</tr>';
					}
					if (driverUserRole == 1) {
						$("#driverListModal_tbody1").html(html);
						driverPage.setTotalItems(data.dirverInfoPager.total);
						$("#driverNum1").text(data.dirverInfoPager.total);
						$("#driverDiv").html("内部司机");
					}
					if (driverUserRole == 2) {
						$("#driverListModal_tbody2").html(html);
						driverPage.setTotalItems(data.dirverInfoPager.total);
						$("#driverNum2").text(data.dirverInfoPager.total);
					}
					if (driverUserRole == 3) {
						$("#driverListModal_tbody1").html(html);
						driverPage.setTotalItems(data.dirverInfoPager.total);
						$("#driverNum1").text(data.dirverInfoPager.total);
						$("#driverDiv").html("临时司机");
					}

				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("查询司机信息服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){xjValidate.showTip("服务请求失败");}
	});
}

/**
 * 查询运单信息
 * @param waybillInfoId
 */
function getWaybillStatusById(waybillInfoId){
	var data = null;
	$.ajax({
		url : basePath + "/waybillInfo/waybillIsNew",
		async : false,
		type : "POST",
		data : { "id" : tempWaybillId },
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(resp) {
			ajaxing = false;
			data = resp;
		},
		error:function(){
			ajaxing = false;
			xjValidate.showTip("服务请求失败");
		}
	});
	return data;
}


/**
 * 获得物流公司信息集合
 */
function getContractInfos() {
	// 参数：承运方主机构(shipper_org_root)、承运方(shipper)
	var shipperOrgRootName = $.trim($("#logisticsListModal_shipperOrgRootName").val());
	var shipperName = $.trim($("#logisticsListModal_shipperName").val());
	// 委托方主机构是登录用户主机构，合同分类(contract_classify)为“转包合同”，合同状态(contract_status)为“已确认”的数据
	var contractClassify = 2;
	var contractStatus = 8;

	var params = {
		"shipperOrgRootName" : shipperOrgRootName,
		"shipperName" : shipperName,
		"contractClassify" : contractClassify,
		"contractStatus" : contractStatus,
		"page" : logisticsPage.options.current,
		"rows" : logisticsPage.options.itemPage,
		"waybillInfoId" : tempWaybillId
	};

	$.ajax({
		url : basePath + "/waybillInfo/getContractInfos",
		asyn : false,
		type : "POST",
		data : params,
		dataType : "json",
		success : function(data) {
			if (data) {
				if (data.success) {
					var rows = data.contractInfoPager.rows;
					var html = '';
					for (var i = 0; i < rows.length; i++) {
						var info = rows[i];
						html += '<tr class="table-body ">';
						html += '<td>';
						html += '<label class="i-checks"> ';
						html += '<input data-id="'+ info.id+ '" class="logistics-check" type="checkbox">';
						html += '</label>';
						html += '</td>';
						html += '<td>'+ strIsEmpty(info.shipperOrgRootName)+ '</td>';
						html += '<td>' + strIsEmpty(info.shipperName)+ '</td>';
						html += '<td>'+ strIsEmpty(info.shipperProjectName)+ '</td>';
						html += '<td>'+ contractCooperateStatus(info.cooperateStatus)+ '</td>';
						html += '</tr>';
					}
					$("#logisticsListModal_tbody").html(html);
					// 设置物流总页面
					logisticsPage.setTotalItems(data.contractInfoPager.total);
					$("#logisticsNum").text(data.contractInfoPager.total);
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("查询计划信息服务异常忙，请稍后重试");
				return;
			}
		},
		error : function() {
			xjValidate.showTip("error");
		}
	});
}


/**
 * 查询代理方
 */
function getProxy() {
	// 运单id
	var waybillInfoId = tempWaybillId;
	// 代理方
	var proxyName = $.trim($("#proxyListModal_proxyName").val());
	// 代理运价
	var proxyPrice = $.trim($("#proxyListModal_proxyPrice").val());

	var params = {
		"waybillInfoId" : waybillInfoId,
		"proxyName" : proxyName,
		"proxyPrice" : proxyPrice,
		"page" : proxyPage.options.current,
		"rows" : proxyPage.options.itemPage
	};
	$.ajax({
		url : basePath + "/waybillInfo/getProxylist",
		asyn : false,
		type : "POST",
		data : params,
		dataType : "json",
		success : function(data) {
			if (data) {
				if (data.success) {
					var rows = data.transportPricePager.rows;
					var html = '';
					for (var i = 0; i < rows.length; i++) {
						var info = rows[i];
						html += '<tr class="table-body ">';
						html += '<td>';
						html += '<label class="i-checks">';
						html += '<input data-id="' + info.id + '" data-name="' + info.proxyName + '" class="proxy-check" type="checkbox">';
						html += '</label>';
						html += '</td>';
						html += '<td>' + strIsEmpty(info.entrustName) + '</td>';
						html += '<td>' + strIsEmpty(info.proxyName) + '</td>';
						html += '<td>' + strIsEmpty(info.goodsName) + '</td>';
						html += '<td>' + strIsEmpty(info.lineName) + '</td>';
						html += '<td>' + strIsEmpty(info.forwardingUnit) + '</td>';
						html += '<td>' + strIsEmpty(info.consignee) + '</td>';
						html += '<td>' + new Date(info.startDate) .Format("yyyy-MM-dd") + '</td>';
						html += '<td>' + strIsEmpty(info.unitPrice) + '</td>';
						html += '</tr>';
					}
					$("#proxyListModal_tbody").html(html);
					// 设置物流总页面
					proxyPage.setTotalItems(data.transportPricePager.total);
					$("#proxyNum").text(data.transportPricePager.total);
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("查询代理信息服务异常忙，请稍后重试");
				return;
			}
		},
		error : function() {
			xjValidate.showTip("error");
		}
	});
}

// 处理字符串空数据
function valueFormat(value){
	if (value == null || value == '' || value == undefined) {
		return '';
	} else {
		return value
	}
	
}
