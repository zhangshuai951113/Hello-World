$(function(){
	//搜索
	searchFormulaInfo(1);
	
	//编辑子机构/部门
	$("body").on("click",".modify-operation",function(){
		var formulaInfoId = $(this).parent().attr("formula-info-id");
		//主键ID存在则进行编辑
		if(formulaInfoId && formulaInfoId!=""){
			updateFormulaInfo(formulaInfoId);
		}
	});
	
	//删除公式
	$("body").on("click",".delete-operation",function(){
		//公式的ID
		var formulaInfoId = $(this).parent().attr("formula-info-id");
		
		$.confirm({
			title: "提示",
			content: "是否确认删除该公式",
			buttons: {
		    	'确认': function () {
		    		//主键ID存在则进行编辑
		    		if(formulaInfoId){
		    			deleteFormula(formulaInfoId);
		    		}
		    	},
		        '取消': function () {
		        	
		        }
		    }
		});
	});
	
	//关闭弹框
	$("body").on("click",".department-opt-close",function(){
		$("#show_department_info").empty();
	});
	
	//停用弹窗初始化
	$("body").on("click",".disable-operation",function(){
		//初始化模板描述
		$("#myModalLabel").html("公式停用");
		$("#modal_opearate_title").html("停用原因:");
		$("#modal_opearate_reason").val("");
		$("#modal_opearate_reason").attr("placeholder","请输入停用原因");
		$("#modal_formulaInfoId").attr("operate-type",2);
		
		var formulaInfoId = $(this).parent().attr("formula-info-id");
		//主键ID存在则进行编辑
		if(formulaInfoId){
			$("#modal_formulaInfoId").val(formulaInfoId);
			
		}
	});
	
	//启用弹窗初始化
	$("body").on("click",".enabled-operation",function(){
		//初始化模板描述
		$("#myModalLabel").html("公式启用");
		$("#modal_opearate_title").html("启用原因:");
		$("#modal_opearate_reason").val("");
		$("#modal_opearate_reason").attr("placeholder","请输入启用原因");
		$("#modal_formulaInfoId").attr("operate-type",1);
		
		var formulaInfoId = $(this).parent().attr("formula-info-id");
		//主键ID存在则进行编辑
		if(formulaInfoId){
			$("#modal_formulaInfoId").val(formulaInfoId);
		}
	});
	
	//注销弹窗初始化
	$("body").on("click",".logout-operation",function(){
		//初始化模板描述
		$("#myModalLabel").html("组织注销");
		$("#modal_opearate_title").html("注销原因:");
		$("#modal_opearate_reason").val("");
		$("#modal_opearate_reason").attr("placeholder","请输入注销原因");
		$("#modal_org_info_id").attr("operate-type",3);
		
		var orgInfoId = $(this).parent().attr("org-info-id");
		//主键ID存在则进行编辑
		if(orgInfoId){
			$("#modal_org_info_id").val(orgInfoId);
		}
	});
	
	
	
	$(".comTbody td:nth-child(2)").click(function(){
		var text = $(this).text();
		var htmlt = '<span name="tab" id="radius">'+text+'</span>';
		$(".header-samll-box-down").append(htmlt); 
	})
	$(".comTbody-two td:nth-child(2)").click(function(){
		var texts = $(this).text();
		var htmlt = '<span name="tab" id="radius">'+texts+'</span>';
		$(".header-samll-box-down").append(htmlt); 
	})
	$(".box-three td").click(function(){
		var texter = $(this).text();
		var htmlt = '<span name="tab" id="radius">'+texter+'</span>';
		$(".header-samll-box-down").append(htmlt); 
	})
	$('#operation').click(function(){
		
		//获取最后一个元素

		// var test = $(".header-samll-box-down").text();
		 $(".header-samll-box-down span:last").remove();
		 

	});
	$("#operation-huan").click(function(){
		var htmls = '<br>';
		$(".header-samll-box-down").append(htmls); 
	})
});

/**
 * 分页查询
 * @author chengzhihuan 2017年5月18日
 * @param number 页数
 */
function pagerGoto(number) {
	searchFormulaInfo(number);
}


/**
 * 跳转到某页
 * @author chengzhihuan 2017年5月18日
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
	
	searchFormulaInfo(goPage);
}

/**
 * 根据页数查询公式
 * @author yuewei 2017年9月19日
 * @param number 页数
 */

