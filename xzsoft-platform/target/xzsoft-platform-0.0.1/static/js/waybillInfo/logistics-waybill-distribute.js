//初始化page
var waybillPage = null;
var linePage = null;
var driverPage = null;
var logisticsPage = null;
var proxyPage = null;
var fromDriver = "distributeDriver"; // 判断选择是哪种派发，司机派发直接选择distributeDriver，代理派发需要代理司机选择
										// distributeProxy
var tempWaybillId = null;
var tempSelectedWaybillIds = null;
var tempDriverUserRole = 1;
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

	// 单选
//	$("body").on("click", ".sub-waybill-check", function() {
//		var index = $(this).attr("data-id");
//		$(".sub-waybill-check").each(function() {
//			if ($(this).attr("data-id") != index) {
//				$(this).prop("checked", false);
//			}
//		});
//
//	});
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
	}, 500)

	// 允许运单表格拖着
	$("#tableDrag").colResizable({
		resizeMode: 'overflow',
		liveDrag : true,
		gripInnerHtml : "<div class='grip'></div>",
		draggingClass : "dragging"
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
		
		// 清除搜索数据
		$("#driver-from")[0].reset();
		
		// 记录司机类型，并加载司机信息
		var target = $(this).data("target");
		if (target == '#driver-inside') {
			tempDriverUserRole  = 1;
			getDriver(1);
		} else if (target == '#driver-outsource') {
			tempDriverUserRole  = 2;
			getDriver(2);
		} else if (target == '#driver-temporary') {
			tempDriverUserRole  = 3;
			getDriver(3);
		}
	});
})(jQuery);


// 运单
/**
 * 运单page页跳转
 */
function waybillPageSlect(e) {
	var value = $(e).prev().find('input').val();
	waybillPage.setCurrentPage(value);
}

function waybillPageQuery(page) {
	waybillPage.setCurrentPage(page);
}

function resetEmpty() {
	// 清除重置线路
	$("#selectLine").empty();
}
/**
 * 获取运单信息
 */
