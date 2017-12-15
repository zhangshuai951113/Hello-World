$(function() {
	
	// 搜索
	searchBiddingDetailInfo(1);

	// 全选/全不选
	$("body").on("click", ".all_check", function() {
		if ($(".all_check").is(":checked")) {
			// 全选时
			$(".sub_check").each(function() {
				$(this).prop("checked", true);
			});
		} else {
			// 全不选时
			$(".sub_check").each(function() {
				$(this).prop("checked", false);
			});
		}
	});

	// 部分选择判断
	$("body").on("click", ".sub_check", function() {
		var isAll = true;
		$(".sub_check").each(function() {
			if ($(this).is(":checked")) {
				$(this).prop("checked", true);
			} else {
				$(this).prop("checked", false);
			}
			if (!$(this).prop("checked")) {
				isAll = false;
			}
		});
		$(".all_check").prop("checked", isAll);
	});

	// 编辑招标信息信息
	$("body").on("click", ".modify-operation", function() {
		// 招标信息ID
		var biddingDetailInfoId = $(this).parent().attr("bidding-detail-info-id");
		if (biddingDetailInfoId && biddingDetailInfoId != "") {
			addOrEditBiddingDetailInfoPage(biddingDetailInfoId);
		}else{
			commonUtil.showPopup("提示", "非法操作！");
			return;
		}
	});
	
	// 删除招标信息
	$("body").on("click", ".delete-operation", function() {
		// 招标信息ID
		var biddingDetailInfoId = $(this).parent().attr("bidding-detail-info-id");
		if (biddingDetailInfoId && biddingDetailInfoId != "") {
			deleteBiddingDetailInfo(biddingDetailInfoId);
		}else{
			commonUtil.showPopup("提示", "非法操作！");
			return;
		}
	});
	/*//时间调用插件
    setTimeout(function() {
       $(".date-time").datetimepicker({
          format: "YYYY-MM-DD",
          autoclose: true,
          todayBtn: true,
          todayHighlight: true,
          showMeridian: true,
          pickerPosition: "bottom-left",
          startView: 2,//月视图
          minView: 2//日期时间选择器所能够提供的最精确的时间选择视图
        }); 
    },500);*/
	$("#dsfdsfd").lineSelect();
	$("#endLifdsfdsfneData").lineSelect();
});

// 选择中标方
$("body").on("click", ".award-operation", function() {
	// 招标信息ID
	var biddingDetailInfoId = $(this).parent().attr("bidding-detail-info-id");
	if (biddingDetailInfoId && biddingDetailInfoId != "") {
		biddingDetailId = biddingDetailInfoId;
		biddersShow();
	}else{
		commonUtil.showPopup("提示", "非法操作！");
		return;
	}
});

/**
 * 根据页数查询招标信息信息
 * @author zhangya 2017年6月22日
 * @param number 页数
 */
function searchBiddingDetailInfo(number) {
	// 货物名称
	var goodsName = $.trim($("#goodsName").val());
	// 请求地址
	var url = basePath + "/biddingDetailInfo/listBiddingDetailInfoPage #bidding-detail-info-data";
	$("#search-bidding-detail-info").load(url, {
		"page" : number,
		"rows" : 10,
		"biddingInfoId":$("#hiddenBiddingInfoId").val(),
		"goodsName" : goodsName
	}, function() {
		// 允许表格拖着
		$("#tableDrag").colResizable({
			liveDrag : true,
			gripInnerHtml : "<div class='grip'></div>",
			draggingClass : "dragging"
		});
		//数据较多，增加滑动
		$.mCustomScrollbar.defaults.scrollButtons.enable = true; 
	  	$.mCustomScrollbar.defaults.axis = "yx"; 
	  	$(".iscroll").css("min-height","55px");
	  	$(".iscroll").mCustomScrollbar({
	    	theme: "minimal-dark"
	  	});
	  	
	});
}

/**
 * 分页查询
 * @author zhangya 2017年6月12日
 * @param number 页数
 */
function pagerGoto(number) {
	searchBiddingDetailInfo(number);
}

/**
 * 跳转到某页
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

	searchBiddingDetailInfo(goPage);
}

/**
 * 删除勾选招标明细
 * @returns
 */
function deleteCheckedBiddingDetailInfo() {
	// 所有选中招标信息ID
	var biddingDetailInfoIds = findAllCheckBiddingDetailInfoIds();
	if (biddingDetailInfoIds == undefined || biddingDetailInfoIds == "") {
		commonUtil.showPopup("提示", "请选择需要删除的招标明细");
		return;
	}

	//删除招标信息
	deleteBiddingDetailInfo(biddingDetailInfoIds);
}

/**
 * 获取所有选中的招标信息ID
 * @author zhangya 2017年6月13日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckBiddingDetailInfoIds() {
	// 所有选中招标信息ID
	var biddingDetailInfoIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			biddingDetailInfoIds.push($(this).attr("data-id"))
		}
	});

	return biddingDetailInfoIds.join(",");
}

/**
 * 新增/编辑招标信息信息初始页
 * @param biddingDetailInfoId 招标信息信息ID
 * @author zhangya 2017年6月12日
 */
function addOrEditBiddingDetailInfoPage(biddingDetailInfoId) {
	$("#biddingDetailModal").modal("show");
	// 请求地址
	var url = basePath + "/biddingDetailInfo/editBiddingDetailInfoPage #bidding-detail-content";
	$("#show_bidding_detail_info").load(url, {
		"biddingDetailInfoId" : biddingDetailInfoId,
		"biddingInfoId":$("#hiddenBiddingInfoId").val()
	}, function() {
		// 上传图片初始化
		$('.upload_img').each(function() {
			uploadLoadFile($(this));
		})
		$(function() {
			//时间调用插件
		    setTimeout(function() {
		       $(".date-time").datetimepicker({
		          format: "YYYY-MM-DD",
		          autoclose: true,
		          todayBtn: true,
		          todayHighlight: true,
		          showMeridian: true,
		          pickerPosition: "bottom-left",
		          startView: 2,//月视图
		          minView: 2//日期时间选择器所能够提供的最精确的时间选择视图
		        }); 
		       
		    },500);
		});
	});
}

