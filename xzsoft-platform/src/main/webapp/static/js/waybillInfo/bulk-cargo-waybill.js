
// 初始化page
var waybillPage = null;
var linePage = null;
var driverPage = null;
var driverType = "insideDriver";
var selectWayBill = new Array();

var tempWaybillId = null;
var ajaxing = false;

(function($) {
	// 初始化运单列表page页面
	waybillPage = $("#waybillPage").operationList({
		"current" : 1, // 当前目标
		"maxSize" : 4, // 前后最大列表
		"itemPage" : 10, // 每页显示多少条
		"totalItems" : 0, // 总条数
		"chagePage" : function(current) {
			// 调用ajax请求拿最新数据
			getWaybillList();
		}
	});
	getWaybillList();

	// 全选/全不选
	/*
	$("body").on("click", ".all-auth-check", function() {
		if ($(".all-auth-check").is(":checked")) {
			// 全选时
			$(".sub-auth-check").each(function() {
				$(this).prop("checked", true);
			});
		} else {
			// 全不选时
			$(".sub-auth-check").each(function() {
				$(this).prop("checked", false);
			});
		}
	});
	*/
	$("body").on("click", ".sub-auth-check", function() {
		var index = $(this).attr("data-id");
		$(".sub-auth-check").each(function() {
			if ($(this).attr("data-id") != index){
				$(this).prop("checked", false);
			}
		});
		
	});
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

	// 允许运单表格拖着
	$("#tableDrag").colResizable({
		liveDrag : true,
		gripInnerHtml : "<div class='grip'></div>",
		draggingClass : "dragging",
		resizeMode: 'overflow'
	});

	// 运单表格数据较多，增加滑动
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
		// 司机类型
		driverType = $(this).data("type");

		// 清空司机所有选择
		$(".driver-check").each(function() {
			$(this).prop("checked", false);
		});
		$(".driver-content").hide();
		$(target).show();
		// 清除搜索数据
		$("#driver-from")[0].reset();
		// 调用ajax请求
		// 设置总数和page页面
		if (target == '#driver-inside') {
			getDriver(1);
			
		} else if (target == '#driver-outsource') {
			getDriver(2);
		}
	})
})(jQuery);

/**
 * 运单page页跳转
 */
function waybillPageSlect(e) {
	var value = $(e).prev().find('input').val();
	waybillPage.setCurrentPage(value);
}

function resetEmpty() {
	// 清除重置线路
	$("#selectLine").empty();
}

/**
 * 添加线路弹出框
 */
function lineSelect() {
	$("#lineSelectModal").modal('show');
	// 初始线路列表page页面
	linePage = $("#linePage").operationList({
		"current" : 1, // 当前目标
		"maxSize" : 4, // 前后最大列表
		"itemPage" : 10, // 每页显示多少条
		"totalItems" : 0, // 总条数
		"chagePage" : function(current) {
			// 调用ajax请求拿最新数据
			getLineList();
		}
	});
	getLineList();
}

/**
 * 线路page页跳转
 */
function linePageSlect(e) {
	var value = $(e).prev().find('input').val();
	linePage.setCurrentPage(value);
}

/**
 * 线路选择
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
 * 派发弹出框
 */
function distribute() {	
	var selectlist = findAllCheck(".sub-auth-check");
	if (selectlist.length != 1 ) {
		xjValidate.showTip("请选择数据");
		return;
	}
	distribute2(selectlist[0].id);
}
function distribute2(id) {
	tempWaybillId = id;
	// 查询运单状态
	$.ajax({
		url : basePath + "/waybillInfo/getWaybillStatusForBulkCargo",
		asyn : false,
		type : "POST",
		data : {"id":id},
		dataType : "json",
		success : function(response) {
			if (response) {
				if (response.success) {
					if (response.distribute) {
						$("#distributeModal").modal('show');
						$("#selectDriver").text('');
						$("#userInfoId").val('');
						$("#Freight").text('');
					} else {
						xjValidate.showTip(response.msg);
					}
				} else {
					xjValidate.showTip(response.msg);
				}
			}
		},
		error:function(){
			xjValidate.showTip("error");
		}
	});
	
}
/**
 * 司机列表
 */
