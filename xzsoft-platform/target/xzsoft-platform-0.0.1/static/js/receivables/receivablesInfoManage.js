// 合同弹出框工具条
var contractTool = null;

// 请求是否正在进行中
var ajaxing =false;

$(function(){
	searchReceivablesInfo(1);
	
	//关闭弹框
	$("body").on("click",".receivables-opt-close",function(){
		$("#show_receivables_info").empty();
	});
	
	//修改收款信息
	$("body").on("click",".modify-operation",function(){
		//收款信息ID
		var receivablesInfoId = $(this).parent().attr("receivables-info-id");
		addOrEditReceivablesInfoPage(receivablesInfoId);
	});
	
	//删除收款信息
	$("body").on("click",".delete-operation",function(){
		//收款信息ID
		var receivablesInfoId = $(this).parent().attr("receivables-info-id");
		if(receivablesInfoId && receivablesInfoId!=""){
			deleteReceivablesInfo(receivablesInfoId);
		}
	});
	
	//确认收款信息
	$("body").on("click",".confirm-operation",function(){
		//收款信息ID
		var receivablesInfoId = $(this).parent().attr("receivables-info-id");
		if(receivablesInfoId && receivablesInfoId!=""){
			operateReceivables(receivablesInfoId,2);
		}
	});
	
	//全选/全不选
	$("body").on("click",".all_receivables_check",function(){
		if($(".all_receivables_check").is(":checked")){
			//全选时
			$(".sub_receivables_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_receivables_check").each(function(){
				$(this).prop("checked",false);
			});
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
 * 分页查询
 * @author luojaun 2017年7月3日
 * @param number 页数
 */
function pagerGoto(number) {
	searchReceivablesInfo(number);
}

/**
 * 跳转到某页
 * @author luojaun 2017年7月3日
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
	
	searchReceivablesInfo(goPage);
}

/**
*分页查询收款管理页面
*
*@author luojuan 2017年7月3日
*@param number 页数
*/
function searchReceivablesInfo(number){
	
	//客户名称
	var customerId = $.trim($("#s_customer_id").val());
	
	//组织部门
	var projectInfoId = $.trim($("#s_project_info_id").val());
	
	//收款金额
	var receivablePrice = $.trim($("#s_receivable_price").val());
	
	//到款日期Start
	var arrivalPriceDateStart = $.trim($("#arrival_price_date_start").val());
	
	//到款日期End
	var arrivalPriceDateEnd = $.trim($("#arrival_price_date_end").val());
	
	//收款类型
	var receivableType = $("#s_receivable_type").val();
	
	//收款分类
	var receivableClassify = $("#s_receivable_classify").val();
	
	//请求地址
	var url = basePath + "/receivablesInfo/showReceivablesInfolistPage #receivables-info-data";
	$("#search-receivables-info").load(url,
		{"page":number,"rows":10,
		 "customerId":customerId,
		 "projectInfoId":projectInfoId,
		 "receivablePrice":receivablePrice,
		 "arrivalPriceDateStart":arrivalPriceDateStart,
		 "arrivalPriceDateEnd":arrivalPriceDateEnd,
		 "receivableType":receivableType,
		 "receivableClassify":receivableClassify
		},
		function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
			  liveDrag:true, 
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging"
			});
		})
}

/**
 * 新增/编辑收款管理信息初始页
 * 
 * @author luojuan 2017年7月3日
 * @param receivablesInfoId 收费ID
 */
function addOrEditReceivablesInfoPage(receivablesInfoId){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(receivablesInfoId!=undefined && receivablesInfoId!=""){
		operateType = 2;
	}else{
		operateType = 1;
	}
	//请求地址
	var url = basePath + "/receivablesInfo/initReceivablesPage #receivables-data-info";
	$("#show_receivables_info").load(url,{"receivablesInfoId":receivablesInfoId,"operateType":operateType},function(data){
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
		if(data==2) {
			$.alert("收款已确认！","提示");
		}
	})
}

/**
 * 新增/编辑收款管理信息
 * 
 * @author luojuan 2017年7月4日
 */
function addOrUpdateReceivableInfo(){
	//收款分类
	var receivableClassify = $("#receivable_classify").val();
	if(receivableClassify==undefined || receivableClassify==""){
		xjValidate.showTip("收款分类不能为空");
		return;
	}
	
	//承兑汇票编号
	var acceptanceDraftId = $("#acceptance_draft_id").val();
	if(acceptanceDraftId.length>100){
		xjValidate.showTip("承兑汇票编号不能超过50个汉字");
		return;
	}
	
	//付款行名称
	var paymentBankName = $("#payment_bank_name").val();
	if(paymentBankName.length>100){
		xjValidate.showTip("付款行名称不能超过50个汉字");
		return;
	}
	
	//出票人全称
	var drawerFullName = $("#drawer_full_name").val();
	if(drawerFullName.length>100){
		xjValidate.showTip("出票人全称不能超过50个汉字");
		return;
	}
	
	//出票人账号
	var drawerAccount = $("#drawer_account").val();
	if(drawerAccount.length>100){
		xjValidate.showTip("出票人账号不能超过50个汉字");
		return;
	}
	
	//到款日期
	var arrivalPriceDate = $("#arrival_price_date").val();
	
	//出票日期
	var drawerDate = $("#drawer_date").val();
	
	//汇票到期日
	var draftEndDate = $("#draft_end_date").val();
	
	//收款类型
	var receivableType = $("#receivable_type").val();
	if(receivableType==undefined || receivableType==""){
		xjValidate.showTip("收款类型不能为空");
		return;
	}
	
	//组织部门
	var projectInfoId = $("#project_info_id").val();
	
	//客户编号
	var customerId = $("#customer_id").val();
	
	//新增/编辑收费管理信息
	$.ajax({
		url : basePath + "/receivablesInfo/addOrUpdateReceivable",
		asyn : false,
		type : "POST",
		data : $('#receivables_info_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#show_receivables_info").empty();
					//刷新页面
					window.location.href = basePath + "/receivablesInfo/rootReceivablesInfolistPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存收款信息服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
}

/**
 * 搜索组织部门
 * 
 * @author luojuan 2017年7月4日
 */
function searchProject(){
	//请求地址
	var url = basePath + "/receivablesInfo/searchProjectInfoListPage #listInfo";
	$("#show_project_info").load(url,{},function(){
		
		// 关闭弹框
		$("body").on("click", ".project-opt-close", function() {
			$("#show_project_info").empty();
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
 * @author luojuan 2017年7月4日
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
 * @author luojuan 2017年7月4日
 */
function searchCustomer(){
	//请求地址
	var url = basePath + "/receivablesInfo/searchCustomerListPage #customerlistInfo";
	$("#show_customer_info").load(url,{},function(){
		
		// 关闭弹框
		$("body").on("click", ".customer-opt-close", function() {
			$("#show_customer_info").empty();
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
 * @author luojuan 2017年7月4日
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
 * 根据勾选的收款ID删除收款信息
 * 
 * @author luojuan 2017年7月5日
 * @param receivablesInfoId 收款ID
 */
function deleteCheckedReceivablesInfo(){
	var receivablesInfoIds = findAllCheckReceivablesIds();
	if(receivablesInfoIds==undefined || receivablesInfoIds==""){
		xjValidate.showPopup("请选择需要删除的收款信息","提示",true);
		return;
	}
	
	//根据收款ID删除收款信息
	deleteReceivablesInfo(receivablesInfoIds);
}

/**
 * 删除收款信息
 * 
 * @author luojuan 2017年7月5日
 * @param receivablesInfoId 收款ID
 */
function deleteReceivablesInfo(receivablesInfoIds){
	//校验收款ID不能为空
	if (receivablesInfoIds == null) {
		xjValidate.showPopup("所选收款信息不能为空！","提示",true);
		return;
	}
	$.confirm({
		title: "提示",
		content: "是否要删除该数据？",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/receivablesInfo/deleteReceivablesInfo",
	    			asyn : false,
	    			type : "POST",
	    			data : {"receivablesInfoIds":receivablesInfoIds},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						xjValidate.showPopup("删除成功","提示",true);
	    						//刷新页面
	    						window.location.href = basePath + "/receivablesInfo/rootReceivablesInfolistPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup("删除收款信息异常，请稍后重试","提示",true);
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
 * 根据勾选的收款ID确认收款信息
 * 
 * @author luojuan 2017年7月5日
 * @param receivablesInfoId 收款ID
 */
function operateCheckedReceivablesInfo(operateType){
	var receivablesInfoIds = findAllCheckReceivablesIds();
	if(receivablesInfoIds==undefined || receivablesInfoIds==""){
		xjValidate.showPopup("请选择需要操作的收款信息","提示",true);
		return;
	}
	
	//根据收款ID确认收款信息
	operateReceivables(receivablesInfoIds,operateType);
}

/**
 * 根据收款ID确认收款信息
 * 
 * @author luojuan 2017年7月5日
 * @param receivablesInfoId 收款ID
 */
function operateReceivables(receivablesInfoIds,operateType){
	//操作名称
	var operateName;
	if(operateType==2){
		operateName="确认";
	}
	
	//根据收款ID确认收款信息
	$.confirm({
		title: "提示",
		content: "是否将所选收款信息"+operateName,
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/receivablesInfo/operateReceivables",
	    			asyn : false,
	    			type : "POST",
	    			data : {"receivablesInfoIds":receivablesInfoIds,"operateType":operateType},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						window.location.href = basePath + "/receivablesInfo/rootReceivablesInfolistPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup(operateName+"收款服务异常忙，请稍后重试","提示",true);
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
 * 获取所有选中的收款ID
 * 
 * @author luojuan 2017年7月5日
 * @returns 收款ID，逗号分隔
 */
function findAllCheckReceivablesIds(){
	//所有选中收款ID
	var receivablesInfoIds = new Array();
	$(".sub_receivables_check").each(function(){
		if($(this).is(":checked")){
			receivablesInfoIds.push($(this).attr("data-id"))
		}
	});
	
	return receivablesInfoIds.join(",");
}

/**
 * 显示合同查询界面
 */
function showContractWin(){
	//请求地址
	var url = basePath + "/receivablesInfo/showContractListPage #contractList";
	$("#show_contract_info").load(url,{},function(){
		
		contractTool = $(".contractTool").operationList({
			"current" : 1, // 当前目标
			"maxSize" : 4, // 前后最大列表
			"itemPage" : 10, // 每页显示多少条
			"totalItems" : 0, // 总条数
			"chagePage" : function(current) {
				// 调用ajax请求拿最新数据
				loadContracts(current)
			}
		});
		
		// 关闭弹框
		$("body").on("click", ".contract-opt-close", function() {
			$("#show_contract_info").empty();
		});
		
		// 绑定组织部门输入框
		$("body").on("click", ".sub_contract_check", function() {
			var isChecked = $(this).is(":checked");
			$(".sub_contract_check").prop("checked", false);
			if (isChecked) {
				$(this).prop("checked", isChecked);
			} else {
				$(this).prop("checked", isChecked);
			}
		});
		
		// 允许运单表格拖着
		$("#contractTable").colResizable({
			liveDrag : true,
			gripInnerHtml : "<div class='grip'></div>",
			draggingClass : "dragging",
			resizeMode: 'overflow'
		});
		
		// 加载数据
		loadContracts(1);
	})
}
/**
 * 加载合同信息数据
 */
function loadContracts(current){
	contractTool.options.current = current;
	var params = {
		"contractInfoName" : $.trim($("#contract-name").val()),
		"page" : contractTool.options.current,
		"rows" : contractTool.options.rows
	};
	console.log(params);
	$.ajax({
		url : basePath + "/receivablesInfo/getContractInfos",
		async : false,
		type : "POST",
		data : {},
		dataType : "json",
		beforeSend:function(){
			if(ajaxing){xjValidate.showPopup("请求进行中，请稍候......","提示",true);return false;}else{ajaxing=true;}
		},
		success : function(resp) {
			ajaxing = false;
			if (resp) {
				if (resp.success) {
					var list = resp.list;
					var count = resp.count;
					var length = numberFormat(list.length);
					$("#contractTBody").html("");
					list.forEach(function(item,index){
						var tr = "";
						tr += "<tr class='table-body' align='center'>";
						tr += "<td><input type='checkbox' class='sub_contract_check' data-contractInfoId="+item.id+" data-contractInfoName="+item.contractName+"></td>";
						tr += "<td>" + item.contractCode + "</td>";
						tr += "<td>" + item.contractName + "</td>";
						tr += "</tr>";
						$("#contractTBody").append(tr);
					});
					
				} else {
					xjValidate.showPopup(resp.msg,"提示",true);
				}
			} else {
				xjValidate.showPopup("服务异常忙，请稍后重试","提示",true);
			}
		},
		error:function(){ajaxing = false;xjValidate.showPopup("服务请求失败","提示",true);},
		complete:function(){ajaxing = false;}
	});
}
/**
 * 合同页面跳转
 * @param e
 */
function contractJumpPage(e){
	var val = e.prev().find("input").val();
	contractTool.setCurrentPage(val);
}

function contractSelect(){
	var contracts = [];
	$(".sub_contract_check").each(function(){
		if ($(this).is(":checked")){
			var contract = {
				"contractInfoId":$(this).attr("data-contractInfoId"),
				"contractInfoName":$(this).attr("data-contractInfoName")
			};
			contracts.push(contract);
		}
	});
	if(contracts.length == 0 || contracts.length > 1){
		xjValidate.showPopup("请选择一条数据","提示",true);
		return;
	}
	var contract = contracts[0];
	$("#contract_info_id").val(contract.contractInfoId);
	$("#contract_info_name").val(contract.contractInfoName);
	$("#show_contract_info").empty();
}

/**
 * 处理数字
 * @param value
 */
function numberFormat(value){
	if (isEmpty(value)) {
		return 0;
	} 
	return value
}

/**
 * 是否为空
 * @param value
 * @returns {Boolean}
 */
function isEmpty(value){
	if (value == null || value == '' || value == undefined) {
		return true;
	}
	return false;
}
/**
 * 清除合同信息
 */
function cleanContract(){
	$("#contract_info_id").val('');
	$("#contract_info_name").val('');
	console.log('clean contract success');
}