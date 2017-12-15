$(function() {
	// 搜索
	searchOrgCancelApplyPo(1);
});

/**
 * 分页查询
 * @param number 页数
 */
function pagerGoto(number) {
	searchOrgCancelApplyPo(number);
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
		$.alert("请输出正确的数字！");
		return;
	}

	// 跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	searchOrgCancelApplyPo(goPage);
}

/**
 * 根据页数查询机构注销申请
 * @param number
 */
function searchOrgCancelApplyPo(number) {
	// 组织名称
	var orgName = $.trim($("#orgName").val());
	// 请求地址
	var url = basePath + "/orgInfo/listOrgCancelApplyInfo #org_cancel_apply";
	$("#search_org_cancel_apply_info").load(url, {
		"page" : number,
		"rows" : 10,
		"orgName" : orgName
	}, function() {
		
		//允许表格拖着
		$("#tableDrag").colResizable({
			  liveDrag:true, 
			  partialRefresh:true,
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging"
		});
		
		//图片预览
		$('td').viewer({
			title:false
		});
	})
}

/**
 * 审核信息填写
 */
$("body").on("click", ".audit-operation", function() {
	var orgCancelApplyPoId = $(this).parent().attr("org-cancel-apply-po-id");
	var orgInfoId = $(this).parent().attr("org-info-id");
	// 主键ID存在则进行审核
	if (orgCancelApplyPoId, orgInfoId) {
		checkBeforeAudit(orgCancelApplyPoId, orgInfoId);
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 主机构注销申请信息查看
 */
$("body").on("click",".view-operation",function() {
	var orgCancelApplyPoId = $(this).parent().attr("org-cancel-apply-po-id");
	$("#org_info_id").val(1);
	$("#view_audit_form").attr("action",basePath + "/orgInfo/rootOrgInfoViewAndAuditPage");
	$("#view_audit_form").submit();
});

// 全选/全不选
$("body").on("click", ".all_org_cancel_apply_check", function() {
	var disabled = false;
	var style = "operation-button operation-blue";
	if ($(".all_org_cancel_apply_check").is(":checked")) {
		// 全选时
		$(".sub_org_cancel_apply_check").each(function() {
			$(this).prop("checked", true);
			if ($(this).attr("data-audit-result") != 1) {
				disabled = true;
				style = "operation-button operation-grey";
			}
		});
	} else {
		// 全不选时
		$(".sub_org_cancel_apply_check").each(function() {
			$(this).prop("checked", false);
		});
	}
	$("#auditBtn").attr("disabled", disabled);
	$("#auditBtn").attr("class", style);
});
// 部分选择判断
$("body").on("click", ".sub_org_cancel_apply_check", function() {
	var disabled = false;
	var isAll =true;
	var style = "operation-button operation-blue";
	$(".sub_org_cancel_apply_check").each(function() {
		if ($(this).is(":checked")) {
			$(this).prop("checked", true);
			if ($(this).attr("data-audit-result") != 1) {
				disabled = true;
				style = "operation-button operation-grey";
			}
			$("#auditBtn").attr("disabled", disabled);
			$("#auditBtn").attr("class", style);
		} else {
			$(this).prop("checked", false);
		}
		if(!$(this).prop("checked")){
			isAll =false;
		}
	});
	$("#auditBtn").attr("disabled", disabled);
	$("#auditBtn").attr("class", style);
	$(".all_org_cancel_apply_check").prop("checked", isAll);
});
/**
 * 审核勾选的主机构
 */
function auditCheckedOrgCancelApply() {
	// 所有选中注销申请ID
	var orgCancelApplyIds = findAllCheckOrgCancelApplyIds();
	if (orgCancelApplyIds == undefined || orgCancelApplyIds == "") {
		commonUtil.showPopup("提示", "请选择要审核的注销申请！");
		return;
	}
	// 所有选中主机构ID
	var orgInfoIds = findAllCheckOrgIds();
	if (orgInfoIds == undefined || orgInfoIds == "") {
		commonUtil.showPopup("提示", "请选择要审核的注销申请！");
		return;
	}
	// 审核
	batchAudit(orgCancelApplyIds, orgInfoIds);
}

/**
 * 获取所有选中的注销申请ID
 * @author zhangya 2017年5月26日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckOrgCancelApplyIds() {
	// 所有选中主机构ID
	var orgCancelApplyIds = new Array();
	$(".sub_org_cancel_apply_check").each(function() {
		if ($(this).is(":checked")) {
			orgCancelApplyIds.push($(this).attr("data-id"))
		}
	});
	return orgCancelApplyIds.join(",");
}
/**
 * 获取所有选中的主机构ID
 * @author zhangya 2017年5月26日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckOrgIds() {
	// 所有选中主机构ID
	var orgIds = new Array();
	$(".sub_org_cancel_apply_check").each(function() {
		if ($(this).is(":checked")) {
			orgIds.push($(this).attr("data-org-info-id"))
		}
	});

	return orgIds.join(",");
}

/**
 * 审核信息填写
 * @author zhangya 2017年5月24日
 * @param orgInfoId 组织ID
 */
function checkBeforeAudit(orgCancelApplyPoId, orgInfoId) {
	// 校验是否管理员
	$.ajax({
		url : basePath + "/orgInfo/checkBeforeAudit",
		asyn : false,
		type : "POST",
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					// $('#orgInfoAuditModal').modal("show");
					audit(orgCancelApplyPoId, orgInfoId);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "查询组织信息服务异常忙，请稍后重试！");
				return;
			}
		}
	});
}

