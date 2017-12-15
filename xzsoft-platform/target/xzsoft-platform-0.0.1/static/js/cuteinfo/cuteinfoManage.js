$(function(){
	//搜索
	searchCuteInfo(1);
	   //全选/全不选
    $("body").on("click", ".all_check", function () {
      if ($(".all_check").is(":checked")) {
        //全选时
        $(".sub_check").each(function () {
          $(this).prop("checked", true);
        });
      } else {
        //全不选时
        $(".sub_check").each(function () {
          $(this).prop("checked", false);
        });
      }
    });
    

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
	
});

/**
 * 分页查询
 * @author yuewei 2017年10月10日
 * @param number 页数
 */
function pagerGoto(number) {
	searchCuteInfo(number);
}


/**
 * 跳转到某页
 * @author yuewei 2017年10月10日
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
	
	searchOrgInfo(goPage);
}

/**
 * 根据页数查询结算单信息
 * @author yuewei 2017年10月10日
 * @param number 页数
 */
function searchCuteInfo(number){
	
	var settlementNo = $.trim($("#settlementNo").val()); //结算单编号
	var waybillNo = $.trim($("#waybillNo").val());//运单编号
	var checkStatus = $.trim($("#checkStatus").val());//数据检查状态
	var roadsheetStatus = $.trim($("#roadsheetStatus").val());//上报状态
	var forwardingTimeStart =$.trim($("#forwardingTimeStart").val()); //发货日期起始日期
	var forwardingTimeEnd =$.trim($("#forwardingTimeEnd").val());//发货日期结束日期
	var arriveTimeStart  =$.trim($("#arriveTimeStart").val()); //到货日期起始日期
	var arriveTimeEnd  =$.trim($("#arriveTimeEnd").val()); //到货日期结束日期

	//请求地址
	var url = basePath + "/cuteinfo/listCuteInfo #cunteinfo_info";
	$("#search_cuteinfo_info").load(url,
 		{
		"page" : number,
		"rows" : 10,
		"settlementNo" : settlementNo,
		"waybillNo" : waybillNo,
		"checkStatus" : checkStatus,
		"roadsheetStatus" : roadsheetStatus,
		"forwardingTimeStart" : forwardingTimeStart,
		"forwardingTimeEnd" : forwardingTimeEnd,
		"arriveTimeStart" : arriveTimeStart,
		"arriveTimeEnd" : arriveTimeEnd
	},
		function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
				  liveDrag:true, 
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging"
			});
		})
	}


/**
 * @author yuewei 2017年10月10日
 * 上报路单信息至无车承运人监测平台
 */
function reportRoadSheet() {
	// 获取选中的操作记录
	var settlementIds = findAllCheckedRoadSheetIds();
	if (settlementIds == undefined || settlementIds == "") {
		commonUtil.showPopup("提示", "请选择要上报的路单");
		return;
	}
	$.confirm({
		title : "提示",
		content : "是否确认上报？",
		buttons : {
			'确认' : function() {
				$(".main").showLoading();
				upRoadSheet(settlementIds); 
			},
			'取消' : function() {
			}
		}
	});
}


/**
 * 上报路单操作
 * @param waybillIds 运单ID
 * 
 * @returns
 */
function upRoadSheet(settlementIds) {
	$.ajax({
		url : basePath + "/cuteinfo/upRoadSheet",
		asyn : false,
		type : "POST",
		data : {
			"settlementIds" : settlementIds
		},
		dataType : "json",
		success : function(dataStr) {
			  $(".main").hideLoading();
			if (dataStr.result == 0) {
				commonUtil.showPopup("提示", dataStr.msg);
			}
			else if (dataStr.result == 1) {
				commonUtil.showPopup("提示", dataStr.msg);
				searchCuteInfo(1); //跳转到路单上报初始页面;
			}
			else {
				commonUtil.showPopup("提示", dataStr.msg);
			}

		},
		error : function() {
			  $(".main").hideLoading();
			commonUtil.showPopup("提示", "路单上报操作异常，请稍后重试");
		}
		
		
	});
}


/**
 * 获取所有选中的运单ID
 * @author yuewei 2017年10月10日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckedRoadSheetIds() {
	// 所有选中运单的ID
	var roadSheetIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			roadSheetIds.push($(this).attr("data-id"))
		}
	});
	return roadSheetIds.join(",");
}

