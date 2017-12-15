//单据条目数  （与数组长度一致）
var accountInfoTotal =0;

//运费小计
var transportPriceSubtotal =0 ;

var accountIds = new Array();
$(function(){
	searchInvoiceInfo(1);
	
	//关闭弹框
	$("body").on("click",".invoice-opt-close",function(){
		$("#show_invoice_info").empty();
	});
	
	//修改发票信息
	$("body").on("click",".modify-operation",function(){
		//发票主单ID
		var invoiceInfoId = $(this).parent().attr("data-id");
		addOrEditInvoiceInfoPage(invoiceInfoId);
	});
	
	//删除发票信息
	$("body").on("click",".delete-operation",function(){
		//发票主单ID
		var invoiceInfoId = $(this).parent().attr("data-id");
		if(invoiceInfoId && invoiceInfoId!=""){
			deleteInvoiceInfo(invoiceInfoId);
		}
	});
	
	//提交审核发票信息
	$("body").on("click",".submit-operation",function(){
		//发票主单ID
		var invoiceInfoId = $(this).parent().attr("data-id");
		if(invoiceInfoId && invoiceInfoId!=""){
			operateInvoiceInfo(invoiceInfoId,2);
		}
	});
	
	//审核发票信息
	$("body").on("click",".audit-operation",function(){
		var invoiceStatus = $(this).parent().attr("date-invoiceStatus");
		if(invoiceStatus == 3){
			xjValidate.showPopup("发票已审核通过!","提示",true);
		}else if(invoiceStatus == 2){
			//初始化模板描述
			$("#myModalLabel").html("发票审核");
			$("#modal_opearate_title").html("审核意见:");
			$("#modal_opearate_reason").val("");
			$("#modal_opearate_reason").attr("placeholder","请输入审核意见");
			$("#modal_invoice_info_id").attr("operate-type",3);
			
			//发票主单ID
			var invoiceInfoId = $(this).parent().attr("data-id");
			if(invoiceInfoId && invoiceInfoId!=""){
				$("#modal_invoice_info_id").val(invoiceInfoId);
			}
			$('#disableModal').modal('show');
		}else{
			xjValidate.showTip("待审核状态才能进行发票审核!");
		}
		
	});
	
	//发票主单全选/全不选
	$("body").on("click",".all_invoice_check",function(){
		if($(".all_invoice_check").is(":checked")){
			//全选时
			$(".sub_invoice_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_invoice_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	
	//对账单全选/全不选
	$("body").on("click",".all_account_check",function(){
		if($(".all_account_check").is(":checked")){
			//全选时
			$(".sub_account_check").each(function(){
				$(this).prop("checked",true);
				accountInfoTotal++;
				accountIds.push(($(this).attr("data-id")));
				//确认账款 汇总到运费小计
				transportPriceSubtotal += ($(this).attr("confirmPrice") == "") ? 0: Number($(this).attr("confirmPrice"));
			});
		}else{
			//全不选时
			$(".sub_account_check").each(function(){
				$(this).prop("checked",false);
				accountInfoTotal--;
				//获取当前元素的索引
				var index = $.inArray($(this).attr("data-id"),accountIds);
				//删除
				accountIds.splice(index,1);
				transportPriceSubtotal -= ($(this).attr("confirmPrice") == "") ? 0: Number($(this).attr("confirmPrice"));
			});
		}
	});
	
	// 对账单部分选择判断
	$("body").on("click", ".sub_account_check", function() {
		if ($(this).is(":checked")) {
			$(this).prop("checked", true);
			accountInfoTotal++;
			accountIds.push(($(this).attr("data-id")));
			//确认账款  汇总到运费小计
			transportPriceSubtotal += ($(this).attr("confirmPrice") == "") ? 0: Number($(this).attr("confirmPrice"));
		}else{
			$(this).prop("checked", false);
			accountInfoTotal--;
			//获取当前元素的索引
			var index = $.inArray($(this).attr("data-id"),accountIds);
			//删除
			accountIds.splice(index,1);
			transportPriceSubtotal -= ($(this).attr("confirmPrice") == "") ? 0: Number($(this).attr("confirmPrice"));
		}
	});
	
	//调用时间插件
	setTimeout(function () {
	  $(".date-time").datetimepicker({
	    format: "YYYY-MM-DD",
	    autoclose: true,
	    todayBtn: true,
	    todayHighlight: true,
	    showMeridian: true,
	    pickTime: false
	  });
	}, 500)
})


/**
 * 绑定上传事件的dom对象
 * @author chengzhihuan 2017年5月18日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn,{
   		action: basePath + '/upload/imageUpload',
   		name: 'myfile',
		dataType: 'json',
   		onSubmit : function(file , ext){
   			// 文件上传格式校验
			if (!(ext && /^(jpg|png|bmp|docx|doc|pdf|xls|xlsx)$/.test(ext.toLowerCase()))) {
				xjValidate.showPopup( "请上传格式为 jpg|png|bmp|docx|doc|pdf|xls|xlsx 的文件","提示",true);
				return;
			}
   		},
   		//服务器响应成功时的处理函数
   		onComplete :function(file, resultJson){
   			if(resultJson){
   				resultJson = $.parseJSON(resultJson);
   				//是否成功
   				var isSuccess = resultJson.isSuccess;
   				//上传图片URL
   				var uploadUrl = resultJson.uploadUrl;
   				if(isSuccess=="true"){
   					//图片类型
   					var imgType = btn.attr("img-type");
   					var imgText = btn.attr("img-text");
					btn.attr("src",fastdfsServer+"/"+uploadUrl);
					$("#"+imgType).val(uploadUrl);
					$("#"+imgText).text(file);
   				}else{
   					$.alert(resultJson.errorMsg);
   	   				return;
   				}
   			}else{
   				$.alert("服务器异常，请稍后重试");
   				return;
   			}
		}
	});
}

/**
 * 分页查询
 * @author luojaun 2017年7月10日
 * @param number 页数
 */
function pagerGoto(number) {
	searchInvoiceInfo(number);
}

/**
 * 跳转到某页
 * @author luojaun 2017年7月10日
 */
function btnPagerGoto() {
	//取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	//取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	//数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		xjValidate.showPopup("请输出正确的数字","提示",true);
		return;
	}
	
	//跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	searchInvoiceInfo(goPage);
}

/**
 * 分页查询发票管理页面
 *
 *@author luojuan 2017年7月8日
 *@param number 页数
 */
function searchInvoiceInfo(number){
	//发票号码
	var invoiceId = $.trim($("#s_invoice_id").val());
	
	//发票代码
	var invoiceCode = $.trim($("#s_invoice_code").val());
	
	//对账单号
	var accountCheckId = $.trim($("#s_account_check_id").val());
	
	//客户名称
	var customerId = $.trim($("#s_customer_id").val());
	
	//开票日期Strat
	var billingDateStrat = $.trim($("#billing_date_start").val());
	
	//开票日期End
	var billingDateEnd = $.trim($("#billing_date_end").val());
	
	//组织部门
	var projectInfoId = $.trim($("#s_project_info_id").val());
	
	//发票分类
	var invoiceClassify = $("#s_invoice_classify").val();
	
	//单据状态
	var invoiceStatus = $("#s_invoice_status").val();
	
	//请求地址
	var url = basePath + "/invoiceInfo/showInvoiceInfolistPage #invoice-info-data";
	$("#search-invoice-info").load(url,
		{"page":number,"rows":10,
		"invoiceId":invoiceId,
		"invoiceCode":invoiceCode,
		"accountCheckId":accountCheckId,
		"customerId":customerId,
		"billingDateStrat":billingDateStrat,
		"billingDateEnd":billingDateEnd,
		"projectInfoId":projectInfoId,
		"invoiceClassify":invoiceClassify,
		"invoiceStatus":invoiceStatus},
		function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
			  liveDrag:true, 
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging",
			  resizeMode: 'overflow'
			});
		})
}

