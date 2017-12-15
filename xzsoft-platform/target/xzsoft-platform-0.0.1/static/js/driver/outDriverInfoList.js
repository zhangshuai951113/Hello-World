$(function(){
	//搜索
	searchOutDriverInfo(1);
});

/**
 * 分页查询
 * @author chengzhihuan 2017年6月2日
 * @param number 页数
 */
function pagerGoto(number) {
	searchOutDriverInfo(number);
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
	
	searchOutDriverInfo(goPage);
}

/**
 * 根据页数查询合作伙伴司机信息
 * @author chengzhihuan 2017年6月2日
 * @param number 页数
 */
function searchOutDriverInfo(number){
	//司机名称
	var driverName = $.trim($("#driver_name").val());
	
	//手机号
	var mobilePhone = $("#mobile_phone").val();
	
	//请求地址
	var url = basePath + "/driverInfo/listOutDriverInfo #out_driver_info";
	
	$("#search_out_driver_info").load(url,{"page":number,"rows":10,"driverName":driverName,"mobilePhone":mobilePhone},function(){})
}
