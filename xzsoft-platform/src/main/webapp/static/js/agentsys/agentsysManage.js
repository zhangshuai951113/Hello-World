$(function(){
	//搜索
	//searchAgentSettlementInfo(1);
	   //全选/全不选
    $("body").on("click", ".all_check", function () {
      if ($(".all_check").is(":checked")) {
        //全选时
        $(".sub_check").each(function () {
          $(this).prop("checked", true);
        });
      } else {
        //全不选时
        $(".sub_check").each(function () {
          $(this).prop("checked", false);
        });
      }
    });
    

    	  //时间调用插件
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
	
});

/**
 * 分页查询
 * @author yuewei 2017年10月10日
 * @param number 页数
 */
function pagerGoto(number) {
	searchCuteInfo(number);
}


/**
 * 跳转到某页
 * @author yuewei 2017年10月10日
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
	
	searchOrgInfo(goPage);
}

/**
 * 根据页数查询结算单信息
 * @author yuewei 2017年10月10日
 * @param number 页数
 */
function searchAgentSettlementInfo(number){
	
	var entrustId = $.trim($("#orgId").val()); //代理机构
	var customerId = $.trim($("#customerId").val());//客户名称
	var forwardingName = $.trim($("#forwardingName").val());//发货单位
	var settlementNo =  $.trim($("#settlementNo").val());//结算单编号
	var makeUser = $.trim($("#makeUser").val());//制单人
	var loginUser = $.trim($("#loginUser").val());//登录账号
	var loginPassword = $.trim($("#loginPassword").val());//登录密码
	
	
	console.log("entrustId:"+entrustId);
	//请求地址
	var url = basePath + "/agent/listAgentSettlementInfo #cunteinfo_info";
	$("#search_cuteinfo_info").load(url,
 		{
		"page" : number,
		"rows" : 10,
		"entrustId" : entrustId,
		"customerId" : customerId,
		"forwardingName" : forwardingName,
		"settlementNo" : settlementNo,
		"makeUser" : makeUser
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
 * @author yuewei 2017年10月10日
 * 上报结算单至金网运通平台
 */
function reportAgentSettlementInfo() {
	// 获取选中的操作记录
	var settlementIds = findAllCheckedRoadSheetIds();
	if (settlementIds == undefined || settlementIds == "") {
		commonUtil.showPopup("提示", "请选择要上报的路单");
		return;
	}
	
	if ($.trim($("#loginUser").val()).length==0){
		commonUtil.showPopup("提示", "请输入平台登录帐号");
		return;
	}
	if ($.trim($("#loginPassword").val()).length==0){
		commonUtil.showPopup("提示", "请输入平台登录密码");
		return;
	}


	$.confirm({
		title : "提示",
		content : "是否确认上报？",
		buttons : {
			'确认' : function() {
				$(".main").showLoading();
				upAgentSettlementInfo(settlementIds); 
			},
			'取消' : function() {
			}
		}
	});
}


/**
 * 上报路单操作
 * @param waybillIds 运单ID
 * 
 * @returns
 */
function upAgentSettlementInfo(settlementIds) {
	
	var loginUser = $.trim($("#loginUser").val()); //登录用户名
	var loginPassword = $.trim($("#loginPassword").val());//登录密码
	
	
	$.ajax({
		url : basePath + "/agent/upAgentSettlementInfo",
		asyn : false,
		type : "POST",
		data : {
			"settlementNo" : settlementIds,
			"loginUser":loginUser,
			"loginPassword":loginPassword
		},
		dataType : "json",
		success : function(dataStr) {
			  $(".main").hideLoading();
			if (dataStr.result == 0) {
				commonUtil.showPopup("提示", dataStr.msg);
			}
			else if (dataStr.result == 1) {
				commonUtil.showPopup("提示", dataStr.msg);
				searchCuteInfo(1); //跳转到路单上报初始页面;
			}
			else {
				commonUtil.showPopup("提示", dataStr.msg);
			}

		},
		error : function() {
			  $(".main").hideLoading();
			commonUtil.showPopup("提示", "路单上报操作异常，请稍后重试");
		}
		
		
	});
}


/**
 * 获取所有选中的运单ID
 * @author yuewei 2017年10月10日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckedRoadSheetIds() {
	// 所有选中运单的ID
	var roadSheetIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			roadSheetIds.push($(this).attr("data-id"))
		}
	});
	return roadSheetIds.join(",");
}




//分页
var entrustPagination = $(".pagination-list-entrust").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		entrustList(current);
	}
});



/**
 * 查询代理方
 */
function orgSelect(pageNo) {
	$("#proxyTbody").html("");
	$("#proxyTbody").empty();
	var pageSizeStr = '10';
 	var sign = '2';
 	var selectData = {
			curPage : pageNo,
			pageSizeStr : pageSizeStr,
			sign:sign
 	}
	  //提交审核操作
	  $.ajax({
	    	url:basePath+ "/tariff/findCustomerName",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:selectData,
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup("请求失败","提示");
	        },
	        success:function(data){
	        	 var jsonAll = data;
		    	  var jsonList = jsonAll.tList;
	        	  var totalCount = jsonAll.totalCount;
		        	$("#orgNum").text("搜索结果共"+totalCount);
		        	orgPage.setTotalItems(totalCount);
	        	$.each(jsonList,function(i, val) {
	        	$("#proxyTbody").append("<tr class='table-body '><td><label class='i-checks'>" +
	        			"<input data-id='1' data-name='组织名称' class='org-check' name = 'proxyNames' id = 'proxyRadio' type='radio'></label></td>" +
	        			"<td>"+val.orgInfoId+"</td>" +
	        			"<td>"+val.orgName+"</td>");
	        	});
	        	$("#orgSelectModal").modal('show');
	        }
	    });
}


/**
 *代理方选择
 */
function submitSelectOrg() {
  var selectlist = findAllCheck(".org-check");
  if(selectlist.length==0 || selectlist.length>1) {
    //xjValidate.showTip("请选择一条数据");
      xjValidate.showPopup('请选择一条数据！',"提示");
    return;
  }
  var ftr = $("#proxyRadio:checked").parents("tr");
  var id = ftr.children().eq(1).html();
  var name = ftr.children().eq(2).html();
  $("#selectOrg").html(name);
  $("#orgId").val(id);
  $("#orgSelectModal").modal('hide');
}


//绑定委托方输入框 
$("body").on("click", "#selectCustomer", function() {
	$("#entrustNameQuery").val(null);
	$("#entrustSelectModal").modal('show');
	entrustList(1);

});


//委托方选择列表单选模式
$("body").on("click", ".sub_entrust_check", function() {
	var isChecked = $(this).is(":checked");
	$(".sub_entrust_check").prop("checked", false);
	if (isChecked) {
		$(this).prop("checked", isChecked);
	} else {
		$(this).prop("checked", isChecked);
	}
});


//委托方查询
function entrustList(number) {
	$("#entrustTBody").html("");
	$.ajax({
		url :basePath + "/contractInfo/getEntrustData",
		data : {
			'cooperateStatus' :'2', //半协同
			'orgName' : $("#entrustNameQuery").val(),
			'page' : number,
			'rows' : 10
		},
		dataType : "json",
		type : "post",
		async : false,
		success : function(resp) {
			var objs = eval(resp);
			$.each(objs, function(index, ele) {
				// 追加数据
				var tr = "";
				tr += "<tr class='table-body' align='center'>";
				tr+="<td><input type='checkbox' class='sub_entrust_check' orgInfoId="+ele.id+" orgName="+ele.orgName+" rootOrgName="+ele.rootOrgName+" rootOrgInfoId="+ele.rootOrgInfoId+"></td>";
				tr += "<td>" + ele.orgName + "</td>";
				tr += "<td>" + ele.rootOrgName + "</td>";
				// 将tr追加
				$("#entrustTBody").append(tr);
			});
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url :basePath + "/contractInfo/getEntrustCount",
		type : "post",
		data : {'cooperateStatus' : '2','orgName' : $("#entrustNameQuery").val()},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			entrustPagination.setTotalItems(resp);
			$("#panel-num-entrust").text("搜索结果共" + resp + "条");
		}
	});

}

//委托方选择确认
function entrustSelect() {
	$(".sub_entrust_check").each(function() {
		if ($(this).is(":checked")) {
			$("#selectCustomer").html($(this).attr("orgName"));
			$("#customerId").val($(this).attr("orgInfoId"));
			return false;
		}
	});
	$("#entrustSelectModal").modal('hide');
}
