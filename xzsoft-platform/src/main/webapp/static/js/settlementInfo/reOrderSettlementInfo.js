 //初始化page
  var settlementPage = null;
  var goodsPage = null;
  var orgPage = null;
  //时间戳转化成固定日期格式
  (function ($) {
	  
	  var format = function(time, format){
	      var t = new Date(time);
	      var tf = function(i){return (i < 10 ? '0' : '') + i};
	      return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
	          switch(a){
	              case 'yyyy':
	                  return tf(t.getFullYear());
	                  break;
	              case 'MM':
	                  return tf(t.getMonth() + 1);
	                  break;
	              case 'mm':
	                  return tf(t.getMinutes());
	                  break;
	              case 'dd':
	                  return tf(t.getDate());
	                  break;
	              case 'HH':
	                  return tf(t.getHours());
	                  break;
	              case 'ss':
	                  return tf(t.getSeconds());
	                  break;
	          }
	      })
	  }
	  
	  
	  searchSettlementInfo(1);
	  
	  
    //全选/全不选
    $("body").on("click", ".all-settlement-check", function () {
      if ($(".all-settlement-check").is(":checked")) {
        //全选时
        $(".sub-settlement-check").each(function () {
          $(this).prop("checked", true);
        });
      } else {
        //全不选时
        $(".sub-settlement-check").each(function () {
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

      //线路插件
    $("#startAddress").lineSelect();
    $("#endAddress").lineSelect();
    
    //关闭应付调差弹框
	$("body").on("click",".reciveInfo-close",function(){
		$("#show_settlement_info_difference").empty();
	});
	//关闭组织部门（项目）弹框
	$("body").on("click",".project-opt-close",function(){
		$("#show-settlement-project-data-info").empty();
	});
	//关闭组织部门（项目）弹框
	$("body").on("click",".settlement-opt-close",function(){
		$("#show-settlement-data-info").empty();
	});
  })(jQuery);

  /**
  * 结算分页查询
  * @author jiangww 2017年8月10日
  * @param number 页数
  */
  function pagerGoto(number) {
	  //结算信息
	  var settlement = $("#settlement").val();
	  //组织部门
	  var project = $("#project").val();
	  //调用查询结算信息方法
	  if(settlement != null && settlement != "" && settlement == "1"){
		  searchSettlementInfo(number);
	  }
	  //调用查询组织部门方法
	  if(project != null && project != "" && project == "2"){
		searchReOrderProjectInfo(number);
	  }
  }

  /**
   * 跳转到某页
   * @author jiangww 2017年8月10日
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
  	  //结算信息
	  var settlement = $("#settlement").val();
	  //组织部门
	  var project = $("#project").val();
	  //调用查询结算信息方法
	  if(settlement != null && settlement != "" && settlement == "1"){
		  searchSettlementInfo(goPage);
	  }
	  //调用查询组织部门方法
	  if(project != null && project != "" && project == "2"){
		searchReOrderProjectInfo(goPage);
	  }
  }

  /**
   * 重置搜索栏
   * 
   * @author liumin
   */
  function resetEmpty() {
    //清除重置线路
    $(".select-address").empty();
    $(".select-address").siblings("input").val("");
    //清除其他搜索
    $(".search-select-list").empty();
    $(".search-select-list").siblings("input").val("");
  }

  /**
   * 组织部门选择
   */
  function submitSelectOrg() {
  	$(".sub_project_info_check").each(function() {
  		if ($(this).is(":checked")) {
  			$("#projectInfoId").val($(this).attr("data-id"));
  			$("#projectInfoName").val($(this).attr("data-projectName"));
  			return false;
  		}
  	});
  	$("#project-data-info").empty();
  }

  /**
   * 查找选择
   * @author jiangweiwei 2017年7月22日
   */
  function findAllCheck(element){
    var checkList = new Array();
    $(element).each(function(){
      if($(this).is(":checked")){
        var params = {
          "id":$(this).attr("data-id"),
          "settlementStatus":$(this).attr("data-settlementStatus"),
          "isWriteOff":$(this).attr("data-isWriteOff"),
          "lineInfoId":$(this).attr("data-lineInfoId"),
          "endPoints":$(this).attr("data-endPoints"),
          "scatteredGoods":$(this).attr("data-scatteredGoods"),
          "rootWaybillInfoId":$(this).attr("data-rootWaybillInfoId")
        }
        checkList.push(params);
      }
    });
    return checkList;
  }
  
  /**
   * 获取选中返单结算信息ID
   * @author jiangweiwei 2017年7月23日
   * @returns 结算信息ID，逗号分隔
   */
  function findAllCheckReOrderSettlementInfoIds(){
  	//所有选中返单结算信息ID
  	var reOrderSettlementInfoIds = new Array();
  	$(".re_order_settlement_check").each(function(){
  		if($(this).is(":checked")){
  			reOrderSettlementInfoIds.push($(this).attr("data-id"))
  		}
  	});
  	
  	return reOrderSettlementInfoIds.join(",");
  }
  
   /**
   * 获取选中返单结算信息ID
   * @author qiuyongcheng 2017年9月18日
   * @returns 结算信息ID，逗号分隔
   */
  function findAllCheckEASReOrderSettlementInfoIds(){
  	//所有选中返单结算信息ID
  	var reOrderSettlementInfoIds = new Array();
  	$(".re_order_settlement_check").each(function(){
  		if($(this).is(":checked")){
  			reOrderSettlementInfoIds.push($(this).attr("data-id"))
  		}
  	});
  	
  	return reOrderSettlementInfoIds.join(",");
  }
  
  /**
   * 获取选中返单结算运单信息表主键ID
   * @author jiangweiwei 2017年7月23日
   * @returns 运单信息表主键ID，逗号分隔
   */
  function findAllCheckReOrderWaybillInfoIds(){
  	//所有选中返单结算信息ID
  	var reOrderWaybillInfoIds = new Array();
  	$(".re_order_settlement_check").each(function(){
  		if($(this).is(":checked")){
  			reOrderWaybillInfoIds.push($(this).attr("data-waybillInfoId"))
  		}
  	});
  	
  	return reOrderWaybillInfoIds.join(",");
  }
  
  /**
   * 提交审核
   * 根据选择的结算数据主键ID修改结算单状态
   * @author jiangweiwei 2017年7月22日
   */
  function submitAudit(){
	  var checkList = findAllCheck(".re_order_settlement_check");
	  if(checkList.length == 0 || checkList.length > 1){
		  xjValidate.showPopup("请选择一条记录!","提示");
		  return;
	  }
	  var id = checkList[0].id;
	  var settlementStatus = checkList[0].settlementStatus;
	  if(settlementStatus == "2" || settlementStatus == "3"){
		  xjValidate.showPopup("结算单正在审核中或已审核!","提示");
		  return;
	  }
	  if(id){
		  $.confirm({
				title : "提示",
				content : "是否确认提交审核？",
				buttons : {
					'确认' : function() {
						$.ajax({
							asyn : false,
							type : "POST",
							url	: basePath+"/settlementInfo/submitSettlementInfo",
							data : {"id":id},
							dataType : "json",
							success	: function(dataStr){
								if(dataStr){
									xjValidate.showPopup("结算单提交审核成功!","提示");
					        		window.location.href = basePath+ "/settlementInfo/showReOrderSettlementInfoListPage";
								}
							}
						});
					},
					'取消' : function() {
					}
				}
			});
	  }
  }
  
  /**
   * 审核按钮弹出框
   * @author jiangweiwei 2017年7月22日
   */
  function audit() {
	  var checkList = findAllCheck(".re_order_settlement_check");
	  if(checkList.length == 0 || checkList.length > 1){
		  xjValidate.showPopup("请选择一条记录!","提示");
		  return;
	  }
	  var id = checkList[0].id;
	  var settlementStatus = checkList[0].settlementStatus;
	  if(settlementStatus == "1" || settlementStatus == "3" || settlementStatus == "4"){
		  xjValidate.showPopup("结算单正在审核中或已审核!","提示");
		  return;
	  }
	  var buttonType = "";
  	  var auditOpinion="";
    $.confirm({
      title : '请您填写审核意见:',
      content : ''
          + '<form action="" class="formName">'
          + '<div class="form-group">'
          + '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px;  resize: none;">同意</textarea>'
          + '</div>' + '</form>',
      buttons : {
        agreed : {
          text : '通过',
          btnClass : 'btn-blue',
          action : function() {
        	buttonType = "1";
            auditOpinion = this.$content.find('#auditOpinion').val();
            if (!auditOpinion) {
            	xjValidate.showPopup("审核意见不能为空！","提示");
              return false;
            }
            auditSettlementInfo(id,buttonType,auditOpinion);
          }
        },
        rejected : {
          text : '不通过',
          btnClass : 'btn-red',
          action : function() {
        	buttonType = "0";
            auditOpinion = this.$content.find('#auditOpinion').val();
            if (!auditOpinion) {
            	xjValidate.showPopup("审核意见不能为空！","提示");
              return false;
            }
            auditSettlementInfo(id,buttonType,auditOpinion);
          }
        },
        '取消' : function() {
          // close
        }
      }
    });
  }
  /**
   * 审核按钮弹出框
   * @author qiuyongcheng 2017年11月4日
   */
  function audit_settlement_info() {
	  var checkList = findAllCheck(".re_order_settlement_check");
	  if(checkList.length == 0){
		  xjValidate.showPopup("请至少选择一条记录!","提示");
		  return;
	  }
	  if(checkList.length>1){
		  for (var int = 0; int < checkList.length; int++) {
			  var id = checkList[int].id;
			  var settlementStatus = checkList[int].settlementStatus;
			  if(settlementStatus == "3"){
				  xjValidate.showPopup("选择的结算单存在已经审核状态!","提示");
				  return;
			  }
		  }
		  $.confirm({
		      title : '请您填写审核意见:',
		      content : ''
		          + '<form action="" class="formName">'
		          + '<div class="form-group">'
		          + '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px;  resize: none;">同意</textarea>'
		          + '</div>' + '</form>',
		      buttons : {
		        agreed : {
		          text : '通过',
		          btnClass : 'btn-blue',
		          action : function() {
		        	buttonType = "1";
		            auditOpinion = this.$content.find('#auditOpinion').val();
		            if (!auditOpinion) {
		            	xjValidate.showPopup("审核意见不能为空！","提示");
		              return false;
		            }
		            for (var int = 0; int < checkList.length; int++) {
		            	auditSettlementInfo(checkList[int].id,buttonType,auditOpinion);
		            }
		          }
		        },
		        rejected : {
		          text : '不通过',
		          btnClass : 'btn-red',
		          action : function() {
		        	buttonType = "0";
		            auditOpinion = this.$content.find('#auditOpinion').val();
		            if (!auditOpinion) {
		            	xjValidate.showPopup("审核意见不能为空！","提示");
		              return false;
		            }
		            for (var int = 0; int < checkList.length; int++) {
		            	auditSettlementInfo(checkList[int].id,buttonType,auditOpinion);
		            }
		          }
		        },
		        '取消' : function() {
		          // close
		        }
		      }
		    });
	  }else{
		  var id = checkList[0].id;
		  var settlementStatus = checkList[0].settlementStatus;
		  if(settlementStatus == "3"){
			  xjValidate.showPopup("选择的结算单已审核!","提示");
			  return;
		  }
	  	// 请求地址
	  	var url = basePath
	  			+ "/settlementInfo/showSettlementInfo #settlement-data-info";
	  	$("#show-settlement-data-info").load(url, {
	  		"id" : id
	  	}, function() {
	  	})
	  }
  }
  /**
   * 审核不通过需要填写驳回原因
   */
  function audit_reject(id,buttonType,auditOpinion){
	  if(buttonType == 0){
		  $.confirm({
		      title : '请您填写驳回意见:',
		      content : ''
		          + '<form action="" class="formName">'
		          + '<div class="form-group">'
		          + '<textarea type="text" placeholder="驳回意见" id ="auditOpinion" class="name form-control" required style="height:150px;  resize: none;"></textarea>'
		          + '</div>' + '</form>',
		      buttons : {
		        rejected : {
		          text : '确定',
		          btnClass : 'btn-red',
		          action : function() {
		        	buttonType = "0";
		            auditOpinion = this.$content.find('#auditOpinion').val();
		            if (!auditOpinion) {
		            	//xjValidate.showPopup("驳回意见不能为空！","提示");
		            	commonUtil.showPopup("提示","驳回意见不能为空");
		              return false;
		            }else{
		            	auditSettlementInfo(id,buttonType,auditOpinion);
		            }
		          }
		        },
		        '取消' : function() {
		          // close
		        }
		      }
		    });
	  }else{
		  auditSettlementInfo(id,buttonType,auditOpinion);
	  }
  }
  
  
  /**
   * 审核结算单操作
   * @author jiangweiwei 2017年7月22日
   */
  function auditSettlementInfo(id,buttonType,auditOpinion) {
	//提交审核操作
	  $.ajax({
	    	url:basePath+ "/settlementInfo/auditSettlementInfo",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{"id":id,"buttonType":buttonType,"auditOpinion":auditOpinion},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	        	xjValidate.showPopup("请求失败！","提示");
	        },
	        success:function(data){
	        	if(data == true){
	        		//xjValidate.showPopup("结算单审核通过!","提示");
	        		window.location.href = basePath+ "/settlementInfo/showReOrderSettlementInfoListPage";
	        	}
	        }
	    });
  }

   /**
   * 应付调差初始化页
   * @author jiangweiwei 2017年7月22日
   */
  function initDifference() {
	  var checkList = findAllCheck(".re_order_settlement_check");
	  if(checkList.length == 0 || checkList.length > 1){
		  xjValidate.showPopup("请选择一条记录!","提示");
		  return;
	  }
	  var id = checkList[0].id;
	  var settlementStatus = checkList[0].settlementStatus;
	  var isWriteOff = checkList[0].isWriteOff;
	  if(settlementStatus == "1" || settlementStatus == "2" || settlementStatus == "4"){
		  xjValidate.showPopup("结算单正在审核中或未提交审核!","提示");
		  return;
	  }
	  if(isWriteOff == "1"){
		  xjValidate.showPopup("结算单已红冲!","提示");
		  return;
	  }
	  //请求地址
	  var url = basePath + "/settlementInfo/selectSettlementForReviceInfo #differenceModal";
		$("#show_settlement_info_difference").load(url,{
			"id" : id
		},function(){
		})
  	}
  
//监听调差类型change事件
//  $("body").on("change","#txreviseType",function(){
//  	if($("#txreviseType").val() == 1){//金额调差
//  		$("#txforwardingTonnageDiv").hide();
//  		$("#txarriveTonnageDiv").hide();
//  	}else{//金额+吨位调差
//  		$("#txforwardingTonnageDiv").show();
//  		$("#txarriveTonnageDiv").show();
//  	}
//  })
  
  //监听调差类型change事件
$("body").on("change","#txreviseType",function(){
	 if($("#txreviseType").val() == 0){//吨位调差
			$("#txforwardingTonnageDiv").hide();
			$("#txarriveTonnageDiv").hide();
			$("#tcshipperPriceDiv").hide();
			$("#txpayablePriceDiv").hide();
			$("#txactualPaymentPriceDiv").hide();
			$("#txtransportPriceIncomeTaxDiv").hide();
			$("#txincomeTaxDiv").hide();
			$("#txotherTaxPriceDiv").hide();
			$("#txtransportPriceCostDiv").hide();
		}
	
	if($("#txreviseType").val() == 1){//金额调差
		$("#txforwardingTonnageDiv").hide();
		$("#txarriveTonnageDiv").hide();
	    $("#tcshipperPriceDiv").show();
		$("#txpayablePriceDiv").show();
		$("#txactualPaymentPriceDiv").show();
		$("#txtransportPriceIncomeTaxDiv").show();
		$("#txincomeTaxDiv").show();
		$("#txotherTaxPriceDiv").show();
		$("#txtransportPriceCostDiv").show();
	}
    if($("#txreviseType").val() == 2){//金额+吨位调差
		$("#txforwardingTonnageDiv").show();
		$("#txarriveTonnageDiv").show();
		$("#tcshipperPriceDiv").show();
		$("#txpayablePriceDiv").show();
		$("#txactualPaymentPriceDiv").show();
		$("#txtransportPriceIncomeTaxDiv").show();
		$("#txincomeTaxDiv").show();
		$("#txotherTaxPriceDiv").show();
		$("#txtransportPriceCostDiv").show();
	}
    if($("#txreviseType").val() == 3){//吨位调差
		$("#txforwardingTonnageDiv").show();
		$("#txarriveTonnageDiv").show();
		$("#tcshipperPriceDiv").hide();
		$("#txpayablePriceDiv").hide();
		$("#txactualPaymentPriceDiv").hide();
		$("#txtransportPriceIncomeTaxDiv").hide();
		$("#txincomeTaxDiv").hide();
		$("#txotherTaxPriceDiv").hide();
		$("#txtransportPriceCostDiv").hide();
	}
})
  
  /**
   * 应付调差
   * @author jiangweiwei 2017年7月22日
   */
$("body").on("click","#saveReciveInfo",function(){
	  var id = $("#tcId").val();
		var reviseType = $("#txreviseType").val();
		var shipperPrice = $("#tcshipperPrice").val();
		var forwardingTonnage = $("#txforwardingTonnage").val();
		var arriveTonnage = $("#txarriveTonnage").val();
		var payablePrice = $("#txpayablePrice").val();
		var actualPaymentPrice = $("#txactualPaymentPrice").val();
		var transportPriceIncomeTax = $("#txtransportPriceIncomeTax").val();
		var incomeTax = $("#txincomeTax").val();
		var otherTaxPrice = $("#txotherTaxPrice").val();
		var transportPriceCost = $("#txtransportPriceCost").val();
		if(reviseType == 0 || reviseType == null || reviseType == ""){
	    	 xjValidate.showPopup("请选择调差类型","警告");
	    	 return;
	     }
		var check = xjValidate.checkForm();
		if(check == false){
			xjValidate.showPopup("输入的数据不符合规范","警告")
			return;
		}
		
		var insertData = {
				id:id,
				reviseType:reviseType,
				shipperPrice:shipperPrice,
				forwardingTonnage:forwardingTonnage,
				arriveTonnage:arriveTonnage,
				payablePrice:payablePrice,
				actualPaymentPrice:actualPaymentPrice,
				transportPriceIncomeTax:transportPriceIncomeTax,
				incomeTax:incomeTax,
				otherTaxPrice:otherTaxPrice,
				transportPriceCost:transportPriceCost
		};
		 $.ajax({
		    	url:basePath+"/settlementInfo/saveSettlementForRecive",//请求的action路径
		        async:false,//是否异步
		        cache:false,//是否使用缓存
		        type:'POST',//请求方式：post
		        data:insertData,
		        dataType:'json',//数据传输格式：json
		        error:function(){
		            //请求失败处理函数
		            xjValidate.showPopup("请求失败！","提示");
		        },
		        success:function(data){
		        	if(data == false){
		        		xjValidate.showPopup("调差失败！","提示");
		        	}else{
		        		$("#differenceDiv").empty();
		        		window.location.href = basePath+ "/settlementInfo/showReOrderSettlementInfoListPage";
		        	}
		        	
		       }
		});
});

  /**
   * 根据页数查询结算信息
   * @author jiangweiwei 2017年7月11日
   * @param number 页数
   */
  function searchSettlementInfo(number){
  	//委托方
  	var entrustName = $.trim($("#entrustName").val());
  	//车牌号码
  	var carCode = $.trim($("#carCode").val());
  	//发货单号
  	var forwardingId = $.trim($("#forwardingId").val());
  	//到货单号
  	var arriveId = $.trim($("#arriveId").val());
  	//货物
  	var goodsName = $.trim($("#goodsName").val());
  	//零散货物
  	var scatteredGoods = $.trim($("#scatteredGoods").val());
  	//组织部门
  	var projectInfoId = $("#projectInfoId").val();
  	//核算主体
  	var accountingEntity = $("#accountingEntity").val();
  	//结算单状态
  	var settlementStatus = $("#settlementStatus").val();
  	//是否对账
  	var isAccount = $("#isAccount").val();
  	//是否开票
  	var isInvoice = $("#isInvoice").val();
  	//发货时间开始
  	var forwardingTimeStart = $("#forwardingTimeStart").val();
  	//发货时间结束
  	var forwardingTimeEnd = $("#forwardingTimeEnd").val();
  	//到货时间开始
  	var arriveTimeStart = $("#arriveTimeStart").val();
  	//到货时间结束
  	var arriveTimeEnd = $("#arriveTimeEnd").val();
  	//回单开始日期
  	var rMakeStartTime = $("#rMakeStartTime").val();
  	//回单结束日期
  	var rMakeEndTime = $("#rMakeEndTime").val();
  	//制单人
  	var makeUser = $.trim($("#makeUser").val());
  	//运单号
  	var rootWaybillId = $.trim($("#rootWaybillId").val());
  	//备注
  	var remarks = $("#remarks").val();
//  	if(forwardingTime != null && forwardingTime != "" && arriveTime != null && arriveTime != "" && arriveTime < forwardingTime){
//  		xjValidate.showPopup("到货时间必须大于发货时间！","提示");
//  		return;
//  	}
  	//请求地址
  	var url = basePath + "/settlementInfo/listSettlementInfo #re_order_settlement_info";
  	$("#search_settlement_info").load(url,
  		{"page":number,"rows":10,"entrustName":entrustName,"carCode":carCode,
  		"forwardingId":forwardingId,"arriveId":arriveId,"goodsName":goodsName,
  		"goodsName":goodsName,"scatteredGoods":scatteredGoods,"projectInfoId":projectInfoId,
  		"accountingEntity":accountingEntity,"settlementStatus":settlementStatus,
  		"forwardingTimeStart":forwardingTimeStart,"forwardingTimeEnd":forwardingTimeEnd,
  		"arriveTimeStart":arriveTimeStart,"arriveTimeEnd":arriveTimeEnd,"rMakeStartTime":rMakeStartTime,
  		"rMakeEndTime":rMakeEndTime,"makeUser":makeUser,"remarks":remarks,"isAccount":isAccount,
  		"isInvoice":isInvoice,"rootWaybillId":rootWaybillId},
  		function(){
  			//允许表格拖着
  			$("#tableDrag").colResizable({
  				  liveDrag:true, 
  				  partialRefresh:true,
  				  gripInnerHtml:"<div class='grip'></div>", 
  				  draggingClass:"dragging",
  				  resizeMode: 'overflow'
  			});
  		    //结算数据较多，增加滑动
  		    $(".iscroll").css("min-height", "55px");
  		    $(".iscroll").mCustomScrollbar({
  		      theme: "minimal-dark"
  		    });
  		})
  	}
  /**
   * 返单结算信息新增/编辑初始页
   * @author jiangweiwei 
   * @date 2017年7月12日
   */
  function addOrEditSettlementInfoPage(operateType){
	  if(operateType == 2){
		  var checkList = findAllCheck(".re_order_settlement_check");
		  if(checkList.length == 0 || checkList.length > 1){
			  xjValidate.showPopup("请选择一条记录!","提示");
			  return;
		  }
		  var settlementInfoId = checkList[0].id;
		  var settlementStatus = checkList[0].settlementStatus;
		  if(settlementStatus == "2" || settlementStatus == "3"){
			  xjValidate.showPopup("结算单正在审核中或已审核通过!","提示");
			  return;
		  }
	  }
  	$("#hidden_operate_type").val(operateType);
  	$("#hidden_settlement_info_id").val(settlementInfoId);
  	$("#form_settlement_opt").attr("action",basePath+"/settlementInfo/initReOrderSettlementInfoPage");
  	$("#form_settlement_opt").submit();
  }
  
  /**
   * 删除结算信息
   * @author jiangweiwei 2017年7月21日
   */
  function deleteReOrderSettlementInfo(){
	  var settlements = findAllCheck(".re_order_settlement_check");
	  if(settlements.length == 0){
		  xjValidate.showPopup("请选择一条记录!","提示");
		  return;
	  }
	  var flag = false;
	  for(var i=0; i<settlements.length; i++){
		  if(settlements[i].settlementStatus=='2' || settlements[i].settlementStatus=='3'){
			 flag = true;
			 break;
		  }
	  }
	  if(flag) {
		  xjValidate.showPopup("正在审核中或审核通过的数据不可删除！","提示");
		  return;
	  }
	  var settlementIds = findAllCheckReOrderSettlementInfoIds();
	  var waybillInfoIds = findAllCheckReOrderWaybillInfoIds();
	  var waybillInfos = new Array();
	  $(".re_order_settlement_check").each(function() {
			if ($(this).is(":checked")) {
				var params = {
					"id":$(this).attr("data-waybillInfoId"),
					"rootWaybillInfoId":$(this).attr("data-rootWaybillInfoId")
				}
				waybillInfos.push(params);
			}
		});
	  var waybillInfoJson = JSON.stringify(waybillInfos);
	  var settlementType = "2";
	  $.confirm({
			title : "提示",
			content : "是否确认删除结算信息？",
			buttons : {
				'确认' : function() {
				  	//删除结算信息
				  	$.ajax({
				  		url : basePath + "/settlementInfo/delSettlementInfo",
				  		asyn : false,
				  		type : "POST",
				  		data : {"ids":settlementIds,"wIds":waybillInfoIds,"settlementType":settlementType,"waybillInfoJson":waybillInfoJson},
				  		dataType : "json" ,
				  		success : function(dataStr) {
				  			if(dataStr){
				  				window.location.href = basePath+"/settlementInfo/showReOrderSettlementInfoListPage";
				  			}else{
				  				xjValidate.showPopup("删除结算信息服务异常忙，请稍后重试","提示");
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
   * 导出结算信息
   */
  function exportExcelSettlement(){
	  var settlementIds = findAllCheckReOrderSettlementInfoIds();
	  if(settlementIds == null || settlementIds.length == 0){
		  xjValidate.showPopup("请选择需要导出的结算信息","提示");
		  return;
	  }
	  var type = 2;
	  var url = basePath+ "/settlementInfo/exportSettlementLosses?ids="+settlementIds+"&type="+type;
	  window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes");
//	  $.ajax({
//		  url : basePath + "/settlementInfo/exportSettlementLosses",
//		  asyn : false,
//		  type : "POST",
//		  data : {"ids":settlementIds,"url":url,"name":name},
//		  success : function(dataStr){
//			  if(dataStr){
//				  xjValidate.showTip("导出结算信息成功"); 
//			  }else{
//				  xjValidate.showTip("导出结算信息服务异常忙，请稍后重试");
//	  			  return;
//			  }
//		  }
//	  });
  }

  /**
   * 导出EAS 返单结算信息
   * @author qiuyongcheng 2017年9月18日
   */
  function EASexportExcelReOrderSettlement(){
	  var settlementArray = findAllCheck(".re_order_settlement_check");
	  if(settlementArray.length <= 0){
		  xjValidate.showPopup("请选择需要导出的结算信息!","提示");
		  return;
	  }
	  var flag = false;
	  for(var i=0; i<settlementArray.length; i++){
		  if(settlementArray[i].settlementStatus!='3'){
			 flag = true;
			 break;
		  }
		  
	  }
	  if(flag) {
		  xjValidate.showPopup("未审核通过的数据不可导出！","提示");
		  return;
	  }else{
		  var settlementIds = findAllCheckReOrderSettlementInfoIds();
		  var type = 2;
		  var url = basePath+ "/settlementInfo/EASexportSettlementLosses?ids="+settlementIds+"&type="+type;
		  window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes");
	  }
  }
  
  /**
   * 根据选择的结算单数据生成挂账红冲生成一条新的红冲数据
   * @author jiangweiwei 2017年7月12日
   */
  function writeOffSettlementInfo(){
	  var checkList = findAllCheck(".re_order_settlement_check");
	  if(checkList.length == 0 || checkList.length > 1){
		  xjValidate.showPopup("请选择一条记录!","提示");
		  return;
	  }
	  var id = checkList[0].id;
	  var settlementStatus = checkList[0].settlementStatus;
	  var isWriteOff = checkList[0].isWriteOff;
	  if(settlementStatus == "1" || settlementStatus == "2" || settlementStatus == "4"){
		  xjValidate.showPopup("结算单正在审核中或未提交审核!","提示");
		  return;
	  }
	  if(isWriteOff == "1"){
		  xjValidate.showPopup("结算单已红冲!","提示");
		  return;
	  }
	  var settlementType = "2";
	  var rootWaybillInfoId = checkList[0].rootWaybillInfoId;
	  $.confirm({
			title : "提示",
			content : "是否确认挂账红冲结算信息？",
			buttons : {
				'确认' : function() {
			  	  $.ajax({
			  		url : basePath + "/settlementInfo/RedSettlementInfo",
			  		asyn : false,
			  		type : "POST",
			  		data : {"id":id,"settlementType":settlementType,"rootWaybillInfoId":rootWaybillInfoId},
			  		dataType : "json" ,
			  		success : function(dataStr) {
			  			if(dataStr){
			  				//刷新页面
			  				window.location.href = basePath+"/settlementInfo/showReOrderSettlementInfoListPage";
			  			}else{
			  				xjValidate.showPopup("红冲服务异常忙，请稍后重试","提示");
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
  
  function selectDifferenceType(){
	  if($("#reviseType").val() == 1){
		  $('#reviseTransportPrice').prop('readonly',false);
		  $('#reviseArriveTonnage').prop('readonly',true);
		  $('#otherProjectRevise').prop('readonly',true);
		  $('#reviseTransportPrice').val("");
		  $('#reviseArriveTonnage').val(0);
		  $('#otherProjectRevise').val(0);
	  }
	  if($("#reviseType").val() == 2){
		  $('#reviseTransportPrice').prop('readonly',true);
		  $('#reviseArriveTonnage').prop('readonly',false);
		  $('#otherProjectRevise').prop('readonly',true);
		  $('#reviseTransportPrice').val(0);
		  $('#reviseArriveTonnage').val("");
		  $('#otherProjectRevise').val(0);
	  }
	  if($("#reviseType").val() == 3){
		  $('#reviseTransportPrice').prop('readonly',true);
		  $('#reviseArriveTonnage').prop('readonly',true);
		  $('#otherProjectRevise').prop('readonly',false);
		  $('#reviseTransportPrice').val(0);
		  $('#reviseArriveTonnage').val(0);
		  $('#otherProjectRevise').val("");
	  }
  }
  
  /**
   * 根据页数查询组织部门（项目）信息
   * @author jiangweiwei 2017年7月13日
   * @param number 页数
   */
  function searchReOrderProjectInfo(number) {
  	var projectName = $("#projectName").val();
  	// 请求地址
  	var url = basePath
  			+ "/settlementInfo/showSettlementProjectInfoPage #project-data-info";
  	$("#show-settlement-project-data-info").load(url, {
  		"page" : number,
  		"rows" : 10,
  		"projectName" : projectName
  	}, function() {
  	})
  }
  
  function printSettlementInfo(){
	  var checkList = findAllCheck(".re_order_settlement_check");
	  if(checkList.length == 0 || checkList.length > 1){
		  xjValidate.showPopup("请选择一条记录!","提示");
		  return;
	  }
	  var id = checkList[0].id;
	  var settlementStatus = checkList[0].settlementStatus;
	  var startPoints = checkList[0].lineInfoId;
      var endPoints = checkList[0].endPoints;
      var scatteredGoods = checkList[0].scatteredGoods;
//      if(settlementStatus != 3){
//    	  xjValidate.showPopup("请选择审核通过的记录!","提示");
//		  return;
//      }
      $.ajax({
  		type : "POST",
  		url	: basePath+"/settlementInfo/searchSettlementInfoPrintNum",
  		data : {"id":id},
  		success	: function(dataStr){
  			if(dataStr.success){
  				window.location.href = basePath+"/settlementInfo/printSettlementInfo?id="+id+"&startPoints="+startPoints+"&endPoints="+endPoints;
  			}else{
  				xjValidate.showPopup(dataStr.msg,"提示");
  				return;
  			}
  		}
  	});
      
  }
  
  
  
  
  /**
   * 结算单拍照
   */
  function uploadSettlementPhoto(){
	  var settlementIds = findAllCheckReOrderSettlementInfoIds();
	  if(settlementIds == null || settlementIds.length == 0){
		  xjValidate.showPopup("请选择需要一条结算信息","提示");
		  return;
	  }
	  var url = basePath+ "/settlementInfo/exportSettlementLosses?ids="+settlementIds+"&type="+type;
	  window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes");
//	  $.ajax({
//		  url : basePath + "/settlementInfo/exportSettlementLosses",
//		  asyn : false,
//		  type : "POST",
//		  data : {"ids":settlementIds,"url":url,"name":name},
//		  success : function(dataStr){
//			  if(dataStr){
//				  xjValidate.showTip("导出结算信息成功"); 
//			  }else{
//				  xjValidate.showTip("导出结算信息服务异常忙，请稍后重试");
//	  			  return;
//			  }
//		  }
//	  });
  }
  
  /**
   * 影像页面
   */
  function settlementphoto(){
	  var checkList = findAllCheck(".re_order_settlement_check");
	  if(checkList.length == 0 || checkList.length > 1){
		  xjValidate.showPopup("请选择一条记录!","提示");
		  return;
	  }
	  var id = checkList[0].id;
	  $("#settlementInfoIdInput").val(id);
  	
//  	// 请求地址
//  	var url = basePath
//  			+ "/settlementInfo/addSettlementPhotoInfoPage #photo-data-info";
  //	
//  	$("#settlementphoto_info_view").load(url, {}, function() {
//  		
//  		
//  	});
  	//EThumbnails.ClearDisplay(true);
  	$("#settlementPhotoModal").modal('show');
  }


  function submitSelectPhhot(){
	var reOrderSettlementPhoto = sessionStorage.getItem("reOrderSPhoto");
	var settlementInfoId = $("#settlementInfoIdInput").val();
	$("#reOrderSPhoto").val(reOrderSettlementPhoto);
	$.ajax({
		url	: basePath + "/settlementInfo/addDriverWaybillMaintainAndDriverWaybillImgDetail",
		asyn : false,
		type : "POST",
		data : {"reOrderSPhoto" : reOrderSettlementPhoto,"settlementInfoId" : settlementInfoId},
		dataType : "json",
		success : function(dataStr){
			if(dataStr){
				if(dataStr.success){
					//xjValidate.showPopup("影像保存成功","提示");
					$("#settlementPhotoModal").modal('hide');
				}else{
					xjValidate.showPopup(dataStr.msg,"提示");
	   				return;
				}
			}else{
				xjValidate.showPopup("维护磅单信息服务异常忙，请稍后重试","提示");
				return;
			}
		}
		
	});
  }
  //查看驳回原因
  function viewAuditLog(settlementId){
	  $.ajax({
	      	url:basePath+"/settlementInfo/viewAuditLog",//请求的action路径
	          async:false,//是否异步
	          cache:false,//是否使用缓存
	          type:'POST',//请求方式：post
	          data:{"settlementId":settlementId},
	          dataType:'json',//数据传输格式：json
	          success:function(data){
	        	  var viewAuditLog = data.viewAuditLog;
	          	 $.confirm({
	   		      title : '驳回意见:',
	   		      content : ''
	   		          + '<form action="" class="formName">'
	   		          + '<div class="form-group">'
	   		          + '<textarea type="text" readonly="readonly" placeholder="驳回意见" id ="auditOpinion" class="name form-control" required style="height:150px;  resize: none;">'+viewAuditLog.auditOpinion+'&#10;复核人:'+viewAuditLog.auditName+'&#10;时间:'+format(new Date(viewAuditLog.auditTime).toString(),'yyyy-MM-dd HH:mm:ss')+'</textarea>'
	   		          + '</div>' + '</form>',
	   		      buttons : {
	   		        rejected : {
	   		          text : '确定',
	   		          btnClass : 'btn-red',
	   		          action : function() {
	   		        	  // close
	   		          }
	   		        }
	   		      }
	   		    });
	          }
	          });
  }
  
  
  
//查看附件
  function viewAttachment(rootWaybillInfoId){
  	$("#unloadingDiv").empty();
  	$("#unloadingDiv").html("");
  	$("#loadingDiv").empty();
  	$("#loadingDiv").html("");
  	$("#onpassageDiv").empty();
  	$("#onpassageDiv").html("");
  	 //查看附件
  	$.ajax({
      	url:basePath+"/settlementInfo/findEnclosure",//请求的action路径
          async:false,//是否异步
          cache:false,//是否使用缓存
          type:'POST',//请求方式：post
          data:{"rootWaybillInfoId":rootWaybillInfoId},
          dataType:'json',//数据传输格式：json
          success:function(data){
          	var jsonAll = data;
          	var jsonLoading = jsonAll.loadingImgList;
          	var jsonOnpassage = jsonAll.onpassageImgList;
          	var jsonUnloading = jsonAll.unloadingImgList;
          	var imgUrl = "";
          	if(jsonLoading != null && jsonLoading.length >0){
          		$.each(jsonLoading,function(i, val) {
          			if(val == "" || val == null){
          				imgUrl = basePath+"/static/images/common/timg.jpg";
          			}else{
          				imgUrl = fastdfsServer+"/"+val;
          			}
          			$("#loadingDiv").append("<div class='group-img'>" +
          					"<div class='view-img'>" +
          					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
          					"</div>" +
          					"</div>" );
  	    		})
          	}else{
          		imgUrl = basePath+"/static/images/common/timg.jpg";
          		$("#loadingDiv").append("<div class='group-img'>" +
      					"<div class='view-img'>" +
      					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
      					"</div>" +
      					"</div>" );
          	}
//          	if(jsonOnpassage != null && jsonLoading.length >0){
//          		$.each(jsonOnpassage,function(i, val) {
//          			if(val == "" || val == null){
//          				imgUrl = basePath+"/static/images/common/timg.jpg";
//          			}else{
//          				imgUrl = fastdfsServer+"/"+val;
//          			}
//          			$("#onpassageDiv").append("<div class='group-img'>" +
//          					"<div class='view-img'>" +
//          					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
//          					"</div>" +
//          					"</div>" );
//  	    		})
//          	}else{
//          		imgUrl = basePath+"/static/images/common/timg.jpg";
//          		$("#onpassageDiv").append("<div class='group-img'>" +
//      					"<div class='view-img'>" +
//      					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
//      					"</div>" +
//      					"</div>" );
//          	}
          	
          	if(jsonUnloading != null  && jsonLoading.length >0){
          		$.each(jsonUnloading,function(i, val) {
          			if(val == "" || val == null){
          				imgUrl = basePath+"/static/images/common/timg.jpg";
          			}else{
          				imgUrl = fastdfsServer+"/"+val;
          			}
          			$("#unloadingDiv").append("<div class='group-img'>" +
          					"<div class='view-img'>" +
          					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
          					"</div>" +
          					"</div>" );
  	    		})
          	}else{
          		imgUrl = basePath+"/static/images/common/timg.jpg";
          		$("#unloadingDiv").append("<div class='group-img'>" +
      					"<div class='view-img'>" +
      					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
      					"</div>" +
      					"</div>" );
          	}
          	$("#lookDocModal").modal('show');
          	}
          });
  	
  	//图片预览
  	$('.view-img').viewer({
  		title:false
  	});
  }
  
  /**
   * 组织部门清除
   * jiangweiwei 2017年11月3日
   */
  function cleanOrgInfo(){
  	$("#projectInfoName").val("");
  	$("#projectInfoId").val("");
  }
  