/**
 * 编辑审核信息提交
 * @param orgInfoId 组织ID
 * @author zhangya 2017年5月22日
 */
function audit(orgCancelApplyPoId, orgInfoId) {
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
							var auditOpinion = this.$content.find('#auditOpinion').val();
							if (!auditOpinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							var auditInfo = {
								"auditOpinion" : auditOpinion,
								"auditResult" : 2,
								"orgCancelApplyPoId" : orgCancelApplyPoId,
								"orgInfoId" : orgInfoId
							};
							// 提交主机构审核意见信息
							$.ajax({
										url : basePath + "/orgInfo/auditApplyCancelRootOrgInfo",
										asyn : false,
										type : "POST",
										data : auditInfo,
										dataType : "json",
										success : function(dataStr) {
											if (dataStr) {
												if (dataStr.success) {
													commonUtil.showPopup("提示","保存成功");
													searchOrgCancelApplyPo(1);
												} else {
													commonUtil.showPopup("提示",dataStr.msg);
													return;
												}
											} else {
												commonUtil.showPopup("提示","保存主机构服务异常忙，请稍后重试");
												return;
											}
										}
									});
						}
					},
					formSubmit1 : {
						text : '不通过',
						btnClass : 'btn-red',
						action : function() {
							var auditOpinion = this.$content.find('#auditOpinion').val();
							if (!auditOpinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							var auditInfo = {
								"auditOpinion" : auditOpinion,
								"auditResult" : 3,
								"orgCancelApplyPoId" : orgCancelApplyPoId,
								"orgInfoId" : orgInfoId
							};
							// 提交主机构审核意见信息
							$.ajax({
										url : basePath + "/orgInfo/auditApplyCancelRootOrgInfo",
										asyn : false,
										type : "POST",
										data : auditInfo,
										dataType : "json",
										success : function(dataStr) {
											if (dataStr) {
												if (dataStr.success) {
													commonUtil.showPopup("提示","保存成功");
													searchOrgCancelApplyPo(1);
												} else {
													commonUtil.showPopup("提示",dataStr.msg);
													return;
												}
											} else {
												commonUtil.showPopup("提示","保存主机构服务异常忙，请稍后重试");
												return;
											}
										}
									});
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
 * 编辑审核信息提交
 * @param orgInfoId 组织ID
 * @author zhangya 2017年5月22日
 */
function batchAudit(orgCancelApplyPoIds, orgInfoIds) {
	$
			.confirm({
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
							var auditOpinion = this.$content.find(
									'#auditOpinion').val();
							if (!auditOpinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							var auditInfo = {
								"auditOpinion" : auditOpinion,
								"auditResult" : 2,
								"orgCancelApplyPoIds" : orgCancelApplyPoIds,
								"orgInfoIds" : orgInfoIds
							};
							// 提交主机构审核意见信息
							$.ajax({
										url : basePath + "/orgInfo/batchAuditApplyCancelRootOrgInfo",
										asyn : false,
										type : "POST",
										data : auditInfo,
										dataType : "json",
										success : function(dataStr) {
											if (dataStr) {
												if (dataStr.success) {
													commonUtil.showPopup("提示","保存成功");
													searchOrgCancelApplyPo(1);
												} else {
													commonUtil.showPopup("提示",dataStr.msg);
													return;
												}
											} else {
												commonUtil.showPopup("提示","保存主机构服务异常忙，请稍后重试");
												return;
											}
										}
									});
						}
					},
					formSubmit1 : {
						text : '不通过',
						btnClass : 'btn-red',
						action : function() {
							var auditOpinion = this.$content.find('#auditOpinion').val();
							if (!auditOpinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							var auditInfo = {
								"auditOpinion" : auditOpinion,
								"auditResult" : 3,
								"orgCancelApplyPoIds" : orgCancelApplyPoIds,
								"orgInfoIds" : orgInfoIds
							};
							// 提交主机构审核意见信息
							$.ajax({
										url : basePath + "/orgInfo/batchAuditApplyCancelRootOrgInfo",
										asyn : false,
										type : "POST",
										data : auditInfo,
										dataType : "json",
										success : function(dataStr) {
											if (dataStr) {
												if (dataStr.success) {
													commonUtil.showPopup("提示","保存成功");
													searchOrgCancelApplyPo(1);
												} else {
													commonUtil.showPopup("提示",dataStr.msg);
													return;
												}
											} else {
												commonUtil.showPopup("提示","保存主机构服务异常忙，请稍后重试");
												return;
											}
										}
									});
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
