$(function() {
	// 搜索
	searchProxyInfo(1);

	// 启用代理
	$("body").on("click", ".enabled-button", function() {
		// 代理ID
		var proxyInfoInfoId = $(this).parent().attr("proxy-info-id");
		operateProxyInfo(proxyInfoInfoId, 1);
	});

	// 停用代理
	$("body").on("click", ".disable-button", function() {
		// 代理ID
		var proxyInfoInfoId = $(this).parent().attr("proxy-info-id");
		operateProxyInfo(proxyInfoInfoId, 0);
	});

	// 代理信息审核
	$("body").on("click", ".audit-button", function() {
		// 代理ID
		var proxyInfoInfoId = $(this).parent().attr("proxy-info-id");
		checkBeforeOperte(proxyInfoInfoId, 4);
	});

	// 代理信息提交审核
	$("body").on("click", ".submit-button", function() {
		// 代理ID
		var proxyInfoInfoId = $(this).parent().attr("proxy-info-id");
		operateProxyInfo(proxyInfoInfoId, 2);
	});
	// 代理信息修改
	$("body").on("click", ".modify-button", function() {
		// 代理ID
		var proxyInfoId = $(this).parent().attr("proxy-info-id");
		checkBeforeOperte(proxyInfoId, 5);
	});
	// 代理信息删除
	$("body").on("click", ".delete-button", function() {
		// 代理ID
		var proxyInfoInfoId = $(this).parent().attr("proxy-info-id");
		operateProxyInfo(proxyInfoInfoId, 3);
	});

	// 全选/全不选
	$("body").on("click", ".all_proxy_check", function() {
		if ($(".all_proxy_check").is(":checked")) {
			// 全选时
			$(".sub_proxy_check").each(function() {
				$(this).prop("checked", true);
			});
		} else {
			// 全不选时
			$(".sub_proxy_check").each(function() {
				$(this).prop("checked", false);
			});
		}
	});

	// 关闭代理信息编辑框
	$("body").on("click", ".proxy-info-opt-close", function() {
		$("#edit_proxy_info_modal").empty();
	});
});

/**
 * 绑定上传事件的dom对象
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn, {
		action : basePath + '/upload/imageUpload',
		name : 'myfile',
		dataType : 'json',
		onSubmit : function(file, ext) {
			// 文件上传格式校验
			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))) {
				commonUtil.showPopup("提示", "请上传格式为 jpg|png|bmp 的图片");
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
					btn.attr("src", fastdfsServer + "/" + uploadUrl);
					$("#" + imgType).val(uploadUrl);
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
 * 分页查询
 * 
 * @param number
 *            页数
 */
function pagerGoto(number) {
	searchProxyInfo(number);
}

/**
 * 跳转到某页
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

	searchProxyInfo(goPage);
}

/**
 * 根据页数查询代理信息
 * @param number 页数
 */
function searchProxyInfo(number) {
	// 代理名
	var proxyName = $.trim($("#proxyName").val());
	// 证件号
	var idCard = $.trim($("#idCard").val());
	// 银行账号
	var bankAccount = $("#bankAccount").val();
	// 开户行
	var bankName = $("#bankName").val();
	// 启用状态
	var isAvailable = $("#isAvailable").val();
	// 证件类型
	var cardType = $("#cardType").val();
	// 代理状态
	var proxyStatus = $("#proxyStatus").val();

	// 请求地址
	var url = basePath + "/proxyInfo/listProxyInfoPage #proxy-info-data";
	$("#search-proxy-info").load(url, {
		"page" : number,
		"rows" : 10,
		"proxyName" : proxyName,
		"idCard" : idCard,
		"bankAccount" : bankAccount,
		"bankName" : bankName,
		"isAvailable" : isAvailable,
		"proxyStatus" : proxyStatus,
		"cardType" : cardType
	}, function() {
		// 允许表格拖着
		$("#tableDrag").colResizable({
			partialRefresh: true,
			liveDrag : true,
			gripInnerHtml : "<div class='grip'></div>",
			draggingClass : "dragging"
		});

		// 图片预览
		$('td img').viewer({
			title : false
		});
	});
}

