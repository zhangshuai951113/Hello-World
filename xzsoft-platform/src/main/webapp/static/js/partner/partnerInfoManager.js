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
	searchPartnerInfo(1);
	
	//启用
	$("body").on("click",".enable-partner",function(){
		//初始化数据
		$("#myModalLabel").html("启用合作伙伴");
		$("#remarks").val("");
		
		//合作伙伴ID
		var partnerInfoId = $(this).parent().attr("data-id");
		$("#hidden_partner_info_ids").val(partnerInfoId);
		$("#hidden_is_available").val(1);
		
		//打开弹框
		$("#partnerModal").modal("show");
	});
	
	//停用
	$("body").on("click",".disable-partner",function(){
		//初始化数据
		$("#myModalLabel").html("停用合作伙伴");
		$("#remarks").val("");
		
		//合作伙伴ID
		var partnerInfoId = $(this).parent().attr("data-id");
		$("#hidden_partner_info_ids").val(partnerInfoId);
		$("#hidden_is_available").val(0);
		
		//打开弹框
		$("#partnerModal").modal("show");
	});
	
});

/**
 * 分页查询
 * @author chengzhihuan 2017年6月1日
 * @param number 页数
 */
function pagerGoto(number) {
	searchPartnerInfo(number);
}

/**
 * 跳转到某页
 * @author chengzhihuan 2017年6月1日
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
	
	searchPartnerInfo(goPage);
}

/**
 * 根据页数查询合作伙伴信息
 * @author chengzhihuan 2017年6月1日
 * @param number 页数
 */
function searchPartnerInfo(number){
	//启用状态
	var isAvailable = $("#is_available").val();
	
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
	
	//请求地址
	var url = basePath + "/partner/listPartnerInfo #partner_info";
	$("#search_partner_info").load(url,{"page":number,"rows":10,"isAvailable":isAvailable,
		"confirmTimeStartStr":confirmTimeStartStr,"confirmTimeEndStr":confirmTimeEndStr},function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
			  liveDrag:true, 
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging"
			});
		})
}

/**
 * 启用/停用合作伙伴
 */
function optPartnerInfo(){
	//合作伙伴信息ID
	var partnerInfoIds = $("#hidden_partner_info_ids").val();
	if(partnerInfoIds==undefined || partnerInfoIds==""){
		commonUtil.showPopup("提示","所选记录不能为空");
		return;
	}
	
	//操作类型
	var isAvailable = $("#hidden_is_available").val();
	if(isAvailable==undefined || isAvailable==""){
		commonUtil.showPopup("提示","操作类型不能为空");
		return;
	}
	
	//备注
	var remarks = $.trim($("#remarks").val());
	if(remarks==undefined || remarks==""){
		commonUtil.showPopup("提示","备注信息必填");
		return;
	}
	
	if(remarks.length>160){
		commonUtil.showPopup("提示","备注信息不能超过80个汉字");
		return;
	}
	
	//启用/停用
	$.ajax({
		url : basePath + "/partner/modifyPartnerInfoAvailable",
		asyn : false,
		type : "POST",
		data : {"partnerInfoIds":partnerInfoIds, "isAvailable":isAvailable, "remarks":remarks},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#partnerModal").modal("hide");
					//刷新页面
					window.location.href = basePath+"/partner/showPartnerInfoPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","操作合作伙伴服务异常忙，请稍后重试");
				return;
			}
		}
	});
	
}