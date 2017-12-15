//初始化page
	  var templateEvaluatePage = null;
(function ($) {
	
	templateEvaluatePage = $("#templateEvaluatePage").operationList({
	    "current":1,    //当前目标
	    "maxSize":4,  //前后最大列表
	    "itemPage":10,  //每页显示多少条
	    "totalItems":0,  //总条数
	    "chagePage":function(current){
	      //调用ajax请求拿最新数据
	    	selectEvaluationInfo(current); 
	    }
	  });
	    
	    function templateEvaluateSlect(e) {
	      var value = $(e).prev().find('input').val();
	      templateEvaluatePage.setCurrentPage(value);
	    }
//允许结算表格拖着
    $("#addEvaluationTable").colResizable({
      liveDrag: true,
      gripInnerHtml: "<div class='grip'></div>",
      draggingClass: "dragging"
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
  })(jQuery);



//新增
$('#addLogisticsButton').on('click', function(){
	var _html = '<tr class="table-body">'+
					'<td><label class="i-checks">'+
						'<input class="sub-auth-check" type="checkbox"></label>'+
					'</td>'+
					'<td><span></span><input type="text" /></td>'+
					'<td><span class="assessmentItemsText"></span><input class = "assessmentItems" type="text" /></td>'+
					'<td><span class="weightText"></span><input class = "weight" type="text" /></td>'+
					'<td><span class="targetRequirementText"></span><input class = "targetRequirement" type="text" /></td>'+
					'<td><span class="ratingScaleText"></span><input class = "ratingScale" type="text" /></td>'+
				 '</tr>';
	$('#addEvaluationTable tbody').append(_html);
	
	changeNumber();
});

//删除
$('#delLogisticsButton').on('click', function(){
	$('.table-body .sub-auth-check').each(function(){
		if($(this).is(':checked')){
			$(this).closest('tr').remove();
		}
	});
	changeNumber();
	
});

//双击编辑
$(document).delegate('#addEvaluationTable tbody td', 'click', function(){
	if($(this).index()===0){
		return;
	}
	var spanText = $(this).find('span').text();
	
	$(this).find('span').hide();
	$(this).find('input').val(spanText).show().focus();
});

//失去焦点保存
$(document).delegate('#addEvaluationTable tbody td input', 'blur', function(){
	if($(this).parent().index()===0){
		return;
	}
	var inputVal = $(this).val();
	//alert(inputVal);
	$(this).val('').hide();
	$(this).parent().find('span').text(inputVal).show();
});

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
 /**
  * 查找选择
  */
 function findAllCheck(element){
   var checkList = new Array();
   $(element).each(function(){
     if($(this).is(":checked")){
       var params = {
         "id":$(this).attr("data-id"),
         "name":$(this).attr("data-name")
       }
       checkList.push(params);
     }
   });
	return checkList;
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

/**
 * 查询评价模板信息
 * */
function selectEvaluationInfo(pageNo){
	$("#evaluationTemplateTbody").empty();
	$("#evaluationTemplateTbody").html("");
	var evaluationTemplateType = $("#mhevaluationTemplateType").val();
	var status = $("#mhstatus").val();
	var creatTime = $("#mhcreatTime").val();
	var creatTime1 = $("#mhcreatTime1").val();
	var pageSizeStr = '10';
	var seleteData = {
			evaluationTemplateType:evaluationTemplateType,
			status:status,
			creatTimeStr:creatTime,
			creatTime1Str:creatTime1,
			curPage : pageNo,
			pageSizeStr : pageSizeStr
	}
	$.ajax({
		url:basePath+ "/evaluate/selectEvaluationTemplate",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:seleteData,
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	var jsonAll = data;
        	var jsonList = jsonAll.tpList;
        	var totalCount = jsonAll.totalCount;
        	$("#templateEvaluateNum").text("搜索结果共"+totalCount);
        	templateEvaluatePage.setTotalItems(totalCount);
        	$.each(jsonList,function(i, val) {
        		var j = i+1;
        		if(val.status ==1){
        			val.status = "启用";
        		}
        		if(val.status ==0){
        			val.status = "停用";
        		}
        		if(val.status ==2){
        			val.status = "新建";
        		}
        		if(val.evaluationTemplateType == 1){
        			val.evaluationTemplateType ="企业对司机"
        		}
        		if(val.evaluationTemplateType == 2){
        			val.evaluationTemplateType ="司机对企业"
        		}
        		if(val.evaluationTemplateType == 3){
        			val.evaluationTemplateType ="委托方对承运方"
        		}
        		if(val.evaluationTemplateType == 4){
        			val.evaluationTemplateType ="承运方对委托方"
        		}
        		if(val.evaluationStage == 1){
        			val.evaluationStage ="运单已付款"
        		}
        		if(val.evaluationStage == 2){
        			val.evaluationStage ="计划已下达"
        		}
        		if(val.evaluationStage == 3){
        			val.evaluationStage ="对账已完成"
        		}
        		if(val.evaluationStage == 4){
        			val.evaluationStage ="结算已付款"
        		}
        		$("#evaluationTemplateTbody").append("<tr class='table-body'><td>" +
        				"<label class='i-checks'><input class='sub-auth-check' type='radio' id= 'evaluateRadioId' name='evaluateRadio'></label></td>" +
        				"<td style='display:none'>"+val.id+"</td>" +
        				"<td>"+j+"</td>"+
        				"<td>"+toChar(val.evaluationTemplateName)+"</td>" +
        				"<td>"+toChar(val.evaluationTemplateType)+"</td>" +
        				"<td>"+toChar(val.evaluationStage)+"</td>" +
        				"<td>"+format(new Date(val.creatTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
        				"<td>"+toChar(val.status)+"</td>" +
        				"<td><div class='operation-td'  onClick = 'showEvaluateDetail(this)'><div class='modify-operation operation-m'>"+
					    "<div class='modify-icon'></div>" +
					    "<div class='text' style= 'font-size: 14px;'>查看明细</div>" +
					    "</div></div></td>" +
        				"</tr>");
        	})
        	
        }
		
	})
}
//改变序号
function changeNumber(){
	$('#addEvaluationTable tbody tr').each(function(){
		$(this).find('td').eq(1).text($(this).index()+1);
	});
}

//跳转到新增评价模板
function addEvaluateTemplete(){
	var flag = '1';
	window.location.href = basePath+ "/evaluate/goAddEvaluateTemplete?flag="+flag;
}

//新增或修改评价模板主子表所有信息
$("#saveEvaluateTemple").click(function(){
	var flag = $("#flag").val();
    var evaluationTemplateName = $("#zbevaluationTemplateName").val();
	var evaluationTemplateType = $("#zbevaluationTemplateType").val(); 
	var evaluationStage = $("#zbevaluationStage").val(); 
	var creatTime = $("#zbcreatTime").val();    
	if(evaluationTemplateName == null || evaluationTemplateName =="" || evaluationTemplateName ==undefined ){
		xjValidate.showPopup('请输入表单名称！',"提示");
		return;
	}
	if(evaluationTemplateType == null || evaluationTemplateType =="" || evaluationTemplateType ==undefined ){
		xjValidate.showPopup('请选择表单类型！',"提示");
		return;
	}
	if(evaluationStage == null || evaluationStage =="" || evaluationStage ==undefined ){
		xjValidate.showPopup('请选择评价阶段！',"提示");
		return;
	}
	if(creatTime == null || creatTime =="" || creatTime ==undefined ){
		xjValidate.showPopup('请选择创建日期！',"提示");
		return;
	}
   if(flag == '2'){//修改操作--先删除后新增
	   var id =  sessionStorage.getItem("id"); 
		//删除操作
	   // 1.删除评价模板信息
	   delEvaluationTemplate(id)
		// 2.删除评价模板明细信息
		delEvaluationTemplateDetailByETId(id)
	}
	var insertData = {
		evaluationTemplateName:evaluationTemplateName,
		evaluationTemplateType:evaluationTemplateType,
		evaluationStage:evaluationStage,
		creatTime:new Date(creatTime)
	};
	//新增评价模板主表信息
	 $.ajax({
	    	url:basePath+ "/evaluate/insertEvaluationTemplate",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:insertData,
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	if(data != null && data != 0){
	        		//$("#evaluationTrmplateId").val(data);  //评价模板主键
	        		//这个地方才要插入明细信息
	        		addEvalustionTemplateDetail(data);  //新增子表评价模板明细表
	        	}else{
	        		xjValidate.showPopup('添加模板失败！',"提示");
	        	}
	        }
	    });
});

//新增子表评价模板明细表
function addEvalustionTemplateDetail(id){
	var arr = [];
	var weightTotal=0;
	$('.table-body').each(function(){
		var assessmentItems = $.trim($(this).find(".assessmentItemsText").text());
		var weight = $.trim($(this).find(".weightText").text());
		var targetRequirement = $.trim($(this).find(".targetRequirementText").text());
		var ratingScale = $.trim($(this).find(".ratingScaleText").text());
		if(!assessmentItems){
			xjValidate.showPopup('考核项目不能为空！',"提示");
			// 1.删除评价模板信息
			   delEvaluationTemplate(id)
			return;
		}
		if(!weight){
			xjValidate.showPopup('权重不能为空！',"提示");
			// 1.删除评价模板信息
			   delEvaluationTemplate(id)
			return;
		}
		if(weight && !/^[0-9]*$/.test(weight)){
			xjValidate.showPopup('权重必须是数字！',"提示");
			// 1.删除评价模板信息
			   delEvaluationTemplate(id)
			return;
		}
		if(!targetRequirement){
			xjValidate.showPopup('目标值要求不能为空！',"提示");
			// 1.删除评价模板信息
			   delEvaluationTemplate(id)
			return;
		}
		if(!ratingScale){
			xjValidate.showPopup('评分等级不能为空！',"提示");
			// 1.删除评价模板信息
			   delEvaluationTemplate(id)
			return;
		}
		weightTotal = parseInt(weight)+parseInt(weightTotal);
		var obj = {
				assessmentItems: assessmentItems,
				weight: weight,
				targetRequirement: targetRequirement,
				ratingScale: ratingScale,
				evaluationTemplateId:id
		};
		arr.push(obj);
	});
	if(weightTotal != 100){
		xjValidate.showPopup('权重相加不等于100！',"提示");
		// 1.删除评价模板信息
		   delEvaluationTemplate(id)
		return;
	}
	
	var detail = JSON.stringify(arr)
	$.ajax({
		url:basePath+ "/evaluate/insertEvaluationTemplateDetail",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"detail":detail},
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	if(data == true){
        		
        		window.location.href = basePath+ "/evaluate/evaluationTemplate";        	
        		}
        }
	});
}


function showEvaluateDetail(obj){
	$("#showEvaluationTbody").empty();
	$("#showEvaluationTbody").html("");
	$("#showModalEvaluationDetailTbody").empty();
	$("#showModalEvaluationDetailTbody").html("");
    var ftr = $(obj).parents('tr');
    var id = ftr.children().eq(1).html();
    var evaluationTemplateName= ftr.children().eq(3).html();
    var evaluationTemplateType= ftr.children().eq(4).html();
    var evaluationStage= ftr.children().eq(5).html();
    var creatTime= ftr.children().eq(6).html();
    $("#showModalEvaluationDetailTbody").append('<tr><td colSpan = "3" style = "text-align: right;padding-right:20px">表单名称:</td>'+
    		'<td colSpan = "3" width = "180px" >'+evaluationTemplateName+'</td>'+
    		'<td  colSpan = "3" width = "180px" style = "text-align: right;padding-right:20px">表单类型:</td>'+
    		'<td colSpan = "3" width = "180px" >'+evaluationTemplateType+'</td></tr><tr>'+
    		'<td colSpan = "3" style = "text-align: right;padding-right:20px">评价阶段:</td>'+
    		'<td colSpan = "3" width = "180px" >'+evaluationStage+'</td>'+
    		'<td  colSpan = "3" width = "180px" style = "text-align: right;padding-right:20px">创建日期:</td>'+
    		'<td colSpan = "3" width = "180px" >'+creatTime+'</td></tr>')
    
	$.ajax({
		url:basePath+ "/evaluate/selectEvaluateDetailInfo",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"evaluationTemplateId":id},
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	if(data != null){
        	$.each(data,function(i, val) {
        		var j = i+1;
        	$("#showEvaluationTbody").append("<tr class='table-body' >" +
    				"<td style='display:none'>"+val.id+"</td>" +
    				"<td>"+j+"</td>"+
    				"<td>"+toChar(val.assessmentItems)+"</td>" +
    				"<td>"+toChar(val.weight)+"</td>" +
    				"<td>"+toChar(val.targetRequirement)+"</td>" +
    				"<td>"+toChar(val.ratingScale)+"</td>" +
    				"</tr>");
        	});
        	}
        	$("#selectEvaluationTemplateDetailModal").modal('show');
        	
        }
	});
}

