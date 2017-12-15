$(function(){
	evaluationEnterpriseList(1);
	//允许表格拖着
	$("#tableDrag").colResizable({
		  liveDrag:true, 
		  gripInnerHtml:"<div class='grip'></div>", 
		  draggingClass:"dragging",
		  ifDel: 'tableDrag'
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


//数据全查
function evaluationEnterpriseList(number){
	
	//禁止多次追加
	$("#evaluationEnterpriseTBody").html("");
	
	$.ajax({
		url:basePath+"/evaluate/evaluationEnterpriseList",
		data:{
			"page":number-1,
			"rows":10,
			"timeStart":$("#timeStart").val(),
			"timeEnd":$("#timeEnd").val(),
			"billNo":$("#billNo").val(),
			"billType":$("#billType").val(),
			"type":1
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var obj=eval(resp);
			$.each(obj,function(index,ele){
				
				if(ele.entrustName==null){
					ele.entrustName="";
				}
				
				if(ele.shipperName==null){
					ele.shipperName="";
				}
				
				if(ele.billType==1){
					ele.billType="计划";
				}else if(ele.billType==2){
					ele.billType="对账";
				}else if(ele.billType==3){
					ele.billType="结算";
				}
				
				if(ele.billStatus==1){
					ele.billStatus="计划已下达";
				}else if(ele.billStatus==2){
					ele.billStatus="对账已完成";
				}else if(ele.billStatus==3){
					ele.billStatus="结算已付款";
				}
				
				var tr="<tr class='table-body'>";
				tr+="<td style='display:none'>"+ele.id+"</td>";
				tr+="<td>"+(index+1)+"</td>";
				tr+="<td>"+ele.billNo+"</td>";
				tr+="<td>"+ele.billType+"</td>";
				tr+="<td>"+ele.entrustName+"</td>";
				tr+="<td>"+ele.shipperName+"</td>";
				tr+="<td>"+ele.billStatus+"</td>";
				tr+="<td>"+ele.createTimeStr+"</td>";
				tr+="<td><div class='operation-td' onclick='evaluationModel(this)'><div class='modify-operation operation-m'><div class='modify-icon'></div><div class='text' style= 'font-size: 14px;'>评价</div></div></div></td>";
				tr+="</td>";
				$("#evaluationEnterpriseTBody").append(tr);
			});
		}
	});
	
	//查询数据数量
	$.ajax({
		url:basePath+"/evaluate/getEvaluationEnterpriseListCount",
		data:{
			"timeStart":$("#timeStart").val(),
			"timeEnd":$("#timeEnd").val(),
			"billNo":$("#billNo").val(),
			"billType":$("#billType").val(),
			"type":1
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			 $("#evaluation-num").text("搜索结果共"+resp+"条");
			 parent.getEvaluationTotalRecords=resp;
			 evaluationPagination.setTotalItems(resp);
		}
	});
}

//分页
var evaluationPagination = $("#evaluation-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  evaluationEnterpriseList(current);
	  }
	});

	
	function jumpEvaluationPage(e) {
      var totalPage=Math.floor(( parent.getEvaluationTotalRecords+9)/10);
	  var myreg=/^[0-9]+.?[0-9]*$/;
	  var re = new RegExp(myreg);
	  var number=$(e).prev().find('input').val();
	  if(!re.test(number)){
		  xjValidate.showPopup("请输入正确的数字!","提示",true);
		  $(e).prev().find('input').val("");
		  return false;
	  }
	   var value = parseInt(number);
	   if(value<1){
		   $(e).prev().find('input').val("1")
		   value=1;
	   }
	   if(value>=totalPage){
		   $(e).prev().find('input').val(totalPage);
		   value=totalPage;
	   }
	   evaluationPagination.setCurrentPage(value);
	}

	
	//重置
	function resetSelectParams(){
		setTimeout(function(){
			evaluationEnterpriseList(1);
		});
	}
	
//调用评价模板
function evaluationModel(obj){
	var ftr = $(obj).parents('tr');
	parent.getEvaluationEnterpriceId=ftr.children().eq(0).html();
	var url=basePath+"/evaluate/showEvaluationModelPage";

	$("#show_evaluation_model_page").load(url,{},function(){
		
		/*setTimeout(function(){
			//允许表格拖着
			$("#tableDrag1").colResizable({
				  liveDrag:true, 
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  ifDel: 'tableDrag1'
			});
		},500);*/
		
		//分页
		evaluationTemplatePagination = $("#evaluate-list").operationList({
			  "current":1,    //当前目标
			  "maxSize":4,  //前后最大列表
			  "itemPage":10,  //每页显示多少条
			  "totalItems":0,  //总条数
			  "chagePage":function(current){
			    //调用ajax请求拿最新数据
				  evaluationTemplateList(current);
			  }
			});
		
		evaluationTemplateList(1);
		
	});
	
}

//模板数据
function evaluationTemplateList(number){

	$("#evaluateTBody").html("");
	$("#showModalEvaluationDetailTbody").html("");
	$.ajax({
		url:basePath+"/evaluate/showEvaluationMation",
		data:{"id":parent.getEvaluationEnterpriceId,"type":1},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
            var objs=eval(resp.evaluationTemplate);

            $("#showModalEvaluationDetailTbody").append('<tr><td colSpan = "3" style = "text-align: right;padding-right:20px">表单名称:</td>'+
    	    		'<td colSpan = "3" width = "180px" >'+objs.evaluationTemplateName+'</td>'+
    	    		'<td  colSpan = "3" width = "180px" style = "text-align: right;padding-right:20px">表单类型:</td>'+
    	    		'<td colSpan = "3" width = "180px" >'+objs.evaluationTemplateTypeStr+'</td></tr><tr>'+
    	    		'<td colSpan = "3" style = "text-align: right;padding-right:20px">评价阶段:</td>'+
    	    		'<td colSpan = "3" width = "180px" >'+objs.evaluationStageStr+'</td>'+
    	    		'<td  colSpan = "3" width = "180px" style = "text-align: right;padding-right:20px">创建日期:</td>'+
    	    		'<td colSpan = "3" width = "180px" >'+objs.creatTimeStr+'</td></tr>')
            
			var obj=eval(resp.evaluationTemplateDetails);
			$.each(obj,function(index,ele){
				var tr="<tr class='table-body templateTbody'>";
					tr+="<td style='display:none'class='id'>"+ele.id+"</td>";
					tr+="<td>"+(index+1)+"</td>";
					tr+="<td class='assessmentItems'>"+ele.assessmentItems+"</td>";
					tr+="<td class='weight'>"+ele.weight+"%"+"</td>";
					tr+="<td class='targetRequirement'>"+ele.targetRequirement+"</td>";
					tr+="<td class='ratingScale'>"+ele.ratingScale+"</td>";
					tr+="<td>"+"<input class='scoreNum' type='text' style='border-left:0px;border-top:0px;border-right:0px;border-bottom:1px;height:30px ' onkeyup='checkedNum(this)' onblur='evalater(this)' onKeyPress='if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;'/>"+"</td>";
					tr+="</tr>";
					$("#evaluateTBody").append(tr);
			});
			$("#evaluateTBody").append(''+
					'<tr  class="table-body score" ><td colspan="5">总分：</td><td class="scoreSum"></td></tr>');
		}
	});
	$.ajax({
		url:basePath+"/evaluate/getEvaluationMationCount",
		data:{"id":parent.getEvaluationEnterpriceId,"type":1},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			 $("#evaluationEvaluate-num").text("搜索结果共"+resp+"条");
			 parent.getEvaluationTemplateTotalRecords=resp;
			 evaluationTemplatePagination.setTotalItems(resp);
		}
	});
}