function distributeDriver() {
	$("#driverListModal").modal('show');
	driverPage = $("#driverPage").operationList({
		"current" : 1, //当前目标
		"maxSize" : 4, //前后最大列表
		"itemPage" : 10, //每页显示多少条
		"totalItems" : 0, //总条数
		"chagePage" : function(current) {
			//调用ajax请求拿最新数据
			getDriver(1);
			getDriver(2);
		}
	});
	
	getDriver(1);
	getDriver(2);
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
	var selectlist = findAllCheck(".driver-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	$("#selectDriver").text(selectlist[0].name);
	$("#selectDriver").next("input").val(selectlist[0].id);
	$("#driverListModal").modal('hide');
	// 内部司机
	if (driverType == "insideDriver") {
		$("#Freight").val(0).attr("readonly", true);
	} else {
		$("#Freight").val('').attr("readonly", false);
	}
}

/**
 * 查看运单详情
 */
function viewWaybill() {
	var selectlist = findAllCheck(".sub-auth-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	var id = selectlist[0].id;
	$.ajax({
		url : basePath + "/waybillInfo/getSonWaybillByParentId",
		asyn : false,
		type : "POST",
		data : {"id":id},
		dataType : "json",
		success : function(data) {
			if (data) {
				if (data.success) {
					var json = data.data;
					$("#viewWaybillModal_id").html(json.waybillId);
					$("#viewWaybillModal_parentWaybillId").html(json.parentWaybillInfoCode);
					$("#viewWaybillModal_entrustName").html(json.entrustName);
					$("#viewWaybillModal_userInfoId").html(json.driverName);// 司机编号→司机名称
					$("#viewWaybillModal_goodsInfoName").html(json.goodsName);
					$("#viewWaybillModal_lineInfoName").html(json.lineName);
					$("#viewWaybillModal_carCode").html(json.carCode);
					$("#viewWaybillModal_currentTransportPrice").html(json.currentTransportPrice);
					$("#viewWaybillModal_waybillStatus").html(waybillStatusChange(json.waybillStatus));
					$("#viewWaybillModal_cooperateStatus").html(waybillCooperateStatusChange(json.cooperateStatus));
					$("#viewWaybillModal_waybillType").html(waybillTypeChange(json.waybillType));
					$("#viewWaybillModal_waybillClassify").html(waybillClassifyChange(json.waybillClassify));
					$("#viewWaybillModal").modal('show');
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("查询运单信息服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){
			xjValidate.showTip("error");
		}
	});
}

// 运单类型（1：物流运单 2：自营运单 3：代理运单 4：转包运单）大宗货物运单时使用
function waybillTypeChange(temp){
	if (temp == 1) {
		return "物流运单";
	} else if (temp == 2) {
		return "自营运单";
	} else if (temp == 3) {
		return "代理运单";
	} else if (temp == 4) {
		return "转包运单";
	} else {
		return "";
	}
}
// 运单分类（1：大宗货物运单 2：零散货物运单）
function waybillClassifyChange(temp){
	if (temp == 1) {
		return "大宗货物运单";
	} else if (temp == 2) {
		return "零散货物运单";
	} else {
		return "";
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
				"name" : $(this).attr("data-name")
			}
			checkList.push(params);
		}
	});
	return checkList;
}

/**
 * 查找选择
 */
function findAllWayBillCheck(element) {
	var checkList = new Array();
	$(element).each(function() {
		if ($(this).is(":checked")) {
			checkList.push($(this).attr("data-id"));
		}
	});
	return checkList;
}

/**
 * 加载零散货物运单派发列表
 * 
 * @param number
 */
function getWaybillList() {
	$("#bulkCargoWaybillBody").html("");
	var goodsName = $.trim($("#goodsName").val());
	var entrustName = $.trim($("#entrustName").val());
	var shipperName = $.trim($("#shipperName").val());
	var forwardingUnit = $.trim($("#forwardingUnit").val());
	var consignee = $.trim($("#consignee").val());
	var lineId = $.trim($("#lineId").val());
	var planTransportDateStart = $.trim($("#planTransportDateStart").val());
	var planTransportDateEnd = $.trim($("#planTransportDateEnd").val());
	var waybillStatus = $.trim($("#waybillStatus").val());
	var cooperateStatus = $.trim($("#cooperateStatus").val());
	
	var params = {
			goodsName : goodsName,
			entrustName : entrustName,
			shipperName : shipperName,
			forwardingUnit : forwardingUnit,
			consignee : consignee,
			lineId : lineId,
			planTransportDateStart : planTransportDateStart,
			planTransportDateEnd : planTransportDateEnd,
			waybillStatus : waybillStatus,
			cooperateStatus : cooperateStatus,
			"page" : waybillPage.options.current,
			"rows" : waybillPage.options.itemPage
		};
	$.ajax({
		url : basePath + "/waybillInfo/getBulkCargoWaybillList",
		data : params,
		dataType : "json",
		type : "post",
		async : false,
		success : function(resp) {
			if (resp) {
				if (resp.success) {
					$.each(resp.list,function(index, ele) {
						console.log(ele);
						// 追加数据
						var tr = "";
						tr += "<tr class='table-body'>";
						tr += '<td>';
						tr += '<label class="i-checks"> ';
						tr += '<input class="sub-auth-check" type="radio" data-id="'+ele.id+'">';
						tr += '</label>';
						tr += '</td>';
						tr += "<td>" + strIsEmpty(ele.rootWaybillId) + "</td>";
						tr += "<td>" + waybillStatusChange(ele.waybillStatus) + "</td>";
						tr += "<td>" + strIsEmpty(ele.entrustName) + "</td>";
						tr += "<td>" + strIsEmpty(ele.shipperName) + "</td>";
						tr += "<td>" + ele.currentTransportPrice + "</td>";
						tr += "<td>" + strIsEmpty(ele.scatteredGoods) + "</td>";
						tr += "<td>" + strIsEmpty(ele.lineName) + "</td>";
						tr += "<td>" + strIsEmpty(ele.distance) + "</td>";
						tr += "<td>" + strIsEmpty(ele.forwardingUnit) + "</td>";
						tr += "<td>" + strIsEmpty(ele.consignee) + "</td>";
						tr += "<td>" + new Date( ele.planTransportDate).Format("yyyy-MM-dd") + "</td>";
						// 将tr追加
						$("#bulkCargoWaybillBody").append(tr);
					});
					waybillPage.setTotalItems(resp.total);
					$("#waybillNum").text(resp.total);
				}
			}
			
		}
	});
}
//运单状态（1：新建 2：已派发 3：已撤回 4：已拒绝 5：已接单 6：已装货 7：在途 8：已卸货 9：已挂账 10：已发布 11:已回收报价）
function waybillStatusChange(temp){
	if (temp == 1){
		return '新建';
	} else if (temp == 2) {
		return '已派发';
	} else if (temp == 3) {
		return '已撤回';
	} else if (temp == 4) {
		return '已拒绝';
	} else if (temp == 5) {
		return '已接单';
	} else if (temp == 6) {
		return '已装货';
	} else if (temp == 7) {
		return '在途';
	} else if (temp == 8) {
		return '已卸货';
	} else if (temp == 9) {
		return '已挂账';
	} else if (temp == 10) {
		return '已发布';
	} else if (temp == 11) {
		return '已回收报价';
	} else {
		return '';
	}
}
function slitPlanSave() {
	var waybillId = tempWaybillId;
	var driverUserRole = 1;
	if (driverType == "insideDriver") {
		driverUserRole = 1;
	} else {
		driverUserRole = 2;
	}
	// 这个userInfoId不是用户id  实际存的是  司机表主键或者合作合办表主键
	var userInfoId = $.trim($("#userInfoId").val());
	var currentTransportPrice = $.trim($("#Freight").val());

	if(ajaxing){
		return false;
	}
	$.ajax({
		url : basePath + "/waybillInfo/bulkCargoDistribute",
		data : {
			"waybillId" : waybillId,
			"driverUserRole" : driverUserRole,
			"currentTransportPrice" : currentTransportPrice,
			"driverInfoId" : userInfoId
		},
		dataType : "json",
		type : "post",
		async : false,
		beforeSend: function(){
			ajaxing = true;
		},
		success : function(resp) {
			ajaxing = false;
			if (resp) {
				if (resp.success) {
					xjValidate.showTip(resp.msg);
					$("#distributeModal").modal('hide');
					getWaybillList();
					
				} else {
					xjValidate.showTip(resp.msg);
				}
			} else {
				xjValidate.showTip("撤回运单服务异常忙，请稍后重试");
			}
		},
		errot : function () {
			ajaxing = false;
			xjValidate.showTip("error");
		},
		complete: function(){
			ajaxing = false;
		}
	});
}

/**
 * 撤回
 */
function withdraw() {
	var selectlist = findAllCheck(".sub-auth-check");
	if (selectlist.length != 1 ) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	withdrawOne(selectlist[0].id);
}
/**
 * 撤回
 * @param id
 */
function withdrawOne(id) {
	$.ajax({
		url : basePath + "/waybillInfo/bulkCargoRevoke",
		data : { "id" : id },
		dataType : "json",
		type : "post",
		async : false,
		success : function(resp) {
			if (resp) {
				if (resp.success) {
					xjValidate.showTip(resp.msg);
					getWaybillList();
					
				} else {
					xjValidate.showTip(resp.msg);
				}
			} else {
				xjValidate.showTip("撤回运单服务异常忙，请稍后重试");
			}
			
		}
	});
}


/**
 * 处理空字符串
 * @param str
 * @returns
 */
function strIsEmpty(str) {
	if (str == null || str == undefined || str == '') {
		return '';
	} else {
		return str;
	}
}
/**
 * 
 * 获得司机 1：内部司机 2：外部司机
 * @param id
 */
function getDriver(driverUserRole){

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
	}
	if (driverUserRole == 2) {
		url = basePath + "/waybillInfo/selectOutsideDriver";
		//合作伙伴角色为“司机”，启用状态为“启用”的数据。 合作伙伴
		params = {
				"driverName" : name,
				"mobilePhone" : phone,
				"carCode" : carCode,
				"page" : driverPage.options.current,
				"rows" : driverPage.options.itemPage
		};
	}
	if (driverUserRole == 3) {
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
					for(var i = 0; i < rows.length; i++){
						var info = rows[i];
						html += '<tr class="table-body ">';
						html += '<td>';
						html += '<label class="i-checks">';
						html += '<input data-id="'+info.id+'" data-name="'+strIsEmpty(info.driverName)+'" class="driver-check" type="checkbox">';
						html += '</label>';
						html += '</td>';
						html += '<td>'+strIsEmpty(info.driverName)+'</td>';
						html += '<td>'+strIsEmpty(info.mobilePhone)+'</td>';
						html += '<td>'+strIsEmpty(info.carCode)+'</td>';
						html += '</tr>'; 
						
					}
					if (driverUserRole == 1) {
						$("#driverListModal_tbody1").html(html);
						driverPage.setTotalItems(data.dirverInfoPager.total);
						$("#driverNum1").text(data.dirverInfoPager.total);
					} else {
						$("#driverListModal_tbody2").html(html);
						driverPage.setTotalItems(data.dirverInfoPager.total);
						$("#driverNum2").text(data.dirverInfoPager.total);
					}
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("查询计划信息服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){
			xjValidate.showTip("error");
		}
	});
}
/**
 * 查询线路信息
 */
function getLineList(page,rows){
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
		asyn : false,
		type : "POST",
		data : params,
		dataType : "json",
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
						html += '<td>'+strIsEmpty(info.lineName)+'</td>';
						html += '<td>'+strIsEmpty(info.startPoints)+'</td>';
						html += '<td>'+strIsEmpty(info.endPoints)+'</td>';
						html += '<td>'+strIsEmpty(info.distance)+'</td>';
						html += '<td>'+strIsEmpty(info.days)+'</td>';
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
				xjValidate.showTip("查询计划信息服务异常忙，请稍后重试");
				return;
			}
		},
		error:function(){
			xjValidate.showTip("error");
		}
	});
}

function getLineListForQyertBtn(){
	getLineList();
}

// 协同状态(1：上下游协同 2：下游不协同 3：上游不协同)
function waybillCooperateStatusChange(temp){
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
function getDriverForBtn(){
	if (fromDriver == 'distributeDriver') {
		getDriver(1);
		getDriver(2);
	} else if (fromDriver == 'distributeProxy') {
		getDriver(3);
		getDriver(2);
	}
}