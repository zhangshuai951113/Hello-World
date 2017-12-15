//报价方查询
var biddingDetailId = null;
function bidderList(number) {
	$("#bidderTBody").html("");
	$.ajax({url : basePath + "/biddingDetailInfo/getOfferInfoData",
		data : {
			'page' : number,
			'bidderName' : $("#bidderNameQuery").val(),
			'biddingDetailInfoId' : biddingDetailId,
			'rows' : 10
		},
		dataType : "json",
		type : "post",
		async : false,
		success : function(resp) {
			var objs = eval(resp);
			$.each(objs,function(index, ele) {
				
//				1:企业货主  2:物流公司  3:个体货主  4:司机
				var offerRole ="无";
				if(ele.offerRole ==1){
					offerRole ="企业货主";
				}else if (ele.offerRole ==2){
					offerRole ="物流公司";
				}else if (ele.offerRole ==3){
					offerRole ="个体货主";
				}else if (ele.offerRole ==4){
					offerRole ="司机";
				}
						// 追加数据
						var tr = "";
						tr += "<tr class='table-body' align='center'>";
						tr += "<td><input type='checkbox' class='sub_bidder_check' offerId=" + ele.id + " offerId=" 
								+ ele.id + " offerId=" + ele.id + " offerId=" + ele.id + "></td>";
						tr += "<td>" + ele.offerOrgInfoName + "</td>";
						tr += "<td>" + offerRole + "</td>";
						tr += "<td>" + ele.transportPrice + "</td>";
						tr += "<td>" + ele.reasonableLossRatio + "</td>";
						tr += "<td>" + ele.lossDeductionPrice + "</td>";
						tr += "<td>" + ele.lossDeductionPrice + "</td>";
						tr += "<td>" + ele.quotationDescription + "</td>";

						// 将tr追加
						$("#bidderTBody").append(tr);

					});
				}
			});
	// 获取最大数据记录数
	$.ajax({
		url : basePath + "/biddingDetailInfo/getOfferInfoCount",
		type : "post",
		data : {
			'bidderName' : $("#bidderNameQuery").val(),
			'biddingDetailInfoId' : biddingDetailId
		},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			bidderPagination.setTotalItems(resp);
			$("#bidderAmount").text(resp);
		}
	});

}

// 分页
var bidderPagination = $("#pagination-list-bidder").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		bidderList(current);
	}
});

function bidderJumpPage(e) {
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
	bidderPagination.setCurrentPage(value);
}

/**
 * 报价信息列表
 */
function biddersShow() {
	$("#bidderSelectModal").modal('show');
	bidderList(1);
}

// 设置项目列表单选模式
$("body").on("click", ".sub_bidder_check", function() {
	var isChecked = $(this).is(":checked");
	$(".sub_bidder_check").prop("checked", false);
	if (isChecked) {
		$(this).prop("checked", isChecked);
	} else {
		$(this).prop("checked", isChecked);
	}
});

// 确认中标方
function bidderSelect() {
	var hasChecked = false;
	$(".sub_bidder_check").each(function() {
		if ($(this).is(":checked")) {
			var selectedOfferId = $(this).attr("offerId");
			
			$.ajax({
				url : basePath + "/biddingDetailInfo/confirmWinBidder",
				type : "post",
				data : {
					'offerId' : selectedOfferId
				},
				dataType : "json",
				async : false,
				success : function(dataStr) {
					if (dataStr) {
						if (dataStr.success) {
							$("#bidderSelectModal").modal("hide");
							commonUtil.showPopup("提示", dataStr.msg);
							// 刷新数据
							searchBiddingDetailInfo(1);
						} else {
							commonUtil.showPopup("提示", dataStr.msg);
							return;
						}
					} else {
						commonUtil.showPopup("提示", "确认中标方服务异常忙，请稍后重试");
						return;
					}
				}
			});

			hasChecked = true;
			return false;
		}
	});
	if (!hasChecked) {
		commonUtil.showPopup("提示", "请选择中标单位!");
		return;
	}
}