function jumpEvaluatePage(e) {
  var totalPage=Math.floor(( parent.getEvaluationTemplateTotalRecords+9)/10);
  var myreg=/^[0-9]+.?[0-9]*$/;
  var re = new RegExp(myreg);
  var number=$(e).prev().find('input').val();
  if(!re.test(number)){
	  xjValidate.showPopup("请输入正确的数字!","提示",true);
	  $(e).prev().find('input').val("");
	  return false;
  }
   var value = parseInt(number);
   if(value<1){
	   $(e).prev().find('input').val("1")
	   value=1;
   }
   if(value>=totalPage){
	   $(e).prev().find('input').val(totalPage);
	   value=totalPage;
   }
   evaluationTemplatePagination.setCurrentPage(value);
}

var sum = 0;
//评分计算
/*function evalater(obj){
	var ftr = $(obj).parents("tr");
	var weight = ftr.children().eq(3).html();
	var score = $(obj).val();
	weight  = weight.replace("%","");
	weight = weight/100;
	var totalScore = score*weight;
	sum += totalScore;
	var nextTr = ftr.nextAll(".score");
    nextTr.children().eq(1).html(sum);	
}*/

//校验输入的数字
function checkedNum(obj){
	var score = parseInt($(obj).val());
	if(score>100){
		$(obj).val(100);
	}else if(score<0){
		$(obj).val(0);
	}
	var ftr = $(obj).parents("tr");
	var weight = ftr.children().eq(3).html();
	var score = $(obj).val();
	weight  = weight.replace("%","");
	weight = weight/100;
	var totalScore = score*weight;
	ftr.attr("data-source",totalScore);
	
	//累计总分
	getSum(ftr);
	/*sum += totalScore;
	var nextTr = ftr.nextAll(".score");
    nextTr.children().eq(1).html(sum);	*/
}