function getWaybillList() {
	// 货物
	var goodsInfoName = $.trim($("#goodsInfoName").val());
	// 委托方
	var entrustName = $.trim($("#entrustName").val());
	// 发货单位
	var forwardingUnit = $.trim($("#forwardingUnit").val());
	// 到货单位
	var consignee = $.trim($("#consignee").val());
	// 线路
	var lineInfoId = $.trim($("#lineInfoId").val());
	// 拉运日期
	var planTransportDate1 = $.trim($("#planTransportDate1").val());
	var planTransportDate2 = $.trim($("#planTransportDate2").val());
	// 运单状态
	var waybillStatus = $.trim($("#waybillStatus").val());
	// 协同状态
	var cooperateStatus = $.trim($("#cooperateStatus").val());

	// 运单分类为“大宗货物运单”，运单类型为“物流运单”的数据
	var params = {
		"goodsInfoName" : goodsInfoName,
		"entrustName" : entrustName,
		"forwardingUnit" : forwardingUnit,
		"consignee" : consignee,
		"lineInfoId" : lineInfoId,
		"planTransportDate1" : planTransportDate1,
		"planTransportDate2" : planTransportDate2,
		"waybillStatus" : waybillStatus,
		"cooperateStatus" : cooperateStatus,
		"page" : waybillPage.options.current,
		"rows" : waybillPage.options.itemPage
	};
	$.ajax({
		url : basePath + "/waybillInfo/getLogisticsWaybillInfoList",
		asyn : false,
		type : "POST",
		data : params,
		dataType : "json",
		success : function(data) {
			if (data) {
				if (data.success) {
					console.log(data);
					var rows = data.waybillInfoPager.rows;
					var html = '';
					for (var i = 0; i < rows.length; i++) {
						var info = rows[i];
						html += '<tr class="table-body ">';
						html += '<td>';
						html += '<label class="i-checks"> ';
						html += '<input class="sub-waybill-check" type="checkbox" data-id="' + info.id + '">';
						html += '</label>';
						html += '</td>';
						html += '<td>' + strIsEmpty(info.rootWaybillId) + '</td>';
						html += '<td>' + waybillStatusChange(info.waybillStatus) + '</td>';
						html += '<td>' + strIsEmpty(info.entrustName) + '</td>';
						html += '<td>' + strIsEmpty(info.shipperName) + '</td>';
						html += '<td>' + info.currentTransportPrice + '</td>';
						html += '<td>' + strIsEmpty(info.goodsName) + '</td>';
						html += '<td>' + strIsEmpty(info.lineName) + '</td>';
						html += '<td>' + strIsEmpty(info.distance) + '</td>';
						html += '<td>' + strIsEmpty(info.forwardingUnit) + '</td>';
						html += '<td>' + strIsEmpty(info.consignee) + '</td>';
						html += '<td>' + new Date(info.planTransportDate).Format("yyyy-MM-dd") + '</td>';
						html += '</tr>';
					}
					$("#waybillList_tbody").html(html);
					// 设置运单页面总条数
					waybillPage.setTotalItems(data.waybillInfoPager.total);
					$("#waybillNum").text(data.waybillInfoPager.total);
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

// 线路
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
 * 查询线路信息
 */
function getLineList() {
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
					for (var i = 0; i < rows.length; i++) {
						var info = rows[i];
						html += '<tr class="table-body ">';
						html += '<td>';
						html += '<label class="i-checks"> ';
						html += '	<input data-id="'
								+ info.id
								+ '" data-name="'
								+ info.lineName
								+ '" data-km="50" class="line-check" type="checkbox">';
						html += '</label>';
						html += '</td>';
						html += '<td>' + strIsEmpty(info.lineName)
								+ '</td>';
						html += '<td>' + strIsEmpty(info.startPoints)
								+ '</td>';
						html += '<td>' + strIsEmpty(info.endPoints)
								+ '</td>';
						html += '<td>' + strIsEmpty(info.distance)
								+ '</td>';
						html += '<td>' + strIsEmpty(info.days)
								+ '</td>';
						html += '</tr>';
					}
					$("#lineSelectModal_tbody").html(html);
					// 设置线路总页面
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
		error : function() {
			xjValidate.showTip("error");
		}
	});
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

// 司机
/**
 * 显示司机选择界面
 * @param value
 */
function showDriverListModel(value){
	// 判断选择是哪种派发，司机派发直接选择distributeDriver，代理派发需要代理司机选择 distributeProxy
	if (value == 'distributeDriver') {
		// 直接派发司机可以选择内部司机，外协司机，临时司机
		fromDriver = 'distributeDriver';
		// 请选择一条数据
		var selectlist = findAllCheck(".sub-waybill-check");
		if (selectlist.length == 0 || selectlist.length > 1) {
			xjValidate.showTip("请选择一条数据");
			return;
		}
		tempWaybillId = selectlist[0].id;
		// 验证运单状态
		$.ajax({
			url : basePath + "/waybillInfo/waybillIsNew",
			async : false,
			type : "POST",
			data : {"id" : tempWaybillId},
			dataType : "json",
			beforeSend:function(){
				if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
			},
			success : function(data) {
				ajaxing = false;
				if (data) {
					if (data.success) {
						// 新建、已撤回、已拒绝
						if (data.waybillStatus == 1 || data.waybillStatus == 3 || data.waybillStatus == 4) {
							// 有两种选择，一种来自司机派发选择，一种来自代理派发
							$("#driverListModal").modal('show');
							$(".driver-tab").removeClass("active");
							$("#insideDriverTab").show();
							$("#insideDriverTab").addClass("active");
							// 初始司机列表page页面
							driverPage = $("#driverPage").operationList({
								"current" : 1, // 当前目标
								"maxSize" : 4, // 前后最大列表
								"itemPage" : 10, // 每页显示多少条
								"totalItems" : 0, // 总条数
								"chagePage" : function(current) {
									getDriver(tempDriverUserRole);
								}
							});
							getDriver(1);
						} else {
							xjValidate.showTip("运单已派发"); return;
						}
					} else {
						xjValidate.showTip(data.msg); return;
					}
				} else {
					xjValidate.showTip("服务异常忙，请稍后重试"); return;
				}
			},
			error : function() {ajaxing = false;xjValidate.showTip("服务请求失败");},
			complete:function(){ajaxing = false;}
		});
		
		
		
	} else if (value == 'distributeProxy') {
		fromDriver = 'distributeProxy';
		// 从代理派发弹出司机选择框,代理派发不可选择内部司机
		$("#driverListModal").modal('show');
		$(".driver-tab").removeClass("active");
		$("#insideDriverTab").hide();
		$("#outsourceDriverTab").addClass("active");
		// 初始司机列表page页面
		driverPage = $("#driverPage").operationList({
			"current" : 1, // 当前目标
			"maxSize" : 4, // 前后最大列表
			"itemPage" : 10, // 每页显示多少条
			"totalItems" : 0, // 总条数
			"chagePage" : function(current) {
				getDriver(tempDriverUserRole);
			}
		});
		getDriver(2);
		
	}
	
}

/**
 * 刷新司机信息
 */
function refreshDriver(){
	getDriver(tempDriverUserRole);
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
	var driverUserRole = tempDriverUserRole;
	
	if (fromDriver == "distributeDriver") {
		// 直接派发司机
		var params = {
			"waybillInfoId" : waybillId,
			"driverInfoId" : driverInfoId,
			"driverUserRole" : driverUserRole
		};
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
						xjValidate.showTip(data.msg);
						waybillPageQuery(1);
					} else {
						xjValidate.showTip(data.msg);
						return;
					}
				} else {
					xjValidate.showTip("派发司机服务异常忙，请稍后重试");
					return;
				}
			},
			error : function(){ajaxing = false;xjValidate.showTip("error");},
			complete : function(){ajaxing = false;}
		});
	} else if (fromDriver == "distributeProxy") {
		// 代理派发处理
		$("#selectDriver").text(selectlist[0].name);
		$("#selectDriver").next("input").val(selectlist[0].id);
	}
	$("#driverListModal").modal('hide');
}

