//车辆信息查询
function carList(number) {
	//车牌号码
	var carCode = $.trim($("#ci_car_code").val());
	
	$("#carTBody").html("");
	$.ajax({
		url : "getCarData",
		data : {
			'carCode' : carCode,
			'page' : number,
			'rows' : 10
		},
		dataType : "json",
		type : "post",
		async : false,
		success : function(resp) {
			var objs = eval(resp);
			$.each(objs, function(index, ele) {
				// 追加数据
				var tr = "";
				tr += "<tr class='table-body' align='center'>";
				tr+="<td><input type='checkbox' class='sub_car_check' carInfoId="+ele.id+" carCodeName="+ele.carCode+" carType="+ele.carType+" carTypeName="+ele.carTypeName+" loads="+ele.checkLoad+" gabarite="+ele.gabarite+"></td>";
				tr += "<td>" + ele.carCode + "</td>";
				tr += "<td>" + ele.carTypeName + "</td>";
				tr += "<td>" + ele.checkLoad + "</td>";
				tr += "<td>" + ele.gabarite + "</td>";

				// 将tr追加
				$("#carTBody").append(tr);

			});
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url : "getCarCount",
		type : "post",
		data : {},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			carPagination.setTotalItems(resp);
			$("#panel-num-car").text("搜索结果共" + resp + "条");
		}
	});

}

// 分页
var carPagination = $(".pagination-list-car").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		carList(current);
	}
});

function carJumpPage(e) {
	var totalPage = parseInt((parent.getTotalRecords + 9) / 10);
	var myreg = /^[0-9]+.?[0-9]*$/;
	var re = new RegExp(myreg);
	var number = $(e).prev().find('input').val();
	if (!re.test(number)) {
		commonUtil.showPopup("提示", "请输入正确的数字!");
		$(e).prev().find('input').val("");
		return false;
	}
	var value = parseInt(number);
	if (value < 1) {
		$(e).prev().find('input').val("1")
		value = 1;
	}
	if (value >= totalPage) {
		$(e).prev().find('input').val(totalPage);
		value = totalPage;
	}
	carPagination.setCurrentPage(value);
}