/**
 * 启用/停用/删除/提交审核
 * 
 * @param operateType
 *            操作类型 0:停用 1:启用 2:提交审核 3:删除 4:审核
 */
function operateCheckedProxyInfo(operateType) {
	var operaStr = "";
	if (operateType == 0) {
		operaStr = "停用";
	} else if (operateType == 1) {
		operaStr = "启用";
	} else if (operateType == 2) {
		operaStr = "提交审核";
	} else if (operateType == 3) {
		operaStr = "删除";
	} else if (operateType == 4) {
		operaStr = "审核";
	}
	// 所有选中代理ID
	var proxyInfoIds = findAllCheckProxyIds();
	if (proxyInfoIds == undefined || proxyInfoIds == "") {
		commonUtil.showPopup("提示", "请选择要" + operaStr + "的代理信息！");
		return;
	}
	// 根据代理ID启用/停用/删除/提交审核
	if (operateType == 4) {
		checkBeforeOperte(proxyInfoIds, 4);
	} else {
		operateProxyInfo(proxyInfoIds, operateType);
	}
}

/**
 * 根据代理ID/停用 /启用 /提交审核 /删除
 * 
 * @param proxyInfoIds
 *            代理ID集合，逗号分隔
 * @param operateType
 *            操作类型 0:停用 1:启用 2:提交审核 3:删除
 */