/**
 * 新增/编辑发票管理信息初始页
 * 
 * @author luojuan 2017年7月10日
 * @param invoiceInfoId 发票主键ID
 */
function addOrEditInvoiceInfoPage(invoiceInfoId){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(invoiceInfoId!=undefined && invoiceInfoId!=""){
		operateType = 2;
	}else{
		operateType = 1;
	}
	//请求地址
	var url = basePath + "/invoiceInfo/initInvoicePage #invoice-data-info";
	$("#show_invoice_info").load(url,{"invoiceInfoId":invoiceInfoId,"operateType":operateType},function(data){
		
	})
}

/**
 * 新增/编辑发票管理
 * 
 * @author luojuan 2017年7月10日
 */
function addOrUpdateInvoiceInfo(){
	//发票编号
	var invoiceId = $.trim($("#invoice_id").val());
	if(invoiceId==undefined || invoiceId==""){
		xjValidate.showTip("发票编号不能为空");
		return;
	}
	
	if(invoiceId.length>100){
		xjValidate.showTip("发票编号不能超过100个字符");
		return;
	}
	
	//发票号码
	var invoiceCode = $.trim($("#invoice_code").val());
	if(invoiceCode==undefined || invoiceCode==""){
		xjValidate.showTip("发票号码不能为空");
		return;
	}
	
	if(invoiceCode.length>60){
		xjValidate.showTip("发票号码不能超过60个字符");
		return;
	}
	
	//购买方
	var purchaser = $.trim($("#purchaser").val());
	if(purchaser.length>60){
		xjValidate.showTip("购买方不能超过30个汉字");
		return;
	}
	
	//购买方纳税识别号
	var purchaserTaxDistinguishId = $.trim($("#purchaser_tax_distinguish_id").val());
	if(purchaserTaxDistinguishId.length>100){
		xjValidate.showTip("购买方纳税识别号不能超过100个字符");
		return;
	}
	
	//发货人
	var forwarding = $.trim($("#forwarding").val());
	if(forwarding.length>60){
		xjValidate.showTip("发货人不能超过30个汉字");
		return;
	}
	
	//发货人纳税识别号
	var forwardingTaxDistinguishId = $.trim($("#forwarding_tax_distinguish_id").val());
	if(forwardingTaxDistinguishId.length>100){
		xjValidate.showTip("发货人纳税识别号不能超过100个字符");
		return;
	}
	
	//销售方
	var sales = $.trim($("#sales").val());
	if(sales==undefined || sales==""){
		xjValidate.showTip("销售方不能为空");
		return;
	}
	
	if(sales.length>60){
		xjValidate.showTip("销售方不能超过30个汉字");
		return;
	}
	
	//销售方纳税识别号
	var salesTaxDistinguishId = $.trim($("#sales_tax_distinguish_id").val());
	if(salesTaxDistinguishId==undefined || salesTaxDistinguishId==""){
		xjValidate.showTip("销售方纳税识别号不能为空");
		return;
	}
	
	if(salesTaxDistinguishId.length>100){
		xjValidate.showTip("销售方纳税识别号不能超过100个字符");
		return;
	}
	
	//数量（重量）
	var quantity = $.trim($("#quantity").val());
	if(quantity==undefined || quantity==""){
		xjValidate.showTip("数量不能为空");
		return;
	}
	
	if(quantity.length>14){
		xjValidate.showTip("数量不能超过14位数字");
		return;
	}
	
	//其他费用
	var otherPrice = $.trim($("#other_price").val());
	if(otherPrice==undefined || otherPrice==""){
		xjValidate.showTip("其他费用不能为空");
		return;
	}
	
	if(otherPrice.length>14){
		xjValidate.showTip("其他费用不能超过14位数字");
		return;
	}
	
	//组织部门
	var projectInfoId = $("#project_info_id").val();
	if(projectInfoId==undefined || projectInfoId==""){
		xjValidate.showTip("组织部门不能为空");
		return;
	}
	
	//客户编号
	var customerId = $("#customer_id").val();
	if(customerId==undefined || customerId==""){
		xjValidate.showTip("客户编号不能为空");
		return;
	}
	
	//对账单编号
	var accountCheckIds = $("#account_check_id").val();
	if(accountCheckIds==undefined || accountCheckIds==""){
		xjValidate.showTip("对账单编号不能为空");
		return;
	}
	
	//发票分类
	var invoiceClassify = $("#invoice_classify").val();
	if(invoiceClassify==undefined || invoiceClassify==""){
		xjValidate.showTip("发票分类不能为空");
		return;
	}
	
	//备注
	var remarks = $.trim($("#remarks").val());
	if(remarks.length>200){
		xjValidate.showTip("备注不能超过100个汉字");
		return;
	}
	
	//运费小计
	var transportPriceSubtotal = $("#transport_price_subtotal").val();
	if(transportPriceSubtotal==undefined || transportPriceSubtotal==""){
		xjValidate.showTip("运费小计不能为空");
		return;
	}
	
	if(transportPriceSubtotal.length>14){
		xjValidate.showTip("运费小计不能超过14位数字");
		return;
	}
	
	//合计金额
	var totalPrice = $("#total_price").val();
	if(totalPrice==undefined || totalPrice==""){
		xjValidate.showTip("合计金额不能为空");
		return;
	}
	
	if(totalPrice.length>14){
		xjValidate.showTip("合计金额不能超过14位数字");
		return;
	}
	
	//新增/编辑发票管理信息
	$.ajax({
		url : basePath + "/invoiceInfo/addOrUpdateinvoice",
		asyn : false,
		type : "POST",
		data : $('#invoice_info_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#show_invoice_info").empty();
					//刷新页面
					window.location.href = basePath + "/invoiceInfo/rootInvoiceInfolistPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存发票管理服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
}

/**
 * 搜索组织部门
 * 
 * @author luojuan 2017年7月10日
 */
function searchProject(){
	//请求地址
	var url = basePath + "/invoiceInfo/searchProjectInfoListPage #listInfo";
	$("#show_project_info").load(url,{},function(){
		
		// 关闭弹框
		$("body").on("click", ".project-opt-close", function() {
			$("#show_project_info").empty();
		});
		
		// 分页
		projectPagination = $(".pagination-list-project").operationList({
			"current" : 1, // 当前目标
			"maxSize" : 4, // 前后最大列表
			"itemPage" : 10, // 每页显示多少条
			"totalItems" : 0, // 总条数
			"chagePage" : function(current) {
				// 调用ajax请求拿最新数据
				projectList(current);
			}
		});
		
		projectList(1);
		
		// 绑定组织部门输入框
		$("body").on("click", ".sub_project_check", function() {
			var isChecked = $(this).is(":checked");
			$(".sub_project_check").prop("checked", false);
			if (isChecked) {
				$(this).prop("checked", isChecked);
			} else {
				$(this).prop("checked", isChecked);
			}
		});
		
	})
}

/**
 * 项目信息勾选
 * 
 * @author luojuan 2017年7月10日
 */
function projectSelect(){
	$(".sub_project_check").each(function() {
		if ($(this).is(":checked")) {
			$("#project_info_id").val($(this).attr("projectInfoId"));
			$("#project_info_name").val($(this).attr("projectName"));
			//alert($(this).attr("projectInfoId"));
			return false;
		}
	});
	$("#show_project_info").empty();
}

/**
 * 搜索客户编号
 * 
 * @author luojuan 2017年7月10日
 */
function searchCustomer(){
	//请求地址
	var url = basePath + "/invoiceInfo/searchCustomerListPage #customerlistInfo";
	$("#show_customer_info").load(url,{},function(){
		
		// 关闭弹框
		$("body").on("click", ".customer-opt-close", function() {
			$("#show_customer_info").empty();
		});
		
		customerPagination = $(".pagination-list-customer").operationList({
			"current" : 1, // 当前目标
			"maxSize" : 4, // 前后最大列表
			"itemPage" : 10, // 每页显示多少条
			"totalItems" : 0, // 总条数
			"chagePage" : function(current) {
				// 调用ajax请求拿最新数据
				customerList(current);
			}
		});
		
		customerList(1);
		
		// 绑定组织部门输入框
		$("body").on("click", ".sub_customer_check", function() {
			var isChecked = $(this).is(":checked");
			$(".sub_customer_check").prop("checked", false);
			if (isChecked) {
				$(this).prop("checked", isChecked);
			} else {
				$(this).prop("checked", isChecked);
			}
		});
	})
}

/**
 * 客户编号信息勾选
 * 
 * @author luojuan 2017年7月10日
 */
function customerSelect(){
	$(".sub_customer_check").each(function() {
		if ($(this).is(":checked")) {
			$("#customer_id").val($(this).attr("customerId"));
			$("#customer_name").val($(this).attr("orgName"));
			//alert($(this).attr("projectId"));
			return false;
		}
	});
	$("#show_customer_info").empty();
}

/**
 * 删除勾选的发票主单
 * 
 * @author luojuan 2017年7月10日
 */
function deleteCheckedInvoiceInfo(){
	var invoiceInfoIds = findAllCheckInvoiceInfoIds();
	if(invoiceInfoIds==undefined || invoiceInfoIds==""){
		xjValidate.showPopup("请选择需要删除的发票信息","提示",true);
		return;
	}
	
	//根据收款ID删除发票信息
	deleteInvoiceInfo(invoiceInfoIds);
}

/**
 * 删除发票信息
 * 
 * @author luojuan 2017年7月10日
 */
function deleteInvoiceInfo(invoiceInfoIds){
	//校验发票主单ID不能为空
	if (invoiceInfoIds == null) {
		xjValidate.showPopup("所选发票信息不能为空！","提示",true);
		return;
	}
	$.confirm({
		title: "提示",
		content: "是否要删除该数据？",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/invoiceInfo/deleteInvoiceInfo",
	    			asyn : false,
	    			type : "POST",
	    			data : {"invoiceInfoIds":invoiceInfoIds},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						xjValidate.showPopup("删除成功","提示",true);
	    						//刷新页面
	    						window.location.href = basePath + "/invoiceInfo/rootInvoiceInfolistPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup("删除发票信息异常，请稍后重试","提示",true);
	    					return;
	    				}
	    			}
	    		});
	    	},
	        '取消': function () {
	        }
	    }
	});
}