/**
 * 获得司机 1：内部司机 2：外部司机 3:企业临时司机
 * @param driverUserRole
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
						html += '<input data-id="'+ info.id+ '" data-name="'+ strIsEmpty(info.driverName)+ '" class="driver-check" type="checkbox">';
						html += '</label>';
						html += '</td>';
						html += '<td>'+strIsEmpty(info.driverName)+'</td>';
						html += '<td>'+strIsEmpty(info.mobilePhone)+'</td>';
						html += '<td>'+strIsEmpty(info.carCode)+'</td>';
						html += '</tr>';
					}
					$("#driverListModalTbody").html(html);
					driverPage.setTotalItems(data.dirverInfoPager.total);
					$("#driverNum").text(data.dirverInfoPager.total);

				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("查询司机信息服务异常忙，请稍后重试");
				return;
			}
		},
		error : function() {
			xjValidate.showTip("error");
		}
	});
}




/**
 * 派发物流公司弹出框
 */
function distributeLogistics() {
	// 请选择一条数据
	var selectlist = findAllCheck(".sub-waybill-check");
	if (selectlist.length == 0) {
		xjValidate.showTip("请选择数据");
		return;
	}
	var waybillInfoIds = [];
	selectlist.forEach(function(value){
		waybillInfoIds.push(value.id);
	});
	tempSelectedWaybillIds = waybillInfoIds;
	// 判断所选运单是否是 “新建”、“已撤回”、“已拒绝”
	$.ajax({
		url : basePath + "/waybillInfo/verifWhetherTheWaybillCanBeDelivered",
		asyn : false,
		type : "POST",
		data : {"waybillInfoIds" : tempSelectedWaybillIds.join(',')},
		dataType : "json",
		success : function(data) {
			if (data) {
				if (data.success) {
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
					
					// 表格拖动
					setTimeout(function(){
		    			$("#table-wuliugongsi").colResizable({
		    		      liveDrag:true, 
		    		      gripInnerHtml:"<div class='grip'></div>", 
		    		      draggingClass:"dragging",
		    		      ifDel: 'wlTable',
		    		      resizeMode: 'overflow'
		    		    });
			    		},1000);
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
				return;
			}
		},
		error : function() {
			xjValidate.showTip("error");
		}
	});
	
	//distributeLogistics2(selectlist[0].id);
}

//function distributeLogistics2(id) {
//	tempWaybillId = id;
//	// 验证是否是新建状态
//	$.ajax({
//		url : basePath + "/waybillInfo/waybillIsNew",
//		asyn : false,
//		type : "POST",
//		data : {
//			"id" : id
//		},
//		dataType : "json",
//		success : function(data) {
//			if (data) {
//				if (data.success) {
//					if (data.waybillStatus == 1 || data.waybillStatus == 3
//							|| data.waybillStatus == 4) {
//						$("#logisticsListModal").modal('show');
//						
//						// 初始物流列表page页面
//						logisticsPage = $("#logisticsPage").operationList({
//							"current" : 1, // 当前目标
//							"maxSize" : 4, // 前后最大列表
//							"itemPage" : 10, // 每页显示多少条
//							"totalItems" : 0, // 总条数
//							"chagePage" : function(current) {
//								// 调用ajax请求拿最新数据
//								getContractInfos();
//							}
//						});
//						getContractInfos();
//						
//						// 表格拖动
//						setTimeout(function(){
//			    			$("#table-wuliugongsi").colResizable({
//			    		      liveDrag:true, 
//			    		      gripInnerHtml:"<div class='grip'></div>", 
//			    		      draggingClass:"dragging",
//			    		      ifDel: 'wlTable',
//			    		      resizeMode: 'overflow'
//			    		    });
//			    		},1000);
//					} else {
//						xjValidate.showTip("运单已派发");
//					}
//				} else {
//					xjValidate.showTip(data.msg);
//					return;
//				}
//			} else {
//				xjValidate.showTip("运单派发服务异常忙，请稍后重试");
//				return;
//			}
//		},
//		error : function() {
//			xjValidate.showTip("error");
//		}
//	});
//}

/**
 * 物流公司page页跳转
 */
function logisticsPageSelect(e) {
	var value = $(e).prev().find('input').val();
	logisticsPage.options.current = value;
	getContractInfos();
	//logisticsPage.setCurrentPage(value);
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
			"waybillInfoIds" : tempSelectedWaybillIds.join(','),
			"contractInfoId" : contractInfoId
		},
		dataType : "json",
		beforeSend : function() {
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(data) {
			ajaxing = false;
			if (data) {
				if (data.success) {
					xjValidate.showTip(data.msg);
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
		error : function() { ajaxing = false; xjValidate.showTip("error"); }
	});
	$("#logisticsListModal").modal('hide');
}

/**
 * 派发代理弹出框
 */
function proxyDistribute() {
	fromDriver = 'distributeProxy';
	
	var selectlist = findAllCheck(".sub-waybill-check");

	// 请选择一条数据
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	proxyDistribute2(selectlist[0].id);
	
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
		success : function(data) {
			if (data) {
				if (data.success) {
					if (data.waybillStatus == 1 || data.waybillStatus == 3
							|| data.waybillStatus == 4) {
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
		error : function() {
			xjValidate.showTip("error");
		}
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
	if (valueIsEmpty(transportPriceId)) {
		xjValidate.showTip("请选择代理方");
		return false;
	}
	if (valueIsEmpty(proxyDistributeModal_driverInfoId)) {
		xjValidate.showTip("请选择司机");
		return false;
	}

	var params = {
		"waybillInfoId" : waybillInfoId,
		"transportPriceId" : transportPriceId,
		"driverInfoId" : driverInfoId,
		"driverUserRole" : driverUserRole
	};

	if (ajaxing) {
		return false;
	}
	$.ajax({
		url : basePath + "/waybillInfo/logisticsProxyDistributed",
		asyn : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend : function() {
			ajaxing = true;
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
		error : function() {
			ajaxing = false;
			xjValidate.showTip("error");
		},
		complete : function() {
			ajaxing = false;
		}
	});

}

/**
 * 查看运单详情
 */
function viewWaybill() {
	var selectlist = findAllCheck(".sub-waybill-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	var id = selectlist[0].id;
	$.ajax({
		url : basePath + "/waybillInfo/getSonWaybillByParentId",
		asyn : false,
		type : "POST",
		data : {
			"id" : id
		},
		dataType : "json",
		success : function(data) {
			if (data) {
				if (data.success) {

					var json = data.data;
					$("#viewWaybillModal_waybillId").html(json.waybillId);
					$("#viewWaybillModal_parentWaybillId").html( json.parentWaybillInfoCode);
					$("#viewWaybillModal_entrustName").html(json.entrustName);
					$("#viewWaybillModal_shipperName").html(json.shipperName);
					$("#viewWaybillModal_userInfoId").html(json.driverName);// 司机编号→司机名称
					$("#viewWaybillModal_goodsInfoName").html(json.goodsName);
					$("#viewWaybillModal_proxyName").html(json.proxyName);
					$("#viewWaybillModal_lineInfoName").html(json.lineName);
					$("#viewWaybillModal_carCode").html(json.carCode);
					$("#viewWaybillModal_currentTransportPrice").html(json.currentTransportPrice);
					$("#viewWaybillModal_waybillStatus").html(waybillStatusChange(json.waybillStatus));
					$("#viewWaybillModal_cooperateStatus").html(waybillCooperateStatus(json.cooperateStatus));
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
		error : function() {
			xjValidate.showTip("error");
		}
	});

}

// 运单状态（1：新建 2：已派发 3：已撤回 4：已拒绝 5：已接单 6：已装货 7：在途 8：已卸货 9：已挂账 10：已发布 11:已回收报价）
function waybillStatusChange(temp) {
	if (temp == 1) {
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
// 协同状态(1：上下游协同 2：下游不协同 3：上游不协同)
function waybillCooperateStatus(temp) {
	if (temp == 1) {
		return '上下游协同';
	} else if (temp == 2) {
		return '下游不协同';
	} else if (temp == 3) {
		return '上游不协同';
	} else {
		return '';
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
 * 撤回
 */
function revoke() {
	// 请选择一条数据
	var selectlist = findAllCheck(".sub-waybill-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	var id = selectlist[0].id;
	revoke2(id);
}
function revoke2(id) {
	$.ajax({
		url : basePath + "/waybillInfo/logisticsRetract",
		asyn : false,
		type : "POST",
		data : {
			"id" : id
		},
		dataType : "json",
		success : function(data) {
			if (data) {
				if (data.success) {
					xjValidate.showTip(data.msg);
					waybillPageQuery(1);
				} else {
					xjValidate.showTip(data.msg);
					return;
				}
			} else {
				xjValidate.showTip("撤回运单服务异常忙，请稍后重试");
				return;
			}
		},
		error : function() {
			xjValidate.showTip("error");
		}
	});
}


/**
 * 获得物流公司
 * 
 * @param page
 * @param rows
 */
function getContractInfos() {
	// 参数：承运方主机构(shipper_org_root)、承运方(shipper)
	var shipperOrgRootName = $.trim($("#logisticsListModal_shipperOrgRootName").val());
	var shipperName = $.trim($("#logisticsListModal_shipperName").val());
	// 委托方主机构是登录用户主机构，合同分类(contract_classify)为“转包合同”，合同状态(contract_status)为“已确认”的数据
//	var contractClassify = 2;
//	var contractStatus = 8;

	var params = {
		"shipperOrgRootName" : shipperOrgRootName,
		"shipperName" : shipperName,
//		"contractClassify" : contractClassify,
//		"contractStatus" : contractStatus,
		"page" : logisticsPage.options.current,
		"rows" : logisticsPage.options.itemPage,
		"waybillInfoIds" : tempSelectedWaybillIds.join(',')
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
					var list = data.list;
					var count = data.count;
					var html = '';
					var length = 0;
					if (valueIsEmpty(list)) {
						length = 0;
					} else {
						length = list.length;
					}
					for (var i = 0; i < length; i++) {
						var info = list[i];
						html += '<tr class="table-body ">';
						html += '<td>';
						html += '<label class="i-checks"> ';
						html += '<input data-id="'+ info.id + '" class="logistics-check" type="checkbox">';
						html += '</label>';
						html += '</td>';
						html += '<td>' + strIsEmpty(info.shipperOrgRootName) + '</td>';
						html += '<td>' + strIsEmpty(info.shipperName) + '</td>';
						html += '<td>' + strIsEmpty(info.shipperProjectName) + '</td>';
						html += '<td>' + contractCooperateStatus(info.cooperateStatus) + '</td>';
						html += '</tr>';
					}
					$("#logisticsListModal_tbody").html(html);
					// 设置物流总页面
					logisticsPage.setTotalItems(count);
					$("#logisticsNum").text(count);
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
function contractCooperateStatus(cooperateStatus) {
	if (cooperateStatus == 1) {
		return '协同';
	} else if (cooperateStatus == 2) {
		return '半协同';
	} else {
		return '';
	}
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
	$
			.ajax({
				url : basePath + "/waybillInfo/getProxylist",
				asyn : false,
				type : "GET",
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
								html += '<input data-id="'
										+ info.id
										+ '" data-name="'
										+ info.proxyName
										+ '" class="proxy-check" type="checkbox">';
								html += '</label>';
								html += '</td>';
								html += '<td>' + strIsEmpty(info.entrustName)
										+ '</td>';
								html += '<td>' + strIsEmpty(info.proxyName)
										+ '</td>';
								html += '<td>' + strIsEmpty(info.goodsName)
										+ '</td>';
								html += '<td>' + strIsEmpty(info.lineName)
										+ '</td>';
								html += '<td>'
										+ strIsEmpty(info.forwardingUnit)
										+ '</td>';
								html += '<td>' + strIsEmpty(info.consignee)
										+ '</td>';
								html += '<td>'
										+ new Date(info.startDate)
												.Format("yyyy-MM-dd") + '</td>';
								html += '<td>' + strIsEmpty(info.unitPrice)
										+ '</td>';
								html += '</tr>';
							}
							$("#proxyListModal_tbody").html(html);
							// 设置物流总页面
							proxyPage
									.setTotalItems(data.transportPricePager.total);
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
/**
 * 处理空字符串
 * 
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
 * 企业货主派发
 */
function businessOwnerDistribute() {
	$.confirm({
		title : "提示",
		content : "是否确认变更所选车辆营运状态？",
		buttons : {
			'确认' : function() {
				// 请选择一条数据
				var selectlist = findAllCheck(".sub-waybill-check");
				if (selectlist.length == 0 || selectlist.length > 1) {
					xjValidate.showTip("请选择一条数据");
					return;
				}
				tempWaybillId = selectlist[0].id;

				if (ajaxing) {
					return false;
				}
				$.ajax({
					url : basePath + "/waybillInfo/businessOwnerDistribute",
					asyn : false,
					type : "POST",
					data : {
						"id" : tempWaybillId
					},
					dataType : "json",
					beforeSend : function() {
						ajaxing = true;
					},
					success : function(data) {
						ajaxing = false;
						if (data) {
							if (data.success) {
								waybillPage.setCurrentPage(waybillPage.options.current);
								xjValidate.showTip(data.msg);
							} else {
								xjValidate.showTip(data.msg);
							}
						} else {
							xjValidate.showTip("企业货主派发服务异常忙，请稍后重试");
						}
					},
					error : function() {
						ajaxing = false;
						xjValidate.showTip("企业货主派发服务异常忙，请稍后重试");
					},
					complete : function() {
						ajaxing = false;
					}
				});
			},
			'取消' : function() {
				
			}
		}
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
					getWaybillList();
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
 * 查询运单信息
 * @param waybillInfoId
 */
function getWaybillStatusById(waybillInfoId){
	var data = null;
	$.ajax({
		url : basePath + "/waybillInfo/waybillIsNew",
		async : false,
		type : "POST",
		data : { "id" : waybillInfoId },
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
		},
		complete:function(){ajaxing = false;}
	});
	return data;
}

/**
 * 打印
 */
function preview() {
	/*
	var selectlist = findAllCheck(".sub-waybill-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	var id = selectlist[0].id;
	*/
	var id = 0;
	window.location = 'showWaybillDetailPageForPrint?id='+id;

}

function valueIsEmpty(value){
	if (value == null || value == undefined || value == '') { 
		return true;
	} else {
		return false;
	}
}
