
//时间戳转化成固定日期格式
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
};

//时间调用插件（精确到秒）
setTimeout(function() {
  $(".date-time-ws").datetimepicker({
      format: "YYYY-MM-DD HH:mm:ss",
      autoclose: true,
      todayBtn: true,
      todayHighlight: true,
      showMeridian: true,
      useSeconds:true
    }); 
},500)
  //时间调用插件（精确到秒）
    setTimeout(function() {
      $(".date-time-we").datetimepicker({
          format: "YYYY-MM-DD HH:mm:ss",
          autoclose: true,
          todayBtn: true,
          todayHighlight: true,
          showMeridian: true,
          useSeconds:true
        }); 
    },500)
function nullToString(obj){
	if(obj == null){
		obj = "";
	}
	return obj;
}
//外协司机运价界面加载时触发
function showDriverLossInfo(pageNo){
	$("#allTariffInfo").empty();
	$("#allTariffInfo").html("");
	var pageSizeStr = '10';
	var goodsName = $("#dmhgoodsName").val();
	var entrustName = $("#dmhentrustName").val();
	var startDate = $("#dmhstartDate").val();
	var startDate1 = $("#dmhstartDate1").val();
	var endDate = $("#dmhendDate").val();
	var forwardingUnit = $("#dmhforwardingUnit").val();
	var consignee = $("#dmhconsignee").val();
	var endDate1 = $("#dmhendDate1").val();
	var lossDeductionStatus = $("#dmhtransportPriceStatus").val();
	var lossDeductionPrice = $("#dmhunitPrice").val();
	var lossDeductionPrice1 = $("#dmhunitPrice1").val();
	var lineInfoId = $("#wllineId").val();
	var selectData = {
			curPage : pageNo,
			pageSizeStr : pageSizeStr,
			goodsName:goodsName,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			entrustName:entrustName,
			startDateStr:startDate,
			startDate1Str:startDate1,
			endDateStr:endDate,
			endDate1Str:endDate1,
			lineInfoId:lineInfoId,
			lossDeductionStatus:lossDeductionStatus,
			lossDeductionPrice:lossDeductionPrice,
			lossDeductionPrice1:lossDeductionPrice1
	}
    $.ajax({
    	url:basePath+ "/tariff/findDriverLossInfo",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:selectData,
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	var jsonAll = data;
        	var jsonList = jsonAll.tpList;
        	var totalCount = jsonAll.totalCount;
        	
        	$("#bigNum").text("搜索结果共"+totalCount);
        	 bigPage.setTotalItems(totalCount);
        	$.each(jsonList,function(i, val) {
    			/*if(val.cooperateStatus == '1'){
    				val.cooperateStatus ='协同';
    			}
    			if(val.cooperateStatus == '2'){
    				val.cooperateStatus ='半协同';
    			}*/
    			if(val.lossDeductionType == '1'){
    				val.lossDeductionType ='物流损耗扣款';
    			}
    			if(val.lossDeductionType == '2'){
    				val.lossDeductionType ='转包损耗扣款';
    			}
    			if(val.deductionMode == '1'){
    				val.deductionMode ='比例';
    			}
    			if(val.deductionMode == '2'){
    				val.deductionMode ='吨位';
    			}
    			if(val.lossDeductionStatus == '1'){
    				val.lossDeductionStatus ='新建';
    			}
    			if(val.lossDeductionStatus == '2'){
    				val.lossDeductionStatus ='审核中';
    			}
    			if(val.lossDeductionStatus == '3'){
    				val.lossDeductionStatus ='审核通过';
    			}
    			if(val.lossDeductionStatus == '4'){
    				val.lossDeductionStatus ='审核驳回';
    			}
    			$("#allTariffInfo").append("<tr class='table-body'><td><label class='i-checks'>" +
    					"<input class='sub-auth-check' type='checkbox' id = 'tarifficCheck'></label></td>" +
    					"<td>"+nullToString(val.id)+"</td>" +
    					"<td>"+nullToString(val.lossDeductionStatus)+"</td>" +
    					"<td>"+nullToString(val.entrustName)+"</td>" +
    					"<td>"+nullToString(val.goodsName)+"</td>" +
    					"<td>"+nullToString(val.lineName)+"</td>" +
    					"<td>"+nullToString(val.distance)+"</td>" +
    					"<td>"+nullToString(val.forwardingUnit)+"</td>" +
    					"<td>"+nullToString(val.consignee)+"</td>" +
    					"<td>"+nullToString(val.deductionMode)+"</td>" +
    					"<td>"+nullToString(val.reasonableLossRatio)+"</td>" +
    					"<td>"+nullToString(val.reasonableLossTonnage)+"</td>" +
    					"<td>"+nullToString(val.lossDeductionPrice)+"</td>" +
    					"<td>"+format(new Date(val.startDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
    					"<td>"+format(new Date(val.endDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
    					"<td>"+nullToString(val.priority)+"</td>" +
    					"<td style='display:none'>"+nullToString(val.cooperateStatus)+"</td>" +
    					"<td style='display:none'>"+val.remarks+"</td>" +
    					"<td style='display:none'>"+val.isInvert+"</td>" +
    					"<td style='display:none'>"+val.forwardingUnit+"</td>" +
    					"<td style='display:none'>"+val.consignee+"</td>" +
    					"<td style='display:none'>"+val.goodsInfoId+"</td>" +
    					"<td style='display:none'>"+val.lineInfoId+"</td>" +
    					"<td style='display:none'>"+val.entrust+"</td>" +
    					"<td style='display:none'>"+val.contractInfoId+"</td>" +
    					"<td style='display:none'>"+val.contractDetailInfoId+"</td>" +
    					"</tr>");
    		})
        }
    });
}

//点击模糊查询按钮
$("#mhSearchAll").click(function(){
	showDriverLossInfo(1);
})

function lineSelect(pageNo) {
	$("#showLineTbody").empty();
	$("#showLineTbody").html("");
	$("#lineSelectModal").modal('show');
  var lineName =$("#mhlinename").val();
  var pageSizeStr = '10';
	
  //alert(lineName);
  $.ajax({
  	url:basePath+ "/tariff/selectLineInfo",//请求的action路径
      async:false,//是否异步
      cache:false,//是否使用缓存
      type:'POST',//请求方式：post
      dataType:'json',//数据传输格式：json
      data:{lineName:lineName,
    	    curPage : pageNo,
    	    pageSizeStr : pageSizeStr},
      error:function(){
          //请求失败处理函数
          xjValidate.showPopup('请求失败！',"提示");
      },
      success:function(data){
    	  var jsonAll = data;
    	  var jsonList = jsonAll.tList;
      	  var totalCount = jsonAll.totalCount;
      	$("#lineNum").text("搜索结果共"+totalCount);
      	linePage.setTotalItems(totalCount);
    		$.each(jsonList,function(i, val) {
    			$("#showLineTbody").append("<tr class='table-body '><td>" +
    					"<label class='i-checks'><input data-id='1' data-name='线路名称' name = 'lineCheck' id = 'lineCheck' class='contract-check' type='radio'>" +
    					"</label></td>" +
    					"<td style='display:none'>"+val.id+"</td>" +
    					"<td>"+nullToString(val.lineName)+"</td>" +
    					"<td>"+nullToString(val.startPoints)+"</td>" +
    					"<td>"+nullToString(val.endPoints)+"</td>" +
    					"<td>"+nullToString(val.distance)+"</td>" +
    					"<td>"+nullToString(val.days)+"</td>" +
    					"</tr>");
    		})
    		
    		setTimeout(function(){
    			$("#lineTable").colResizable({
    		      liveDrag:true, 
    		      gripInnerHtml:"<div class='grip'></div>", 
    		      draggingClass:"dragging",
    		      ifDel: 'wlTable'
    		    });
    		},1000)
      }
  });
}

function saveLinebutton(){
	 var selectlist = findAllCheck(".contract-check");
	    if(selectlist.length==0 || selectlist.length>1) {
	       //xjValidate.showTip("请选择一条数据");
	       xjValidate.showPopup('请选择一条数据！',"提示");
	       return;
	    }
	var ftr = $("#lineCheck:checked").parents("tr");
	var id = ftr.children().eq(1).html();
	var lineName = ftr.children().eq(2).html();
	$("#selectLine").html(lineName);
	$("#wllineId").val(id);
	 $("#lineSelectModal").modal('hide');
}

//点击线路模糊查询按钮
$("#searchLineByName").click(function(){
	lineSelect(1);
});

//弹出新增框
function addDriverTransport() {
	 $.ajax({
		  	url:basePath+ "/tariff/choickUserRose",//请求的action路径
		      async:false,//是否异步
		      cache:false,//是否使用缓存
		      type:'POST',//请求方式：post
		      error:function(){
		          //请求失败处理函数
		          xjValidate.showPopup('请求失败！',"提示");
		      },
		      success:function(data){
		    	  if(data =="1"){
		    		  $("#addOwnerModal").modal('show');
		    		    $("#flag1").val("1");  //标识为新增
		    			$('#addOwnerModal .modal-body').css('height', '482px');
		    	  }if(data =="2"){
		    		  $("#addFreightModal1").modal('show');
		    		    $("#flag2").val("1");  //标识为新增
		    			$('#addFreightModal1 .modal-body').css('height', '452px');
		    	  }
		    	  
		      }
		  });
  //时间调用插件（精确到秒）
    setTimeout(function() {
      $(".date-time-ss").datetimepicker({
          format: "YYYY-MM-DD hh:mm:ss",
          autoclose: true,
          todayBtn: true,
          todayHighlight: true,
          showMeridian: true,
          useSeconds:true
        }); 
    },500)
  }

//保存或修改大宗损耗界面添加的信息
function saveForAddTraffic(){
	var pid = $("#editid").val();
	var remarks = $("#wlremarks").val();
	var endDate = $("#wlendDate").val();
	var startDate = $("#wlstartDate").val();
	var reasonableLossRatio = $("#wlreasonableLossRatio").val();
	var reasonableLossTonnage = $("#wlreasonableLossTonnage").val();
	var lossDeductionPrice = $("#wllossDeductionPrice").val();
	var deductionMode = $("#wldeductionMode").val();
	var isInvert = $("#wlisInvert").val();
	var entrustName = $("#wlentrustName").html();
	//var shipperName = $("#wlshipperName").html();
	var lineName = $("#wllineName").html();
	var distance = $("#wldistance").html();
	var forwardingUnit = $("#wlforwardingUnit").html();
	var consignee = $("#wlconsignee").html();
    var entrust = $("#wlentrust").val();
   // var shipper = $("#wlshipper").val();
    var goodsInfoId = $("#wlgoodsInfoId").val();
    var lineInfoId = $("#wllineInfoId").val();
    var wlid = $("#wlid").val();
    var contractInfoId = $("#wlcontractInfoId").val();
	//var cooperateStatus = $("#wlcooperateStatus").val();
    var contractDetailInfoId = $("#wlcontractDetailInfoId").val();
    /*if(cooperateStatus == '协同'){
    	cooperateStatus =1;
    }
    if(cooperateStatus == '半协同'){
    	cooperateStatus =2;
    }*/
    if(reasonableLossRatio == "" || reasonableLossRatio == null || reasonableLossRatio == undefined){
    	xjValidate.showTip("合理损耗比例不能为空");
    	return;
    }
    if(reasonableLossTonnage == "" || reasonableLossTonnage == null || reasonableLossTonnage == undefined){
    	xjValidate.showTip("合理损耗吨位不能为空");
    	return;
    }
    if(lossDeductionPrice == "" || lossDeductionPrice == null || lossDeductionPrice == undefined){
    	xjValidate.showTip("损耗扣款价格不能为空");
    	return;
    }
    if(deductionMode == "" || deductionMode == null || deductionMode == undefined){
    	xjValidate.showTip("请选择定损方式");
    	return;
    }
    if(isInvert == "" || isInvert == null || isInvert == undefined){
    	xjValidate.showTip("请选择是否倒扣");
    	return;
    }
    if(startDate == "" || startDate == null || startDate == undefined){
    	xjValidate.showTip("启用时间不能为空");
    	return;
    }
    if(endDate == "" || endDate == null || endDate == undefined){
    	xjValidate.showTip("结束时间不能为空");
    	return;
    }
    if(endDate < startDate){
    	xjValidate.showTip("结束时间不能小于开始时间");
    	return;
    }
    if(entrustName == "" || entrustName == null || entrustName == undefined){
    	xjValidate.showTip("线路信息不能为空");
    	return;
    }
    if(pid == null || pid == undefined){
    	pid = "";
    }
    var check = xjValidate.checkForm('#addFreightModal1 .form-item');
	if(check == false){
		xjValidate.showPopup("存在不合法数据请检查","数据错误")
		return;
	}
    var addData = {
    		id:pid,
			remarks:remarks,
			endDate:new Date(endDate),
			startDate:new Date(startDate),
			reasonableLossRatio:reasonableLossRatio,
			reasonableLossTonnage:reasonableLossTonnage,
			lossDeductionPrice:lossDeductionPrice,
			deductionMode:deductionMode,
			isInvert:isInvert,
			entrustName:entrustName,
			lineName:lineName,
			distance:distance,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			entrust:entrust,
			goodsInfoId:goodsInfoId,
			contractInfoId:contractInfoId,
			logisticsLossDeductionId:wlid,
			lineInfoId:lineInfoId,
			contractDetailInfoId:contractDetailInfoId
			};
    var flag = $("#flag2").val();
    if(flag =="1"){
    	//执行新增操作
    $.ajax({
    	url:basePath+ "/tariff/addLossForDriverWl",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:addData,
        dataType:'text',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(flag){
        	if(flag != "success" && flag != null){
        		xjValidate.showPopup("启用日期不能小于"+flag,"提示");
            	return;
        	}else{
        		$("#addFreightModal1").modal('hide');
        		//刷新页面
        		//window.navigate(location);
        		//showTraffictcsInfo();
        		window.location.href = basePath+ "/tariff/goDriverLossManage";
        	}
        }
    });
    }
    if(flag =="2"){
    //执行修改操作
    	  $.ajax({
    	    	url:basePath+ "/tariff/editLossDeduction",//请求的action路径
    	        async:false,//是否异步
    	        cache:false,//是否使用缓存
    	        type:'POST',//请求方式：post
    	        data:addData,
    	        dataType:'json',//数据传输格式：json
    	        error:function(){
    	            //请求失败处理函数
    	            xjValidate.showPopup('请求失败！',"提示");
    	        },
    	        success:function(data){
    	        	if(data == true){
    	        		$("#addFreightModal1").modal('hide');
    	        		window.location.href = basePath+ "/tariff/goDriverLossManage";
    	        	}
    	        }
    	    });
    }
}
//保存或修改用户角色为企业货主的外协司机运价界面添加的信息
function saveDriverTraffic(){
	    var pid = $("#editid").val();
		var remarks = $("#d_remark").val();
		var endDate = $("#d_endDate").val();
		var startDate = $("#d_startDate").val();
		var entrustName = $("#selectOrg").html();
		var distance = $("#d_distance").html();
		var forwardingUnit = $("#d_forwardingUnit").val();
		var consignee = $("#d_consignee").val();
		var entrust = $("#orgId").val();
    	var goodsInfoId = $("#goodsInfoId").val();
    	var lineInfoId = $("#lineInfoId").val();
    	var reasonableLossRatio = $("#qyreasonableLossRatio").val();
    	var reasonableLossTonnage = $("#qyreasonableLossTonnage").val();
    	var lossDeductionPrice = $("#qylossDeductionPrice").val();
    	var deductionMode = $("#qydeductionMode").val();
    	var isInvert = $("#qyisInvert").val();
    if(entrust == "" || entrust == null || entrust == undefined){
    	xjValidate.showTip("请选择客户");
    	return;
    }
    if(goodsInfoId == "" || goodsInfoId == null || goodsInfoId == undefined){
    	xjValidate.showTip("请选择货物");
    	return;
    }
    if(lineInfoId == "" || lineInfoId == null || lineInfoId == undefined){
    	xjValidate.showTip("请选择线路");
    	return;
    }
    if(deductionMode == "" || deductionMode == null || deductionMode == undefined){
    	xjValidate.showTip("请选择扣损方式");
    	return;
    }
    if(isInvert == "" || isInvert == null || isInvert == undefined){
    	xjValidate.showTip("请选择是否倒扣");
    	return;
    }
    if(startDate == "" || startDate == null || startDate == undefined){
    	xjValidate.showTip("启用时间不能为空");
    	return;
    }
    if(endDate == "" || endDate == null || endDate == undefined){
    	xjValidate.showTip("结束时间不能为空");
    	return;
    }
    if(endDate < startDate){
    	xjValidate.showTip("结束时间不能小于开始时间");
    	return;
    }
    if(pid == null || pid == undefined){
    	pid = "";
    }
    var check = xjValidate.checkForm('#addOwnerModal .form-item');
	if(check == false){
		xjValidate.showPopup("存在不合法数据请检查","数据错误")
		return;
	}
    var addData = {
    		id:pid,
			remarks:remarks,
			endDate:new Date(endDate),
			startDate:new Date(startDate),
			distance:distance,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			entrust:entrust,
			reasonableLossRatio:reasonableLossRatio,
			reasonableLossTonnage:reasonableLossTonnage,
			lossDeductionPrice:lossDeductionPrice,
			deductionMode:deductionMode,
			isInvert:isInvert,
			goodsInfoId:goodsInfoId,
			lineInfoId:lineInfoId
			};
    var flag = $("#flag1").val();
    if(flag =="1"){
    	//执行新增操作
    	  $.ajax({
    	    	url:basePath+ "/tariff/addLossForDriverWl",//请求的action路径
    	        async:false,//是否异步
    	        cache:false,//是否使用缓存
    	        type:'POST',//请求方式：post
    	        data:addData,
    	        dataType:'text',//数据传输格式：json
    	        error:function(){
    	            //请求失败处理函数
    	            xjValidate.showPopup('请求失败！',"提示");
    	        },
    	        success:function(flag){
    	        	if(flag != "success" && flag != null){
    	        		xjValidate.showPopup("启用日期不能小于"+flag,"提示");
    	            	return;
    	        	}else{
    	        		$("#addFreightModal1").modal('hide');
    	        		//刷新页面
    	        		//window.navigate(location);
    	        		//showTraffictcsInfo();
    	        		window.location.href = basePath+ "/tariff/goDriverLossManage";
    	        	}
    	        }
    	    });
    }
    if(flag =="2"){
    //执行修改操作
    	//执行修改操作
  	  $.ajax({
  	    	url:basePath+ "/tariff/editLossDeduction",//请求的action路径
  	        async:false,//是否异步
  	        cache:false,//是否使用缓存
  	        type:'POST',//请求方式：post
  	        data:addData,
  	        dataType:'json',//数据传输格式：json
  	        error:function(){
  	            //请求失败处理函数
  	            xjValidate.showPopup('请求失败！',"提示");
  	        },
  	        success:function(data){
  	        	if(data == true){
	        		$("#addOwnerModal").modal('hide');
  	        		window.location.href = basePath+ "/tariff/goDriverLossManage";
  	        	}
  	        }
  	    });
    }
}




//查询新增大宗运价的线路信息
function contractSelectByLogictics(pageNo) {
    $("#contractSelectModal1").modal('show');
     //初始合同列表page页面
    
    $("#addLogisticsTbody").empty();
	$("#addLogisticsTbody").html("");
	$("#saveWLcontractInfo").empty();
	$("#saveWLcontractInfo").html("");
	
    var entrustName = $("#wlhtentrustName").val();
    var goodsName = $("#goodsName").val();//货物名称
    var forwardingUnitName = $("#forwardingUnitName").val();//发货单位
    var consigneeName = $("#consigneeName").val();//到货单位
    var pageSizeStr = '10';
    var selectData = {
    		curPage : pageNo,
			pageSizeStr : pageSizeStr,
   		    entrustName:entrustName,
   		    goodsName:goodsName,
   		    forwardingUnit:forwardingUnitName,
   		    consignee:consigneeName
    };
	   $.ajax({
	    	url:basePath+ "/tariff/findLogisticsloss",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:selectData,
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            alert('请求失败！');
	        },
	        success:function(data){
	        	  var jsonAll = data;
		    	  var jsonList = data.tpList;
		    	  var totalCount = data.totalCount;
	        	
	        	$("#contractNum1").text("搜索结果共"+totalCount);
	        	contractPage1.setTotalItems(totalCount);
	    		$.each(jsonList,function(i, val) {
	    			/*if(val.cooperateStatus == '1'){
	    				val.cooperateStatus ='协同';
	    			}
	    			if(val.cooperateStatus == '2'){
	    				val.cooperateStatus ='半协同';
	    			}*/
	    			if(val.lossDeductionType == '1'){
	    				val.lossDeductionType ='物流损耗扣款';
	    			}
	    			if(val.lossDeductionType == '2'){
	    				val.lossDeductionType ='转包损耗扣款';
	    			}
	    			$("#addLogisticsTbody").append("<tr class='table-body '><td>" +
	    					"<label class='i-checks'><input data-id='1' data-name='兴竹信息' name = 'logisticsCheck' id = 'logisticsCheck' class='contract-check' type='radio'>" +
	    					"</label></td>" +
	    					"<td>"+nullToString(val.entrustName)+"</td>" +
	    					"<td>"+nullToString(val.goodsName)+"</td>" +
	    					"<td>"+nullToString(val.lineName)+"</td>" +
	    					"<td>"+nullToString(val.distance)+"</td>" +
	    					"<td>"+nullToString(val.forwardingUnit)+"</td>" +
	    					"<td>"+nullToString(val.consignee)+"</td>" +
	    					"<td style='display:none'>"+nullToString(val.cooperateStatus)+"</td>" +
	    					"<td style='display:none'>"+format(new Date(val.startDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"<td style='display:none'>"+format(new Date(val.endDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"<td style='display:none'>"+nullToString(val.lossDeductionPrice)+"</td>" +
	    					"<td style='display:none'>"+nullToString(val.priority)+"</td>" +
	    					"<td style='display:none'>"+nullToString(val.lossDeductionType)+"</td>" +
	    					"<td style='display:none'>"+val.id+"</td>" +
	    					"<td style='display:none'>"+val.entrust+"</td>" +
	    					"<td style='display:none'>"+val.goodsInfoId+"</td>" +
	    					"<td style='display:none'>"+val.lineInfoId+"</td>" +
	    					"<td style='display:none'>"+val.contractInfoId+"</td>" +
	    					"<td style='display:none'>"+val.contractDetailInfoId+"</td>" +
	    					"</tr>");
	    		})
	    		setTimeout(function(){
	    			$("#wlTable").colResizable({
	    		      liveDrag:true, 
	    		      gripInnerHtml:"<div class='grip'></div>", 
	    		      draggingClass:"dragging",
	    		      ifDel: 'wlTable'
	    		    });
	    		},1000)
	        }
	    });
  }

//保存物流运价线路信息
function saveLogisticsContractInfo() {
    var selectlist = findAllCheck(".contract-check");
    if(selectlist.length==0 || selectlist.length>1) {
       xjValidate.showPopup("请选择一条数据","提示");
       return;
    }
    var ftr = $("#logisticsCheck:checked").parents("tr");
    var entrustName = ftr.children().eq(1).html();
    var goodsName = ftr.children().eq(2).html();
    var lineName = ftr.children().eq(3).html();
    var distance = ftr.children().eq(4).html();
    var forwardingUnit = ftr.children().eq(5).html();
    var consignee = ftr.children().eq(6).html();
    var cooperateStatus = ftr.children().eq(7).html();
    var id = ftr.children().eq(13).html();
    var entrust = ftr.children().eq(14).html();
    var goodsInfoId= ftr.children().eq(15).html();
    var lineInfoId= ftr.children().eq(16).html();
    var contractInfoId= ftr.children().eq(17).html();
    var contractDetailInfoId= ftr.children().eq(18).html();
    //console.log(selectlist[0].id)
    $("#saveWLcontractInfo").append("<p>委托方:<span id ='wlentrustName'>"+entrustName+"</span></p>" +
    		"<p>货物:<span id ='wlgoodsName'>"+goodsName+"</span></p>" +
    		"<p>线路:<span id ='wllineName'>"+lineName+"</span></p>" +
    		"<p>远距:<span id ='wldistance'>"+distance+"</span></p>"+
    		"<p>发货单位:<span id ='wlforwardingUnit'>"+forwardingUnit+"</span></p>"+
    		"<p>到货单位:<span id ='wlconsignee'>"+consignee+"</span></p>"+
    		"<input type = 'hidden' id = 'wlentrust' value ='"+entrust+"'>"+
    		"<input type = 'hidden' id = 'wlgoodsInfoId' value ='"+goodsInfoId+"'>"+
    		"<input type = 'hidden' id = 'wlid' value ='"+id+"'>"+
    		"<input type = 'hidden' id = 'wlcontractInfoId' value ='"+contractInfoId+"'>"+
    		"<input type = 'hidden' id = 'wllineInfoId' value ='"+lineInfoId+"'>"+
    		"<input type = 'hidden' id = 'wlcontractDetailInfoId' value ='"+contractDetailInfoId+"'>"
    );
    $("#contractSelectModal1").modal('hide');
 }

$("#selectcontractByMoHu").click(function(){
	contractSelectByLogictics(1);
});

//修改外协司机损耗扣款
function editDriverTransport(){
	 var selectlist = findAllCheck(".sub-auth-check");
	    if(selectlist.length==0){
	       xjValidate.showPopup("请选择一条数据","提示");
	       return;
	    }
	    if(selectlist.length>1) {
		       xjValidate.showPopup("您只能选择一条数据进行修改","提示");
		       return;
		    }
	    var ftr = $("#tarifficCheck:checked").parents("tr");
	    var id = ftr.children().eq(1).html();
	    var entrustName = ftr.children().eq(3).html();
	    var goodsName = ftr.children().eq(4).html();
	    var lineName = ftr.children().eq(5).html();
	    var distance = ftr.children().eq(6).html();
	    var forwardingUnit = ftr.children().eq(7).html();
	    var consignee = ftr.children().eq(8).html();
	    var deductionMode = ftr.children().eq(9).html();
	    var reasonableLossRatio = ftr.children().eq(10).html();
	    var reasonableLossTonnage = ftr.children().eq(11).html();
	    var lossDeductionPrice = ftr.children().eq(12).html();
	    var startDate = ftr.children().eq(13).html();
	    var endDate = ftr.children().eq(14).html();
	    var priority = ftr.children().eq(15).html();
	    var lossDeductionStatus = ftr.children().eq(2).html();
	    var cooperateStatus = ftr.children().eq(16).html();
	    var remarks = ftr.children().eq(17).html();
	    var isInvert = ftr.children().eq(18).html();
	    var forwardingUnit = ftr.children().eq(19).html();
	    var consignee= ftr.children().eq(20).html();
	    var goodsInfoId= ftr.children().eq(21).html();
	    var lineInfoId= ftr.children().eq(22).html();
	    var entrust= ftr.children().eq(23).html();
	    var contractInfoId= ftr.children().eq(24).html();
	    var contractDetailInfoId= ftr.children().eq(25).html();
		if(deductionMode == '比例'){
			deductionMode ='1';
		}
		if(deductionMode == '吨位'){
			deductionMode ='2';
		}
		if(isInvert == '是'){
			isInvert ='1';
		}
		if(isInvert == '否'){
			isInvert ='0';
		}
		 if(lossDeductionStatus == '新建' || lossDeductionStatus == '审核驳回'){
		    	$("#editid").val(id);
		    	$("#editid").val(id);
		    	 $.ajax({
		 		  	url:basePath+ "/tariff/choickUserRose",//请求的action路径
		 		      async:false,//是否异步
		 		      cache:false,//是否使用缓存
		 		      type:'POST',//请求方式：post
		 		      error:function(){
		 		          //请求失败处理函数
		 		          xjValidate.showPopup('请求失败！',"提示");
		 		      },
		 		      success:function(data){
		 		    	  if(data =="1"){
		 		    		  $("#addOwnerModal").modal('show');
		 		    		    $("#flag1").val("2");  //标识为修改
		 		    			$("#d_remark").val(remarks);
		 		    			$("#d_endDate").val(endDate);
		 		    			$("#d_startDate").val(startDate);
		 		    			$("#selectOrg").html(entrustName);
		 		    			$("#d_distance").html(distance);
		 		    			$("#d_forwardingUnit").val(forwardingUnit);
		 		    			$("#d_consignee").val(consignee);
		 		    			$("#orgId").val(entrust);
		 		    	    	$("#goodsInfoId").val(goodsInfoId);
		 		    	    	$("#lineInfoId").val(lineInfoId);
		 		    	    	$("#selectGoods").html(goodsName);
		 		    	    	$("#modalLine").html(lineName);
		 		    	    	$("#qyreasonableLossRatio").val(reasonableLossRatio);
		 		    	    	$("#qyreasonableLossTonnage").val(reasonableLossTonnage);
		 		    	    	$("#qylossDeductionPrice").val(lossDeductionPrice);
		 		    	    	$("#qydeductionMode").val(deductionMode);
		 		    	    	$("#qyisInvert").val(isInvert);
		 		    		    
		 		    	  }if(data =="2"){
		    		 $("#addFreightModal1").modal('show');
			         $("#flag2").val("2");  //标识为修改
			         $("#saveWLcontractInfo").empty();
			         $("#saveWLcontractInfo").html("");
			         //时间调用插件（精确到秒）
			         setTimeout(function() {
			           $(".date-time-ss").datetimepicker({
			               format: "YYYY-MM-DD hh:mm:ss",
			               autoclose: true,
			               todayBtn: true,
			               todayHighlight: true,
			               showMeridian: true,
			               useSeconds:true
			             }); 
			         },500)
			         
					$("#wlremarks").val(remarks);
					$("#wlendDate").val(endDate);
					$("#wlstartDate").val(startDate);
					$("#wlreasonableLossRatio").val(reasonableLossRatio);
					$("#wlreasonableLossTonnage").val(reasonableLossTonnage);
					$("#wllossDeductionPrice").val(lossDeductionPrice);
					$("#wldeductionMode").val(deductionMode);
					$("#wlisInvert").val(isInvert);
					 $("#saveWLcontractInfo").append("" +
					 			"<p>委托方:<span id ='wlentrustName'>"+entrustName+"</span></p>" +
					    		"<p>货物:<span id ='wlgoodsName'>"+goodsName+"</span></p>" +
					    		"<p>线路:<span id ='wllineName'>"+lineName+"</span></p>" +
					    		"<p>远距:<span id ='wldistance'>"+distance+"</span></p>"+
					    		"<p>发货单位:<span id ='wlforwardingUnit'>"+forwardingUnit+"</span></p>"+
					    		"<p>到货单位:<span id ='wlconsignee'>"+consignee+"</span></p>"+
					    		"<input type = 'hidden' id = 'wlid' value ='"+id+"'>"+
					    		"<input type = 'hidden' id = 'wlentrust' value ='"+entrust+"'>"+
			    	    		"<input type = 'hidden' id = 'wlgoodsInfoId' value ='"+goodsInfoId+"'>"+
			    	    		"<input type = 'hidden' id = 'wlcontractInfoId' value ='"+contractInfoId+"'>"+
			    	    		"<input type = 'hidden' id = 'wllineInfoId' value ='"+lineInfoId+"'>"+
			    	    		"<input type = 'hidden' id = 'wlcontractDetailInfoId' value ='"+contractDetailInfoId+"'>"
					    		);
		 		    	  }
		 		     }
		 		  });
		    }else{
		    	xjValidate.showPopup("运价已提交审核，无法修改!","提示");
		    	return;
		    }
}


//删除大宗损耗扣款信息
function delLossInfo(){
	var ids ="";
	var lossDeductionStatus="";
	var lossDeductionStatusArr="";
	 var selectlist = findAllCheck(".sub-auth-check");
	    if(selectlist.length==0){
	       xjValidate.showPopup("请选择要删除的数据","提示");
	       return;
	    }
	    $("#tarifficCheck:checked").each(function() {
	    	var id = $(this).parents("tr").children().eq(1).html();
	    	ids += id+",";
	    	lossDeductionStatus = $(this).parents("tr").children().eq(2).html();
	    	lossDeductionStatusArr += lossDeductionStatus+",";
	    })
	   // alert(ids);
	    if(lossDeductionStatusArr.indexOf("审核中") > -1  || lossDeductionStatusArr.indexOf("审核通过") > -1){
  		xjValidate.showPopup("运价已提交审核,无法删除!","提示");
	    	return;
   }else
	  //执行删除操作
	   $.confirm({
			title : "提示",
			content : "您确认要删除选中的数据？",
			buttons : {
				'确认' : function() {
					 //提交审核操作
					 $.ajax({
					    	url:basePath+ "/tariff/delLossDedectionInfo",//请求的action路径
					        async:false,//是否异步
					        cache:false,//是否使用缓存
					        type:'POST',//请求方式：post
					        data:{"ids":ids},
					        dataType:'json',//数据传输格式：json
					        error:function(){
					            //请求失败处理函数
					            xjValidate.showPopup('请求失败！',"提示");
					        },
					        success:function(data){
					        	if(data == true){
					        		window.location.href = basePath+ "/tariff/goDriverLossManage";
					        	}
					        }
					    });
				},
				'取消' : function() {
				}
			}
		});
}

//提交审核
function tijiaoNutton(){
	 var selectlist = findAllCheck(".sub-auth-check");
	    if(selectlist.length==0){
	       xjValidate.showPopup("请选择一条数据","提示");
	       return;
	    }
	    if(selectlist.length>1) {
		       xjValidate.showPopup("您只能选择一条数据提交审核","提示");
		       return;
		    }
	
	    var ftr = $("#tarifficCheck:checked").parents("tr");
	    var id = ftr.children().eq(1).html();
	    var lossDeductionStatus = ftr.children().eq(2).html();
	    if(lossDeductionStatus == '新建' || lossDeductionStatus == '审核驳回'){
	    	  //提交审核操作
	    	$.confirm({
    			title : "提示",
    			content : "您确认要提交审核选中的数据？",
    			buttons : {
    				'确认' : function() {
    					 //提交审核操作
    					  $.ajax({
    			    	    	url:basePath+ "/tariff/tjLossDeduction",//请求的action路径
    			    	        async:false,//是否异步
    			    	        cache:false,//是否使用缓存
    			    	        type:'POST',//请求方式：post
    			    	        data:{"id":id},
    			    	        dataType:'json',//数据传输格式：json
    			    	        error:function(){
    			    	            //请求失败处理函数
    			    	            xjValidate.showPopup('请求失败！',"提示");
    			    	        },
    			    	        success:function(data){
    			    	        	if(data == true){
    			    	        		window.location.href = basePath+ "/tariff/goDriverLossManage";
    			    	        	}
    			    	        }
    			    	    });
    				},
    				'取消' : function() {
    				}
    			}
    		});
	    
	    }else{
	    	xjValidate.showPopup("运价已提交审核!","提示");
	    	return;
	    }

}

//审核
function audit() {
	 var selectlist = findAllCheck(".sub-auth-check");
	    if(selectlist.length==0){
	       xjValidate.showPopup("请选择一条数据","提示");
	       return;
	    }
	    if(selectlist.length>1) {
		       xjValidate.showPopup("您只能选择一条数据审核","提示");
		       return;
		    }
	
	    var ftr = $("#tarifficCheck:checked").parents("tr");
	    var id = ftr.children().eq(1).html();
	    var lossDeductionStatus = ftr.children().eq(2).html();
	    if(lossDeductionStatus == '审核中'){
	    	var buttonType = "";
	    	var auditOpinion="";
	    	$.confirm({
				title : '请您填写审核意见:',
				content : ''
						+ '<form action="" class="formName">'
						+ '<div class="form-group">'
						+ '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px;  resize: none;" />'
						+ '</div>' + '</form>',
				buttons : {
					agreed : {
						text : '通过',
						btnClass : 'btn-blue',
						action : function() {
							buttonType = "1";
							auditOpinion = this.$content.find('#auditOpinion').val();
							if (!auditOpinion) {
								xjValidate.showPopup("审核意见不能为空！", "提示");
								return false;
							}
							
							  //提交审核操作
					    	  $.ajax({
					    	    	url:basePath+ "/tariff/auditLossDeduction",//请求的action路径
					    	        async:false,//是否异步
					    	        cache:false,//是否使用缓存
					    	        type:'POST',//请求方式：post
					    	        data:{"id":id,"buttonType":buttonType,"auditOpinion":auditOpinion},
					    	        dataType:'json',//数据传输格式：json
					    	        error:function(){
					    	            //请求失败处理函数
					    	            xjValidate.showPopup('请求失败！',"提示");
					    	        },
					    	        success:function(data){
					    	        	if(data == true){
					    	        		window.location.href = basePath+ "/tariff/goDriverLossManage";
					    	        	}
					    	        }
					    	    });
						}
					},
					rejected : {
						text : '不通过',
						btnClass : 'btn-red',
						action : function() {
							buttonType = "0";
							auditOpinion = this.$content.find('#auditOpinion').val();
							if (!auditOpinion) {
								xjValidate.showPopup("审核意见不能为空！", "提示");
								return false;
							}
							  //提交审核操作
					    	  $.ajax({
					    	    	url:basePath+ "/tariff/auditLossDeduction",//请求的action路径
					    	        async:false,//是否异步
					    	        cache:false,//是否使用缓存
					    	        type:'POST',//请求方式：post
					    	        data:{"id":id,"buttonType":buttonType,"auditOpinion":auditOpinion},
					    	        dataType:'json',//数据传输格式：json
					    	        error:function(){
					    	            //请求失败处理函数
					    	            xjValidate.showPopup('请求失败！',"提示");
					    	        },
					    	        success:function(data){
					    	        	if(data == true){
					    	        		window.location.href = basePath+ "/tariff/goDriverLossManage";
					    	        	}
					    	        }
					    	    });
						}
					},
					'取消' : function() {
						// close
					}
				}
			});
	    	
	    	
	    }else{
	    	xjValidate.showPopup("该运价已审核!","提示");
	    	return;
	    }
}



/**
 * 添加货物弹出框
 */
 function goodsSelect(pageNo) {
	 $("#showgoodsTbody").html("");
	 $("#showgoodsTbody").empty();
	 var goodsName = $("#ggoodsName").val();
	 var pageSizeStr = '10';
		var selectData = {
				curPage : pageNo,
				pageSizeStr : pageSizeStr,
				goodsName:goodsName
				}
		 $.ajax({
			  	url:basePath+ "/tariff/findgoodsInfo",//请求的action路径
			      async:false,//是否异步
			      cache:false,//是否使用缓存
			      type:'POST',//请求方式：post
			      dataType:'json',//数据传输格式：json
			      data:selectData,
			      error:function(){
			          //请求失败处理函数
			          xjValidate.showPopup('请求失败！',"提示");
			      },
			      success:function(data){
			    	  var jsonAll = data;
			    	  var jsonList = data.tpList;
			    	  var totalCount = data.totalCount;
			        	$("#goodsNum").text("搜索结果共"+totalCount);
			        	goodsPage.setTotalItems(totalCount);
			    		$.each(jsonList,function(i, val) {
			    			$("#showgoodsTbody").append("<tr class='table-body '><td>" +
			    					"<label class='i-checks'><input data-id='1' data-name='货物名称' class='goods-check' type='radio'>" +
			    					"</label></td>" +
			    					"<td>"+nullToString(val.id)+"</td>" +
			    					"<td>"+nullToString(val.goodsName)+"</td>" +
			    					"<td>"+nullToString(val.specModel)+"</td>" +
			    					"<td>"+nullToString(val.units)+"</td>" +
			    					"</tr>");
			    		});
			    		  $("#goodsSelectModal").modal('show');
			      }
			  });
 }


 /**
  *货物选择
  */
 function submitSelectGoods() {
   var selectlist = findAllCheck(".goods-check");
   if(selectlist.length==0 || selectlist.length>1) {
     xjValidate.showPopup("请选择一条数据","提示");
     return;
   }
	var ftr = $(".goods-check:checked").parents("tr");
	var id = ftr.children().eq(1).html();
	var goodsName = ftr.children().eq(2).html();
	$("#selectGoods").html(goodsName);
	$("#goodsInfoId").val(id);
   $("#goodsSelectModal").modal('hide');
 }
 
 $("#searchGoods").click(function(){
	 goodsSelect(1);
 });
 
 /**
  * 查询客户
  */
 function orgSelect(pageNo) {
 	$("#proxyTbody").html("");
 	$("#proxyTbody").empty();
 	var pageSizeStr = '10';
 	var sign = '1';
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
 	            xjValidate.showPopup('请求失败！',"提示");
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
 	        			"<td>"+nullToString(val.orgInfoId)+"</td>" +
 	        			"<td>"+nullToString(val.orgName)+"</td>");
 	        	});
 	        	$("#orgSelectModal").modal('show');
 	        }
 	    });
 }

 /**
  *客户选择
  */
 function submitSelectOrg() {
   var selectlist = findAllCheck(".org-check");
   if(selectlist.length==0 || selectlist.length>1) {
     xjValidate.showPopup("请选择一条数据","提示");
     return;
   }
   var ftr = $("#proxyRadio:checked").parents("tr");
   var id = ftr.children().eq(1).html();
   var name = ftr.children().eq(2).html();
   $("#selectOrg").html(name);
   $("#orgId").val(id);
   $("#orgSelectModal").modal('hide');
 }
 
