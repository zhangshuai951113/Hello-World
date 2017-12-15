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
function toChar(data) {
	if (data == null) {
		data = "";
	}
	return data;
}
//时间调用插件（精确到秒）
setTimeout(function() {
  $(".date-time-ss").datetimepicker({
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
$("#addLogisticsButton").click(function(){
	//alert("aaa");
	 $("#addFreightModal1").modal('show');
     $("#freight-title").text("新增物流运价");
     $("#flag").val("1");  //标识为新增
});

function addFreight2() {
    $("#addFreightModal2").modal('show');
      $("#freight-title").text("新增转包运价");
      $("#flag2").val("1");  //标识为新增
    }
//查询新增物流合同的线路信息
function contractSelectByLogictics(pageNo) {
    $("#contractSelectModal1").modal('show');
     //初始合同列表page页面
    
    $("#addLogisticsTbody").empty();
	$("#addLogisticsTbody").html("");
	$("#saveWLcontractInfo").empty();
	$("#saveWLcontractInfo").html("");
	
    var contractCode = $("#wlhtcontractCode").val();
    var contractName = $("#wlhtcontractName").val();
    var entrustName = $("#wlhtentrustName").val();
    var shipperName = $("#wlhtshipperName").val();
    var createTime = $("#wlhtcreateTime").val();
    var createTime1 = $("#wlhtcreateTime1").val();
    var goodsName = $("#goodsName").val();//货物名称
    var forwardingUnitName = $("#forwardingUnitName").val();//发货单位
    var consigneeName = $("#consigneeName").val();//到货单位
    
    var pageSizeStr = '10';
    var selectData = {
    		curPage : pageNo,
			pageSizeStr : pageSizeStr,
   		 contractCode:contractCode,
   		 contractName:contractName,
   		 entrustName:entrustName,
   		 shipperName:shipperName,
   		 createTimeStr:createTime,
   		 createTime1Str:createTime1,
   		 goodsName:goodsName,
   		 forwardingUnit:forwardingUnitName,
   		 consignee:consigneeName
    };
    
	   $.ajax({
	    	url:basePath+ "/tariff/findContractforLogistics",//请求的action路径
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
	        	var jsonList = jsonAll.LogisticsList;
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
	    			$("#addLogisticsTbody").append("<tr class='table-body '><td>" +
	    					"<label class='i-checks'><input data-id='1' data-name='兴竹信息' name = 'logisticsCheck' id = 'logisticsCheck' class='contract-check' type='radio'>" +
	    					"</label></td>" +
	    					"<td>"+toChar(val.entrustName)+"</td>" +
	    					"<td>"+toChar(val.shipperName)+"</td>" +
	    					"<td>"+toChar(val.goodsName)+"</td>" +
	    					"<td>"+toChar(val.lineName)+"</td>" +
	    					"<td>"+toChar(val.distance)+"</td>" +
	    					"<td>"+toChar(val.forwardingUnit)+"</td>" +
	    					"<td>"+toChar(val.consignee)+"</td>" +
	    					"<td style='display:none'>"+val.id+"</td>" +
	    					"<td style='display:none'>"+val.entrust+"</td>" +
	    					"<td style='display:none'>"+val.shipper+"</td>" +
	    					"<td style='display:none'>"+val.goodsInfoId+"</td>" +
	    					"<td style='display:none'>"+val.lineInfoId+"</td>" +
	    					"<td style='display:none'>"+val.contractInfoId+"</td>" +
	    					"<td style='display:none'>"+format(new Date(val.effectiveDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"<td style='display:none'>"+format(new Date(val.endDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
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


//查询新增转包合同的线路信息
function contractSelectByPackage(pageNo) {
    $("#contractSelectModal2").modal('show');
  
    
    $("#zbstartDate").empty();
	$("#zbstartDate").html("");
	$("#addzbTbody").empty();
	$("#addzbTbody").html("");
	$("#saveZBcontractInfo").empty();
	$("#saveZBcontractInfo").html("");
	
    var contractCode = $("#zbhtcontractCode").val();
    var contractName = $("#zbhtcontractName").val();
    var entrustName = $("#zbhtentrustName").val();
    var shipperName = $("#zbhtshipperName").val();
    var createTime = $("#zbhtcreateTime").val();
    var createTime1 = $("#zbhtcreateTime1").val();
    var goodsName = $("#zbhtgoodsName").val();//货物名称
    var forwardingUnitName = $("#zbhtforwardingUnitName").val();//发货单位
    var consigneeName = $("#zbhtconsigneeName").val();//到货单位
    var pageSizeStr = '10'
    var selectData = {
    	curPage : pageNo,
		pageSizeStr : pageSizeStr,
   		 contractCode:contractCode,
   		 contractName:contractName,
   		 entrustName:entrustName,
   		 shipperName:shipperName,
   		 createTimeStr:createTime,
   		 createTime1Str:createTime1,
   		 goodsName:goodsName,
   		 forwardingUnit:forwardingUnitName,
   		 consignee:consigneeName
    };
    
	   $.ajax({
	    	url:basePath+ "/tariff/findContractforSubcontract",//请求的action路径
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
	        	var jsonList = jsonAll.LogisticsList;
	        	var totalCount = jsonAll.totalCount;
	        	
	        	$("#contractNum2").text("搜索结果共"+totalCount);
	        	contractPage2.setTotalItems(totalCount);
	        	
	    		$.each(jsonList,function(i, val) {
	    			if(val.cooperateStatus == '1'){
	    				val.cooperateStatus ='协同';
	    			}
	    			if(val.cooperateStatus == '2'){
	    				val.cooperateStatus ='半协同';
	    			}
	    			$("#addzbTbody").append("<tr class='table-body '><td>" +
	    					"<label class='i-checks'><input data-id='1' data-name='兴竹信息' name = 'logisticsCheck' id = 'subcontractCheck' class='contract-check' type='radio'>" +
	    					"</label></td>" +
	    					"<td>"+toChar(val.entrustName)+"</td>" +
	    					"<td>"+toChar(val.shipperName)+"</td>" +
	    					"<td>"+toChar(val.goodsName)+"</td>" +
	    					"<td>"+toChar(val.lineName)+"</td>" +
	    					"<td>"+toChar(val.distance)+"</td>" +
	    					"<td>"+toChar(val.forwardingUnit)+"</td>" +
	    					"<td>"+toChar(val.consignee)+"</td>" +
	    					"<td style='display:none'>"+val.id+"</td>" +
	    					"<td style='display:none'>"+val.entrust+"</td>" +
	    					"<td style='display:none'>"+val.shipper+"</td>" +
	    					"<td style='display:none'>"+val.goodsInfoId+"</td>" +
	    					"<td style='display:none'>"+val.lineInfoId+"</td>" +
	    					"<td style='display:none'>"+val.contractInfoId+"</td>" +
	    					"<td style='display:none'>"+format(new Date(val.effectiveDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"<td style='display:none'>"+format(new Date(val.endDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"</tr>");
	    		})
	    		setTimeout(function(){
	    			$("#zbTable").colResizable({
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
       //xjValidate.showTip("请选择一条数据");
       xjValidate.showPopup('请选择一条数据！',"提示");
       return;
    }
    var ftr = $("#logisticsCheck:checked").parents("tr");
    var entrustName = ftr.children().eq(1).html();
    var shipperName = ftr.children().eq(2).html();
    var goodsName = ftr.children().eq(3).html();
    var lineName = ftr.children().eq(4).html();
    var distance = ftr.children().eq(5).html();
    var forwardingUnit = ftr.children().eq(6).html();
    var consignee = ftr.children().eq(7).html();
   // var cooperateStatus = ftr.children().eq(8).html();
    var id = ftr.children().eq(8).html();
    var entrust = ftr.children().eq(9).html();
    var shipper= ftr.children().eq(10).html();
    var goodsInfoId= ftr.children().eq(11).html();
    var lineInfoId= ftr.children().eq(12).html();
    var contractInfoId= ftr.children().eq(13).html();
    var effectiveDate = ftr.children().eq(14).html();
    var endDate = ftr.children().eq(15).html();
    $('.date-time-ws').datetimepicker({
 	   format: "YYYY-MM-DD 00:00:00",
        autoclose: true,
        todayBtn: true,
        todayHighlight: true,
        showMeridian: true,
        useSeconds:true,
        minDate:effectiveDate, // yesterday is minimum date
        maxDate:endDate // and tommorow is maximum date calendar
 });
    $("#saveWLcontractInfo").append("<p>委托方:<span id ='wlentrustName'>"+entrustName+"</span></p>" +
    		"<p>承运方:<span id ='wlshipperName'>"+shipperName+"</span></p>" +
    		"<p>货物:<span id ='wlgoodsName'>"+goodsName+"</span></p>" +
    		"<p>线路:<span id ='wllineName'>"+lineName+"</span></p>" +
    		"<p>远距:<span id ='wldistance'>"+distance+"</span></p>"+
    		"<p>发货单位:<span id ='wlforwardingUnit'>"+forwardingUnit+"</span></p>"+
    		"<p>到货单位:<span id ='wlconsignee'>"+consignee+"</span></p>"+
    		"<input type = 'hidden' id = 'wlentrust' value ='"+entrust+"'>"+
    		"<input type = 'hidden' id = 'wlshipper' value ='"+shipper+"'>"+
    		"<input type = 'hidden' id = 'wlgoodsInfoId' value ='"+goodsInfoId+"'>"+
    		"<input type = 'hidden' id = 'wlid' value ='"+id+"'>"+
    		"<input type = 'hidden' id = 'wlcontractInfoId' value ='"+contractInfoId+"'>"+
    		"<input type = 'hidden' id = 'wllineInfoId' value ='"+lineInfoId+"'>"
    );
    $("#contractSelectModal1").modal('hide');
 }

//保存 转包运价线路信息
function saveSubcontractContractInfo() {
    var selectlist = findAllCheck(".contract-check");
    if(selectlist.length==0 || selectlist.length>1) {
       //xjValidate.showTip("请选择一条数据");
        xjValidate.showPopup('请选择一条数据！',"提示");
       return;
    }
    var ftr = $("#subcontractCheck:checked").parents("tr");
    var entrustName = ftr.children().eq(1).html();
    var shipperName = ftr.children().eq(2).html();
    var goodsName = ftr.children().eq(3).html();
    var lineName = ftr.children().eq(4).html();
    var distance = ftr.children().eq(5).html();
    var forwardingUnit = ftr.children().eq(6).html();
    var consignee = ftr.children().eq(7).html();
   // var cooperateStatus = ftr.children().eq(8).html();
    var id = ftr.children().eq(8).html();
    var entrust = ftr.children().eq(9).html();
    var shipper= ftr.children().eq(10).html();
    var goodsInfoId= ftr.children().eq(11).html();
    var lineInfoId= ftr.children().eq(12).html();
    var contractInfoId= ftr.children().eq(13).html();
    var effectiveDate = ftr.children().eq(14).html();
    var endDate = ftr.children().eq(15).html();
    $('.date-time-ws').datetimepicker({
 	   format: "YYYY-MM-DD 00:00:00",
        autoclose: true,
        todayBtn: true,
        todayHighlight: true,
        showMeridian: true,
        useSeconds:true,
        minDate:effectiveDate, // yesterday is minimum date
        maxDate:endDate // and tommorow is maximum date calendar
 });
    //console.log(selectlist[0].id)
    $("#saveZBcontractInfo").append("<p>委托方:<span id ='zbentrustName'>"+entrustName+"</span></p>" +
    		"<p>承运方:<span id ='zbshipperName'>"+shipperName+"</span></p>" +
    		"<p>货物:<span id ='zbgoodsName'>"+goodsName+"</span></p>" +
    		"<p>线路:<span id ='zblineName'>"+lineName+"</span></p>" +
    		"<p>远距:<span id ='zbdistance'>"+distance+"</span></p>"+
    		"<p>发货单位:<span id ='zbforwardingUnit'>"+forwardingUnit+"</span></p>"+
    		"<p>到货单位:<span id ='zbconsignee'>"+consignee+"</span></p>"+
    		"<input type = 'hidden' id = 'zbentrust' value ='"+entrust+"'>"+
    		"<input type = 'hidden' id = 'zbshipper' value ='"+shipper+"'>"+
    		"<input type = 'hidden' id = 'zbgoodsInfoId' value ='"+goodsInfoId+"'>"+
    		"<input type = 'hidden' id = 'zbid' value ='"+id+"'>"+
    		"<input type = 'hidden' id = 'zbcontractInfoId' value ='"+contractInfoId+"'>"+
    		"<input type = 'hidden' id = 'zblineInfoId' value ='"+lineInfoId+"'>"
    );
    $("#contractSelectModal2").modal('hide');
 }

//保存或修改物流运价界面添加的信息
function saveForAddTraffic(){
	var pid = $("#editid").val();
	var remarks = $("#wlremarks").val();
	var endDate = $("#wlendDate").val();
	var startDate = $("#wlstartDate").val();
	var computeMode = $("#wlcomputeMode").val();
	var unitPrice = $("#wlunitPrice").val();
	var entrustName = $("#wlentrustName").html();
	var shipperName = $("#wlshipperName").html();
	var lineName = $("#wllineName").html();
	var distance = $("#wldistance").html();
	var forwardingUnit = $("#wlforwardingUnit").html();
	var consignee = $("#wlconsignee").html();
    var entrust = $("#wlentrust").val();
    var shipper = $("#wlshipper").val();
    var goodsInfoId = $("#wlgoodsInfoId").val();
    var lineInfoId = $("#wllineInfoId").val();
    //var cooperateStatus = $("#wlcooperateStatus").val();
    var wlid = $("#wlid").val();
    var contractInfoId = $("#wlcontractInfoId").val();
    /*if(cooperateStatus == '协同'){
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
			computeMode:computeMode,
			unitPrice:unitPrice,
			entrustName:entrustName,
			shipperName:shipperName,
			lineName:lineName,
			distance:distance,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			entrust:entrust,
			shipper:shipper,
			goodsInfoId:goodsInfoId,
			contractInfoId:contractInfoId,
			contractDetailInfoId:wlid,
			lineInfoId:lineInfoId
			};
    var flag = $("#flag").val();
    if(flag =="1"){
    	//执行新增操作
    $.ajax({
    	url:basePath+ "/tariff/addContractforLogistics",//请求的action路径
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
        		window.location.href = basePath+ "/tariff/goBigTrafficManage";
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
    	            xjValidate.showPopup('请求失败！',"提示");
    	        },
    	        success:function(data){
    	        	if(data == true){
    	        		$("#addFreightModal1").modal('hide');
    	        		window.location.href = basePath+ "/tariff/goBigTrafficManage";
    	        	}
    	        }
    	    });
    }
    	
    
}

//保存或修改转包运价界面添加的信息
function saveForAddSubcontract(){
	var pid = $("#editid").val();
	var remarks = $("#zbremarks").val();
	var endDate = $("#zbendDate").val();
	var startDate = $("#zbstartDate").val();
	var computeMode = $("#zbcomputeMode").val();
	var unitPrice = $("#zbunitPrice").val();
	var entrustName = $("#zbentrustName").html();
	var shipperName = $("#zbshipperName").html();
	var lineName = $("#zblineName").html();
	var distance = $("#zbdistance").html();
	var forwardingUnit = $("#zbforwardingUnit").html();
	var consignee = $("#zbconsignee").html();
    var entrust = $("#zbentrust").val();
    var shipper = $("#zbshipper").val();
    var goodsInfoId = $("#zbgoodsInfoId").val();
    var lineInfoId = $("#zblineInfoId").val();
   // var cooperateStatus = $("#zbcooperateStatus").val();
    var zbid = $("#zbid").val();
    var contractInfoId = $("#zbcontractInfoId").val();
    
    if(pid == null || pid == undefined){
    	pid = "";
    }
 /*   if(cooperateStatus == '协同'){
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
    var check = xjValidate.checkForm('#addFreightModal2 .form-item');
	if(check == false){
		xjValidate.showPopup("存在不合法数据请检查","数据错误")
		return;
	}
    var addData = {
    		id:pid,
			remarks:remarks,
			endDate:new Date(endDate),
			startDate:new Date(startDate),
			computeMode:computeMode,
			unitPrice:unitPrice,
			entrustName:entrustName,
			shipperName:shipperName,
			lineName:lineName,
			distance:distance,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			entrust:entrust,
			shipper:shipper,
			goodsInfoId:goodsInfoId,
			contractInfoId:contractInfoId,
			contractDetailInfoId:zbid,
			lineInfoId:lineInfoId
			};
    
    var flag2 = $("#flag2").val();
    if(flag2 =="1"){
    	//执行新增操作
    $.ajax({
    	url:basePath+ "/tariff/addContractforSubcontract",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:addData,
        dataType:'text',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	if(data != "success" && data != null){
        		xjValidate.showPopup("启用日期不能小于"+data,"提示");
            	return;
        	}else{
        		$("#addFreightModal2").modal('hide');
        		//刷新页面
        		//window.navigate(location);
        		//showTraffictcsInfo();
        		window.location.href = basePath+ "/tariff/goBigTrafficManage";
        	}
        }
    });
    }
    
    if(flag2 =="2"){
    	//执行修改操作
    	  $.ajax({
    	    	url:basePath+ "/tariff/editZBTariffic",//请求的action路径
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
    	        		$("#addFreightModal2").modal('hide');
    	        		//刷新页面
    	        		//window.navigate(location);
    	        		//showTraffictcsInfo();
    	        		window.location.href = basePath+ "/tariff/goBigTrafficManage";
    	        	}
    	        }
    	    });
    }
}
function nullToString(obj){
	if(obj == null){
		obj = "";
	}
	return obj;
}
//大宗运价界面加载时触发
function showTraffictcsInfo(pageNo){
	$("#allTariffInfo").empty();
	$("#allTariffInfo").html("");
	var pageSizeStr = '10';
	var goodsName = $("#mhgoodsName").val();
	var entrustName = $("#mhentrustName").val();
	var shipperName = $("#mhshipperName").val();
	var forwardingUnit = $("#mhforwardingUnit").val();
	var consignee = $("#mhconsignee").val();
	var startDate = $("#mhstartDate").val();
	var startDate1 = $("#mhstartDate1").val();
	var endDate = $("#mhendDate").val();
	var endDate1 = $("#mhendDate1").val();
	var transportPriceType = $("#mhtransportPriceType").val();
	var transportPriceStatus = $("#mhtransportPriceStatus").val();
	var lineInfoId = $("#wllineId").val();
	
	var selectData = {
			curPage : pageNo,
			pageSizeStr : pageSizeStr,
			goodsName:goodsName,
			entrustName:entrustName,
			shipperName:shipperName,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			startDateStr:startDate,
			startDate1Str:startDate1,
			endDateStr:endDate,
			endDate1Str:endDate1,
			transportPriceType:transportPriceType,
			lineInfoId:lineInfoId,
			transportPriceStatus:transportPriceStatus
			
	}
    $.ajax({
    	url:basePath+ "/tariff/findTransInfo",//请求的action路径
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
    			if(val.computeMode == '1'){
    				val.computeMode ='发货吨位';
    			}
    			if(val.computeMode == '2'){
    				val.computeMode ='到货吨位';
    			}
    			if(val.computeMode == '3'){
    				val.computeMode ='最小吨位';
    			}
    			if(val.computeMode == '4'){
    				val.computeMode ='固定运价';
    			}
    			if(val.computeMode == '5'){
    				val.computeMode ='比例';
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
    					"<input class='sub-auth-check' type='checkbox' id = 'tarifficCheck' data-id="+val.id+" data-transportPriceStatus='"+val.transportPriceStatus+"'></label></td>" +
    					"<td>"+nullToString(val.id)+"</td>" +
    					"<td>"+nullToString(val.transportPriceStatus)+"</td>" +
    					"<td>"+nullToString(val.transportPriceType)+"</td>" +
    					"<td>"+nullToString(val.entrustName)+"</td>" +
    					"<td>"+nullToString(val.shipperName)+"</td>" +
    					"<td>"+nullToString(val.goodsName)+"</td>" +
    					"<td>"+nullToString(val.lineName)+"</td>" +
    					"<td>"+nullToString(val.distance)+"</td>" +
    					"<td>"+nullToString(val.unitPrice)+"</td>" +
    					"<td>"+nullToString(val.forwardingUnit)+"</td>" +
    					"<td>"+nullToString(val.consignee)+"</td>" +
    					"<td>"+format(new Date(val.startDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
    					"<td>"+format(new Date(val.endDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
    					"<td>"+nullToString(val.computeMode)+"</td>" +
    					"<td>"+nullToString(val.priority)+"</td>" +
    					"<td style='display:none'>"+nullToString(val.cooperateStatus)+"</td>" +
    					"<td style='display:none'>"+val.remarks+"</td>" +
    					"<td style='display:none'>"+val.transportPriceType+"</td>" +
    					"<td style='display:none'>"+val.entrust+"</td>" +
    					"<td style='display:none'>"+val.goodsInfoId+"</td>" +
    					"<td style='display:none'>"+val.lineInfoId+"</td>" +
    					"<td style='display:none'>"+val.contractInfoId+"</td>" +
    					"</tr>");
    		})
        }
    });
}

/**
 * 线路弹出框
 */
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
})
//点击模糊查询按钮
$("#mhSearchAll").click(function(){
	showTraffictcsInfo(1);
})
//新增物流信息合同模糊查询
$("#selectcontractByMoHu").click(function(){
	contractSelectByLogictics(1);
})
//新增转包信息合同模糊查询
$("#selectcontractforzbByMoHu").click(function(){
	contractSelectByPackage(1);
})

function saveLinebutton(){
	 var selectlist = findAllCheck(".contract-check");
	    if(selectlist.length==0 || selectlist.length>1) {
	      // xjValidate.showTip("请选择一条数据",'.modal-dialog');
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


//修改大宗运价信息
function editTarifficInfo(){
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
	    var transportPriceType = ftr.children().eq(3).html();
	    var entrustName = ftr.children().eq(4).html();
	    var shipperName = ftr.children().eq(5).html();
	    var goodsName = ftr.children().eq(6).html();
	    var lineName = ftr.children().eq(7).html();
	    var distance = ftr.children().eq(8).html();
	    var unitPrice = ftr.children().eq(9).html();
	    var forwardingUnit = ftr.children().eq(10).html();
	    var consignee = ftr.children().eq(11).html();
	    var startDate = ftr.children().eq(12).html();
	    var endDate = ftr.children().eq(13).html();
	    var computeMode = ftr.children().eq(14).html();
	    var priority = ftr.children().eq(15).html();
	    var transportPriceStatus = ftr.children().eq(2).html();
	    var cooperateStatus = ftr.children().eq(16).html();
	    var remarks = ftr.children().eq(17).html();
	    var transportPriceType = ftr.children().eq(18).html();
	    var entrust = ftr.children().eq(19).html();
	    var goodsInfoId = ftr.children().eq(20).html();
	    var lineInfoId = ftr.children().eq(21).html();
	    var contractInfoId = ftr.children().eq(22).html();
	    if(computeMode == "发货吨位"){
	    	computeMode = "1";
	    }
	    if(computeMode == "到货吨位"){
	    	computeMode = "2";
	    }
	    if(computeMode == "最小吨位"){
	    	computeMode = "3";
	    }
	    if(computeMode == "固定运价"){
	    	computeMode = "4";
	    }
	    if(computeMode == "比例"){
	    	computeMode = "5";
	    }
	    if(transportPriceStatus == '新建' || transportPriceStatus == '审核驳回'){
	    	$("#editid").val(id);
	    	if(transportPriceType =="转包运价"){
	    		 $("#addFreightModal2").modal('show');
		         $("#freight-title").text("修改大宗运价");
		         $("#flag2").val("2");  //标识为修改
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
		         
		         $("#zbremarks").val(remarks);
		    	 $("#zbendDate").val(endDate);
		    	 $("#zbstartDate").val(startDate);
		    	$("#zbcomputeMode").val(computeMode);
		    	$("#zbunitPrice").val(unitPrice);
		    	
		    	
		    	 $("#saveZBcontractInfo").append("<p>委托方:<span id ='zbentrustName'>"+entrustName+"</span></p>" +
		    	    		"<p>承运方:<span id ='zbshipperName'>"+shipperName+"</span></p>" +
		    	    		"<p>货物:<span id ='zbgoodsName'>"+goodsName+"</span></p>" +
		    	    		"<p>线路:<span id ='zblineName'>"+lineName+"</span></p>" +
		    	    		"<p>远距:<span id ='zbdistance'>"+distance+"</span></p>"+
		    	    		"<p>发货单位:<span id ='zbforwardingUnit'>"+forwardingUnit+"</span></p>"+
		    	    		"<p>到货单位:<span id ='zbconsignee'>"+consignee+"</span></p>"+
		    	    		"<input type = 'hidden' id = 'edittransportPriceType' value = '"+transportPriceType+"'>"+
		    	    		"<input type = 'hidden' id = 'zbentrust' value ='"+entrust+"'>"+
		    	    		"<input type = 'hidden' id = 'zbgoodsInfoId' value ='"+goodsInfoId+"'>"+
		    	    		"<input type = 'hidden' id = 'zbcontractInfoId' value ='"+contractInfoId+"'>"+
		    	    		"<input type = 'hidden' id = 'zblineInfoId' value ='"+lineInfoId+"'>"
		    	    		
		    	    );
	    	}
	    	if(transportPriceType =="物流运价"){
	    		 $("#addFreightModal1").modal('show');
		         $("#freight-title").text("修改大宗运价");
		         $("#flag").val("2");  //标识为修改
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
		    	$("#wlcomputeMode").val(computeMode);
		    	$("#wlunitPrice").val(unitPrice);
		    	 $("#saveWLcontractInfo").append("<p>委托方:<span id ='wlentrustName'>"+entrustName+"</span></p>" +
		    	    		"<p>承运方:<span id ='wlshipperName'>"+shipperName+"</span></p>" +
		    	    		"<p>货物:<span id ='wlgoodsName'>"+goodsName+"</span></p>" +
		    	    		"<p>线路:<span id ='wllineName'>"+lineName+"</span></p>" +
		    	    		"<p>远距:<span id ='wldistance'>"+distance+"</span></p>"+
		    	    		"<p>发货单位:<span id ='wlforwardingUnit'>"+forwardingUnit+"</span></p>"+
		    	    		"<p>到货单位:<span id ='wlconsignee'>"+consignee+"</span></p>"+
		    	    		"<input type = 'hidden' id = 'edittransportPriceType' value = '"+transportPriceType+"'>"+
		    	    		"<input type = 'hidden' id = 'wlentrust' value ='"+entrust+"'>"+
		    	    		"<input type = 'hidden' id = 'wlgoodsInfoId' value ='"+goodsInfoId+"'>"+
		    	    		"<input type = 'hidden' id = 'wlcontractInfoId' value ='"+contractInfoId+"'>"+
		    	    		"<input type = 'hidden' id = 'wllineInfoId' value ='"+lineInfoId+"'>"
		    	 );
	    	}
	    }else{
	    	xjValidate.showPopup("运价已提交审核，无法修改!","提示");
	    	return;
	    }
}
//编辑弹框中查询合同
function editcontractSelect(){
	var type = $("#edittransportPriceType").val();
	if(type =="转包运价"){
		contractSelectByPackage(1);
	}
	if(type =="物流运价"){
		contractSelectByLogictics(1);
	}
}

//编辑弹框中保存合同
function saveForEditTraffic(){
	var type = $("#edittransportPriceType").val();
	if(type =="转包运价"){
		saveSubcontractContractInfo();
	}
	if(type =="物流运价"){
		saveLogisticsContractInfo();
	}
}
//删除大宗运价信息
function delTarifficInfo(){
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
 			  	            xjValidate.showPopup('请求失败！',"提示");
 			  	        },
 			  	        success:function(data){
 			  	        	if(data == true){
 			  	        		window.location.href = basePath+ "/tariff/goBigTrafficManage";
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
	    if(selectlist.length>=1) {
	    	 for (var int = 0; int < selectlist.length; int++) {
	   			  var id = selectlist[int].id;
	   			  var transportPriceStatus = selectlist[int].transportPriceStatus;
	   			  if(transportPriceStatus != '新建'){
	   				  xjValidate.showPopup("选择的结算单必须为新建状态!","提示");
	   				  return;
	   			  }
			  }
	 	    	//提交审核操作
	 	    	$.confirm({
	     			title : "提示",
	     			content : "您确认要提交审核选中的数据？",
	     			buttons : {
	     				'确认' : function() {
	     					 //提交审核操作
	     					
	     					for (var int = 0; int < selectlist.length; int++) {
	     						 $.ajax({
		     			    	    	url:basePath+ "/tariff/tjTariffic",//请求的action路径
		     			    	        async:false,//是否异步
		     			    	        cache:false,//是否使用缓存
		     			    	        type:'POST',//请求方式：post
		     			    	        data:{"id":selectlist[int].id},
		     			    	        dataType:'json',//数据传输格式：json
		     			    	        error:function(){
		     			    	            //请求失败处理函数
		     			    	            xjValidate.showPopup('请求失败！',"提示");
		     			    	        },
		     			    	        success:function(data){
		     			    	        	if(data == true){
		     			    	        		window.location.href = basePath+ "/tariff/goBigTrafficManage";
		     			    	        	}
		     			    	        }
		     			    	    });
	     						}
	     					},
	     				'取消' : function() {
	     				}
	     			}
	     		});
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
	    	 for (var int = 0; int < selectlist.length; int++) {
	   			  var id = selectlist[int].id;
	   			  var transportPriceStatus = selectlist[int].transportPriceStatus;
	   			  if(transportPriceStatus != "审核中"){
	   				  xjValidate.showPopup("选择的结算单状态必须为审核中状态!","提示");
	   				  return;
	   			  }
			  }
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
									xjValidate.showPopup("审核意见不能为空！","提示");
									return false;
								}
								//提交审核操作
								for (var int = 0; int < selectlist.length; int++) {
									audittransportPrice(selectlist[int].id,buttonType,auditOpinion);
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
								//提交审核操作
								for (var int = 0; int < selectlist.length; int++) {
									audittransportPrice(selectlist[int].id,buttonType,auditOpinion);
								}
							}
						},
						'取消' : function() {
							// close
						}
					}
				});
		 }else{
			 var ftr = $("#tarifficCheck:checked").parents("tr");
			    var id = selectlist[0].id;
			    var transportPriceStatus = selectlist[0].transportPriceStatus;
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
										xjValidate.showPopup("审核意见不能为空！","提示");
										return false;
									}
									//提交审核操作
									audittransportPrice(id,buttonType,auditOpinion);
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
									//提交审核操作
									audittransportPrice(id,buttonType,auditOpinion);
								}
							},
							'取消' : function() {
								// close
							}
						}
					});
		 }else{
		    	xjValidate.showPopup("该运价状态不是审核中 !","提示");
		    	return;
		    }
	    }
}


/**
 * 审核结算单操作
 * @author jiangweiwei 2017年7月22日
 */
function audittransportPrice(id,buttonType,auditOpinion) {
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
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	if(data == true){
	        		window.location.href = basePath+ "/tariff/goBigTrafficManage";
	        	}
	        }
	    });
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
	    });
	    var type = 1;
		var url = basePath+ "/tariff/exportTariffic?ids="+ids+"&type="+type;
		window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes"); 
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
        "transportPriceStatus":$(this).attr("data-transportPriceStatus")
      }
      checkList.push(params);
    }
  });
  return checkList;
}


