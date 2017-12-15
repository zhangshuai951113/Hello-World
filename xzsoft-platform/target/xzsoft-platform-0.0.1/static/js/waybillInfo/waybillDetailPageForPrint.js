
(function($) {
	//初始化运单列表page页面
	
	
	
})(jQuery);




//计划类型（1：物流计划 2：自营计划）
function plan_planType(temp){
	if (temp == 1){
		return '物流计划';
	} else if (temp == 2) {
		return '自营计划';
	} else {
		return '';
	}
}
// 计划状态（1：新建 2：审核中 3：审核通过 4：审核驳回 5：已派发 6：已撤回）
function plan_planStatus(temp){
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
function planCooperateStatus(temp){
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


function doPrint() {
	
	bdhtml = window.document.body.innerHTML;// 获取当前页的html代码

	prnhtml = $("#printBody").html();

	window.document.body.innerHTML = prnhtml;
	window.print();
	window.document.body.innerHTML = bdhtml;
}

function fanhui(){
	window.history.back();
	//window.location = 'showWaybillDetailPageForPrint?id=';
}
