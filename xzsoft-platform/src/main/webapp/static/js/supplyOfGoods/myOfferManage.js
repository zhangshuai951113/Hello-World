$(function(){
	searchMyOfferInfo(1);
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
	//线路插件
  $("#line_name_start").lineSelect();
  $("#line_name_end").lineSelect();
})

/**
 * 重置搜索栏
 * 
 * @author liumin
 */
function resetEmpty() {
  //清除重置线路
  $(".select-address").empty();
  $(".select-address").siblings("input").val("");
}

/**
 * 分页查询
 * @author luojaun 2017年6月26日
 * @param number 页数
 */
function pagerGoto(number) {
	searchMyOfferInfo(number);
}

/**
 * 跳转到某页
 * @author luojaun 2017年6月27日
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
	
	searchMyOfferInfo(goPage);
}

/**
 * 我的报价查询(分页)
 * 
 * @author luojaun 2017年6月27日
 * @param number 页数
 */
function searchMyOfferInfo(number){

	//货物
	var goodsInfoId = $.trim($("#s_goods_info_id").val());
	
	//委托方
	var entrust = $.trim($("#s_entrust").val());
	
	//发货单位
	var forwardingUnit = $.trim($("#s_forwarding_unit").val());
	
	//到货单位
	var consignee = $.trim($("#s_consignee").val());
	
	//计划拉运日期Start
	var planTransportDateStart = $.trim($("#plan_transport_date_start").val());
	
	//计划拉运日期End
	var planTransportDateEnd = $.trim($("#plan_transport_date_end").val());
	
	//线路Start
	var lineNameStart = $.trim($("#line_id_start").val());
	
	//线路End
	var lineNameEnd = $.trim($("#line_id_end").val());
	
	//运单状态
	var waybillStatus = $.trim($("#waybill_status").val());
	
	//是否中标
	var isBid = $.trim($("#is_bid").val());
	
	//请求地址
	var url = basePath + "/supplyOfGoods/showMyOfferlistPage #my-offer-info-data";
	$("#search-my-offer-info").load(url,
		{"page":number,"rows":10,
		"goodsInfoId":goodsInfoId,
		"entrust":entrust,
		"forwardingUnit":forwardingUnit,
		"consignee":consignee,
		"planTransportDateStart":planTransportDateStart,
		"planTransportDateEnd":planTransportDateEnd,
		"lineNameStart":lineNameStart,
		"lineNameEnd":lineNameEnd,
		"waybillStatus":waybillStatus,
		"isBid":isBid},
		function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
			  liveDrag:true,
			  partialRefresh:true,
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging"
			});
			
			//据较多，增加滑动
		  $(".iscroll").css("min-height", "55px");
		  $(".iscroll").mCustomScrollbar({
		    theme: "minimal-dark"
		  });
		})
}