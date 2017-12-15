 
//初始化page
var waybillPage = null;
var linePage = null;
var driverPage = null;

var tempWaybillId = null;
var ajaxing = false;
(function($) {
	//初始化运单列表page页面
	waybillPage = $("#waybillPage").operationList({
		"current" : 1, //当前目标
		"maxSize" : 4, //前后最大列表
		"itemPage" : 10, //每页显示多少条
		"totalItems" : 0, //总条数
		"chagePage" : function(current) {
			//调用ajax请求拿最新数据
			getWaybillList();
		}
	});
	getWaybillList();
	//设置运单页面总条数

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
	}, 500)

	//允许运单表格拖着
	$("#tableDrag").colResizable({
		liveDrag : true,
		gripInnerHtml : "<div class='grip'></div>",
		draggingClass : "dragging",
		resizeMode: 'overflow'
	});

	//运单表格数据较多，增加滑动
	$(".iscroll").css("min-height", "55px");
	$(".iscroll").mCustomScrollbar({
		theme : "minimal-dark"
	});

})(jQuery);

/**
 *运单page页跳转
 */
function waybillPageSlect(e) {
	var value = $(e).prev().find('input').val();
	waybillPage.options.current = num;
	getWaybillList();
}

function resetEmpty() {
	$('#queryForm').reset()
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
	$("#lineInfoName").text(selectlist[0].name);
	$("#lineInfoId").val(selectlist[0].id);
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
				"name" : $(this).attr("data-name"),
				"rootWaybillInfoId" : $(this).attr("data-rootWaybillInfoId"),
			}
			checkList.push(params);
		}
	});
	return checkList;
}

/**
 * 获取运单信息
 */