/**
 * 保存招标信息信息
 */
function saveBiddingDetailInfo() {
	
	var flag = xjValidate.checkForm();
	if(!flag){
		commonUtil.showPopup("提示", "请将必填项填写完整！");
		return;
	}

	// 货物
	var goodsName = $("#goods_name").val();
	if (goodsName == undefined || goodsName == "") {
		commonUtil.showPopup("提示", "货物不能为空");
		return;
	}

	// 线路
	var lineName = $("#line_name").val();
	if (lineName == undefined || lineName == "") {
		commonUtil.showPopup("提示", "线路不能为空");
		return;
	}
	// 发货单位
	var forwardingUnit = $("#forwarding_unit").val();
	if (forwardingUnit == undefined || forwardingUnit == "") {
		commonUtil.showPopup("提示", "发货单位不能为空");
		return;
	}
	
	// 收货单位
	var consignee = $("#consignee").val();
	if (consignee == undefined || consignee == "") {
		commonUtil.showPopup("提示", "收货不能为空");
		return;
	}

	// 总量
	var quantity = $("#quantity").val();
	if (quantity == undefined || quantity == "") {
		commonUtil.showPopup("提示", "总量不能为空");
		return;
	}
	
	$.ajax({
		url : basePath + "/biddingDetailInfo/saveBiddingDetailInfo",
		asyn : false,
		type : "POST",
		data : $('#bidding_detail_info_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					$("#biddingDetailModal").modal("hide");
					commonUtil.showPopup("提示", dataStr.msg);
					// 刷新数据
					searchBiddingDetailInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存招标明细信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 招标信息管理操作
 * @param operateType 1提交审核 2审核前校验 3删除 
 * @returns
 */
function operateCheckedBiddingDetailInfo(operateType) {
	// 校验招标信息ID
	if (operateType == null || operateType =="") {
		commonUtil.showPopup("提示", "无效操作！");
		return;
	}
	if(operateType != 1 && operateType != 2 && operateType != 3){
		commonUtil.showPopup("提示", "无效操作！");
		return;
	}
	var operateStr = "";
	if(operateType == 1){
		operateStr ="提交审核"
	}else if(operateType == 3){
		operateStr ="删除"
	}
	//获取选中的ID
	var biddingDetailInfoIds = findAllCheckBiddingDetailInfoIds();
	if(biddingDetailInfoIds == null || biddingDetailInfoIds == ""){
		commonUtil.showPopup("提示", "请选择要"+operateStr+"的招标信息！");
		return;
	}
	
	if(operateType !=2 ){
		$.confirm({
			title : "提示",
			content : "是否确认将所选招标信息"+ operateStr+"?",
			buttons : {
				'确认' : function() {
					operateBiddingDetailInfo(biddingDetailInfoIds,operateType);
				},
				'取消' : function() {

				}
			}
		});
	}else{
		operateBiddingDetailInfo(biddingDetailInfoIds,operateType);
	}
	
}

/**
 * 绑定上传事件的dom对象
 * @author zhangya 2017年6月21日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn, {
		action : basePath + '/upload/imageUpload',
		name : 'myfile',
		dataType : 'json',
		onSubmit : function(file, ext) {
			// 文件上传格式校验
			if (!(ext && /^(jpg|png|bmp|docx|doc|pdf|xls|xlsx)$/.test(ext.toLowerCase()))) {
				commonUtil.showPopup("提示", "请上传格式为 jpg|png|bmp|docx|doc|pdf|xls|xlsx 的文件");
				return;
			}
		},
		// 服务器响应成功时的处理函数
		onComplete : function(file, resultJson) {
			if (resultJson) {
				resultJson = $.parseJSON(resultJson);
				// 是否成功
				var isSuccess = resultJson.isSuccess;
				// 上传图片URL
				var uploadUrl = resultJson.uploadUrl;
				if (isSuccess == "true") {
					// 图片类型
					var imgType = btn.attr("img-type");
					var imgText = btn.attr("img-text");
					btn.attr("src", fastdfsServer + "/" + uploadUrl);
					$("#" + imgType).val(uploadUrl);
					$("#" + imgText).text(file);
				} else {
					commonUtil.showPopup("提示", resultJson.errorMsg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "服务器异常，请稍后重试");
				return;
			}

		}
	});
}

/**
* 删除招标明细
* @param biddingDetailInfoIds
* @returns
*/
function deleteBiddingDetailInfo(biddingDetailInfoIds) {
	if (biddingDetailInfoIds == null) {
		commonUtil.showPopup("提示", "所选招标明细不能为空！");
		return;
	}
	$.confirm({
		title : "提示",
		content : "是否确认删除所选招标明细?",
		buttons : {
			'确认' : function() {
				$.ajax({
					url : basePath + "/biddingDetailInfo/deleteBiddingDetailInfo",
					asyn : false,
					type : "POST",
					data : {
						"biddingDetailInfoIds" : biddingDetailInfoIds
					},
					dataType : "json",
					success : function(dataStr) {
						if (dataStr) {
							if (dataStr.success) {
								commonUtil.showPopup("提示", dataStr.msg);
								searchBiddingDetailInfo(1);
							} else {
								commonUtil.showPopup("提示", dataStr.msg);
								return;
							}
						} else {
							commonUtil.showPopup("提示", "删除服务异常，请稍后重试");
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