function getSum(ftr){
	var sum = 0;
	$(".templateTbody").each(function(){
		var total = Number($(this).attr("data-source")) || 0;
		sum += total;
		ftr.nextAll(".score").children().eq(1).html(sum);
	})
	
}

//关闭评价模态框
function closeEvalplate(){
	$("#show_evaluation_model_page").load("");
	$("#show_evalplate_already_model").load("");
}

function saveEvalplate(id){  
     
     var arr=[];
     var arr1=[];
 	$('.templateTbody').each(function(){
 		var id = $.trim($(this).find(".id").text());
 		var scoreNum = $.trim($(this).find(".scoreNum").val());
 		var assessmentItems = $.trim($(this).find(".assessmentItems").text());
 		var weight = $.trim($(this).find(".weight").text());
 		var targetRequirement = $.trim($(this).find(".targetRequirement").text());
 		var ratingScale = $.trim($(this).find(".ratingScale").text());
 		var obj = {
 				id: id,
 				scoreNum: scoreNum,
 				assessmentItems:assessmentItems,
 				weight:weight.replace("%",""),
 				targetRequirement:targetRequirement,
 				ratingScale:ratingScale
 		};
 		arr.push(obj);
 	});
 	
 	$('.score').each(function(){
 		var scoreSum = $.trim($(this).find(".scoreSum").text());
 		var ComprehensiveEvaluation=$("#ComprehensiveEvaluation").val();
 		var obj = {
 				scoreSum: scoreSum,
 				comprehensiveScore:ComprehensiveEvaluation,
 	 			id:parent.getEvaluationEnterpriceId
 		};
 		arr1.push(obj);
 	});
 	
 	
 	$.ajax({
 		url:basePath+"/evaluate/insertEvaluationEnterpriceMation",
 		data:{
 			arr:JSON.stringify(arr),
 			arr1:JSON.stringify(arr1)
 		},
 		dataType:"JSON",
 		type:"POST",
 		async:false,
 		success:function(resp){
 			if(resp){
 				if(resp.success){
 					$("#show_evaluation_model_page").load("");
 					$.alert(resp.msg);
 					evaluationEnterpriseList(1);
 				}else{
 					$.alert(resp.msg);
 				}
 			}else{
 				$.alert(resp);
 			}
 		}
 	});
 	
}
