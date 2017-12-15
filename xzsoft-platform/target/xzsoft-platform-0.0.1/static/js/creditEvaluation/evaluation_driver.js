//初始化page
  var driverNoEvaluatePage = null;
  var role = null;//当前评价人角色
  var flag =null;//当前列表状态
 (function($) {
	 //初始线路列表page页面
	 driverNoEvaluatePage = $("#driverNoEvaluatePage").operationList({
	    "current":1,    //当前目标
	    "maxSize":4,  //前后最大列表
	    "itemPage":10,  //每页显示多少条
	    "totalItems":0,  //总条数
	    "chagePage":function(current){
	      //调用ajax请求拿最新数据
	    	showEvaluationDriverNoEvaluate(current); 
	    }
	  });
	    
	    function driverNoEvaluateSlect(e) {
	      var value = $(e).prev().find('input').val();
	      driverNoEvaluatePage.setCurrentPage(value);
	    }

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
 })(jQuery)
 
 function toChar(data) {
	if (data == null) {
		data = "";
	}
	return data;
}
 
 function toZero(data) {
		if (data == null || data == "") {
			data = 0;
		}
		return data;
	}
 
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
 
//评价司机未评价主页面查询
function showEvaluationDriverNoEvaluate(pageNo){
	$("#driverNoEvaluateTbody").empty();
	$("#driverNoEvaluateTbody").html("");
	var pageSizeStr = '10';
	var waybillId = $("#mhwaybillId").val();
	var forwardingUnit = $("#mhforwardingUnit").val();
	var consignee = $("#mhconsignee").val();
	var goodsName = $("#mhgoodsName").val();
	var lineName = $("#mhlineName").val();
	var entrustName = $("#mhentrustName").val();
	var driverName = $("#mhdriverName").val();
	var planTime = $("#mhplanTime").val();
	var planTime1 = $("#mhplanTime1").val();
	
	var selectData = {
			curPage : pageNo,
			pageSizeStr : pageSizeStr,
			goodsName:goodsName,
			entrustName:entrustName,
			waybillId:waybillId,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			driverName:driverName,
			planTimeStr:planTime,
			planTimeStr1:planTime1,
			lineName:lineName,
			driverEvaluationStatus:1,
			enterpriseEvaluationStatus:1
	}
    $.ajax({
    	url:basePath+ "/evaluate/EvaluationForDriver",//请求的action路径
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
        	selectEvaluationDriver(data);
        }
    });
	
}
function selectEvaluationDriver(data){
	var handleName = "";
	var jsonAll = data;
	var jsonList = jsonAll.tpList;
	var totalCount = jsonAll.totalCount;
	var evaluationDriverView = jsonAll.evaluationDriverView;
	role = evaluationDriverView.evaluationRoles;
	 if(evaluationDriverView.evaluationRoles == 1){//当前评论人角色为司机
			$("#cvalustePerson").html(jsonList[0].driverName);
		}else{
			$("#cvalustePerson").html(jsonList[0].entrustName);
		}
	 $("#avgScore").html(toZero(evaluationDriverView.averageScore));
	 $("#evaluateCount").html(toZero(evaluationDriverView.totalEvaluationNumber));
	
	$("#driverNoEvaluateNum").text("搜索结果共"+totalCount);
	driverNoEvaluatePage.setTotalItems(totalCount);
	$.each(jsonList,function(i, val) {
		flag = val.driverEvaluationStatus;
		var _icon = '';
		var _function;
		 if(evaluationDriverView.evaluationRoles == 1){//当前评论人角色为司机
		if(val.driverEvaluationStatus == 1){//未评价
			handleName = "评价";
			//$("#iconDiv").addClass("modify-icon");
			_icon = 'modify-icon';
		}else{
			handleName = val.driverForEntrust;
			//$("#iconDiv").addClass("view-icon");
			_icon = 'view-icon';
		}
		 }else{
			 if(val.enterpriseEvaluationStatus == 1){//未评价
					handleName = "评价";
					//$("#iconDiv").addClass("modify-icon");
					_icon = 'modify-icon';
				}else{
					handleName = val.entrustForDriver;
					//$("#iconDiv").addClass("view-icon");
					_icon = 'view-icon';
				}
		 }
		$("#driverNoEvaluateTbody").append("<tr class='table-body'><td>"+(i+1)+"</td>" +
				"<td><div class='operation-td' onclick = 'showEvaluateTemplate(this)'><div class='modify-operation operation-m'>" +
				"<div id = 'iconDiv' class='"+_icon+"'></div>"+
			      "<div class='text' style= 'font-size: 14px;' >"+handleName+"</div></div></div></td>" +
				"<td style='display:none'>"+val.id+"</td>" +
				"<td>"+toChar(val.waybillId)+"</td>" +
				"<td>"+toChar(val.entrustName)+"</td>" +
				"<td>"+toChar(val.driverName)+"</td>" +
				"<td>"+toChar(val.carCode)+"</td>" +
				"<td>"+toChar(val.thisPayPrice)+"</td>" +
				"<td>"+toChar(val.goodsName)+"</td>" +
				"<td>"+toChar(val.lineName)+"</td>" +
				"<td>"+toChar(val.forwardingUnit)+"</td>" +
				"<td>"+toChar(val.consignee)+"</td>" +
				"<td>"+format(new Date(val.planTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
				"<td style='display:none'>"+val.entrust+"</td>" +
				"<td style='display:none'>"+val.driverId+"</td>" +
				"</tr>");
	})
}
//评价司机已评价主页面查询
function showEvaluationDriverAlreadyEvaluate(pageNo){
	$("#driverNoEvaluateTbody").empty();
	$("#driverNoEvaluateTbody").html("");
	var pageSizeStr = '10';
	var waybillId = $("#mhwaybillId").val();
	var forwardingUnit = $("#mhforwardingUnit").val();
	var consignee = $("#mhconsignee").val();
	var goodsName = $("#mhgoodsName").val();
	var lineName = $("#mhlineName").val();
	var entrustName = $("#mhentrustName").val();
	var driverName = $("#mhdriverName").val();
	var planTime = $("#mhplanTime").val();
	var planTime1 = $("#mhplanTime1").val();
	
	var selectData = {
			curPage : pageNo,
			pageSizeStr : pageSizeStr,
			goodsName:goodsName,
			entrustName:entrustName,
			waybillId:waybillId,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			driverName:driverName,
			planTimeStr:planTime,
			planTimeStr1:planTime1,
			lineName:lineName,
			driverEvaluationStatus:2,
			enterpriseEvaluationStatus:2
	}
    $.ajax({
    	url:basePath+ "/evaluate/EvaluationForDriver",//请求的action路径
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
        	selectEvaluationDriver(data);
        }
    });
}

//评价模板明细的数据
function showEvaluateDetail(obj){
	var jsonAll = obj;
	var jsonList = jsonAll.aList
	var jsonObj = jsonAll.evaluationTemplate;
	
	if(jsonObj.evaluationTemplateType == 1){
		jsonObj.evaluationTemplateType ="企业对司机"
	}
	if(jsonObj.evaluationTemplateType == 2){
		jsonObj.evaluationTemplateType ="司机对企业"
	}
	if(jsonObj.evaluationTemplateType == 3){
		jsonObj.evaluationTemplateType ="委托方对承运方"
	}
	if(jsonObj.evaluationTemplateType == 4){
		jsonObj.evaluationTemplateType ="承运方对委托方"
	}
	if(jsonObj.evaluationStage == 1){
		jsonObj.evaluationStage ="运单已付款"
	}
	if(jsonObj.evaluationStage == 2){
		jsonObj.evaluationStage ="计划已下达"
	}
	if(jsonObj.evaluationStage == 3){
		jsonObj.evaluationStage ="对账已完成"
	}
	if(jsonObj.evaluationStage == 4){
		jsonObj.evaluationStage ="结算已付款"
	}
	$("#showEvaluationTbody").empty();
	$("#showEvaluationTbody").html("");
	$("#showModalEvaluationDetailTbody").empty();
	$("#showModalEvaluationDetailTbody").html("");
    $("#showModalEvaluationDetailTbody").append('<tr><td colSpan = "3" style = "text-align: right;padding-right:20px">表单名称:</td>'+
    		'<td colSpan = "3" width = "180px" >'+jsonObj.evaluationTemplateName+'</td>'+
    		'<td  colSpan = "3" width = "180px" style = "text-align: right;padding-right:20px">表单类型:</td>'+
    		'<td colSpan = "3" width = "180px" >'+jsonObj.evaluationTemplateType+'</td></tr><tr>'+
    		'<td colSpan = "3" style = "text-align: right;padding-right:20px">评价阶段:</td>'+
    		'<td colSpan = "3" width = "180px" >'+jsonObj.evaluationStage+'</td>'+
    		'<td  colSpan = "3" width = "180px" style = "text-align: right;padding-right:20px">创建日期:</td>'+
    		'<td colSpan = "3" width = "180px" >'+jsonObj.creatTime+'</td></tr>')
    
        	$.each(jsonList,function(i, val) {
        		var j = i+1;
        	$("#showEvaluationTbody").append("<tr class='table-body evaluateTr' >" +
    				"<td style='display:none' class='eid'>"+val.id+"</td>" +
    				"<td>"+j+"</td>"+
    				"<td class = 'eassessmentItems'>"+toChar(val.assessmentItems)+"</td>" +
    				"<td class = 'eweight'>"+toChar(val.weight)+"</td>" +
    				"<td class = 'etargetRequirement'>"+toChar(val.targetRequirement)+"</td>" +
    				"<td class = 'eratingScale'>"+toChar(val.ratingScale)+"</td>" +
    				"<td class = 'eassessmentItemsScore' style = 'font-size:16px;'><input onkeyup = 'computeScore(this)' class = 'scoreInput' type = 'text' /></td>" +
    				"</tr>");
        	});
    $("#showEvaluationTbody").append("<tr class='table-body scoreTr'><td colspan='5'>总分=∑（考核项目得分*权重</td><td style = 'font-size:16px;' class='sumTd'></td>" +
    		"<tr class='table-body' style= 'background-color: #6979e9;'><td colspan='6' style = 'font-size: 18px;'>综合评价</td></tr>" +
    		"<tr class='table-body'><td colspan='6' style = 'height:90px;font-size:16px;'> <textarea class='compositeInput'></textarea></td></tr>")
}

var sum = 0;
//计算综合得分
function computeScore(obj){
	var total = 0;
	var sigle =$(obj).val();  //获取输入的单项评分
	if(sigle && !/^[0-9]*$/.test(sigle)){
		xjValidate.showPopup('评分必须是数字！',"提示");
		$(obj).val("");
		return;
		
	}else if(sigle > 100){
		xjValidate.showPopup('单项评分不能大于100！',"提示");
		$(obj).val("");
		return;
	}else{
	var ftr = $(obj).parents("tr")
	var weight = ftr.children().eq(3).html(); //获取该项的权重
	weight = weight/100; 
	total = weight*sigle;  //每个评分项的得分
	ftr.attr('data-score', total);
	}
	computeSum(obj);
}
//累加综合得分
function computeSum(obj){
	var sumScore = 0;
	$('.evaluateTr').each(function(){
		var dataScore = Number($(this).attr('data-score')) || 0;
		sumScore += dataScore;
	});
	$(obj).parents('tr').nextAll('.scoreTr').children().eq(1).html(sumScore.toFixed(2));
}

//查询评价模板或得分明细
function showEvaluateTemplate(obj){
	var ftr = $(obj).parents("tr");
	var id = ftr.children().eq(2).html();
	var entrust = ftr.children().eq(13).html();
	var driverId = ftr.children().eq(14).html();
	$("#evaluationDriverId").val(id);
	if(role != null && role != ""){
		var evaluationTemplateType='';
		if(role == 1){//当前评论人是司机
			evaluationTemplateType = 2;
			$("#appraiser").val(driverId);
			$("#passiveAppraiser").val(entrust);
		}
		if(role == 2){
			evaluationTemplateType = 1;
			$("#appraiser").val(entrust);
			$("#passiveAppraiser").val(driverId);
		}
	if(flag == 1){//未评价
		  $.ajax({
		    	url:basePath+ "/evaluate/selectEvaluationTemplateForDriverEvaluation",//请求的action路径
		        async:false,//是否异步
		        cache:false,//是否使用缓存
		        type:'POST',//请求方式：post
		        data:{evaluationTemplateType:evaluationTemplateType},
		        dataType:'json',//数据传输格式：json
		        error:function(){
		            //请求失败处理函数
		            xjValidate.showPopup('请求失败！',"提示");
		        },
		        success:function(data){
		        	showEvaluateDetail(data);
		        }
		    });
		$("#selectEvaluationTemplateDetailModal").modal('show');
	}
	if(flag == 2){//已评价
		var evaluationDriverId = $("#evaluationDriverId").val();
		var appraiser = $("#appraiser").val();
		$.ajax({
	    	url:basePath+ "/evaluate/findEvaluateDriverByUIdAndEId",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{"evaluationDriverId":evaluationDriverId,"appraiser":appraiser},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	showEvaluateDriverDetail(data);
	        }
	    });
		$("#selectScoreDetailModal").modal('show');
	}
	}
}

