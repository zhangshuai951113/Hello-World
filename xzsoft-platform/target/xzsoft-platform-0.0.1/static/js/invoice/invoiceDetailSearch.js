//发票明细表分页查询
function invoiceDetailList(number,invoiceInfoId) {

	$("#accountTBody").html("");
	$.ajax({
		url : "findInvoiceDetailInfo",
		data : {
			'invoiceInfoId':invoiceInfoId,
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
				tr+="<td><input type='checkbox' class='sub_invoice_detail_check' accountCheckInfoId="+ele.id+" confirmPrice="+ele.confirmPrice
				+" confirmArriveTonnage="+ele.confirmArriveTonnage+" confirmLossTonnage="+ele.confirmLossTonnage+" confirmOutCar="+ele.confirmOutCar
				+" confirmForwardingTonnage="+ele.confirmForwardingTonnage+" lossDifference="+ele.lossDifference+" otherDifference="+ele.otherDifference
				+" incomeTaxRate="+ele.incomeTaxRate+" differenceIncome="+ele.differenceIncome+" receivableTotal="+ele.receivableTotal
				+" payableTotal="+ele.payableTotal+" proxyInvoiceTotal="+ele.proxyInvoiceTotal+" outCar="+ele.outCar
				+" documentsTotal="+ele.documentsTotal+" makeUser="+ele.makeUser+"></td>";
				tr += "<td>" + ele.id + "</td>";
				tr += "<td>" + ele.confirmPrice + "</td>";
				tr += "<td>" + ele.confirmArriveTonnage + "</td>";
				tr += "<td>" + ele.confirmLossTonnage + "</td>";
				tr += "<td>" + ele.confirmOutCar + "</td>";
				tr += "<td>" + ele.confirmForwardingTonnage + "</td>";
				tr += "<td>" + ele.lossDifference + "</td>";
				tr += "<td>" + ele.otherDifference + "</td>";
				tr += "<td>" + ele.incomeTaxRate + "</td>";
				tr += "<td>" + ele.differenceIncome + "</td>";
				tr += "<td>" + ele.receivableTotal + "</td>";
				tr += "<td>" + ele.payableTotal + "</td>";
				tr += "<td>" + ele.proxyInvoiceTotal + "</td>";
				tr += "<td>" + ele.outCar + "</td>";
				tr += "<td>" + ele.documentsTotal + "</td>";
				// 将tr追加
				$("#accountTBody").append(tr);
				//图片预览
				$('td img').viewer({
					title:false
				});
			});
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url : "getInvoiceDetailInfoCount",
		type : "post",
		data : {'invoiceInfoId':invoiceInfoId},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			projectPagination.setTotalItems(resp);
			$("#panel-num-account").text("搜索结果共" + resp + "条");
		}
	});

}

// 分页
var projectPagination = $(".pagination-list-account").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		invoiceDetailList(current);
	}
});

function projectJumpPage(e) {
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
	projectPagination.setCurrentPage(value);
}

