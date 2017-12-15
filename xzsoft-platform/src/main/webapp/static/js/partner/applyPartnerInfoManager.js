$(function(){
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
    
	//搜索
	searchApplyPartnerInfo(1);
	
	//关闭弹框
	$("body").on("click",".partner-opt-close",function(){
		$("#show_apply_partner_info").empty();
	});
	
	//选中合作伙伴
	$(document).delegate('#searchList li', 'click', function(){
		//伙伴名称
        var partnerName = $(this).text();
        //伙伴编码
        var partnerCode = $(this).attr('data-id');

        //赋值
        $('#partner_info_partner_name').val(partnerName);
        $('#partner_info_partner_code').val(partnerCode);
        $('#searchList').hide();
    });
	
	//同意
	$("body").on("click",".agree-partner",function(){
		//申请编码
		var applyId = $(this).parent().attr("data-id");
		operatePartnerApply(applyId ,3);
	});
	
	//拒绝
	$("body").on("click",".refuse-partner",function(){
		//申请编码
		var applyId = $(this).parent().attr("data-id");
		operatePartnerApply(applyId ,2);
	});
	
	//再次申请
	$("body").on("click",".reapply-partner",function(){
		//申请编码
		var applyId = $(this).parent().attr("data-id");
		operatePartnerApply(applyId ,1);
	});
	
});

/**
 * 分页查询
 * @author chengzhihuan 2017年5月31日
 * @param number 页数
 */
function pagerGoto(number) {
	searchApplyPartnerInfo(number);
}

/**
 * 跳转到某页
 * @author chengzhihuan 2017年5月31日
 */
function btnPagerGoto() {
	//取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	//取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	//数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		commonUtil.showPopup("提示","请输出正确的数字");
		return;
	}
	
	//跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	
	searchApplyPartnerInfo(goPage);
}

/**
 * 根据页数查询合作伙伴申请信息
 * @author chengzhihuan 2017年5月31日
 * @param number 页数
 */
function searchApplyPartnerInfo(number){
	//伙伴状态
	var relationStatus = $("#relation_status").val();
	//申请类型
	var operateType= $("#operate_type").val();
//	if(operateType==undefined || operateType==""){
//		commonUtil.showPopup("提示","申请类型不能为空");
//		return;
//	}
//	
	//确认开始时间
	var confirmTimeStartStr = $("#confirm_time_start_str").val();
	var startStrIsNotNull = true;
	if(confirmTimeStartStr==undefined || confirmTimeStartStr==""){
		startStrIsNotNull = false;
	}
	
	//确认结束时间
	var confirmTimeEndStr = $("#confirm_time_end_str").val();
	var endStrIsNotNull = true;
	if(confirmTimeEndStr==undefined || confirmTimeEndStr==""){
		endStrIsNotNull = false;
	}
	
	if((startStrIsNotNull && !endStrIsNotNull) || (!startStrIsNotNull&&endStrIsNotNull) ){
		commonUtil.showPopup("提示","确认时间只能同时为空或同时不为空");
		return;
	}
	
	if(confirmTimeStartStr>confirmTimeEndStr){
		commonUtil.showPopup("提示","确认开始时间不能大于确认结束时间");
		return;
	}
	
	var partnerRole=$.trim($("#partnerRole").val());
	
	//请求地址
	var url = basePath + "/partner/listApplyPartnerInfo #apply_partner_info";
	$("#search_apply_partner_info").load(url,{"page":number,"rows":10,"operateType":operateType,"relationStatus":relationStatus,
		"confirmTimeStartStr":confirmTimeStartStr,"confirmTimeEndStr":confirmTimeEndStr,"partnerRole":partnerRole},function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
			  liveDrag:true, 
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging"
			});
		})
}

function resetPartner(){
	setTimeout(function(){
		searchApplyPartnerInfo(1);
	},500);
}

/**
 * 新增伙伴申请信息初始化页
 * @author chengzhihuan 2017年6月1日
 */
function addApplyPartnerInfoInitPage(){
	//请求地址
	var url = basePath + "/partner/addApplyPartnerInfoInitPage #add_apply_partner_info";
	$("#show_apply_partner_info").load(url,{},function(){
		//允许表格拖着
		$("#tableDrag").colResizable({
		  liveDrag:true, 
		  gripInnerHtml:"<div class='grip'></div>", 
		  draggingClass:"dragging"
		});
	})
}

/**
 * 提交合作伙伴申请
 * @author chengzhihuan
 * @date 2017-6-1
 */
