$(function(){
	evaluationAlreadyEnterpriseList(1);
	
	//允许结算表格拖着
    $("#tableDrag").colResizable({
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
	
});

//数据全查
function evaluationAlreadyEnterpriseList(number){
	//禁止多次追加
	$("#evaluationAlreadyEnterpriseTBody").html("");
	
	$.ajax({
		url:basePath+"/evaluate/evaluationEnterpriseList",
		data:{
			"page":number-1,
			"rows":10,
			"timeStart":$("#timeStart").val(),
			"timeEnd":$("#timeEnd").val(),
			"billNo":$("#billNo").val(),
			"billType":$("#billType").val(),
			"type":2
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
				tr+="<td><div class='operation-td' onclick='evaluationDetail(this)'><div class='modify-operation operation-m'><div class='modify-icon'></div><div class='text' style= 'font-size: 14px;'>评价详情</div></div></div></td>";
				tr+="</td>";
				$("#evaluationAlreadyEnterpriseTBody").append(tr);
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
			"type":2
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			 $("#evaluation-already-num").text("搜索结果共"+resp+"条");
			 parent.getEvaluationAlreadyTotalRecords=resp;
			 evaluationAlreayPagination.setTotalItems(resp);
		}
	});
}

//分页
var evaluationAlreayPagination = $("#evaluation-already-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  evaluationAlreadyEnterpriseList(current);
	  }
	});

	
	function jumpEvaluationalreadyPage(e) {
      var totalPage=Math.floor(( parent.getEvaluationAlreadyTotalRecords+9)/10);
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
	   evaluationAlreayPagination.setCurrentPage(value);
	}

	
	//重置
	function resetevaluation(){
		setTimeout(function(){
			evaluationAlreadyEnterpriseList(1);
		});
	}
	
	//评价详情
	function evaluationDetail(obj){
		var ftr = $(obj).parents('tr');
		parent.getEvaluationEnterpriceId=ftr.children().eq(0).html();
		var url=basePath+"/evaluate/showEvaluationModelPage";
		
		$("#show_evalplate_already_model").load(url,{},function(){
			
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
			data:{"id":parent.getEvaluationEnterpriceId,"type":2},
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
	            
				var obj=eval(resp.evaluationEnterpriceDetailList);
	           
				$.each(obj,function(index,ele){
					var tr="<tr class='table-body templateTbody'>";
						tr+="<td style='display:none'class='id'>"+ele.id+"</td>";
						tr+="<td>"+(index+1)+"</td>";
						tr+="<td class='assessmentItems'>"+ele.assessmentItems+"</td>";
						tr+="<td class='weight'>"+ele.weight+"%"+"</td>";
						tr+="<td class='targetRequirement'>"+ele.targetRequirement+"</td>";
						tr+="<td class='ratingScale'>"+ele.ratingScale+"</td>";
						tr+="<td>"+ele.assessmentItemsScore+"</td>";
						tr+="</tr>";
						$("#evaluateTBody").append(tr);
				});
				if(resp.evaluationEnterprice.type==2){
					$("#evaluateTBody").append(''+
							'<tr  class="table-body score" ><td colspan="5">总分：</td><td class="scoreSum">'+resp.evaluationEnterprice.shipperForEntrust+'</td></tr>');
					$("#ComprehensiveEvaluation").val(resp.evaluationEnterprice.shipperForEntrustComprehensiveScore);
				}else if(resp.evaluationEnterprice.type==1){
					$("#evaluateTBody").append(''+
							'<tr  class="table-body score" ><td colspan="5">总分：</td><td class="scoreSum">'+resp.evaluationEnterprice.entrustForShipper+'</td></tr>');
					$("#ComprehensiveEvaluation").val(resp.evaluationEnterprice.entrustForShipperComprehensiveScore);
				}
				$("#ComprehensiveEvaluation").attr("readonly",true);
				$(".save-button").hide();
			}
		});
		$.ajax({
			url:basePath+"/evaluate/getEvaluationMationCount",
			data:{"id":parent.getEvaluationEnterpriceId,"type":2},
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
	
	//关闭评价模态框
	function closeEvalplate(){
		$("#show_evalplate_already_model").html("");
		$("#show_evaluation_model_page").html("");
	}
	