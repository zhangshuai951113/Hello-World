(function($) {
    choiceMethod();

});

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
}
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
//代理运价界面加载时触发
function showTraffictcsInfo(pageNo){
	$("#allTariffInfo").empty();
	$("#allTariffInfo").html("");
	var pageSizeStr = '10';
	var goodsName = $("#mhgoodsName").val();
	var entrustName = $("#mhentrustName").val();
	var proxyName = $("#mhproxyName").val();
	var forwardingUnit = $("#mhforwardingUnit").val();
	var consignee = $("#mhconsignee").val();
	var startDate = $("#mhstartDate").val();
	var startDate1 = $("#mhstartDate1").val();
	var endDate = $("#mhendDate").val();
	var endDate1 = $("#mhendDate1").val();
	var transportPriceStatus = $("#mhtransportPriceStatus").val();
	var lineInfoId = $("#wllineId").val();
	
	var selectData = {
			curPage : pageNo,
			pageSizeStr : pageSizeStr,
			goodsName:goodsName,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			entrustName:entrustName,
			proxyName:proxyName,
			startDateStr:startDate,
			startDate1Str:startDate1,
			endDateStr:endDate,
			endDate1Str:endDate1,
			lineInfoId:lineInfoId,
			transportPriceStatus:transportPriceStatus
			
	}
    $.ajax({
    	url:basePath+ "/tariff/findProxyTransInfo",//请求的action路径
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
        	var jsonList = jsonAll.tpList;
        	var totalCount = jsonAll.totalCount;
        	
        	$("#bigNum").text("搜索结果共"+totalCount);
        	 bigPage.setTotalItems(totalCount);
        	$.each(jsonList,function(i, val) {
    			if(val.cooperateStatus == '1'){
    				val.cooperateStatus ='协同';
    			}
    			if(val.cooperateStatus == '2'){
    				val.cooperateStatus ='半协同';
    			}
    			if(val.transportPriceType == '1'){
    				val.transportPriceType ='物流运价';
    			}
    			if(val.transportPriceType == '2'){
    				val.transportPriceType ='转包运价';
    			}
    			if(val.proxyTransportPriceMode == '1'){
    				val.proxyTransportPriceMode ='固定运价';
    			}
    			if(val.proxyTransportPriceMode == '2'){
    				val.proxyTransportPriceMode ='比例';
    			}
    			if(val.computeMode == '1'){
    				val.computeMode ='发货吨位';
    			}
    			if(val.computeMode == '2'){
    				val.computeMode ='到货吨位';
    			}
    			if(val.computeMode == '3'){
    				val.computeMode ='最小吨位';
    			}
    			if(val.transportPriceStatus == '1'){
    				val.transportPriceStatus ='新建';
    			}
    			if(val.transportPriceStatus == '2'){
    				val.transportPriceStatus ='审核中';
    			}
    			if(val.transportPriceStatus == '3'){
    				val.transportPriceStatus ='审核通过';
    			}
    			if(val.transportPriceStatus == '4'){
    				val.transportPriceStatus ='审核驳回';
    			}
    			$("#allTariffInfo").append("<tr class='table-body'><td><label class='i-checks'>" +
    					"<input class='sub-auth-check' type='checkbox' id = 'tarifficCheck'></label></td>" +
    					"<td>"+nullToString(val.id)+"</td>" +
    					"<td>"+nullToString(val.transportPriceStatus)+"</td>" +
    					"<td>"+nullToString(val.proxyName)+"</td>" +
    					"<td>"+nullToString(val.entrustName)+"</td>" +
    					"<td>"+nullToString(val.goodsName)+"</td>" +
    					"<td>"+nullToString(val.lineName)+"</td>" +
    					"<td>"+nullToString(val.forwardingUnit)+"</td>" +
    					"<td>"+nullToString(val.consignee )+"</td>" +
    					"<td>"+nullToString(val.distance)+"</td>" +
    					"<td>"+nullToString(val.computeMode)+"</td>" +
    					"<td>"+nullToString(val.unitPrice)+"</td>" +
    					"<td>"+nullToString(val.proxyCostRatio)+"</td>" +
    					"<td>"+format(new Date(val.startDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
    					"<td>"+format(new Date(val.endDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
    					"<td>"+nullToString(val.priority)+"</td>" +
    					"<td style='display:none'>"+val.remarks+"</td>" +
    					"<td style='display:none'>"+val.transportPriceType+"</td>" +
    					"<td >"+val.proxyTransportPriceMode+"</td>" +
    					"<td style='display:none'>"+val.entrust+"</td>" +
    					"<td style='display:none'>"+val.goodsInfoId+"</td>" +
    					"<td style='display:none'>"+val.lineInfoId+"</td>" +
    					"<td style='display:none'>"+val.contractInfoId+"</td>" +
    					"<td style='display:none'>"+val.contractDetailInfoId+"</td>" +
    					"<td style='display:none'>"+val.proxyFormula+"</td>" +
    					"<td style='display:none'>"+val.cooperateStatus+"</td>" +
    					"<td style='display:none'>"+val.proxyTotalType+"</td>" +
    					"</tr>");
    		})
        }
    });
}

//点击模糊查询按钮
$("#mhSearchAll").click(function(){
	showTraffictcsInfo(1);
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
          xjValidate.showPopup("请求失败","提示");
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
    					"<td>"+val.lineName+"</td>" +
    					"<td>"+val.startPoints+"</td>" +
    					"<td>"+val.endPoints+"</td>" +
    					"<td>"+val.distance+"</td>" +
    					"<td>"+val.days+"</td>" +
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
//点击线路模糊查询按钮
$("#searchLineByName").click(function(){
	lineSelect(1);
});

//新增信息线路模糊查询
$("#selectcontractByMoHu").click(function(){
	contractSelectByLogictics(1);
});
function saveLinebutton(){
	 var selectlist = findAllCheck(".contract-check");
	    if(selectlist.length==0 || selectlist.length>1) {
	      // xjValidate.showTip("请选择一条数据");
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

function addProxy(index) {
    $("#addProxyModal").modal('show');
	  $('#addProxyModal .modal-body').css('height', '490px');
    $("#flag").val("1");
	$("#addProxyModal .modal-title").html('新增代理运价');    
  }
//保存或修改代理运价界面添加的信息
function saveProxyInfo(){
	var pid = $("#editid").val();
	var proxy = $("#orgId").val();
	var remarks = $("#premarks").val();
	var proxyCostRatio = $("#proxyCostRatio").val();
	var proxyTransportPriceMode = $("#pproxyTransportPriceMode").val();
	var endDate = $("#pendDate").val();
	var startDate = $("#pstartDate").val();
	var computeMode = $("#pcomputeMode").val();
	var unitPrice = $("#ppunitPrice").val();
	var entrustName = $("#wlentrustName").html();
	//var shipperName = $("#wlshipperName").html();
	var forwardingUnit = $("#wlforwardingUnit").html();
	var consignee = $("#wlconsignee").html();
	var lineName = $("#wllineName").html();
	var distance = $("#wldistance").html();
    var entrust = $("#wlentrust").val();
    var proxyFormula = $("#pproxyFormula").val();
    var proxyTotalType = $("#proxyTotalType").val();
    
    //var shipper = $("#wlshipper").val();
   var goodsInfoId = $("#wlgoodsInfoId").val();
   var lineInfoId = $("#wllineInfoId").val();
  // var cooperateStatus = $("#wlcooperateStatus").val();
    var wlid = $("#wlid").val();
    var contractInfoId = $("#wlcontractInfoId").val();
    var contractDetailInfoId = $("#wlcontractDetailInfoId").val();
   /* if(cooperateStatus == '协同'){
    	cooperateStatus =1;
    }
    if(cooperateStatus == '半协同'){
    	cooperateStatus =2;
    }*/
    if(unitPrice == "" || unitPrice == null || unitPrice == undefined){
    	xjValidate.showTip("单位运价不能为空");
    	return;
    }
    if(computeMode == "" || computeMode == null || computeMode == undefined){
    	xjValidate.showTip("请选择计算方式");
    	return;
    }
    if((proxyFormula == "" || proxyFormula == null || proxyFormula == undefined) && proxyTransportPriceMode == 2){
    	xjValidate.showTip("请选择代理公式");
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
    var check = xjValidate.checkForm('#addProxyModal .form-item');
	if(check == false){
		xjValidate.showPopup("存在不合法数据请检查","数据错误")
		return;
	}
    var addData = {
    		id:pid,
    		proxy:proxy,
			remarks:remarks,
			endDate:new Date(endDate),
			startDate:new Date(startDate),
			computeMode:computeMode,
			proxyCostRatio:proxyCostRatio,
			proxyTransportPriceMode:proxyTransportPriceMode,
			unitPrice:unitPrice,
			entrustName:entrustName,
			lineName:lineName,
			distance:distance,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			entrust:entrust,
			goodsInfoId:goodsInfoId,
			contractInfoId:contractInfoId,
			logisticsPriceId:wlid,
			lineInfoId:lineInfoId,
			contractDetailInfoId:contractDetailInfoId,
			proxyFormula:proxyFormula,
			proxyTotalType:proxyTotalType
			};
    var flag = $("#flag").val();
    if(flag =="1"){
    	//执行新增操作
    $.ajax({
    	url:basePath+ "/tariff/addTarifficforProxy",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:addData,
        dataType:'text',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup("请求失败","提示");
        },
        success:function(data){
        	if(data != "success" && data != null){
        		xjValidate.showPopup("启用日期不能小于"+data,"提示");
            	return;
        	}else{
        		$("#addProxyModal").modal('hide');
        		//刷新页面
        		//window.navigate(location);
        		//showTraffictcsInfo();
        		window.location.href = basePath+ "/tariff/goProxyTrafficManage";
        	}
        }
    });
    }
    if(flag =="2"){
    //执行修改操作
    	  $.ajax({
    	    	url:basePath+ "/tariff/editTariffic",//请求的action路径
    	        async:false,//是否异步
    	        cache:false,//是否使用缓存
    	        type:'POST',//请求方式：post
    	        data:addData,
    	        dataType:'json',//数据传输格式：json
    	        error:function(){
    	            //请求失败处理函数
    	            xjValidate.showPopup("请求失败","提示");
    	        },
    	        success:function(data){
    	        	if(data == true){
    	        		$("#addProxyModal").modal('hide');
    	        		window.location.href = basePath+ "/tariff/goProxyTrafficManage";
    	        	}
    	        }
    	    });
    }
}

//查询代理运价信息
function contractSelectByLogictics(pageNo) {
    $("#contractSelectModal1").modal('show');
     //初始线路列表page页面
    $("#addLogisticsTbody").empty();
	$("#addLogisticsTbody").html("");
	$("#saveWLcontractInfo").empty();
	$("#saveWLcontractInfo").html("");
	
   /* var contractCode = $("#wlhtcontractCode").val();
    var contractName = $("#wlhtcontractName").val();*/
    var entrustName = $("#wlhtentrustName").val();
    var goodsName = $("#goodsName").val();//货物名称
    var forwardingUnitName = $("#forwardingUnitName").val();//发货单位
    var consigneeName = $("#consigneeName").val();//到货单位
    //var shipperName = $("#wlhtshipperName").val();
   /* var createTime = $("#wlhtcreateTime").val();
    var createTime1 = $("#wlhtcreateTime1").val();*/
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
	    	url:basePath+ "/tariff/findLogisticsTariff",//请求的action路径
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
	        	var jsonList = jsonAll.tpList;
	        	var totalCount = jsonAll.totalCount;
	        	
	        	$("#contractNum1").text("搜索结果共"+totalCount);
	        	contractPage1.setTotalItems(totalCount);
	    		$.each(jsonList,function(i, val) {
	    			if(val.cooperateStatus == '1'){
	    				val.cooperateStatus ='协同';
	    			}
	    			if(val.cooperateStatus == '2'){
	    				val.cooperateStatus ='半协同';
	    			}
	    			if(val.transportPriceType == '1'){
	    				val.transportPriceType ='物流运价';
	    			}
	    			if(val.transportPriceType == '2'){
	    				val.transportPriceType ='转包运价';
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
	    					"<td style='display:none'>"+nullToString(val.unitPrice)+"</td>" +
	    					"<td style='display:none'>"+nullToString(val.priority)+"</td>" +
	    					"<td style='display:none'>"+nullToString(val.transportPriceType)+"</td>" +
	    					"<td style='display:none'>"+val.id+"</td>" +
	    					"<td style='display:none'>"+val.entrust+"</td>" +
	    					"<td style='display:none'>"+val.goodsInfoId+"</td>" +
	    					"<td style='display:none'>"+val.lineInfoId+"</td>" +
	    					"<td style='display:none'>"+val.contractInfoId+"</td>" +
	    					"<td style='display:none'>"+val.contractDetailInfoId+"</td>" +
	    					"</tr>");
	    		})
	    		
	    		setTimeout(function(){
	    			$("#contractTable").colResizable({
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
   // var cooperateStatus = ftr.children().eq(7).html();
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

//修改代理运价
function editProxyTransport(){
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
		    var proxyName = ftr.children().eq(3).html();
		    var entrustName = ftr.children().eq(4).html();
		    var goodsName = ftr.children().eq(5).html();
		    var lineName = ftr.children().eq(6).html();
		    var forwardingUnit = ftr.children().eq(7).html();
		    var consignee = ftr.children().eq(8).html();
		    var distance = ftr.children().eq(9).html();
		    var computeMode = ftr.children().eq(10).html();
		    var unitPrice = ftr.children().eq(11).html();
		    var proxyCostRatio = ftr.children().eq(12).html();
		    var startDate = ftr.children().eq(13).html();
		    var endDate = ftr.children().eq(14).html();
		    var priority = ftr.children().eq(15).html();
		    var transportPriceStatus = ftr.children().eq(2).html();
		    var remarks = ftr.children().eq(16).html();
		    var transportPriceType = ftr.children().eq(17).html();
		    var proxyTransportPriceMode = ftr.children().eq(18).html();
		    var entrust = ftr.children().eq(19).html();
		    var goodsInfoId = ftr.children().eq(20).html();
		    var lineInfoId = ftr.children().eq(21).html();
		    var contractInfoId = ftr.children().eq(22).html();
		    var contractDetailInfoId = ftr.children().eq(23).html();
		    var proxyFormula = ftr.children().eq(24).html();
		    var cooperateStatus = ftr.children().eq(25).html();
		    var proxyTotalType = ftr.children().eq(26).html();
		    
		    if(computeMode == "发货吨位"){
		    	computeMode = "1";
		    }
		    if(computeMode == "到货吨位"){
		    	computeMode = "2";
		    }
		    if(computeMode == "最小吨位"){
		    	computeMode = "3";
		    }
		    if(proxyTransportPriceMode == "固定运价"){
		    	proxyTransportPriceMode = "1";
		    }
		    if(proxyTransportPriceMode == "比例"){
		    	proxyTransportPriceMode = "2";
		    }
		    if(transportPriceStatus == '新建' || transportPriceStatus == '审核驳回'){
		    	$("#addProxyModal .modal-title").html('修改代理运价');
		    	$("#editid").val(id);
		    	$("#flag").val("2");  //标识为修改
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
			         
			          if(proxyTransportPriceMode ==1){//固定运价
			        	  $("#ppunitPrice").val(unitPrice);
			        	  $("#pproxyFormula").attr("readonly","readonly");
			        	  $("#proxyCostRatio").attr("readonly","readonly");
			        	  $("#proxyCostRatio").val(0);
			          }else{
					    	$("#pproxyFormula").val(proxyFormula);
					    	$("#proxyCostRatio").val(proxyCostRatio);
					    	$("#ppunitPrice").val(0);
				        	$("#ppunitPrice").attr("readonly","readonly");
			          }
			         $("#selectOrg").html(proxyName);
			         $("#premarks").val(remarks);
			    	 $("#pendDate").val(endDate);
			    	 $("#pstartDate").val(startDate);
			    	$("#pcomputeMode").val(computeMode);
			    	$("#proxyTotalType").val(proxyTotalType);
			    	$("#pproxyTransportPriceMode").val(proxyTransportPriceMode);
			    	 $("#saveWLcontractInfo").append("<p>委托方:<span id ='wlentrustName'>"+entrustName+"</span></p>" +
			    	    		"<p>货物:<span id ='wlgoodsName'>"+goodsName+"</span></p>" +
			    	    		"<p>线路:<span id ='wllineName'>"+lineName+"</span></p>" +
			    	    		"<p>远距:<span id ='wldistance'>"+distance+"</span></p>"+
			    	    		"<p>发货单位:<span id ='wlforwardingUnit'>"+forwardingUnit+"</span></p>"+
			    	    		"<p>到货单位:<span id ='wlconsignee'>"+consignee+"</span></p>"+
			    	    		"<input type = 'hidden' id = 'edittransportPriceType' value = '"+transportPriceType+"'>"+
			    	    		"<input type = 'hidden' id = 'wlentrust' value ='"+entrust+"'>"+
			    	    		"<input type = 'hidden' id = 'wlgoodsInfoId' value ='"+goodsInfoId+"'>"+
			    	    		"<input type = 'hidden' id = 'wlcontractInfoId' value ='"+contractInfoId+"'>"+
			    	    		"<input type = 'hidden' id = 'wllineInfoId' value ='"+lineInfoId+"'>"+
			    	    		"<input type = 'hidden' id = 'wlid' value ='"+contractInfoId+"'>"+
			    	    		"<input type = 'hidden' id = 'wlcontractDetailInfoId' value ='"+contractDetailInfoId+"'>"
			    	    );
			    	 //choiceMethod();
			    	 $("#addProxyModal").modal('show');
		    		  $('#addProxyModal .modal-body').css('height', '490px');

		    }else{
		    	xjValidate.showPopup("运价已提交审核，无法修改!","提示");
		    	return;
		    }
}


//删除大宗物价信息
function delProxyInfo(){
	var ids ="";
	var transportPriceStatus="";
	var transportPriceStatusArr="";
	 var selectlist = findAllCheck(".sub-auth-check");
	    if(selectlist.length==0){
	       xjValidate.showPopup("请选择要删除的数据","提示");
	       return;
	    }
	    $("#tarifficCheck:checked").each(function() {
	    	var id = $(this).parents("tr").children().eq(1).html();
	    	ids += id+",";
	    	transportPriceStatus = $(this).parents("tr").children().eq(2).html();
	    	transportPriceStatusArr += transportPriceStatus+",";
	    })
	   // alert(ids);
	     if(transportPriceStatusArr.indexOf("审核中") > -1  || transportPriceStatusArr.indexOf("审核通过") > -1){
	    		xjValidate.showPopup("运价已提交审核,无法删除!","提示");
		    	return;
	     }else
	  //执行删除操作
	    	 $.confirm({
	    			title : "提示",
	    			content : "您确认要删除选中的数据？",
	    			buttons : {
	    				'确认' : function() {
	    					$.ajax({
	    			  	    	url:basePath+ "/tariff/delTariffic",//请求的action路径
	    			  	        async:false,//是否异步
	    			  	        cache:false,//是否使用缓存
	    			  	        type:'POST',//请求方式：post
	    			  	        data:{"ids":ids},
	    			  	        dataType:'json',//数据传输格式：json
	    			  	        error:function(){
	    			  	            //请求失败处理函数
	    			  	            xjValidate.showPopup("请求失败","提示");
	    			  	        },
	    			  	        success:function(data){
	    			  	        	if(data == true){
	    			  	        		window.location.href = basePath+ "/tariff/goProxyTrafficManage";
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
	    var transportPriceStatus = ftr.children().eq(2).html();
	    if(transportPriceStatus == '新建' || transportPriceStatus == '审核驳回'){
	    	  //提交审核操作
	    	$.confirm({
    			title : "提示",
    			content : "您确认要提交审核选中的数据？",
    			buttons : {
    				'确认' : function() {
    					 //提交审核操作
    					 $.ajax({
    			    	    	url:basePath+ "/tariff/tjTariffic",//请求的action路径
    			    	        async:false,//是否异步
    			    	        cache:false,//是否使用缓存
    			    	        type:'POST',//请求方式：post
    			    	        data:{"id":id},
    			    	        dataType:'json',//数据传输格式：json
    			    	        error:function(){
    			    	            //请求失败处理函数
    			    	            xjValidate.showPopup("请求失败","提示");
    			    	        },
    			    	        success:function(data){
    			    	        	if(data == true){
    			    	        		window.location.href = basePath+ "/tariff/goProxyTrafficManage";
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
	    var transportPriceStatus = ftr.children().eq(2).html();
	    if(transportPriceStatus == '审核中'){
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
					    	    	url:basePath+ "/tariff/auditTariffic",//请求的action路径
					    	        async:false,//是否异步
					    	        cache:false,//是否使用缓存
					    	        type:'POST',//请求方式：post
					    	        data:{"id":id,"buttonType":buttonType,"auditOpinion":auditOpinion},
					    	        dataType:'json',//数据传输格式：json
					    	        error:function(){
					    	            //请求失败处理函数
					    	            xjValidate.showPopup("请求失败","提示");
					    	        },
					    	        success:function(data){
					    	        	if(data == true){
					    	        		window.location.href = basePath+ "/tariff/goProxyTrafficManage";
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
					    	    	url:basePath+ "/tariff/auditTariffic",//请求的action路径
					    	        async:false,//是否异步
					    	        cache:false,//是否使用缓存
					    	        type:'POST',//请求方式：post
					    	        data:{"id":id,"buttonType":buttonType,"auditOpinion":auditOpinion},
					    	        dataType:'json',//数据传输格式：json
					    	        error:function(){
					    	            //请求失败处理函数
					    	            xjValidate.showPopup("请求失败","提示");
					    	        },
					    	        success:function(data){
					    	        	if(data == true){
					    	        		window.location.href = basePath+ "/tariff/goProxyTrafficManage";
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
function choiceMethod(){
	if($("#pproxyTransportPriceMode").val() == ""){//
		$("#ppunitPrice").val("");
		$("#proxyCostRatio").val("");
		return;
	}
	if($("#pproxyTransportPriceMode").val() == 1){//固定运价
		$("#proxyCostRatio").attr("readonly","readonly");
		$("#pproxyFormula").attr("disabled",true);
		$("#proxyCostRatio").val(0);
		$("#pproxyFormula").val(0);
		$("#ppunitPrice").removeAttr("readonly");
		$("#ppunitPrice").val("");
		return;
	}
	if($("#pproxyTransportPriceMode").val() == 2){//比例
		$("#ppunitPrice").attr("readonly","readonly");
		$("#ppunitPrice").val(0);
		$("#proxyCostRatio").removeAttr("readonly");
		$("#roxyFormula").attr("disabled",false);
		$("#proxyCostRatio").val("");
		$("#pproxyFormula").val("");
		return;
	}
}
//导出功能
function exportTarifficInfo(){
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
	    var type = 3;
		var url = basePath+ "/tariff/exportTariffic?ids="+ids+"&type="+type;
		window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes"); 
}

