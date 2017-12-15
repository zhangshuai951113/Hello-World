$(function(){
	//搜索
	searchOrgInfo(1);
});

/**
 * 分页查询
 * @param number 页数
 */
function pagerGoto(number) {
	searchOrgInfo(number);
}


/**
 * 跳转到某页
 */
function btnPagerGoto() {
	//取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	//取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	//数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		alert("请输出正确的数字");
		return;
	}
	
	//跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	
	searchOrgInfo(goPage);
}

/**
 * 根据页数查询机构
 * @param number
 */
function searchOrgInfo(number){
	//组织名称
	var orgName = $.trim($("#orgName").val());
	//统一社会信用代码
	var creditCode = $.trim($("#creditCode").val());
	//启用状态
	var isAvailable = $("#isAvailable").val();
	//组织类型
	var orgType = $("#orgType").val();
	//审核状态
	var orgStatus = $("#orgStatus").val();

	//请求地址
	var url = basePath + "/orgInfo/listOrgInfo #org_info";
	$("#search_org_info").load(url,{"page":number,"rows":10,"orgName":orgName,"creditCode":creditCode,
								"isAvailable":isAvailable,"orgType":orgType,"orgStatus":orgStatus},function(){})

								
}

var pagination = $(".pagination-list").operationList({
  "current":1,    //当前目标
  "maxSize":4,  //前后最大列表
  "itemPage":10,  //每页显示多少条
  "totalItems":19,  //总条数
  "chagePage":function(current){
    //调用ajax请求拿最新数据
      console.log(current); 
  }
});

function jumpPage(e) {
  var value = $(e).prev().find('input').val();
  pagination.setCurrentPage(value);
}
