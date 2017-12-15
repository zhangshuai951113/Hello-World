$(function() {
	// 搜索
	searchCouponTypeInfo(1);
	// 启用有价券类型
	$("body").on("click", ".enabled-operation", function() {
		// 有价券类型ID
		var couponTypeInfoId = $(this).parent().attr("coupon-type-info-id");
		operateCouponType(couponTypeInfoId, 1);
	});

	// 停用有价券类型
	$("body").on("click", ".disable-operation", function() {
		// 用户ID
		var coupongTypeInfoId = $(this).parent().attr("coupon-type-info-id");
		operateCouponType(coupongTypeInfoId, 2);
	});

	// 全选/全不选
	$("body").on("click", ".all_check", function() {
		
		var enableBtnDisabled = false;
		var enableBtnStyle = "operation-button operation-blue";
		var disableBtnDisabled = false;
		var disableBtnStyle = "operation-button operation-blue";
		
		if ($(".all_check").is(":checked")) {
			// 全选时
			$(".sub_check").each(function() {
				$(this).prop("checked", true);
				if ($(this).attr("data-status") == '1') {
					enableBtnDisabled = true;
					enableBtnStyle = "operation-button operation-grey";
				}
				if ($(this).attr("data-status") == '0') {
					disableBtnDisabled = true;
					disableBtnStyle = "operation-button operation-grey";
				}
			});
		} else {
			// 全不选时
			$(".sub_check").each(function() {
				$(this).prop("checked", false);
			});
		}
		$("#enableBtn").attr("disabled", enableBtnDisabled);
		$("#enableBtn").attr("class", enableBtnStyle);
		$("#disableBtn").attr("disabled", disableBtnDisabled);
		$("#disableBtn").attr("class", disableBtnStyle);
	});
	
	//部分选择判断
	$("body").on("click", ".sub_check", function() {
		var isAll = true;
		var enableBtnDisabled = false;
		var enableBtnStyle = "operation-button operation-blue";
		var disableBtnDisabled = false;
		var disableBtnStyle = "operation-button operation-blue";
		$(".sub_check").each(function() {
			if ($(this).is(":checked")) {
				$(this).prop("checked", true);
				if ($(this).attr("data-status") == '1') {
					enableBtnDisabled = true;
					enableBtnStyle = "operation-button operation-grey";
				}
				if ($(this).attr("data-status") == '0') {
					disableBtnDisabled = true;
					disableBtnStyle = "operation-button operation-grey";
				}
			} else {
				$(this).prop("checked", false);
			}
			if (!$(this).prop("checked")) {
				isAll = false;
			}
		});
		$("#enableBtn").attr("disabled", enableBtnDisabled);
		$("#enableBtn").attr("class", enableBtnStyle);
		$("#disableBtn").attr("disabled", disableBtnDisabled);
		$("#disableBtn").attr("class", disableBtnStyle);
		$(".all_check").prop("checked", isAll);
	});

	// 关闭编辑窗口
	$("body").on("click", ".coupon-type-info-opt-close", function() {
		$("#show_coupon_type_info").empty();
	});
	// 编辑有价券类型
	$("body").on("click", ".modify-operation", function() {
		// 有价券类型ID
		var couponTypeInfoId = $(this).parent().attr("coupon-type-info-id");
		if (couponTypeInfoId && couponTypeInfoId != "") {
			$.ajax({
				url : basePath + "/couponTypeInfo/isCouponTypeInfoUsed",
				asyn : false,
				type : "POST",
				data : {"couponTypeInfoId":couponTypeInfoId},
				dataType : "json",
				success : function(dataStr) {
					if (dataStr) {
						if (dataStr.success) {
							addOrEditCouponTypeInfoPage(couponTypeInfoId);
						} else {
							commonUtil.showPopup("提示", dataStr.msg);
							return;
						}
					} else {
						commonUtil.showPopup("提示", "修改有价券类型信息服务异常忙，请稍后重试");
						return;
					}
				}
			});
		}
	});
	// 删除有价券类型
	$("body").on("click", ".delete-operation", function() {
		// 有价券类型ID
		var couponTypeInfoId = $(this).parent().attr("coupon-type-info-id");
		if (couponTypeInfoId && couponTypeInfoId != "") {
			deleteCouponTypeInfo(couponTypeInfoId);
			}
	});
});

/**
 * 分页查询
 * 
 * @author zhangya 2017年6月12日
 * @param number
 *            页数
 */
function pagerGoto(number) {
	searchCouponTypeInfo(number);
}

/**
 * 跳转到某页
 * 
 * @author zhangya 2017年6月12日
 */
function btnPagerGoto() {
	// 取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	// 取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	// 数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		commonUtil.showPopup("提示", "请输出正确的数字");
		return;
	}

	// 跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}

	searchCouponTypeInfo(goPage);
}

/**
 * 根据页数查询有价券类型信息
 * 
 * @author zhangya 2017年6月22日
 * @param number
 *            页数
 */
function searchCouponTypeInfo(number) {
	// 有价券类型
	var couponType = $.trim($("#couponType").val());
	// 进项税税率
	var taxRate = $.trim($("#taxRate").val());
	// 请求地址
	var url = basePath
			+ "/couponTypeInfo/listCouponTypeInfo #coupon-type-info-data";
	$("#search-coupon-type-info").load(url, {
		"page" : number,
		"rows" : 10,
		"couponType" : couponType,
		"taxRate" : taxRate
	}, function() {
		// 允许表格拖着
		$("#tableDrag").colResizable({
			partialRefresh:true,
			 liveDrag : true,
			 gripInnerHtml : "<div class='grip'></div>",
			 draggingClass : "dragging"
		});
	});
}