//评价司机明细的数据
function showEvaluateDriverDetail(obj){
	$("#showEvaluationDriverTbody").html("");
	$("#showEvaluationDriverTbody").empty();
	var jsonAll = obj;
	var jsonList = obj.aList;
	var jsonObject = obj.evaluationDriver;
	var score = 0;
	var comprehensive = "";
	if(role != null){
		if(role == 1){//当前登录人为司机
			score = jsonObject.driverForEntrust;
			comprehensive = jsonObject.driverForEntrustOverallMerit
		}
		if(role == 2){//当前登录人为企业
			score = jsonObject.entrustForDriver;
			comprehensive = jsonObject.entrustForDriverOverallMerit
		}
		}
        	$.each(jsonList,function(i, val) {
        		var j = i+1;
        	$("#showEvaluationDriverTbody").append("<tr class='table-body evaluateTr' >" +
    				"<td style='display:none' class='eid'>"+val.id+"</td>" +
    				"<td>"+j+"</td>"+
    				"<td class = 'eassessmentItems'>"+toChar(val.assessmentItems)+"</td>" +
    				"<td class = 'eweight'>"+toChar(val.weight)+"</td>" +
    				"<td class = 'etargetRequirement'>"+toChar(val.targetRequirement)+"</td>" +
    				"<td class = 'eratingScale'>"+toChar(val.ratingScale)+"</td>" +
    				"<td class = 'eassessmentItemsScore' style = 'font-size:16px;'>"+toChar(val.assessmentItemsScore)+"</td>" +
    				"</tr>");
        	});
    $("#showEvaluationDriverTbody").append("<tr class='table-body'><td colspan='5'>总分=∑（考核项目得分*权重)</td><td style = 'font-size:16px;'>"+toChar(score)+"</td>" +
    		"<tr class='table-body' style= 'background-color: #6979e9;'><td colspan='6' style = 'font-size: 18px;'>综合评价</td></tr>" +
    		"<tr class='table-body'><td colspan='6' style = 'height:90px;font-size:16px;'>"+toChar(comprehensive)+"</td></tr>")
}

