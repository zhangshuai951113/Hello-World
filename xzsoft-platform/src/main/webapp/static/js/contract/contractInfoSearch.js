//合同日志查询
function contractInfoList(number) {
	$("#contractTBody").html("");
	$.ajax({url : "getContractInfoData",
				data : {
					'page' : number,
					"contractName":$("#contractNameQuery").val(),
					'rows' : 10
				},
				dataType : "json",
				type : "post",
				async : false,
				success : function(resp) {
					var objs = eval(resp);
					$.each(objs,function(index, ele) {

						// 业务类型名称
						var businessType = "";
						if (ele.businessType == 1) {
							businessType = "运输";
						} else if (ele.businessType == 2) {
							businessType = "采购";
						} else {
							businessType = "其它";
						}
						// 币种
						var currencyName = "";
						if (ele.currency == 1) {
							currencyName = "人民币";
						} else if (ele.currency == 2) {
							currencyName = "美元";
						} else {
							currencyName = "欧元";
						}
						// 合同类型名称
						var contractType = "";
						if (ele.contractType == 1) {
							contractType = "运输合同";
						} else if (ele.contractType == 2) {
							contractType = "框架协议合同";
						}
						// 运输方式名称
						var transportMode = "";
						if (ele.transportMode == 1) {
							transportMode = "铁路运输";
						} else if (ele.transportMode == 2) {
							transportMode = "公路运输";
						} else if (ele.transportMode == 3) {
							transportMode = "水上运输";
						} else if (ele.transportMode == 4) {
							transportMode = "航空运输";
						} else if (ele.transportMode == 5) {
							transportMode = "管道运输";
						}

						// 合同编号显示 （物流合同显示物流合同编号，转包合同显示转包合同编号）
//						var contractCode = "";
//						if (ele.contractClassify == 1) {
//							// 物流合同
//							contractCode = ele.contractCode;
//						} else if (ele.contractClassify == 2) {
//							// 转包合同
//							contractCode = ele.subContractCode;
//						}

						// 追加数据
						var tr = "";
						tr += "<tr class='table-body' align='center'>";
						tr += "<td><input type='checkbox' class='sub_contract_check' contractInfoId="
								+ ele.id
								+ " contractName="
								+ ele.contractName
								+ " contractCode="
								+ ele.contractCode
								+ " contractClassify="
								+ ele.contractClassify
								+ " shipperOrgRootName="
								+ ele.shipperOrgRootName
								+ " shipperOrgRoot="
								+ ele.shipperOrgRoot
								+ " shipperName="
								+ ele.shipperName
								+ " shipper="
								+ ele.shipper
								+ " shipperAuthorizePerson="
								+ ele.shipperAuthorizePerson
								+ " currency="
								+ ele.currency
								+ " contractType="
								+ ele.contractType
								+ " transportMode="
								+ ele.transportMode
								+ " shipperProject="
								+ ele.shipperProject
								+ " shipperProjectName="
								+ ele.shipperProjectName
								+ " contractClause="
								+ ele.contractClause
								+ "></td>";
						tr += "<td>" + ele.contractName
								+ "</td>";
						tr += "<td >" + ele.contractCode + "</td>";
						tr += "<td>" + ele.shipperName
								+ "</td>";
						tr += "<td>"
								+ ele.shipperAuthorizePerson
								+ "</td>";
						tr += "<td>" + currencyName + "</td>";
						tr += "<td>" + businessType + "</td>";
						tr += "<td>" + contractType + "</td>";
						tr += "<td>" + transportMode + "</td>";
						tr += "<td>" + ele.shipperProjectName
								+ "</td>";
						tr += "<td>" + ele.contractClause
								+ "</td>";

						// 将tr追加
						$("#contractTBody").append(tr);

					});
				}
			});
	// 获取最大数据记录数
	$.ajax({
		url : "getContractInfoCount",
		type : "post",
		data : {"contractName":$("#contractNameQuery").val()},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			contractPagination.setTotalItems(resp);
			$("#contractNum").text(resp);
		}
	});

}

// 分页
var contractPagination = $("#contractPage").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		contractInfoList(current);
	}
});

function contractJumpPage(e) {
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
	contractPagination.setCurrentPage(value);
}

function contractWinShow() {
	$("#contractSelectModal").modal("show");
	contractInfoList(1);
}

// 绑定合同选择列表
$("body").on("click", ".sub_contract_check", function() {
	// 获取当前选中的状态
	var isChecked = $(this).is(":checked");
	$(".sub_contract_check").prop("checked", false);
	if (isChecked) {
		$(this).prop("checked", isChecked);
	} else {
		$(this).prop("checked", isChecked);
	}
});

// 合同选择确认

function contractSelect() {
	$(".sub_contract_check").each(
			function() {
				if ($(this).is(":checked")) {
//					if ($(this).attr("contractClassify") == 1) {
//						// 物流合同
						$("#sub_contract_code").val($(this).attr("contractCode"));
//					} else {
//						// 转包合同
//						$("#contract_code").val($(this).attr("subContractCode"));
//					}
					$("#entrust_org_root").val($(this).attr("shipperOrgRootName"));
					$("#entrust_name").val($(this).attr("shipperName"));
					$("#entrust").val($(this).attr("shipper"));
					$("#entrust_authorize_person").val($(this).attr("shipperAuthorizePerson"));
					$("#currency").val($(this).attr("currency"));
					$("#contract_type").val($(this).attr("contractType"));
					$("#transport_mode").val($(this).attr("transportMode"));
					$("#contract_clause").val($(this).attr("contractClause"));
					$("#_entrust_project_name").val($(this).attr("shipperProjectName"));
					$("#entrust_project").val($(this).attr("shipperProject"));
					return false;
				}
			});
	$("#contractSelectModal").modal("hide");
}