function searchFormulaInfo(number){
	//公式名称
	var formulaName = $.trim($("#formulaName").val());
	//启用状态
	var isAvailable = $("#isAvailable").val();
	//类型
	var equationMark = $("#equationMark").val();
	
	//请求地址
	var url = basePath + "/formulaSettingController/listFormulaInfo #formula_info";
	$("#search_formula_info").load(url,
		{"page":number,"rows":10,"formulaName":formulaName,"isAvailable":isAvailable,"equationMark":equationMark},
		function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
				  liveDrag:true, 
				  partialRefresh:true,
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  resizeMode: 'overflow'
			});
		})
	}

/**
 * 跳转到子机构新增页面
 * @author chengzhihuan 2017年5月22日
 */
function addSubOrgInfoPage(){
	$("#hidden_sub_operate_type").val(1);
	$("#form_sub_org_opt").attr("action",basePath+"/orgInfo/initSubOrgInfoPage");
	$("#form_sub_org_opt").submit();
}


/**
 * 删除公式
 * @author yuewei 2017年9月20日
 * @param formulaInfoId 公式ID
 */
function deleteFormula(formulaInfoId){
	//删除组织
	$.ajax({
		url : basePath + "/formulaSettingController/deleteFormulaInfo",
		asyn : false,
		type : "POST",
		data : {"formulaInfoId":formulaInfoId},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//commonUtil.showPopup("提示","删除成功");
					window.location.href = basePath+"/formulaSettingController/formulaListPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","查询公式信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 新增公式初始化页
 * @param  组织ID
 * @author chengzhihuan 2017年5月22日
 */
function addFormulaInfo(){
	//请求地址
	var url = basePath + "/formulaSettingController/addFormulaInfo";
	window.location.href = url;
}


/**
 * 新增公式初始化页
 * @param  组织ID
 * @author chengzhihuan 2017年5月22日
 */
function updateFormulaInfo(formulaInfoId){
	//请求地址
	var url = basePath + "/formulaSettingController/updateFormulaInfo?formulaInfoId="+formulaInfoId;
	window.location.href = url;
}
function operateFormulaInfo(){
	var operateType = $("#modal_formulaInfoId").attr("operate-type");
	var isAvailable;
	if(operateType==undefined || operateType==""){
		commonUtil.showPopup("提示","操作类型不能为空");
		return;
	}
	
	//操作名称
	var operateName;
	if(operateType==1){
		operateName = "启用";
		isAvailable = 1;
	}else if(operateType==2){
		operateName = "停用";
		isAvailable = 0;
	}else if(operateType==3){
		operateName = "注销";
	}else{
		commonUtil.showPopup("提示","未知操作");
		return;
	}
	//操作组织
	var formulaInfoId = $("#modal_formulaInfoId").val();
	if(formulaInfoId==undefined || formulaInfoId==""){
		commonUtil.showPopup("提示","公式不能为空");
		return;
	}

	//操作原因
	var operateReason = $.trim($("#modal_opearate_reason").val());
	/*if(operateReason==undefined || operateReason==""){
		commonUtil.showPopup("提示","组织"+operateName+"原因不能为空");
		return;
	}*/
	
	if(operateReason.length>160){
		commonUtil.showPopup("提示","操作"+operateName+"原因不能超过80个汉字");
		return;
	}
	
	var formulaInfoId =  $("#modal_formulaInfoId").val();
	$.ajax({
	  	url:basePath+ "/formulaSettingController/operateFormulaInfo",//请求的action路径
	      async:false,//是否异步
	      cache:false,//是否使用缓存
	      type:'POST',//请求方式：post
	      dataType:'json',//数据传输格式：json
	      data:{
	    	  	formulaInfoId:formulaInfoId,
	    	  	operateReason:operateReason,
	    	  	isAvailable:isAvailable
	    	  	},
	      error:function(){
	          //请求失败处理函数
	    	  xjValidate.showPopup('请求失败！',"提示");
	      },
	      success:function(data){
	    	 if(data){
				if(data.success){
					//commonUtil.showPopup("提示",operateName+"成功");
					//关闭弹框
					$('#disableModal').modal('hide');
					//刷新页面
					window.location.href = basePath+"/formulaSettingController/formulaListPage";
				}else{
					commonUtil.showPopup("提示",dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示",operateName+"组织服务异常忙，请稍后重试");
				return;
			}
	      }
	  });
}