//修改评价模板
function editEvaluateTemplete(){
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0) {
    	xjValidate.showPopup("请选择要修改的模板!","提示");
      return;
    }
    var ftr = $("#evaluateRadioId:checked").parents("tr");
    var id = ftr.children().eq(1).html();
    var evaluationTemplateName= ftr.children().eq(3).html();
    var evaluationTemplateType= ftr.children().eq(4).html();
    var evaluationStage= ftr.children().eq(5).html();
    var creatTime= ftr.children().eq(6).html();
    var status = ftr.children().eq(7).html();
    if(status == '启用'){
    	xjValidate.showPopup("请先停用该模板!","提示");
    	return;
    }
    sessionStorage.setItem("id", id); 
	sessionStorage.setItem("evaluationTemplateName", evaluationTemplateName); 
	sessionStorage.setItem("evaluationTemplateType", evaluationTemplateType); 
	sessionStorage.setItem("evaluationStage", evaluationStage); 
	sessionStorage.setItem("creatTime", creatTime); 
	var flag = '2';
	window.location.href = basePath+ "/evaluate/goAddEvaluateTemplete?flag="+flag;
}

//跳转到模板明细页面赋值
function showEvaluateTemplateDetailView(){
	   var flag = $("#flag").val();
	   if(flag !=2){
		   return;
	   }
	   var id =  sessionStorage.getItem("id"); 
	   var evaluationTemplateName =  sessionStorage.getItem("evaluationTemplateName"); 
	   var evaluationTemplateType =  sessionStorage.getItem("evaluationTemplateType"); 
	   var evaluationStage =  sessionStorage.getItem("evaluationStage"); 
	   var creatTime =  sessionStorage.getItem("creatTime"); 
		if(evaluationTemplateType == "企业对司机"){
			evaluationTemplateType =1
		}
		if(evaluationTemplateType == "司机对企业"){
			evaluationTemplateType = 2
		}
		if(evaluationTemplateType == "委托方对承运方"){
			evaluationTemplateType =3
		}
		if(evaluationTemplateType == "承运方对委托方"){
			evaluationTemplateType =4
		}
		if(evaluationStage == "运单已付款"){
			evaluationStage =1
		}
		if(evaluationStage == "计划已下达"){
			evaluationStage =2
		}
		if(evaluationStage == "对账已完成"){
			evaluationStage =3
		}
		if(evaluationStage == "结算已付款"){
			evaluationStage =4
		}    
    //给主表赋值
    $("#evaluationTrmplateId").val(id);
    $("#zbevaluationTemplateName").val(evaluationTemplateName);
    $("#zbevaluationTemplateType").val(evaluationTemplateType);
    $("#zbevaluationStage").val(evaluationStage);
    $("#zbcreatTime").val(creatTime);
    //给子表赋值
    $.ajax({
		url:basePath+ "/evaluate/selectEvaluateDetailInfo",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"evaluationTemplateId":id},
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	if(data != null){
        		$.each(data,function(i, val) {
        			var j = i+1;
        			var _html = '<tr class="table-body">'+
        			'<td><label class="i-checks">'+
        				'<input class="sub-auth-check" type="checkbox"></label>'+
        			'</td><td><span>'+j+'</span><input type="text" /></td>'+
        			'<td><span class="assessmentItemsText">'+toChar(val.assessmentItems)+'</span><input class = "assessmentItems" type="text" /></td>'+
        			'<td><span class="weightText">'+toChar(val.weight)+'</span><input class = "weight" type="text" /></td>'+
        			'<td><span class="targetRequirementText">'+toChar(val.targetRequirement)+'</span><input class = "targetRequirement" type="text" /></td>'+
        			'<td><span class="ratingScaleText">'+toChar(val.ratingScale)+'</span><input class = "ratingScale" type="text" /></td>'+
        		 '</tr>';
        			$('#addEvaluationTable tbody').append(_html);
        		});
        	}
        }
	});
}