//点击线路模糊查询按钮
 $("#searchCustomer").click(function(){
	 orgSelect();
 });
//点击线路模糊查询按钮
 $("#searchModelLineByName").click(function(){
	 lineSelect1(1);
 });
//点击客户模糊查询按钮
 $("#searchGoods").click(function(){
	 goodsSelect(1);
 });
 
 /**
  * 新增模态框线路弹出框
  */
 function lineSelect1(pageNo) {
 	$("#showLineTbody2").empty();
 	$("#showLineTbody2").html("");
 	$("#lineSelectModal2").modal('show');
   var lineName =$("#mtlinename").val();
   var pageSizeStr = '10';
 		
   //alert(lineName);
   $.ajax({
   	url:basePath+ "/tariff/selectLineInfo",//请求的action路径
       async:false,//是否异步
       cache:false,//是否使用缓存
       type:'POST',//请求方式：post
       dataType:'json',//数据传输格式：json
       data:{lineName:lineName,
     	    curPage : pageNo,
     	    pageSizeStr : pageSizeStr},
       error:function(){
           //请求失败处理函数
           xjValidate.showPopup('请求失败！',"提示");
       },
       success:function(data){
     	  var jsonAll = data;
     	  var jsonList = jsonAll.tList;
       	  var totalCount = jsonAll.totalCount;
       	$("#lineNum2").text("搜索结果共"+totalCount);
       	linePage2.setTotalItems(totalCount);
     		$.each(jsonList,function(i, val) {
     			$("#showLineTbody2").append("<tr class='table-body '><td>" +
     					"<label class='i-checks'><input data-id='1' data-name='线路名称' name = 'lineCheck' id = 'lineCheck' class='contract-check' type='radio'>" +
     					"</label></td>" +
     					"<td style='display:none'>"+val.id+"</td>" +
     					"<td>"+nullToString(val.lineName)+"</td>" +
     					"<td>"+nullToString(val.startPoints)+"</td>" +
     					"<td>"+nullToString(val.endPoints)+"</td>" +
     					"<td>"+nullToString(val.distance)+"</td>" +
     					"<td>"+nullToString(val.days)+"</td>" +
     					"</tr>");
     		})
     		
     		setTimeout(function(){
    			$("#line2Table").colResizable({
    		      liveDrag:true, 
    		      gripInnerHtml:"<div class='grip'></div>", 
    		      draggingClass:"dragging",
    		      ifDel: 'wlTable'
    		    });
    		},1000)
       }
   });
 }
 
//保存新增模态框查询选择的线路
 function saveModelLinebutton(){
 	 var selectlist = findAllCheck(".contract-check");
 	    if(selectlist.length==0 || selectlist.length>1) {
 	       xjValidate.showPopup("请选择一条数据","提示");
 	       return;
 	    }
 	var ftr = $("#lineCheck:checked").parents("tr");
 	var id = ftr.children().eq(1).html();
 	var lineName = ftr.children().eq(2).html();
 	var distance = ftr.children().eq(5).html();
 	$("#d_distance").html(distance);
 	$("#modalLine").html(lineName);
 	$("#lineInfoId").val(id);
 	 $("#lineSelectModal2").modal('hide');
 }
 
 //导出
 function exportLossDeductionInfo(){
	 var ids ="";
		 var selectlist = findAllCheck(".sub-auth-check");
		    if(selectlist.length==0){
		       xjValidate.showPopup("请选择要导出的数据","提示");
		       return;
		    }
		    $("#tarifficCheck:checked").each(function() {
		    	var id = $(this).parents("tr").children().eq(1).html();
		    	ids += id+",";
		    })
		    var type = 2;
			var url = basePath+ "/tariff/exportLossDeduction?ids="+ids+"&type="+type;
			window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes"); 
	}