/**
 * 启用/停用勾选有价券类型
 * 
 * @param operateType
 *            操作类型 1:启用 2:停用
 */
function operateCheckedCouponType(operateType) {
	// 所有选中有价券类型ID
	var couponTypeIds = findAllCheckCouponTypeIds();
	if (couponTypeIds == undefined || couponTypeIds == "") {
		commonUtil.showPopup("提示", "请选择需要操作的有价券类型");
		return;
	}

	// 根据有价券ID启用/停用
	operateCouponType(couponTypeIds, operateType);
}
/**
 * 删除勾选有价券类型
 * @returns
 */
function deleteCheckedCouponType(){
	// 所有选中有价券类型ID
	var couponTypeIds = findAllCheckCouponTypeIds();
	if (couponTypeIds == undefined || couponTypeIds == "") {
		commonUtil.showPopup("提示", "请选择需要操作的有价券类型");
		return;
	}

	// 根据有价券ID删除
	deleteCouponTypeInfo(couponTypeIds);
}

/**
 * 根据用户ID启用/停用有价券
 * 
 * @author zhangya 2017年6月13日
 * @param couponTypeInfoIds
 *            用户ID集合，逗号分隔
 * @param operateType
 *            操作类型 1:启用 2:停用
 */
function operateCouponType(couponTypeInfoIds, operateType) {
	// 操作名称
	var operateName;
	var couponStatus;
	if (operateType == 1) {
		operateName = "启用";
		couponStatus =1;
	} else if (operateType == 2) {
		operateName = "停用";
		couponStatus =0;
	}

	// 根据用户ID启用/停用/注销用户
	$.confirm({
		title : "提示",
		content : "是否确认" + operateName + "所选有价券类型",
		buttons : {
			'确认' : function() {
				$.ajax({
					url : basePath + "/couponTypeInfo/operateCouponTypeInfo",
					asyn : false,
					type : "POST",
					data : {
						"couponTypeInfoIds" : couponTypeInfoIds,
						"couponStatus" : couponStatus
					},
					dataType : "json",
					success : function(dataStr) {
						if (dataStr) {
							if (dataStr.success) {
								commonUtil.showPopup("提示", dataStr.msg);
								searchCouponTypeInfo(1);
							} else {
								commonUtil.showPopup("提示", dataStr.msg);
								return;
							}
						} else {
							commonUtil.showPopup("提示", operateName
									+ "有价券服务异常忙，请稍后重试");
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

/**
 * 获取所有选中的有价券ID
 * 
 * @author zhangya 2017年6月13日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckCouponTypeIds() {
	// 所有选中有价券类型ID
	var couponTypeIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			couponTypeIds.push($(this).attr("data-id"))
		}
	});

	return couponTypeIds.join(",");
}

/**
 * 新增/编辑有价券类型信息初始页
 * 
 * @param couponTypeId
 *            有价券类型信息ID
 * @author zhangya 2017年6月12日
 */
function addOrEditCouponTypeInfoPage(couponTypeInfoId) {
	// 请求地址
	var url = basePath
			+ "/couponTypeInfo/addOrEditCouponTypeInfoPage #coupon-type-data-info";
	$("#show_coupon_type_info").load(url, {
		"couponTypeInfoId" : couponTypeInfoId
	}, function() {
	})
}

/**
 * 保存有价券类型信息
 */
function saveCouponTypeInfo() {

	// 有价券类型
	var couponType = $("#coupon_type").val();
	if (couponType == undefined || couponType == "") {
		commonUtil.showPopup("提示", "有价券类型不能为空");
		return;
	}

	// 进项税税率
	var taxRate = $("#tax_rate").val();
	if (taxRate == undefined || taxRate == "") {
		commonUtil.showPopup("提示", "进项税税率不能为空");
		return;
	}
	if(taxRate<=0 || taxRate>=100){
		commonUtil.showPopup("提示", "进项税税率必须为大于0小于100的整数！");
		return;
	}

	$.ajax({
		url : basePath + "/couponTypeInfo/saveCouponTypeInfo",
		asyn : false,
		type : "POST",
		data : $('#coupon_type_info_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					$("#show_coupon_type_info").empty();
					commonUtil.showPopup("提示", dataStr.msg);
					// 刷新数据
					searchCouponTypeInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存有价券类型信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

// 删除有价券类型信息
function deleteCouponTypeInfo(couponTypeInfoIds){
// 校验有价券类型ID
	if(couponTypeInfoIds == null){
		commonUtil.showPopup("提示", "所选有价券类型信息不能为空！");
		return;
	}
	$.confirm({
			title : "提示",
			content : "是否确认删除所选有价券类型",
			buttons : {
				'确认' : function() {
					$.ajax({
					url : basePath + "/couponTypeInfo/deleteCouponTypeInfo",
					asyn : false,
					type : "POST",
					data : {"couponTypeInfoIds":couponTypeInfoIds},
					dataType : "json",
					success : function(dataStr) {
						if (dataStr) {
							if (dataStr.success) {
								commonUtil.showPopup("提示", dataStr.msg);
								searchCouponTypeInfo(1);
							} else {
								commonUtil.showPopup("提示", dataStr.msg);
								return;
							}
						} else {
							commonUtil.showPopup("提示", "删除有价券类型信息服务异常忙，请稍后重试");
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