function getWaybillList(){
	// 运单编号
	var waybillId = $.trim($("#waybillId").val());
	// 货物
	var goodsInfoName = $.trim($("#goodsInfoName").val());
	// 委托方
	var entrustName = $.trim($("#entrustName").val());
	// 司机名称
	var driverName = $.trim($("#driverName").val());
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
	// 角色 （1：承运方、2：委托方）
	var role = $.trim($("#role").val());
	
	var params = {
		"waybillId" : waybillId,
		"goodsInfoName" : goodsInfoName,
		"entrustName" : entrustName,
		"driverName" : driverName,
		"forwardingUnit" : forwardingUnit,
		"consignee" : consignee,
		"lineInfoId" : lineInfoId,
		"planTransportDate1" : planTransportDate1,
		"planTransportDate2" : planTransportDate2,
		"waybillStatus" : waybillStatus,
		"cooperateStatus" : cooperateStatus,
		"waybillClassify" : 1,
		"waybillType" : 2,
		"role":role,
		"page" : waybillPage.options.current,
		"rows" : waybillPage.options.itemPage
	};
	console.log(params);
	$.ajax({
		url : basePath + "/waybillInfo/getWaybillQueryData",
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
						html += '<input class="sub-auth-check" type="radio" data-id="'+info.id+'" data-rootWaybillInfoId="'+info.rootWaybillInfoId+'">';
						html += '</label>';
						html += '</td>';
						html += '<td><a onclick="showWaybillLinePage('+info.id+')">'+strIsEmpty(info.rootWaybillId)+'</a></td>';
						html += '<td>'+waybillStatusChange(info.waybillStatus)+'</td>';
						html += '<td>'+waybillTypeChange(info.waybillType)+'</td>';
						html += '<td>'+strIsEmpty(info.entrustName)+'</td>';
						html += '<td>'+strIsEmpty(info.shipperName)+'</td>';
						html += '<td>'+strIsEmpty(info.driverName)+'</td>';
						html += '<td>'+strIsEmpty(info.carCode)+'</td>';
						html += '<td>'+info.currentTransportPrice+'</td>';
						html += '<td>'+strIsEmpty(info.goodsName)+'</td>';
						html += '<td>'+strIsEmpty(info.lineName)+'</td>';
						html += '<td>'+strIsEmpty(info.forwardingUnit)+'</td>';
						html += '<td>'+strIsEmpty(info.consignee)+'</td>';
						html += '<td>'+dateChange(info.planTransportDate)+'</td>';
						html += '<td>'+dateChange(info.distributeTime)+'</td>';
						html += '<td>'+dateChange(info.driverReceiveTime)+'</td>';
						html += '<td>'+waybillClassifyChange(info.waybillClassify)+'</td>';
						html += '</tr>';
					}
					$("#waybillList_tbody").html(html);
					waybillPage.setTotalItems(data.count);
					$("#waybillNum").text(data.count);
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

/**
 * 查询运单数据
 * @param num
 */
function loadWaybillList(num){
	waybillPage.options.current = num;
	getWaybillList();
}
/**
 * 处理空字符串
 * @param str
 * @returns
 */
function strIsEmpty(str){
	if (str == null || str == undefined || str == '') {
		return '';
	} else {
		return str;
	}
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
// 运单分类（1：大宗货物运单 2：零散货物运单）
function waybillClassifyChange(temp){
	if (temp == 1){
		return '大宗货物运单';
	} else if (temp == 2) {
		return '零散货物运单';
	} else {
		return '';
	}
}
// 运单类型（1：物流运单 2：自营运单 3：代理运单 4：转包运单）大宗货物运单时使用
function waybillTypeChange(temp){
	if (temp == 1){
		return '物流运单';
	} else if (temp == 2) {
		return '自营运单';
	} else if (temp == 3) {
		return '代理运单';
	} else if (temp == 4) {
		return '转包运单';
	} else {
		return '零散货物运单';
	}
}

function dateChange(date){
	if (date == null || date == '' || date == undefined) {
		return '';
	} else {
		return new Date(date).Format("yyyy-MM-dd")
	}
}
/**
 * 查询线路信息
 */
function getLineList(){
	// 线路名称
	var lineInfoName = $.trim($("#lineSelectModal_lineInfoName").val());
	// 起点
	var startPoints = $.trim($("#lineSelectModal_startPoints").val());
	// 终点
	var endPoints = $.trim($("#lineSelectModal_endPoints").val());
	
	var params = {
		"lineInfoName" : lineInfoName,
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

/**
 * 跳转到运单轨迹界面
 * @param id 运单主键
 */
function showWaybillLinePage1(){
	// 请选择一条数据
	var selectlist = findAllCheck(".sub-auth-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	var id = selectlist[0].id;
	showWaybillLinePage(id);
}
/**
 * 跳转到运单轨迹界面
 * @param id 运单主键
 */
function showWaybillLinePage(id){
	// 查询运单数据
	$.ajax({
		url : basePath + "/waybillInfo/getWaybillById",
		async : false,
		type : "POST",
		data : {
			"id" : id
		},
		dataType : "json",
		success : function(data) {

			if (data) {
				if (data.success == true) {
					var info = data.data ;
					var waybillInfoId = info.id;
					var driverUserRole = info.driverUserRole;
					var userInfoId = info.userInfoId;
					var waybillStatus = info.waybillStatus;
					if (waybillStatus == 6 || waybillStatus == 7 || waybillStatus == 8 || 
							waybillStatus == 9 || waybillStatus == 10 || waybillStatus == 11) {
						
						if (driverUserRole == 1 || driverUserRole == 2) {
							window.location.href =basePath+"/waybillReadTimeTrajectory/initWaybillReadTimeTrajectory?waybillInfoId="+waybillInfoId+"&userInfoId="+userInfoId+"";
						} else {
							xjValidate.showTip("此运单不可进行运单跟踪操作");
						}
						
					} else {
						xjValidate.showTip("此运单还没有轨迹");
					}
					
					return false;
					
					
				}
			}
		},
		error : function() {
			xjValidate.showTip("服务请求失败");
		}
	});
}

/**
 * 查看附件
 */
function viewAttachment(){
	$("#unloadingDiv").empty();
	$("#unloadingDiv").html("");
	$("#loadingDiv").empty();
	$("#loadingDiv").html("");
	$("#onpassageDiv").empty();
	$("#onpassageDiv").html("");
	
	// 请选择一条数据
	var selectlist = findAllCheck(".sub-auth-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}


	var rootWaybillInfoId = selectlist[0].rootWaybillInfoId;

	//查看附件
	$.ajax({
    	url:basePath+"/settlementInfo/findEnclosure",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"rootWaybillInfoId":rootWaybillInfoId},
        dataType:'json',//数据传输格式：json
        beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
        success:function(data){
        	ajaxing = false;
        	var jsonAll = data;
        	var jsonLoading = jsonAll.loadingImgList;
        	var jsonOnpassage = jsonAll.onpassageImgList;
        	var jsonUnloading = jsonAll.unloadingImgList;
        	var imgUrl = "";
        	// 装货
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
	    		});
        	}
        	else{
        		imgUrl = basePath+"/static/images/common/timg.jpg";
        		$("#loadingDiv").append("<div class='group-img'>" +
    					"<div class='view-img'>" +
    					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
    					"</div>" +
    					"</div>" );
        	}
        	// 在途
        	if(jsonOnpassage != null && jsonOnpassage.length >0){
        		$.each(jsonOnpassage,function(i, val) {
        			if(val == "" || val == null){
        				imgUrl = basePath+"/static/images/common/timg.jpg";
        			}else{
        				imgUrl = fastdfsServer+"/"+val;
        			}
        			$("#onpassageDiv").append("<div class='group-img'>" +
        					"<div class='view-img'>" +
        					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
        					"</div>" +
        					"</div>" );
	    		});
        	}
        	else{
        		imgUrl = basePath+"/static/images/common/timg.jpg";
        		$("#onpassageDiv").append("<div class='group-img'>" +
    					"<div class='view-img'>" +
    					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
    					"</div>" +
    					"</div>" );
        	}
        	// 卸货
        	if(jsonUnloading != null  && jsonUnloading.length >0){
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
	    		});
        	}
        	else{
        		imgUrl = basePath+"/static/images/common/timg.jpg";
        		$("#unloadingDiv").append("<div class='group-img'>" +
    					"<div class='view-img'>" +
    					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
    					"</div>" +
    					"</div>" );
        	}
        	$("#lookDocModal").modal('show');
        },
        error:function(){xjValidate.showTip("服务请求失败");},
		complete:function(){ajaxing = false;}
    });
	
	//图片预览
	$('.view-img').viewer({
		title:false
	});
}

/**
 * 显示运单日志界面
 */
function showWaybillLog(){

	var selectlist = findAllCheck(".sub-auth-check");
	if (selectlist.length == 0 || selectlist.length > 1) {
		xjValidate.showTip("请选择一条数据");
		return;
	}
	var waybillInfoId = selectlist[0].id;
	$.ajax({
		url : basePath + "/waybillInfo/getWaybillLog",
		async : false,
		type : "POST",
		data : {"waybillInfoId":waybillInfoId},
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(resp) {
			ajaxing = false;
			console.log(resp);
			if (resp) {
				if (resp.success) {
					var list = resp.data;
					// 填充form表单数据
					var info = list[0];
					$("#waybillLog-goodName").val(strIsEmpty(info.goodsName));
					$("#waybillLog-lineName").val(strIsEmpty(info.lineName));
					$("#waybillLog-planTransportDate").val(dateChange(info.planTransportDate));
					$("#waybillLog-lineName").val(strIsEmpty(info.lineName));
					$("#waybillLog-forwardingUnit").val(strIsEmpty(info.forwardingUnit));
					$("#waybillLog-consignee").val(strIsEmpty(info.consignee));
					$("#waybillLog-currentStatus").val(waybillStatusChange(waybillStatus));
					// 填充表格数据
					var html = '';
					for(var i = 0; i < list.length; i++){
						var info = list[i];
						html += '<tr class="table-body ">';
						html += '<td>'+strIsEmpty(info.waybillId)+'</td>';
						html += '<td>'+strIsEmpty(info.entrustName)+'</td>';
						html += '<td>'+strIsEmpty(info.shipperName)+'</td>';
						html += '<td>'+strIsEmpty(info.driverName)+'</td>';
						
						html += '<td>'+dateChange(info.loadingDate)+'</td>';
						html += '<td></td>';
						html += '<td>'+dateChange(info.unloadingDate)+'</td>';
						html += '<td></td>';
						html += '<td>'+dateChange(info.createTime)+'</td>';

						html += '</tr>';
					}
					$("#waybillLogTbody").html(html);
					$("#waybillLog").modal('show');
					$("#waybillLogTable").colResizable({
						liveDrag : true,
						gripInnerHtml : "<div class='grip'></div>",
						draggingClass : "dragging"
					});
				} else {
					xjValidate.showTip(resp.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
			}
		},
		error:function(){ajaxing = false;xjValidate.showTip("服务请求失败");}
	});
}

/**
 * 显示运单轨迹
 * @param waybillInfoId
 */
function showWaybillLineModel(waybillInfoId){
	
	var resp = getWaybillById(waybillInfoId);
	
	if (resp) {
		if (resp.success == true) {
			var info = resp.data ;
			var waybillInfoId = info.id;
			var driverUserRole = info.driverUserRole;
			var userInfoId = info.userInfoId;
			var waybillStatus = info.waybillStatus;
			if (waybillStatus == 6 || waybillStatus == 7 || waybillStatus == 8 || 
					waybillStatus == 9 || waybillStatus == 10 || waybillStatus == 11) {
				if (driverUserRole == 1 || driverUserRole == 2) {
					$("#waybillInfoId").val(waybillInfoId);
	            	$("#userInfoId").val(userInfoId);
	            	drawWaybillLine();
				} else {
					xjValidate.showTip("此运单不可进行运单跟踪操作");
				}
				
			} else {
				xjValidate.showTip("此运单还没有轨迹");
				return false;
			}
		} else {
			xjValidate.showTip(resp.msg);
			return false;
		}
	} else {
		xjValidate.showTip("服务请求失败");
		return false;
	}
	
	
	
}


function getWaybillById(id){
	var data = null;
	// 查询运单数据
	$.ajax({
		url : basePath + "/waybillInfo/getWaybillById",
		async : false,
		type : "POST",
		data : { "id" : waybillInfoId },
		dataType : "json",
		beforeSend:function(){if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}},
		success : function(resp) {ajaxing = false;data = resp;},
		error:function(){ajaxing = false;xjValidate.showTip("服务请求失败");},
	});
	return data;
}

function drawWaybillLine(){
	var realtimeMap = function(){
		var map, //百度地图对象
	    	car, //汽车图标
	    	lushu,
	    	centerPoint,
	    	timer, //定时器
	    	index = 0, //记录播放到第几个point
	    	points = [],//获取目标包括当前之前的所有坐标
	    	pointsArr = [];//数据源
		return {
			init: function(){
				this.initDoneMap();
			},
			
			initDoneMap: function() {
				var waybillInfoId = $("#waybillInfoId").val();
	        	var userInfoId = $("#userInfoId").val();
				var _this = this;
				$.ajax({
	         		url: basePath+"/waybillReadTimeTrajectory/showWaybillHistoryTrajectory",
	         		type: "POST",
	         		data : {"waybillInfoId":waybillInfoId,"userInfoId":userInfoId},
	         		success: function(data){
	         			 if(data){
	         				var doneMapArr = [];
	         				 if(data.historyTrajectoryList){
	         					$.each(data.historyTrajectoryList,function(j, val){
	         						doneMapArr.push(new BMap.Point(val.locationLongitude,val.locationLatitude));
	         					});
	         					console.log(doneMapArr)
	         					var lastLength = data.historyTrajectoryList.length-1;
	         					//起点经度
	         					var firstLng = data.historyTrajectoryList[lastLength].locationLongitude;
	         					$("#firstLng").val(firstLng);
	         					//起点纬度
	         					var firstLat = data.historyTrajectoryList[lastLength].locationLatitude;
	         					$("#firstLat").val(firstLat);
	         					//取最后一条数据的创建时间
	         					$("#createTime").val(format(new Date(data.historyTrajectoryList[lastLength].createTime).toString(),'yyyy-MM-dd HH:mm:ss'));
	         					//初始化地图,选取第一个点为起始点
	         		            map = new BMap.Map('container');
	         		            map.setViewport(doneMapArr);
	         		            //设置地图级别
	         		            map.centerAndZoom(doneMapArr[0], 10);
	         		            map.enableScrollWheelZoom();
	         		            map.addControl(new BMap.NavigationControl());
	         		            map.addControl(new BMap.ScaleControl());
	         		            map.addControl(new BMap.OverviewMapControl({ isOpen: true }));

	         			        //画面移动到起点和终点的中间
	         			        centerPoint = new BMap.Point((doneMapArr[0].lng + doneMapArr[doneMapArr.length - 1].lng) / 2, (doneMapArr[0].lat + doneMapArr[doneMapArr.length - 1].lat) / 2);
	         			        map.panTo(centerPoint);
	         			        map.addOverlay(new BMap.Polyline(doneMapArr, { strokeColor: '#7fde8a', strokeWeight: 5, strokeOpacity: 1 }));
	         			        _this.initData(firstLng,firstLat);
	         			        _this.initMap();
	         				 }
	         			 }
	         		}
	         	});
	        },
	        
			/**此处为数据源，以后换为ajax获取**/
			initData: function(firstLng,firstLat){
				//获取所有点的坐标
			    points = [//初始数据，至少有一个点，越多越好
			        new BMap.Point(firstLng,firstLat)
			    ];

			},

			initMap: function(){
				var _this = this,
					i = 0;
		        //初始化地图,选取第一个点为起始点
	            
	            lushu = new BMapLib.LuShu(map,points,{
		            defaultContent: '',
		            autoView: true,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
		            icon: new BMap.Icon(basePath+"/static/images/carTrajectory/car.png", new BMap.Size(50,42),{anchor : new BMap.Size(27, 13)}),
		            speed: 1000,
		            enableRotation: true,//是否设置marker随着道路的走向进行旋转
		            landmarkPois: [
		              
		            ],
		            getPath: function(){
		            	var waybillInfoId = $("#waybillInfoId").val();
		            	var userInfoId = $("#userInfoId").val();
		            	var locationLongitude = $("#lastLng").val();
		            	var locationLatitude = $("#lastLat").val();
		            	var createTime = $("#createTime").val();
		             	$.ajax({
		             		url: basePath+"/waybillReadTimeTrajectory/showWaybillReadTimeTrajectory",
		             		type: "POST",
		             		async: false,
		             		data : {"waybillInfoId":waybillInfoId,"userInfoId":userInfoId,"locationLongitude":locationLongitude,
		             			"locationLatitude":locationLatitude,"createTime":createTime},
		             		success: function(data){
		             			 if(data){
		             				 var pointsArr = [];
		             				 if(data.currentTrajectoryList){
		             					var i = 0;
		             					var firstLng = $("#firstLng").val();
		             					var firstLat = $("#firstLat").val();
		             					pointsArr.push(new BMap.Point(firstLng,firstLat));
		             					$.each(data.currentTrajectoryList,function(j, val){
		             						 i++;
		             						 pointsArr.push(new BMap.Point(val.locationLongitude,val.locationLatitude));
		             					});
		             					var lastLength = data.currentTrajectoryList.length-1;
	            						$("#createTime").val(format(new Date(data.currentTrajectoryList[lastLength].createTime).toString(),'yyyy-MM-dd HH:mm:ss'));
	            						$("#firstLng").val(data.currentTrajectoryList[lastLength].locationLongitude);
	            						$("#firstLat").val(data.currentTrajectoryList[lastLength].locationLatitude);
		             				 }
		             				 lushu._path = pointsArr;
		             				 lushu.success = data.success;
		             			 }
		             		}
		             	});
		            }
		        }); 
				
	            lushu.start(); 
			}
		};
	}();
	realtimeMap.init();
}
/**
 * @author zhangxuanbin
 * @time 20170817
 * @desc 该功能依靠百度地图api，实时获取服务器端目标坐标，并绘制实时轨迹
 **/


//时间戳转化成固定日期格式
var format = function(time, format){
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
    });
}