function operateProxyInfo(proxyInfoIds, operateType) {
	// 操作名称
	var operaStr = "";
	if (operateType == 0) {
		operaStr = "停用";
	} else if (operateType == 1) {
		operaStr = "启用";
	} else if (operateType == 2) {
		operaStr = "提交审核";
	} else if (operateType == 3) {
		operaStr = "删除";
	}

	// 根据代理ID启用/停用/注销代理
	$.confirm({
		title : "提示",
		content : "是否确认" + operaStr + "所选代理信息",
		buttons : {
			'确认' : function() {
				$.ajax({
					url : basePath + "/proxyInfo/operateProxyInfo",
					asyn : false,
					type : "POST",
					data : {
						"proxyInfoIds" : proxyInfoIds,
						"operateType" : operateType
					},
					dataType : "json",
					success : function(dataStr) {
						if (dataStr) {
							if (dataStr.success) {
								commonUtil.showPopup("提示", dataStr.msg);
								searchProxyInfo(1);
							} else {
								commonUtil.showPopup("提示", dataStr.msg);
								return;
							}
						} else {
							commonUtil.showPopup("提示", operateName
									+ "代理服务异常忙，请稍后重试");
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
 * 获取所有选中的代理ID
 * 
 * @returns 代理ID，逗号分隔
 */
function findAllCheckProxyIds() {
	// 所有选中代理ID
	var proxyInfoIds = new Array();
	$(".sub_proxy_check").each(function() {
		if ($(this).is(":checked")) {
			proxyInfoIds.push($(this).attr("data-id"))
		}
	});

	return proxyInfoIds.join(",");
}

/**
 * 新增/编辑代理信息初始页
 * 
 * @param proxyInfoInfoId
 *            代理ID
 */
function addOrEditProxyInfoPage(proxyInfoId) {
	// 请求地址
	var url = basePath + "/proxyInfo/editProxyInfoPage #proxy-data-info";
	$("#edit_proxy_info_modal").load(url, {
		"proxyInfoId" : proxyInfoId
	}, function() {
		// 上传图片初始化
		$('.upload_img').each(function() {
			uploadLoadFile($(this));
		});
	});
}

/**
 * 新增/编辑代理信息
 */
function addOrUpdateProxyInfo() {
	// 代理人名称
	// var proxyName = $.trim($("#proxy_name").val());
	// if (proxyName == undefined || proxyName == "") {
	// commonUtil.showPopup("提示", "代理人名称不能为空");
	// return;
	// }

	// if (proxyName.length > 40) {
	// commonUtil.showPopup("提示", "代理人名称不能超过20个汉字");
	// return;
	// }

	// 证件类型
	var cardType = $.trim($("#card_type").val());
	// if (cardType == undefined || cardType == "") {
	// commonUtil.showPopup("提示", "证件类型不能为空！");
	// return;
	// }

	// 身份证号（企业统一信用代码）
	var idCard = $.trim($("#id_card").val());
	// if (idCard == undefined || idCard == "") {
	// commonUtil.showPopup("提示", "证件号不能为空");
	// return;
	// }
	if (idCard != undefined && idCard != "" && cardType == 1) {
		var cardreg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
		if (!cardreg.test(idCard)) {
			commonUtil.showPopup("提示", "请输入有效的身份证号");
			return;
		}
	}

	// 附件
	var proxyImg = $.trim($("#proxy_img").val());
	if (proxyImg != undefined && proxyImg != "" && proxyImg.length > 200) {
		commonUtil.showPopup("提示", "附件存储路径不能超过200个字符");
		return;
	}

	// 新增/编辑代理信息
	$.ajax({
		url : basePath + "/proxyInfo/addOrUpdateProxyInfo",
		asyn : false,
		type : "POST",
		data : $('#proxy_info_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					// 关闭弹框
					$("#edit_proxy_info_modal").empty();
					commonUtil.showPopup("提示", dataStr.msg);
					// 刷新页面
					searchProxyInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存代理信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 审核选中的代理信息
 */
function auditCheckedProxyInfo() {

	// 获取选中的操作记录
	var proxyInfoIds = findAllCheckProxyIds();
	if (proxyInfoIds == undefined || proxyInfoIds == "") {
		commonUtil.showPopup("提示", "请选择要审核的代理信息！");
		return;
	}

}
/**
 * 审核、修改前数据校验
 * 
 * @author zhangya
 * @param proxyInfoIds
 *            代理ID
 * @param operateType
 *            操作类型 5:修改 4:审核
 */
function checkBeforeOperte(proxyInfoIds, operateType) {
	$.ajax({
		url : basePath + "/proxyInfo/checkBeforeOperate",
		asyn : false,
		type : "POST",
		data : {
			"proxyInfoIds" : proxyInfoIds,
			"operateType" : operateType,
		},
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					if (operateType == 5) {
						// 打开修改页面
						addOrEditProxyInfoPage(proxyInfoIds);
					} else if (operateType == 4) {
						auditWin(proxyInfoIds);
					}
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "代理信息管理服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 编辑审核信息提交
 * 
 * @param proxyInfoId
 */

function auditWin(proxyInfoId) {
	$
			.confirm({
				title : '请填写审核意见:',
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
							var opinion = this.$content.find('#auditOpinion')
									.val();
							// 提交审核信息
							audit(proxyInfoId, opinion, 1)
						}
					},
					formSubmit1 : {
						text : '不通过',
						btnClass : 'btn-red',
						action : function() {
							var opinion = this.$content.find('#auditOpinion')
									.val();
							// 提交审核信息
							audit(proxyInfoId, opinion, 2)
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
 * 审核代理信息
 * 
 * @param proxyInfoIds
 *            合同ID
 * @param opinion
 *            审核意见
 * @param restul
 *            审核结果
 * @returns
 */
function audit(proxyInfoIds, opinion, result) {
	var auditInfo = {
		"opinion" : opinion,
		"result" : result,
		"proxyInfoIds" : proxyInfoIds
	};
	// 提交代理信息审核信息
	$.ajax({
		url : basePath + "/proxyInfo/auditProxyInfo",
		asyn : false,
		type : "POST",
		data : auditInfo,
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					commonUtil.showPopup("提示", dataStr.msg);
					searchProxyInfo(1);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "代理信息审核服务异常忙，请稍后重试");
				return;
			}
		}
	});

}