/**
 * 提交审核
 * 
 * @author luojuan 2017年7月10日
 */
function operateInvoiceInfo(invoiceInfoIds,operateType){
	//操作名称
	var operateName;
	if(operateType==2){
		operateName="提交审核";
	}else if(operateType==3){
		operateName="审核";
	}
	
	//根据发票ID提交审核/审核发票信息
	$.confirm({
		title: "提示",
		content: "是否确认"+operateName+"所选发票信息",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/invoiceInfo/operateInvoice",
	    			asyn : false,
	    			type : "POST",
	    			data : {"invoiceInfoIds":invoiceInfoIds,"operateType":operateType},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						window.location.href = basePath + "/invoiceInfo/rootInvoiceInfolistPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup(operateName+"发票服务异常忙，请稍后重试","提示",true);
	    					return;
	    				}
	    			}
	    		});
	    	},
	        '取消': function () {
	        	
	        }
	    }
	});
}

/**
 * 发票审核
 * 
 * @author luojuan 2017年7月13日
 */
function auditInvoiceInfo(){
	//操作类型
	var operateType = $("#modal_invoice_info_id").attr("operate-type");
	if(operateType==undefined || operateType==""){
		xjValidate.showPopup("操作类型不能为空","提示",true);
		return;
	}
	
	//操作名称
	var operateName;
	if(operateType == 3){
		operateName = "发票审核";
	}else{
		xjValidate.showPopup("未知操作","提示",true);
		return;
	}
	//操作发票
	var invoiceInfoId = $("#modal_invoice_info_id").val();
	
	//审核结果
	var auditResult = $.trim($("#modal_audit_result").val());
	
	//审核意见
	var auditOpinion = $.trim($("#modal_opearate_reason").val());
	
	$.ajax({
		url : basePath + "/invoiceInfo/operateInvoice",
		asyn : false,
		type : "POST",
		data : {"invoiceInfoIds":invoiceInfoId,"operateType":operateType,"auditResult":auditResult,"auditOpinion":auditOpinion},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$('#disableModal').modal('hide');
					window.location.href = basePath + "/invoiceInfo/rootInvoiceInfolistPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup(operateName+"发票服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
}

/**
 * 获取所有选中的发票主单ID
 * 
 * @author luojuan 2017年7月10日
 * @returns 发票主单ID，逗号分隔
 */
function findAllCheckInvoiceInfoIds(){
	//所有选中发票ID
	var invoiceInfoIds = new Array();
	$(".sub_invoice_check").each(function(){
		if($(this).is(":checked")){
			invoiceInfoIds.push($(this).attr("data-id"))
		}
	});
	
	return invoiceInfoIds.join(",");
}

/**
 * 获取所有选中的对账单ID
 * 
 * @author luojuan 2017年7月14日
 * @returns 对账单ID，逗号分隔
 */
function findAllCheckAccountIds(){
	//所有选中对账单ID
	var accountCheckInfoIds = new Array();
	$(".sub_account_check").each(function(){
		if($(this).is(":checked")){
			accountCheckInfoIds.push($(this).attr("accountCheckInfoId"))
		}
	});
	return accountCheckInfoIds.join(",");
}

/**
 * 获取所有选中的结算单ID
 * 
 * @author luojuan 2017年7月14日
 * @returns 结算单ID，逗号分隔
 */
function findAllCheckSettlementInfoIds(){
	//所有选中结算单ID
	var settlementInfoIds = new Array();
	$(".sub_account_check").each(function(){
		if($(this).is(":checked")){
			settlementInfoIds.push($(this).attr("settlementInfoId"))
		}
	});
	return settlementInfoIds.join(",");
}

/**
 * 搜索对账单信息
 * 
 * @author luojuan 2017年7月12日
 */
function searchAccountCheck(){
	//请求地址
	var url = basePath + "/invoiceInfo/searchAccountCheckListPage #accountCheckInfolist";
	$("#show_account_check_info").load(url,{},function(){
		transportPriceSubtotal = 0 ;
		// 关闭弹框
		$("body").on("click", ".account-opt-close", function() {
			$("#show_account_check_info").empty();
		});
		accountPagination = $(".pagination-list-account").operationList({
			"current" : 1, // 当前目标
			"maxSize" : 4, // 前后最大列表
			"itemPage" : 10, // 每页显示多少条
			"totalItems" : 0, // 总条数
			"chagePage" : function(current) {
				// 调用ajax请求拿最新数据
				accounttList(current);
			}
		});
		// 查询对账单数据
		accounttList(1);
		
		// 设置表格列宽可以拖动
		setTimeout(function(){
			$("#accountTableDrag").colResizable({
				  liveDrag:true, 
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  resizeMode: 'overflow'
			});
		},500);
		
	})
}

function findAllCheckAccountIdsLength(){
	//所有选中对账单ID
	var accountCheckInfoIds = new Array();
	$(".sub_account_check").each(function(){
		if($(this).is(":checked")){
			accountCheckInfoIds.push($(this).attr("accountCheckInfoId"))
		}
	});
	
	return accountCheckInfoIds.length;
}

/**
 * 对账单信息勾选
 * 
 * @author luojuan 2017年7月12日
 */
function accountSelect(){
	var accountCheckInfoId;
	var accountCheckInfoIds = findAllCheckAccountIds(); 
	var accountCheckInfoIdsLength = findAllCheckAccountIdsLength(); 

	$(".sub_account_check").each(function() {
		if ($(this).is(":checked")) {
			$("#account_check_id").val(accountCheckInfoIds);
			//$("#account_check_id").val($(this).attr("accountCheckInfoId"));
			$("#confirm_price").val($(this).attr("confirmPrice"));
			$("#already_amount").val($(this).attr("alreadyAmount"));
			$("#no_amount").val($(this).attr("noAmount"));
			$("#confirm_arrive_tonnage").val($(this).attr("confirmArriveTonnage"));
			$("#confirm_loss_tonnage").val($(this).attr("confirmLossTonnage"));
			$("#confirm_out_car").val($(this).attr("confirmOutCar"));
			$("#confirm_forwarding_tonnage").val($(this).attr("confirmForwardingTonnage"));
			$("#loss_difference").val($(this).attr("lossDifference"));
			$("#other_difference").val($(this).attr("otherDifference"));
			$("#income_tax_rate").val($(this).attr("incomeTaxRate"));
			$("#difference_income").val($(this).attr("differenceIncome"));
			$("#receivable_total").val($(this).attr("receivableTotal"));
			$("#payable_total").val($(this).attr("payableTotal"));
			$("#proxy_invoice_total").val($(this).attr("proxyInvoiceTotal"));
			$("#out_car").val($(this).attr("outCar"));
			$("#documents_total").val($(this).attr("documentsTotal"));
			$("#transport_price_subtotal").val(transportPriceSubtotal);
			$("#total_price").val(Number(transportPriceSubtotal)+Number($("#other_price").val()));
			return false;
		}
	});
	
	if(accountCheckInfoIdsLength>1){
		$("#transport_price_subtotal").attr("readonly",true);
	}
	
	$("#show_account_check_info").empty();
	
}

/**
 * 操作发票明细表
 * 
 * @author luojuan 2017年7月13日
 */
function operateInvoiceDetail(){
	var invoiceInfoId = findAllCheckInvoiceInfoIds();
	if(invoiceInfoId==undefined || invoiceInfoId==""){
		xjValidate.showPopup("请选择需要查看明细的发票信息","提示",true);
		return;
	}
	//请求地址
	var url = basePath + "/invoiceInfo/searchInvoiceDetailListPage #invoiceDetailInfolist";
	$("#show_invoice_detail_info").load(url,{"invoiceInfoId":invoiceInfoId},function(){
		// 关闭弹框
		$("body").on("click", ".invoice-detail-opt-close", function() {
			$("#show_invoice_detail_info").empty();
		});
		
		invoiceDetailList(1,invoiceInfoId);
	})
}

/**
 * 删除发票明细数据
 * 
 * @author luojuan 2017年7月14日
 */
function deleteInvoiceDetail(){
	var invoiceDetailIds;
	$(".sub_invoice_detail_check").each(function() {
		if ($(this).is(":checked")) {
			$("#invoice_detail_id").val($(this).attr("invoiceDetailId"));
			invoiceDetailIds = $(this).attr("invoiceDetailId");
			//alert($(this).attr("invoiceDetailId"));
			return false;
		}
	});
	$("#show_invoice_detail_info").empty();
	
	$.confirm({
		title: "提示",
		content: "是否要删除该数据？",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/invoiceInfo/deleteInvoiceDetailInfo",
	    			asyn : false,
	    			type : "POST",
	    			data : {"invoiceDetailIds":invoiceDetailIds},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						xjValidate.showPopup("删除成功","提示",true);
	    						//刷新页面
	    						window.location.href = basePath + "/invoiceInfo/rootInvoiceInfolistPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup("删除发票信息异常，请稍后重试","提示",true);
	    					return;
	    				}
	    			}
	    		});
	    	},
	        '取消': function () {
	        }
	    }
	});
}

