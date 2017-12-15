$(function() {
	
	// 搜索
	searchBiddingResultInfo(1);

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

});

/**
 * 根据页数查询招标信息信息
 * @author zhangya 2017年6月22日
 * @param number 页数
 */
function searchBiddingResultInfo(number) {
	// 招标信息编号
	var biddingCode = $.trim($("#biddingCode").val());
	// 招标信息名称
	var biddingName = $.trim($("#biddingName").val());
	// 请求地址
	var url = basePath + "/biddingInfo/listBiddingResultInfoPage #bidding-info-data";
	$("#search-bidding-info").load(url, {
		"page" : number,
		"rows" : 10,
		"biddingCode" : biddingCode,
		"biddingName" : biddingName
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
	searchBiddingResultInfo(number);
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

	searchBiddingResultInfo(goPage);
}

/**
 * 获取所有选中的招标信息ID
 * @author zhangya 2017年6月13日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckBiddingResultInfoIds() {
	// 所有选中招标信息ID
	var BiddingResultInfoIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			BiddingResultInfoIds.push($(this).attr("data-id"))
		}
	});

	return BiddingResultInfoIds.join(",");
}

/**
 * 新增/编辑招标信息信息初始页
 * @param biddingInfoId 招标信息信息ID
 * @author zhangya 2017年6月12日
 */
function addOrEditBiddingResultInfoPage(biddingInfoId) {
	$("#biddingModal").modal("show");
	// 请求地址
	var url = basePath + "/biddingInfo/editBiddingResultInfoPage #bidding-content";
	$("#show_bidding_info").load(url, {
		"biddingInfoId" : biddingInfoId
	}, function() {
		// 上传图片初始化
		$('.upload_img').each(function() {
			uploadLoadFile($(this));
		})
		$(function() {
			//时间调用插件
		    setTimeout(function() {
		       $(".date-time").datetimepicker({
		          format: "YYYY-MM-DD HH:mm:ss",
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
function saveBiddingResultInfo() {
	
	var flag = xjValidate.checkForm();
	if(!flag){
		commonUtil.showPopup("提示", "请将必填项填写完整！");
		return;
	}

	// 招标信息编号
	var biddingCode = $("#bidding_code").val();
	if (biddingCode == undefined || biddingCode == "") {
		commonUtil.showPopup("提示", "招标信息编号不能为空");
		return;
	}

	// 招标信息名称
	var biddingName = $("#bidding_name").val();
	if (biddingName == undefined || biddingName == "") {
		commonUtil.showPopup("提示", "招标信息名称不能为空");
		return;
	}
	
	// 所属项目
//	var biddingProject = $("#bidding_project").val();
//	if (biddingProject == undefined || biddingProject == "") {
//		commonUtil.showPopup("提示", "所属项目不能为空");
//		return;
//	}
	
	// 税率
	var taxRate = $("#tax_rate").val();
	if (taxRate == undefined || taxRate == "") {
		commonUtil.showPopup("提示", "税率不能为空");
		return;
	}

	$.ajax({
		url : basePath + "/biddingInfo/saveBiddingResultInfo",
		asyn : false,
		type : "POST",
		data : $('#bidding_info_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					$("#biddingModal").modal("hide");
					commonUtil.showPopup("提示", dataStr.msg);
					// 刷新数据
					searchBiddingResultInfo(1);
				} else {
					if(dataStr.flag == 1){
						 $('#bidding_code').val(dataStr.biddingCode);
					}
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存招标信息信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 招标信息管理操作
 * @param operateType 1提交审核 2审核前校验 3删除 4回收报价
 * @returns
 */
function operateCheckedBiddingResultInfo(operateType) {
	// 校验招标信息ID
	if (operateType == null || operateType =="") {
		commonUtil.showPopup("提示", "无效操作！");
		return;
	}
	if(operateType != 1 && operateType != 2 && operateType != 3 && operateType != 4 && operateType != 5 && operateType != 6){
		commonUtil.showPopup("提示", "无效操作！");
		return;
	}
	var operateStr = "";
	if(operateType == 1){
		operateStr ="提交审核"
	}else if(operateType == 3){
		operateStr ="删除"
	}else if(operateType == 4){
		operateStr ="回收报价"
	}else if(operateType == 5){
		operateStr ="提交确认中标单位审核"
	}else if(operateType == 6){
		operateStr ="确认中标单位审核"
	}
	//获取选中的ID
	var biddingInfoIds = findAllCheckBiddingResultInfoIds();
	if(biddingInfoIds == null || biddingInfoIds == ""){
		commonUtil.showPopup("提示", "请选择要"+operateStr+"的招标信息！");
		return;
	}
	
	if(operateType !=2 ){
		$.confirm({
			title : "提示",
			content : "是否确认将所选招标信息"+ operateStr+"?",
			buttons : {
				'确认' : function() {
					operateBiddingResultInfo(biddingInfoIds,operateType);
				},
				'取消' : function() {

				}
			}
		});
	}else{
		operateBiddingResultInfo(biddingInfoIds,operateType);
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
 * 招标信息1 提交审核2 审核前校验3 删除4 回收报价（临时）
 * @param biddingInfoIds
 * @param operateType
 * @returns
 */
function operateBiddingResultInfo(biddingInfoIds,operateType){
	
	$.ajax({
		url : basePath + "/biddingInfo/operateBiddingResultInfo",
		asyn : false,
		type : "POST",
		data : {
			"biddingInfoIds" : biddingInfoIds,"operateType":operateType
		},
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					if(operateType ==2 || operateType ==6){
						auditWin(biddingInfoIds,operateType);
					}else{
						commonUtil.showPopup("提示", dataStr.msg);
						searchBiddingResultInfo(1);
					}
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "招标信息管理服务异常，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 编辑审核信息提交
 * @param biddingInfoIds
 * @returns
 */
function auditWin(biddingInfoIds,operateType) {
	$.confirm({
				title : '请您填写审核意见:',
				content : ''
						+ '<form action="" class="formName">'
						+ '<div class="form-group">'
						+ '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px" />'
						+ '</div>' + '</form>',
				buttons : {
					formSubmit : {
						text : '通过',
						btnClass : 'btn-blue',
						action : function() {
							var opinion = this.$content.find('#auditOpinion').val();
							if (!opinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							// 提交审核信息
							biddingInfoAudit(biddingInfoIds, opinion, 1,operateType)
						}
					},
					formSubmit1 : {
						text : '不通过',
						btnClass : 'btn-red',
						action : function() {
							var opinion = this.$content.find('#auditOpinion')
									.val();
							if (!opinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							// 提交审核信息
							biddingInfoAudit(biddingInfoIds, opinion, 2)
						}
					},
					'取消' : function() {
						// close
					}
				},
				onContentReady : function() {
					// bind to events
					var jc = this;
					this.$content.find('form').on('submit', function(e) {
						// if the user submits the form by pressing enter in the
						// field.
						e.preventDefault();
						jc.$$formSubmit.trigger('click'); // reference the
						// button and click
						// it
					});
				}
			});
}

/**
 * 提交审核招标信息
 * @param biddingInfoIds 招标信息ID
 * @param opinion 审核意见
 * @param restult 审核结果
 * @returns
 */
function biddingInfoAudit(biddingInfoIds, opinion, result,operateType) {
	var auditInfo = {
		"opinion" : opinion,
		"result" : result,
		"biddingInfoIds" : biddingInfoIds,
		"operateType":operateType
	};
	// 提交主机构审核意见信息
	$.ajax({
		url : basePath + "/biddingInfo/auditBiddingResultInfo",
		asyn : false,
		type : "POST",
		data : auditInfo,
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					commonUtil.showPopup("提示", dataStr.msg);
					searchBiddingResultInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "合同审核服务异常忙，请稍后重试");
				return;
			}
		}
	});

}

/**
 * 编辑招标信息二次挂网
 * @param biddingInfoId
 * @returns
 */
function addOrEditBiddingResultInfoPage(biddingInfoId) {
	$("#biddingModal").modal("show");
	// 请求地址
	var url = basePath + "/biddingInfo/editBiddingResultInfoPage #bidding-content";
	$("#show_bidding_info").load(url, {
		"biddingInfoId" : biddingInfoId
	}, function() {
		// 上传图片初始化
		$('.upload_img').each(function() {
			uploadLoadFile($(this));
		})
		$(function() {
			//时间调用插件
		    setTimeout(function() {
		       $(".date-time").datetimepicker({
		          format: "YYYY-MM-DD HH:mm:ss",
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
 * 保存招标信息二次挂网
 */
function saveBiddingResultInfoForRelease() {
	
	var flag = xjValidate.checkForm();
	if(!flag){
		commonUtil.showPopup("提示", "请将必填项填写完整！");
		return;
	}

	// 招标信息编号
	var biddingCode = $("#bidding_code").val();
	if (biddingCode == undefined || biddingCode == "") {
		commonUtil.showPopup("提示", "招标信息编号不能为空");
		return;
	}

	// 招标信息名称
	var biddingName = $("#bidding_name").val();
	if (biddingName == undefined || biddingName == "") {
		commonUtil.showPopup("提示", "招标信息名称不能为空");
		return;
	}
	
	// 所属项目
//	var biddingProject = $("#bidding_project").val();
//	if (biddingProject == undefined || biddingProject == "") {
//		commonUtil.showPopup("提示", "所属项目不能为空");
//		return;
//	}
	
	// 税率
	var taxRate = $("#tax_rate").val();
	if (taxRate == undefined || taxRate == "") {
		commonUtil.showPopup("提示", "税率不能为空");
		return;
	}

	$.ajax({
		url : basePath + "/biddingInfo/saveBiddingResultInfoForRelease",
		asyn : false,
		type : "POST",
		data : $('#bidding_info_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					$("#biddingModal").modal("hide");
					commonUtil.showPopup("提示", dataStr.msg);
					// 刷新数据
					searchBiddingResultInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存招标信息信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 招标信息二次挂网编辑页
 * @param biddingInfoId
 * @returns
 */
function biddingInfoReleasePage(biddingInfoId) {
	$("#biddingModal").modal("show");
	// 请求地址
	var url = basePath + "/biddingInfo/editBiddingResultInfoPageForRelease #bidding-content";
	$("#show_bidding_info").load(url, {
		"biddingInfoId" : biddingInfoId
	}, function() {
		// 上传图片初始化
		$('.upload_img').each(function() {
			uploadLoadFile($(this));
		})
		$(function() {
			//时间调用插件
		    setTimeout(function() {
		       $(".date-time").datetimepicker({
		          format: "YYYY-MM-DD HH:mm:ss",
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