//保存评价信息
function saveEvaluateInfo(){
	var arr = [];
	var appraiser = $("#appraiser").val();
	var passiveAppraiser = $("#passiveAppraiser").val();
	var evaluationDriverId = $("#evaluationDriverId").val();
	//获取要插入明细表的数据
	$('.evaluateTr').each(function(){
		var assessmentItems = $.trim($(this).find(".eassessmentItems").text());
		var id = $.trim($(this).find(".eid").text());
		var weight = $.trim($(this).find(".eweight").text());
		var targetRequirement = $.trim($(this).find(".etargetRequirement").text());
		var ratingScale = $.trim($(this).find(".eratingScale").text());
		var assessmentItemsScore = $.trim($(this).find(".scoreInput").val());
		
		var obj = {
				evaluationTemplateDetailId:id,
				assessmentItems:assessmentItems,
				weight:weight,
				targetRequirement:targetRequirement,
				ratingScale:ratingScale,
				assessmentItemsScore:assessmentItemsScore,
				appraiser:appraiser,
				passiveAppraiser:passiveAppraiser,
				evaluationDriverId:evaluationDriverId
				};
		arr.push(obj);
	});
	var totalScore = $('.sumTd').html();
	var overallMerit = $('.compositeInput').val();
	var object = {};
	if(role != null){
		if(role == 1){//当前评价人为司机
			object={
					id:evaluationDriverId,
					driverForEntrust:totalScore,
					driverForEntrustOverallMerit:overallMerit	
			};
		}
		if(role == 2){//当前评价人为企业
			object={
					id:evaluationDriverId, 
					entrustForDriver:totalScore,
					entrustForDriverOverallMerit:overallMerit	
			};
		}
		var detail = JSON.stringify(arr);
		var model = JSON.stringify(object);
		//插入评分明细和总评分及综合得分
		$.ajax({
	    	url:basePath+ "/evaluate/addEvaluationDriverScore",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{"detail":detail,"model":model,"role":role},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	if(data == true){
	        		$("#selectEvaluationTemplateDetailModal").modal('hide');	  
	        		window.location.href=basePath+"/evaluate/driverPending";
	        		
	        	}
	        }
	    });
		
	}
}