/**
 * 计算合计金额
 * 
 * @author luojuan 2017年9月12日
 */
function totalPriceFun(){
	$("#totalPrice").html('');
	var transportPriceSubtotal =$("#transport_price_subtotal").val();
	var otherPrice =$("#other_price").val();
	var num = (Number(transportPriceSubtotal)+Number(otherPrice));
	num = num.toFixed(4);
	$("#total_price").val(num);
}

//发票附件
function invoiceImage(){
	var accIds=new Array();
	$(".sub_invoice_check").each(function() {
		if ($(this).is(":checked")) {
			accIds.push($(this).attr("data-id"));
		}
	});
	if(accIds.length<1){
		$.alert("请选择数据!");
		return false;
	}else if(accIds.length>1){
		$.alert("请选择一条数据!");
		return false;
	}
	
	var url=basePath+"/invoiceInfo/addInvoiceImagePage?id="+accIds;
	$("#show_invoice_image_info").load(url,function(){
		$("#hidden_invoice_info_id").val(accIds),
		//上传图片初始化
		$('.upload_img').each(function(){
			uploadLoadFile($(this));
		})
	});
}

function closeewew(){
	$("#show_invoice_image_info").html("");
}

function addInvoiceImage(){
	$.ajax({
		url:basePath+"/invoiceInfo/addInvoiceImage",
		data:$("#invoice_image_form").serialize(),
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					$("#show_invoice_image_info").html("");
					$.alert(resp.msg);
				}else{
					$.alert(resp.msg);
				}
			}else{
				$.alert("系统异常!");
			}
		}
	});
}