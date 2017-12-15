$(function() {
	initIsCombine();
	initIsAuditable();
	
	//图片预览
	$('.input-img').viewer({
		title:false
	});
});

/**
 * 初始化操作按钮的显示
 */
function initIsAuditable(){
	var orgStatus =$("#orgStatus").val();
	if(orgStatus !=1){
		$("#auditOpinion").attr("readonly","readonly");
		$("#btns").hide();
	}
	
}
/**
 * 初始化三证合一显示
 * 
 * @author chengzhihuan 2017年5月18日
 */
function initIsCombine() {
	// 取出是否三证合一字段
	var isCombine = $("#is_combine").val();
	// 若是三证合一则隐藏税务登记证与组织机构代码证
	if (isCombine && isCombine == 1) {
		$("#is_combine_div").hide();
		$("#tax_img_div").hide();
		$("#org_img_div").hide();
	}
}

/**
 * 查看页面审核信息提交
 * 
 * @author zhangya 2017年5月24日
 * 
 */
function viewAndAudit(orgStatus) {
	// 主机构id
	var orgInfoId = $.trim($("#orgInfoId").val());
	if (orgInfoId == undefined || orgInfoId == "") {
		commonUtil.showPopup("提示", "组织信息无效！");
		return;
	}
	// 校验审核意见
	var auditOpinion = $.trim($("#auditOpinion").val());
	if (auditOpinion == undefined || auditOpinion == "") {
		commonUtil.showPopup("提示", "审核意见不能为空");
		return;
	}
	var auditInfo = {
		"auditOpinion" : auditOpinion,
		"orgStatus" : orgStatus,
		"orgInfoId" : orgInfoId
	};
	// 校验是否管理员

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
					commonUtil.showPopup("提示", dataStr.msg);
					
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存主机构服务异常忙，请稍后重试");
				return;
			}
		}
	});
}
