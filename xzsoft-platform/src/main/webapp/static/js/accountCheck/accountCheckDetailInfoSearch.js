// 分页
var detailPagination = $(".detail-pagination-list").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		accountCheckDetailList(current);
	}
});
//对账明细信息查询
//对账主ID
var accountCheckInfoId ="";
function accountCheckDetailList(number) {
	$("#detailTBody").html("");
	$.ajax({
		url : "getAccountCheckDetailData",
		data : {
			'page' : number,
			'accountCheckInfoId' : accountCheckInfoId,
			'rows' : 10
		},
		dataType : "json",
		type : "post",
		async : false,
		success : function(resp) {
			var objs = eval(resp);
			$.each(objs, function(index, ele) {
				var shipperName =ele.shipperName;
				if(shipperName == null){
					shipperName ="";
				}
				// 追加数据
				var tr = "";
				tr += "<tr class='table-body' align='center'>";
				tr += "<td style='width: 40px;'><label class='i-checks'> <input type='checkbox' class='sub_detail_check' data-id="+ele.id+"></label></td>";
				tr += "<td>" + ele.settlementId  + "</td>";
				tr += "<td>" + ele.waybillId  + "</td>";
				tr += "<td>" + ele.carCode  + "</td>";
				tr += "<td>" + ele.entrustName + "</td>";
				tr += "<td>" + shipperName + "</td>";
				tr += "<td>" + ele.goodsName + "</td>";
				tr += "<td>" + ele.scatteredGoods + "</td>";
				tr += "<td>" + ele.lineName + "</td>";
				tr += "<td>" + ele.forwardingUnit + "</td>";
				tr += "<td>" + ele.consignee + "</td>";
				tr += "<td>" + ele.customerPrice + "</td>";
				tr += "<td>" + ele.payablePrice + "</td>";
				tr += "<td>" + ele.proxyInvoiceTotal + "</td>";
				// 将tr追加
				$("#detailTBody").append(tr);
			});
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url : "getAccountCheckDetailCount",
		type : "post",
		data : {"accountCheckInfoId":accountCheckInfoId},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			detailPagination.setTotalItems(resp);
			$("#detailNum").text(resp);
		}
	});
	
}



function detailJumpPage(e) {
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
	detailPagination.setCurrentPage(value);
}
//对账单明细信息accountCheckInfoId
function detailWinShow(accountCheckId) {
	$("#detailModal").modal("show");
	$(".all_detail_check").prop("checked", false);
	accountCheckInfoId = accountCheckId;
	accountCheckDetailList(1);
	//允许表格拖着
	setTimeout(function() {
		$("#accountDetailSettlementTable").colResizable({
		  resizeMode: 'overflow',
		  liveDrag:true, 
		  gripInnerHtml:"<div class='grip'></div>", 
		  draggingClass:"dragging"
		});
    },500);
	
}

//全选/全不选
$("body").on("click", ".all_detail_check", function() {
	if ($(".all_detail_check").is(":checked")) {
		// 全选时
		$(".sub_detail_check").each(function() {
			$(this).prop("checked", true);
		});
	} else {
		// 全不选时
		$(".sub_detail_check").each(function() {
			$(this).prop("checked", false);
		});
	}
});

// 部分选择判断
$("body").on("click", ".sub_detail_check", function() {
	var isAll = true;
	$(".sub_detail_check").each(function() {
		if ($(this).is(":checked")) {
			$(this).prop("checked", true);
		} else {
			$(this).prop("checked", false);
		}
		if (!$(this).prop("checked")) {
			isAll = false;
		}
	});
	$(".all_detail_check").prop("checked", isAll);
});

/**
 * 获取所有选中的对账信息ID
 */
function findAllCheckAccountCheckDetailInfoIds() {
	// 所有选中对账明细信息ID
	var accountCheckDetailInfoIds = new Array();
	$(".sub_detail_check").each(function() {
		if ($(this).is(":checked")) {
			accountCheckDetailInfoIds.push($(this).attr("data-id"))
		}
	});
	return accountCheckDetailInfoIds.join(",");
}

/**
 * 删除对账单明细
 */
function deleteAllCheckedAccountDetailInfo(){
	//获取选中的对账明细信息ID
	var accountCheckDetailInfoIds = findAllCheckAccountCheckDetailInfoIds();
	// 获取选中的操作记录
	if (accountCheckDetailInfoIds == undefined || accountCheckDetailInfoIds == "") {
		commonUtil.showPopup("提示", "请选择要删除的对账明细信息！");
		return;
	}
	
	$.confirm({
		title : "提示",
		content : "是否确认删除所选对账明细信息？",
		buttons : {
			'确认' : function() {
				$.ajax({
					url : basePath + "/accountCheckInfo/deleteAccountCheckDetailInfo",
					asyn : false,
					type : "POST",
					data : {
						"accountCheckDetailInfoIds" : accountCheckDetailInfoIds
					},
					dataType : "json",
					success : function(dataStr) {
						if (dataStr) {
							if (dataStr.success) {
									commonUtil.showPopup("提示", dataStr.msg);
									//数据刷新
									accountCheckDetailList(1);
									searchAccountCheckInfo(1);
							} else {
								commonUtil.showPopup("提示", dataStr.msg);
								return;
							}
						} else {
							commonUtil.showPopup("提示", "删除对账明细信息服务异常忙，请稍后重试");
							return;
						}
					}
				});
			},
			'取消' : function() {
			}
		}
	});
	
}

//日期格式转化
Date.prototype.format = function(fmt) { 
    var o = { 
       "M+" : this.getMonth()+1,                 //月份 
       "d+" : this.getDate(),                    //日 
       "h+" : this.getHours(),                   //小时 
       "m+" : this.getMinutes(),                 //分 
       "s+" : this.getSeconds(),                 //秒 
       "q+" : Math.floor((this.getMonth()+3)/3), //季度 
       "S"  : this.getMilliseconds()             //毫秒 
   }; 
   if(/(y+)/.test(fmt)) {
           fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
   }
    for(var k in o) {
       if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
   return fmt; 
} 