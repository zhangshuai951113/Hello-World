
//初始化page
// 主列表
var waybillMonitorPage = null; 

//线路信息列表
var linePage = null;


// 临时id
var tempPlanId; // 临时计划信息id

var ajaxing = false; // 请求是否正在进行中
(function($) {
	//初始化运单列表page页面
	waybillMonitorPage = $("#waybillMonitorPage").operationList({
		"current" : 1, //当前目标
		"maxSize" : 4, //前后最大列表
		"itemPage" : 10, //每页显示多少条
		"totalItems" : 0, //总条数
		"chagePage" : function(current) {
			loadWaybillMonitor(current);
		}
	});
	
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
	$("#tableDrag").colResizable({
		liveDrag : true,
		gripInnerHtml : "<div class='grip'></div>",
		draggingClass : "dragging"
	});
	
})(jQuery);

function resetEmpty() {
	//清除重置线路
	$("#selectLine").empty();
}

/**
 * 加载表格数据
 */
function loadWaybillMonitor(current){
	
	waybillMonitorPage.options.current = current;
	
	// 货物
	var goodsInfoName = $.trim($("#goodsInfoName").val());
	// 线路
	var lineInfoId = $.trim($("#lineInfoId").val());
	// 发货日期
	var deliveryDateS = $.trim($("#deliveryDateS").val());
	var deliveryDateE = $.trim($("#deliveryDateE").val());
	// 到货日期
	var arrivalDateS = $.trim($("#arrivalDateS").val());
	var arrivalDateE = $.trim($("#arrivalDateE").val());
	// 委托方
	var entrustName = $.trim($("#entrustName").val());
	// 承运方
	var shipperName = $.trim($("#shipperName").val());
	// 发货单位
	var forwardingUnit = $.trim($("#forwardingUnit").val());
	// 到货单位
	var consignee = $.trim($("#consignee").val());
	
	var params = {
		"goodsInfoName" : goodsInfoName,
		"lineInfoId" : lineInfoId,
		"deliveryDateS" : deliveryDateS,
		"deliveryDateE" : deliveryDateE,
		"arrivalDateS" : arrivalDateS,
		"arrivalDateE" : arrivalDateE,
		"entrustName" : entrustName,
		"shipperName" : shipperName,
		"forwardingUnit" : forwardingUnit,
		"consignee" : consignee,
		"page" : mainTableToolBar.options.current,
		"rows" : mainTableToolBar.options.itemPage
	};
	// 获取数据运单监控数据
	$.ajax({
		url : basePath + "/reportForm/getDataForWaybillMonitorPage",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(resp) {
			console.log(resp);
		},
		error:function(){ajaxing = false;xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
	});

	
}
/**
 * 获取主表格的数据
 * @returns
 */
function getMainData(){
	
}


/**
 * 添加线路弹出框
 */
function lineSelect() {
	$("#lineSelectModal").modal('show');
	$("#lineSelectModal_startPoints").val("");
	$("#lineSelectModal_endPoints").val("");
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