//1.删除评价模板信息
function delEvaluationTemplate(id){
	 $.ajax({
	    	url:basePath+ "/evaluate/deleteEvaluateTemplate",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{"id":id},
	        dataType:'json'//数据传输格式：json
	 });
}
//2.根据评价模板Id删除评价模板明细信息
function delEvaluationTemplateDetailByETId(id){
	$.ajax({
    	url:basePath+ "/evaluate/deleteEvaluateTemplateDetailByETId",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"evaluationTemplateId":id},
        dataType:'json'//数据传输格式：json
 });
}


//返回上级目录
$("#returnEvaluateTemple").click(function(){
	window.history.back();
});


//删除评价模板
function delEvaluateTemplete(){
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0) {
    	xjValidate.showPopup("请选择要删除的模板!","提示");
      return;
    }
    var ftr = $("#evaluateRadioId:checked").parents("tr");
    var id = ftr.children().eq(1).html();
    var status = ftr.children().eq(7).html();
    if(status == '启用'){
    	xjValidate.showPopup("请先停用该模板!","提示");
    	return;
    }
    //删除评价模板信息
    delEvaluationTemplate(id);
 //删除评价模板明细信息
    delEvaluationTemplateDetailByETId(id);
    location.reload();
}

//启用
function eableEvaluateTemplete(){
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0) {
    	xjValidate.showPopup("请选择要启用的模板!","提示");
      return;
    }
    var ftr = $("#evaluateRadioId:checked").parents("tr");
    var id = ftr.children().eq(1).html();
    var status = ftr.children().eq(7).html();
    if(status == '启用'){
    	xjValidate.showPopup("该模板已经启用!","提示");
    	return;
    }
    //查询同一评价阶段，同一表单类型的数据
    $.ajax({
    	url:basePath+ "/evaluate/selectSameDataCount",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"id":id},
        dataType:'json',//数据传输格式：json
        success:function(data){
        	if(data != 0){
        		xjValidate.showPopup("该表单类型该评价阶段的模板已经启用!","提示");
        		return;
        	}else{//修改模板状态
        		
        	var updateData = {
        			"id":id,
        			"status":1
        	                 }
        		$.ajax({
        	    	url:basePath+ "/evaluate/editEvaluationTemplateById",//请求的action路径
        	        async:false,//是否异步
        	        cache:false,//是否使用缓存
        	        type:'POST',//请求方式：post
        	        data:updateData,
        	        dataType:'json',//数据传输格式：json
        	});
        }
            location.reload();

        }
 });
    
}
//停用
function diseableEvaluateTemplete(){
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0) {
    	xjValidate.showPopup("请选择要启用的模板!","提示");
      return;
    }
    var ftr = $("#evaluateRadioId:checked").parents("tr");
    var id = ftr.children().eq(1).html();
    var status = ftr.children().eq(7).html();
    if(status == '停用'){
    	xjValidate.showPopup("该模板已经停用!","提示");
    	return;
    }
	
	var updateData = {
			"id":id,
			"status":2
	                 }
		$.ajax({
	    	url:basePath+ "/evaluate/editEvaluationTemplateById",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:updateData,
	        dataType:'json',//数据传输格式：json
	});
	location.reload();
}