function submitApplyPartner(){
	//发起方编码
	var originCode = $("#partner_info_origin_code").val();
	if(originCode==undefined || originCode==""){
		commonUtil.showPopup("提示","发起方不能为空");
		return;
	}
	
	//伙伴角色
	var partnerRole = $("#partner_info_partner_role").val();
	if(partnerRole==undefined || partnerRole==""){
		commonUtil.showPopup("提示","伙伴角色不能为空");
		return;
	}
	
	//伙伴编码
	var partnerCode = $("#partner_info_partner_code").val();
	if(partnerCode==undefined || partnerCode==""){
		commonUtil.showPopup("提示","合作伙伴不能为空");
		return;
	}
	
	//业务类型
	var businessType= $("#partner_info_business_type").val();
	if(businessType==undefined || businessType==""){
		commonUtil.showPopup("提示","业务类型不能为空");
		return;
	}
	
	$.ajax({
		type : "POST",
		url : basePath + "/partner/addApplyPartnerInfo",
		data :  $('#apply_partner_form').serialize(),
		success : function(dataStr){
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#show_apply_partner_info").empty();
					//刷新页面
					window.location.href = basePath + "/partner/showApplyPartnerInfoPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","搜索伙伴信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 搜索合作伙伴
 * @author chengzhihuan
 * @date 2017-6-1
 */
function searchPartner(){
	//伙伴角色
	var partnerRole = $("#partner_info_partner_role").val();
	if(partnerRole==undefined || partnerRole==""){
		commonUtil.showPopup("提示","请选择伙伴角色后再搜索合作伙伴");
		return;
	}
	
	//伙伴名称
	var partnerName = $.trim($('#partner_info_partner_name').val());
	if(partnerName!=undefined && partnerName!=""){
		//根据伙伴名称搜索合作伙伴
		$.ajax({
			type : "POST",
			url : basePath + "/partner/searchPartnerInfo",
			data : {"partnerRole":partnerRole,"partnerName":partnerName},
			success : function(dataStr){
				if(dataStr){
					//伙伴
					var partnerList =  dataStr.partnerList;
					var isSuccess = dataStr.success;
					if(isSuccess){
						//伙伴数据拼接
						var str = '';
						if(partnerList){
							$.each(partnerList,function(index,item){
								str += '<li data-id="'+item.partnerCode+'">'+item.partnerName+'</li>';
							});
						}
						//清空原数据
						$('#searchList').empty();
						//显示新查询的数据
						$('#searchList').append(str).show();
					}else{
						commonUtil.showPopup("提示",dataStr.msg);
						return;
					}
				}else{
					commonUtil.showPopup("提示","搜索合作伙伴服务异常忙，请稍后重试");
					return;
				}
			}
		});
	}
	
}

/**
 * 重置合作伙伴信息
 * @author chengzhihuan
 * @date 2017-6-1
 */
function resetPartnerInfo(){
	$("#partner_info_partner_name").val("");
	$("#partner_info_partner_code").val("");
	$("#searchList").empty();
}

/**
 * 再次提交申请/同意/拒绝合作伙伴申请
 * @author chengzhihuan
 * @date 2017-6-1
 * @param applyIds 申请编号
 * @param optType 操作类型 1:再次提交申请 2:拒绝 3:确认
 */
function operatePartnerApply(applyIds,optType){
	var contentText = "";
	if(optType==3){
		contentText = "是否同意该申请";
	}else if(optType==2){
		contentText = "是否拒绝该申请";
	}else if(optType==1){
		contentText = "是否再次提交申请";
	}
	
	$.confirm({
		title: "提示",
		content: contentText,
		buttons: {
	    	'确认': function () {
	    		//主键ID存在
	    		if(applyIds){
	    			$.ajax({
	    				type : "POST",
	    				url : basePath + "/partner/confirmApplyPartnerInfo",
	    				data : {"partnerInfoTempIds":applyIds,"relationStatus":optType},
	    				success : function(dataStr){
	    					if(dataStr){
	    						if(dataStr.success){
	    							//刷新页面
	    							window.location.href = basePath + "/partner/showApplyPartnerInfoPage";
	    						}else{
	    							commonUtil.showPopup("提示",dataStr.msg);
	    							return;
	    						}
	    					}else{
	    						commonUtil.showPopup("提示","处理合作伙伴申请服务异常忙，请稍后重试");
	    						return;
	    					}
	    				}
	    			});
	    		}
	    	},
	        '取消': function () {
	        	
	        }
	    }
	});
}