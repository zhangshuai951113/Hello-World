// 请求是否正在进行中
var ajaxing = false;
$(function(){
	loadData();
});



/**
 * 加载数据
 */
function loadData(){
	//var data = getData();
	var resp = getTestData();
	console.log(resp);
	if (valueIsEmpty(resp)) {
		xjValidate.showTip("服务异常忙，请稍后重试");
	}
	if (!resp.success) {
		xjValidate.showTip(resp.msg);
	}
	
	// 将数据填充到表格中
	// 将数据安装组织id排序
	var data = resp.data;
	data.sort(compare('orgInfoId'));
	console.log(data);
	
}

function compare(property){
	return function(a,b){
    	var value1 = a[property];
    	var value2 = b[property];
    	return value1 - value2;
	}
}
/**
 * 从后台获取数据
 * 数据格式
 * [{
 * orgInfoId: 组织部门id
 * orgInfoName: 组织部门名称
 * projectInfoId: 项目id
 * projectInfoName: 项目名称
 * forwardingTonnageYear: 发货吨位年
 * arriveTonnageYear: 到货吨位年
 * costYear: 成本年
 * incomeYear: 收入年
 * forwardingTonnageMonth: 发货吨位月
 * arriveTonnageMonth: 到货吨位月
 * costMonth: 成本月
 * incomeMonth: 收入月
 * forwardingTonnageDay: 发货吨位日
 * arriveTonnageDay: 到货吨位日
 * costDay: 成本日
 * incomeDay: 收入日
 * profitYear: 利润年
 * profitMonth: 利润月
 * profitDay: 利润日
 * rateYear: 利率年
 * rateMonth: 利率月
 * rateDay: 利率日
 * },{
 * ......
 * }]
 */
function getData(){
	var data = null;
	var params = {};
	$.ajax({
		url : basePath + "/reportForm/getDataForProcAndOperStatPage",
		async : false,
		type : "POST",
		data : params,
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showTip("请求进行中，请稍候......");return false;}else{ajaxing=true;}
		},
		success : function(resp) {
			ajaxing = false;
			data = resp;
		},
		error:function(){ajaxing = false;xjValidate.showTip("服务请求失败");}
	});
	return data;
}


function getTestData(){
	var data = [{
		orgInfoId: 1,
		orgInfoName: '组织1',
		projectInfoId: 1,
		projectInfoName: '项目1',
		forwardingTonnageYear: 0,arriveTonnageYear: 0,costYear: 0,incomeYear: 0,
		forwardingTonnageMonth: 0, arriveTonnageMonth: 0,costMonth: 0,incomeMonth: 0,
		forwardingTonnageDay: 0,arriveTonnageDay: 0,costDay: 0,incomeDay: 0,
		profitYear: 0,profitMonth: 0,profitDay: 0,
		rateYear: 0,rateMonth: 0,rateDay: 0
	},{
		orgInfoId: 1,
		orgInfoName: '组织1',
		projectInfoId: 2,
		projectInfoName: '项目2',
		forwardingTonnageYear: 0,arriveTonnageYear: 0,costYear: 0,incomeYear: 0,
		forwardingTonnageMonth: 0, arriveTonnageMonth: 0,costMonth: 0,incomeMonth: 0,
		forwardingTonnageDay: 0,arriveTonnageDay: 0,costDay: 0,incomeDay: 0,
		profitYear: 0,profitMonth: 0,profitDay: 0,
		rateYear: 0,rateMonth: 0,rateDay: 0
	},{
		orgInfoId: 2,
		orgInfoName: '组织2',
		projectInfoId: 3,
		projectInfoName: '项目3',
		forwardingTonnageYear: 0,arriveTonnageYear: 0,costYear: 0,incomeYear: 0,
		forwardingTonnageMonth: 0, arriveTonnageMonth: 0,costMonth: 0,incomeMonth: 0,
		forwardingTonnageDay: 0,arriveTonnageDay: 0,costDay: 0,incomeDay: 0,
		profitYear: 0,profitMonth: 0,profitDay: 0,
		rateYear: 0,rateMonth: 0,rateDay: 0
	},{
		orgInfoId: 2,
		orgInfoName: '组织2',
		projectInfoId: 4,
		projectInfoName: '项目4',
		forwardingTonnageYear: 0,arriveTonnageYear: 0,costYear: 0,incomeYear: 0,
		forwardingTonnageMonth: 0, arriveTonnageMonth: 0,costMonth: 0,incomeMonth: 0,
		forwardingTonnageDay: 0,arriveTonnageDay: 0,costDay: 0,incomeDay: 0,
		profitYear: 0,profitMonth: 0,profitDay: 0,
		rateYear: 0,rateMonth: 0,rateDay: 0
	},{
		orgInfoId: 1,
		orgInfoName: '组织1',
		projectInfoId: 5,
		projectInfoName: '项目5',
		forwardingTonnageYear: 0,arriveTonnageYear: 0,costYear: 0,incomeYear: 0,
		forwardingTonnageMonth: 0, arriveTonnageMonth: 0,costMonth: 0,incomeMonth: 0,
		forwardingTonnageDay: 0,arriveTonnageDay: 0,costDay: 0,incomeDay: 0,
		profitYear: 0,profitMonth: 0,profitDay: 0,
		rateYear: 0,rateMonth: 0,rateDay: 0
	}];
	var json = {
		success : true,
		data : data
	};
	return json;
}
/**
 * 验证value是否为空，当flag为true时 ‘’视为有值
 * @param value
 * @param flag
 * @returns {Boolean}
 */
function valueIsEmpty(value,flag){
	if (flag) {
		if (value == null || value == undefined) {
			return true;
		}
	} else {
		if (value == null || value == '' || value == undefined) {
			return true;
		}
	}
	return false;
}