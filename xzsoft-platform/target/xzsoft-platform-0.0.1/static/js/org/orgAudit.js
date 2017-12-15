$(function() {
	// 搜索
	searchOrgInfoForAudit(1);
});
/**
 * 审核信息填写
 */
$("body").on("click", ".audit-operation", function() {
	var orgInfoId = $(this).parent().attr("org-info-id");
	// 主键ID存在则进行审核
	if (orgInfoId) {
		checkBeforeAudit(orgInfoId);
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});
/**
 * 组织信息查看
 */
$("body").on("click",".view-operation",function() {
	var orgInfoId = $(this).parent().attr("org-info-id");
	$("#org_info_id").val(orgInfoId);
	$("#view_audit_form").attr("action",basePath + "/orgInfo/rootOrgInfoViewAndAuditPage");
	$("#view_audit_form").submit();
});

// 全选/全不选
$("body").on("click", ".all_root_org_check", function() {
	var disabled = false;
	var style = "operation-button operation-blue";
	if ($(".all_root_org_check").is(":checked")) {
		// 全选时
		$(".sub_root_org_check").each(function() {
			$(this).prop("checked", true);
			if ($(this).attr("data-audit-result") != 1) {
				disabled = true;
				style = "operation-button operation-grey";
			}
		});
	} else {
		// 全不选时
		$(".sub_root_org_check").each(function() {
			$(this).prop("checked", false);
		});
	}
	$("#auditBtn").attr("disabled", disabled);
	$("#auditBtn").attr("class", style);
});

//部分选择判断
$("body").on("click", ".sub_root_org_check", function() {
	var disabled = false;
	var isAll =true;
	var style = "operation-button operation-blue";
	$(".sub_root_org_check").each(function() {
		if ($(this).is(":checked")) {
			$(this).prop("checked", true);
			if ($(this).attr("data-org-status") != 1) {
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
	$(".all_root_org_check").prop("checked", isAll);
});

/**
 * 审核勾选的主机构
 */
function auditCheckedOrg() {
	// 所有选中主机构ID
	var orgIds = findAllCheckOrgIds();
	if (orgIds == undefined || orgIds == "") {
		commonUtil.showPopup("提示", "请选择要审核的主机构");
		return;
	}

	// 审核
	batchAudit(orgIds);
}

/**
 * 获取所有选中的主机构ID
 * @author zhangya 2017年5月26日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckOrgIds() {
	// 所有选中主机构ID
	var orgIds = new Array();
	$(".sub_root_org_check").each(function() {
		if ($(this).is(":checked")) {
			orgIds.push($(this).attr("data-id"))
		}
	});
	return orgIds.join(",");
}

/**
 * 分页查询
 * @param number 页数
 */
function pagerGoto(number) {
	searchOrgInfoForAudit(number);
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
		alert("请输出正确的数字");
		return;
	}

	// 跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}

	searchOrgInfoForAudit(goPage);
}

/**
 * 根据页数查询机构
 * @param number
 */
function searchOrgInfoForAudit(number) {
	// 组织名称
	var orgName = $.trim($("#orgName").val());
	// 审核状态
	var orgStatus = $("#orgStatus").val();

	// 请求地址
	var url = basePath + "/orgInfo/orgInfoForAuditData #org_info";
	$("#search_org_info").load(url, {
		"page" : number,
		"rows" : 10,
		"orgName" : orgName,
		"orgStatus" : orgStatus
	}, function() {
		$("#tableDrag").colResizable({
		 liveDrag:true, 
		  partialRefresh:true,
		  gripInnerHtml:"<div class='grip'></div>", 
		  draggingClass:"dragging"
		});
		
	})
}

/**
 * 审核信息填写
 * @author zhangya 2017年5月24日
 * @param orgInfoId  组织ID
 */
function checkBeforeAudit(orgInfoId) {
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
					audit(orgInfoId);
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "查询组织信息服务异常忙，请稍后重试");
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
function audit(orgInfoId) {
	$
			.confirm({
				title : '请您填写审核意见:',
				content : ''
						+ '<form action="" class="formName">'
						+ '<div class="form-group">'
						+ '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px;  resize: none;" />'
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
								"orgStatus" : 3,
								"orgInfoId" : orgInfoId
							};
							// 提交主机构审核意见信息
							$.ajax({
								url : basePath + "/orgInfo/auditRootOrgInfo",
								asyn : false,
								type : "POST",
								data : auditInfo,
								dataType : "json",
								success : function(dataStr) {
									if (dataStr) {
										if (dataStr.success) {
											commonUtil.showPopup("提示", "保存成功");
											searchOrgInfoForAudit(1);
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
								"orgStatus" : 2,
								"orgInfoId" : orgInfoId
							};
							// 提交主机构审核意见信息
							$.ajax({
								url : basePath + "/orgInfo/auditRootOrgInfo",
								asyn : false,
								type : "POST",
								data : auditInfo,
								dataType : "json",
								success : function(dataStr) {
									if (dataStr) {
										if (dataStr.success) {
											commonUtil.showPopup("提示", "保存成功");
											searchOrgInfoForAudit(1);
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
function batchAudit(orgInfoIds) {
	$.confirm({
				title : '请您填写审核意见:',
				content : ''
						+ '<form action="" class="formName">'
						+ '<div class="form-group">'
						+ '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px; resize: none;" />'
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
								"orgStatus" : 3,
								"orgInfoIds" : orgInfoIds
							};
							// 提交主机构审核意见信息
							$.ajax({
								url : basePath + "/orgInfo/batchAuditRootOrgInfo",
								asyn : false,
								type : "POST",
								data : auditInfo,
								dataType : "json",
								success : function(dataStr) {
									if (dataStr) {
										if (dataStr.success) {
											commonUtil.showPopup("提示", "保存成功");
											searchOrgInfoForAudit(1);
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
							var auditOpinion = this.$content.find(
									'#auditOpinion').val();
							if (!auditOpinion) {
								commonUtil.showPopup("提示", "审核意见不能为空！");
								return false;
							}
							var auditInfo = {
								"auditOpinion" : auditOpinion,
								"orgStatus" : 2,
								"orgInfoIds" : orgInfoIds
							};
							// 提交主机构审核意见信息
							$.ajax({
								url : basePath + "/orgInfo/batchAuditRootOrgInfo",
								asyn : false,
								type : "POST",
								data : auditInfo,
								dataType : "json",
								success : function(dataStr) {
									searchOrgInfoForAudit(1);
									if (dataStr) {
										if (dataStr.success) {
											commonUtil.showPopup("提示", "保存成功");
											
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