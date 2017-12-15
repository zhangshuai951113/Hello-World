$(function(){
	//搜索
	searchOutCarInfo(1);
});

/**
 * 分页查询
 * @author chengzhihuan 2017年6月2日
 * @param number 页数
 */
function pagerGoto(number) {
	searchOutCarInfo(number);
}

/**
 * 跳转到某页
 * @author chengzhihuan 2017年6月2日
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
	
	searchOutCarInfo(goPage);
}

/**
 * 根据页数查询合作伙伴车辆信息
 * @author chengzhihuan 2017年6月2日
 * @param number 页数
 */
function searchOutCarInfo(number){
	//车牌号码
	var carCode = $.trim($("#car_code").val());
	
	//车辆运营状态
	var operationStatus = $("#operation_status").val();
	
	//司机名称
	var driverName = $.trim($("#driver_name").val());
	
	//车辆类型
	var carType = $("#car_type").val();
	
	//请求地址
	var url = basePath + "/carInfo/listOutCarInfo #out_car_info";
	
	$("#search_out_car_info").load(url,{"page":number,"rows":10,"carCode":carCode,"operationStatus":operationStatus,
		"driverName":driverName,"carType":carType},function(){})
}
