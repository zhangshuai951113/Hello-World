
$(function(){
	list(1);
	
	//全选/全不选
	$("body").on("click",".all_settlement_formula_check",function(){
		if($(".all_settlement_formula_check").is(":checked")){
			//全选时
			$(".sub_settlement_formula_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_settlement_formula_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//页面全查
function list(number){
	
	$("#settlementFormulaTtableList").html("");
	
	$.ajax({
		url:basePath+"/settlementFormula/findSettlementFormulaAll",
		data:{"page":number-1,"rows":10},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				if(ele.createTimeStr==null){
					ele.createTimeStr="";
				}
				if(ele.overallTaxRate==null){
					ele.overallTaxRate="";
				}
				if(ele.individualIncomeTax==null){
					ele.individualIncomeTax="";
				}
			var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_settlement_formula_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="<td>"+ele.overallTaxRate+"</td>";
				tr+="<td>"+ele.individualIncomeTax+"</td>";
				tr+="<td>"+ele.withholdingTaxRate+"</td>";
				tr+="<td>"+ele.incomeTaxRate+"</td>";
				tr+="<td>"+ele.createTimeStr+"</td>";
				tr+="</tr>";
				$("#settlementFormulaTtableList").append(tr);
			});
		}
	});
	//获取最大数据记录数
	$.ajax({
		 url:basePath+"/settlementFormula/getSettlementFormulaMaxCount",
		 type:"post",
		 data:{"page":number-1,"rows":10},
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 parent.getTotalRecordsPlanInfo=resp;
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
}

//分页
var pagination = $(".pagination-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
	      list(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getTotalRecordsPlanInfo+4)/5);
	  var myreg=/^[0-9]+.?[0-9]*$/;
	  var re = new RegExp(myreg);
	  var number=$(e).prev().find('input').val();
	  if(!re.test(number)){
		  xjValidate.showTip("请输入正确的数字!");
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
	  pagination.setCurrentPage(value);
	}

//新增结算公式
function addSettlementFormulaPage(){
	var url=basePath+"/settlementFormula/addSettlementFormula";
	$("#add_settlement_formula_info").load(url);
}

//关闭模态框
function closeSett(){
	$("#add_settlement_formula_info").html("");
	$("#update_settlement_formula_info").html("");
	$("#find_org_info_page").html("");
	list(1);
}


//焦点点击验证
function sum(){
	$("#overallTaxRate").html('');
	var withholdingTaxRate=$.trim($("#withholdingTaxRate").val());
	var withholdingTaxRateNum= parseFloat(withholdingTaxRate);
	var incomeTaxRate=$.trim($("#incomeTaxRate").val());
	var incomeTaxRateNum= parseFloat(incomeTaxRate);
	var sum=(withholdingTaxRateNum+incomeTaxRateNum).toFixed(4); 
	var regax=/^\d+(\.\d+)?$/;
	if(!regax.test(withholdingTaxRate) ){
		 
		return false;
	}
	var regax=/^\d+(\.\d+)?$/;
	if(!regax.test(incomeTaxRate)){
		 
		return false;
	}
	$("#overallTaxRate").text(sum);
}


//添加结算公式
function saveSettlementFormula(){
	//企业代扣税税率
	var withholdingTaxRate=$.trim($("#withholdingTaxRate").val());
	if(withholdingTaxRate==undefined || withholdingTaxRate==""){
		xjValidate.showTip("企业代扣税税率不能为空!");
		return false;
	}
	
	var regax=/^\d+(\.\d+)?$/;
	if(!regax.test(withholdingTaxRate)){
		xjValidate.showTip("企业代扣税税率的正确格式应为0.00!");
		return false;
	}
	//司机运费进项税税率
	var incomeTaxRate=$.trim($("#incomeTaxRate").val());
	if(incomeTaxRate==undefined || incomeTaxRate==""){
		xjValidate.showTip("司机运费进项税税率不能为空!");
		return false;
	}
	
	var regax=/^\d+(\.\d+)?$/;
	if(!regax.test(incomeTaxRate)){
		xjValidate.showTip("司机运费进项税税率的正确格式应为0.00!");
		return false;
	}
	
	//个人所得税税率
	var individualIncomeTax=$.trim($("#individualIncomeTax").val());
	if(individualIncomeTax!=undefined && individualIncomeTax!=''){
		var regax=/^\d+(\.\d+)?$/;
		if(!regax.test(individualIncomeTax)){
			xjValidate.showTip("个人所得税的正确格式应为0.00!");
			return false;
		}
	}
	
	
	//综合税率
	var overallTaxRate=$("#overallTaxRate").val();
	if(overallTaxRate!=undefined && overallTaxRate!=''){
		var regax=/^\d+(\.\d+)?$/;
		if(!regax.test(overallTaxRate)){
			xjValidate.showTip("综合税率的正确格式应为0.00!");
			return false;
		}
	}
	
	var withholdingTaxRate=$.trim($("#withholdingTaxRate").val());
	var incomeTaxRate=$.trim($("#incomeTaxRate").val());
	
	var data={
			withholdingTaxRate:withholdingTaxRate,
			incomeTaxRate:incomeTaxRate,
			individualIncomeTax:individualIncomeTax,
			overallTaxRate:overallTaxRate
			};
	
	//添加结算公式
	$.ajax({
		url:basePath+"/settlementFormula/saveSettlementFormula",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			if(resp){
				
				if(resp.success){
					xjValidate.showTip(resp.msg);
					$("#add_settlement_formula_info").html("");
					list(1);
				}else{
					xjValidate.showTip(resp.msg);
				}
				
			}else{
				xjValidate.showTip("添加结算公式异常!");
			}
		}
	});
}

//获取全选/单选ID (结算ID，逗号分隔)
function ChoicSettlementFormulaMation(number){

	var sIds = new Array();
	$(".sub_settlement_formula_check").each(function(){
		if($(this).is(":checked")){
			sIds.push($(this).attr("data-id"))
		}
	});
	
	var sIdsLength=sIds.length;
	
	    //删除按钮
	if(number==2){
		deleteSettlementFormulaMationById(sIds.join(","),sIdsLength);
	}else 
		//修改按钮
		if(number==1){
		updateSettlementFormulaMationById(sIds.join(","),sIdsLength);
	}else
		//查看按钮
		if(number==4){
		seeSettlementFormulaMationById(sIds.join(","),sIdsLength);
	}else 
		//分配主体
		if(number==3){
		allocationAccountingEntity(sIds.join(","),sIdsLength);
	}
}

//修改结算公式
function updateSettlementFormulaMationById(sIds,sIdsLength){
	
	//判断选择条数
	if(sIdsLength>1){
		xjValidate.showTip("请选择一条数据!");
	}else if(sIdsLength<1){
		xjValidate.showTip("请选择一条数据!");
	}else if(sIdsLength=1){
		
		//判断数据是否存在
		$.ajax({
			url:basePath+"/settlementFormula/findMationIsExits",
			data:{"sIds":sIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				//数据存在
				if(resp.success){
					xjValidate.showTip(resp.msg);
				}
				//数据不存在
				else{
					
					//弹出修改模态框
					var url=basePath+"/settlementFormula/updateSettlementFormula";
					$("#update_settlement_formula_info").load(url,function(){
						
						//根据id查询数据
						$.ajax({
							url:basePath+"/settlementFormula/findSettlementFormulaData",
							data:{"sIds":sIds},
							dataType:"json",
							type:"post",
							async:false,
							success:function(resp){
								console.log(resp);
								$("#sIds").val(resp.id);
								$("#withholdingTaxRate").val(resp.withholdingTaxRate);
								$("#incomeTaxRate").val(resp.incomeTaxRate);
								$("#individualIncomeTax").val(resp.individualIncomeTax);
								$("#overallTaxRate").val(resp.overallTaxRate);
							}
						});
					});
				}
			}
		});
	}
}

//提交修改数据
function updateSettlementFormula(){
	
	var withholdingTaxRate=$.trim($("#withholdingTaxRate").val());
	if(withholdingTaxRate==undefined || withholdingTaxRate==""){
		xjValidate.showTip("企业代扣税税率不能为空!");
		return false;
	}
	
	var regax=/^\d+(\.\d+)?$/;
	if(!regax.test(withholdingTaxRate)){
		xjValidate.showTip("企业代扣税税率的正确格式应为0.00!");
		return false;
	}
	
	var incomeTaxRate=$.trim($("#incomeTaxRate").val());
	if(incomeTaxRate==undefined || incomeTaxRate==""){
		xjValidate.showTip("司机运费进项税税率不能为空!");
		return false;
	}
	
	var regax=/^\d+(\.\d+)?$/;
	if(!regax.test(incomeTaxRate)){
		xjValidate.showTip("司机运费进项税税率的正确格式应为0.00!");
		return false;
	}
	
	//个人所得税税率
	var individualIncomeTax=$.trim($("#individualIncomeTax").val());
	if(individualIncomeTax!=undefined || individualIncomeTax!=""){
		var regax=/^\d+(\.\d+)?$/;
		if(!regax.test(individualIncomeTax)){
			xjValidate.showTip("个人所得税的正确格式应为0.00!");
			return false;
		}
	}
	
	
	
	//综合税率
	var overallTaxRate=$("#overallTaxRate").val();
	if(overallTaxRate!=undefined || overallTaxRate!=""){
		var regax=/^\d+(\.\d+)?$/;
		if(!regax.test(overallTaxRate)){
			xjValidate.showTip("综合税率的正确格式应为0.00!");
			return false;
		}
	}
	
	
	
	var withholdingTaxRate=$.trim($("#withholdingTaxRate").val());
	var incomeTaxRate=$.trim($("#incomeTaxRate").val());
	var overallTaxRate=$("#overallTaxRate").val();
	var individualIncomeTax=$.trim($("#individualIncomeTax").val());
	var sIds=$("#sIds").val();
	var data={
			withholdingTaxRate:withholdingTaxRate,
			incomeTaxRate:incomeTaxRate,
			individualIncomeTax:individualIncomeTax,
			overallTaxRate:overallTaxRate,
			sIds:sIds
			};
	
	$.ajax({
		url:basePath+"/settlementFormula/updateSettlementFormulaData",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			if(resp){
				
				if(resp.success){
					xjValidate.showTip(resp.msg);
					$("#update_settlement_formula_info").html("");
					list(1);
				}else{
					xjValidate.showTip(resp.msg);
				}
				
			}else{
				xjValidate.showTip("修改结算公式异常!");
			}
		}
	});
}

//删除结算
function deleteSettlementFormulaMationById(sIds,sIdsLength){
	
	//判断选择条数
	if(sIdsLength>1){
		xjValidate.showTip("请选择一条数据!");
	}else if(sIdsLength<1){
		xjValidate.showTip("请选择一条数据!");
	}else if(sIdsLength=1){
		
		//判断数据是否存在
		$.ajax({
			url:basePath+"/settlementFormula/findMationIsExits",
			data:{"sIds":sIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				//数据存在
				if(resp.success){
					xjValidate.showTip(resp.msg);
				}
				//数据不存在
				else{
					
					$.confirm({
					      title: '提示',
					      content: '您确定要删除吗？',
					      buttons: {
					          '确定': function () {
					        	  
					        	//删除结算公式
					        	$.ajax({
					        		url:basePath+"/settlementFormula/delSettlementFormulaData",
					        		data:{"sIds":sIds},
					        		dataType:"json",
			                        type:"post",
			                        async:false,
			                        success:function(resp){
			                        	if(resp.success){
			                        		xjValidate.showTip(resp.msg);
			                        		list(1);
			                        	}else{
			                        		xjValidate.showTip(resp.msg);
			                        	}
			                        }
					        	});
					          },
					          '取消': function () {
					        	  
					          }
					      }
					  });
					
				}
			}
		});
		
	}
	
}

//进入分配核算主体模态框
function allocationAccountingEntity(sIds,sIdsLength){
	
	//判断选择条数
	if(sIdsLength>1){
		xjValidate.showTip("请选择一条数据!");
	}else if(sIdsLength<1){
		xjValidate.showTip("请选择一条数据!");
	}else if(sIdsLength==1){
		
		var url=basePath+"/settlementFormula/goAllocationAccountingEntityPage";
		$("#find_org_info_page").load(url,function(){
			$("#settIds").val(sIds);
		});
	}
}

//查看结算公式
function seeSettlementFormulaMationById(sIds,sIdsLength){
	
	//判断选择条数
	if(sIdsLength>1){
		xjValidate.showTip("请选择一条数据!");
	}else if(sIdsLength<1){
		xjValidate.showTip("请选择一条数据!");
	}else if(sIdsLength==1){
		
		var url=basePath+"/settlementFormula/seeSettlementFormulaMationModel";
		$("#see_settlement_formula_detail_page").load(url,function(){
			$("#SFDIds").val(sIds);
		});
	}
}