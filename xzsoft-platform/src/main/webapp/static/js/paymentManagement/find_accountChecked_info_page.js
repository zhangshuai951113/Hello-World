$(function(){
	findAccountCheckList(1);
	$("body").on("click",".all_account_info_check",function(){
		if($(".all_account_info_check").is(":checked")){
			//全选时
			$(".sub_account_info_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_account_info_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

function findAccountCheckList(number){
	
	var accountCheckId=$.trim($("#accountCheckId").val());
	var accountCheckStatus=$.trim($("#accountCheckStatus").val());
	var shipperName=$.trim($("#shipperName").val());
	//禁止追加
	$("#AccountInfoTBody").html("");
	
	$.ajax({
		url:basePath+"/paymentInfo/findAccountCheckList",
		data:{
			"accountCheckId":accountCheckId,
			"accountCheckStatus":accountCheckStatus,
			"shipperName":shipperName,
			"page":number,
			"rows":10
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
					if(ele.accountCheckStatus==1){
						ele.accountCheckStatus="起草";
					}else if(ele.accountCheckStatus==2){
						ele.accountCheckStatus="待审核";
					}else if(ele.accountCheckStatus==3){
						ele.accountCheckStatus="审核通过";
					}else if(ele.accountCheckStatus==4){
						ele.accountCheckStatus="驳回";
					}else if(ele.accountCheckStatus==5){
						ele.accountCheckStatus="待确认";
					}else if(ele.accountCheckStatus==6){
						ele.accountCheckStatus="已确认";
					}
					
					if(ele.shipperName==null || ele.shipperName==""){
						ele.shipperNam="";
					}
					
				var tr ="<tr class='table-body'>";
					tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_account_info_check' data-id=\""+ele.id+"\" ></label></td>";
					tr+="<td>"+ele.accountCheckId+"</td>";
					tr+="<td style='color:red'>"+ele.accountCheckStatus+"</td>";
					tr+="<td>"+ele.shipperName+"</td>";
					tr+="<td>"+ele.confirmPrice+"</td>";
					tr+="<td>"+ele.paymentAlreadyAmount+"</td>";
					tr+="<td>"+ele.paymentNoAmount+"</td>";
					tr+="<td>"+ele.confirmArriveTonnage+"</td>";
					tr+="<td>"+ele.confirmLossTonnage+"</td>";
					tr+="<td>"+ele.confirmOutCar+"</td>";
					tr+="<td>"+ele.confirmForwardingTonnage+"</td>";
					tr+="<td>"+ele.lossDifference+"</td>";
					tr+="<td>"+ele.otherDifference+"</td>";
					tr+="<td>"+ele.incomeTaxRate+"</td>";
					tr+="<td>"+ele.differenceIncome+"</td>";
					tr+="<td>"+ele.receivableTotal+"</td>";
					tr+="<td>"+ele.payableTotal+"</td>";
					tr+="<td>"+ele.proxyInvoiceTotal+"</td>";
					tr+="<td>"+ele.outCar+"</td>";
					tr+="<td>"+ele.documentsTotal+"</td>";
					tr+="<td>"+ele.makeUserName+"</td>";
					tr+="<td>"+ele.makeTimeStr+"</td>";
					tr+="</tr>";
					$("#AccountInfoTBody").append(tr);
			});
		}
	});
	$.ajax({
		url:basePath+"/paymentInfo/getAccountCheckListCount",
		data:{
			"accountCheckId":accountCheckId,
			"accountCheckStatus":accountCheckStatus,
			"shipperName":shipperName
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			parent.getAccTotalRecords=resp;
			accOuntList.setTotalItems(resp);
			$("#account-num").text("搜索结果共"+resp+"条");
		}
	});
}

//分页
var accOuntList = $("#account-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  findAccountCheckList(current);
	  }
	});

	
	function jumpAccPage(e) {
      var totalPage=Math.floor((parent.getAccTotalRecords+9)/10);
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
	   accOuntList.setCurrentPage(value);
	}

//关闭模态框
function closeAIutton(){
	$("#find_accountCheck_info_model").html("");
}

//重置
function resetAccInfo(){
	setTimeout(function(){
		findAccountCheckList(1);
	},200);
}

//对账信息选择    获取选择的对账信息ID
function submitAIMation(){
	var accIds=new Array();
	$(".sub_account_info_check").each(function(){
		if($(this).is(":checked")){
			accIds.push($(this).attr("data-id"));
		}
	});
	
	if(accIds.length<1){
		commonUtil.showPopup("提示", "操作无效!");
		return false;
	}else{
		submitAccIMation(accIds.join(","),accIds.length);
	}
	
}

function submitAccIMation(accIds,length){
		
		$.confirm({
		      title: '提示',
		      content: '您确定要选择这些记录吗？',
		      buttons: {
		    	  '确定': function () {
		    		//根据选择的对账ID查询对账明细信息、根据查询出的明细ID查询结算信息
		    		  $.ajax({
		    			  url:basePath+"/paymentInfo/findAccountCheckDetailById",
		    			  data:{"accId":accIds},
		    			  dataType:"JSON",
		    			  type:"POST",
		    			  async:false,
		    			  success:function(resp){
		    				  if(resp){
		    					  var accountPo=resp.accountCheckInfoPo;
		    					  var obj=resp.jo;
		    					  if(obj.success){
		    						  if(length>1){
		    							  $("#thisPayPrice").attr("readOnly",true);
		    						  }
		    						  $("#find_accountCheck_info_model").html("");
		    						  //本次付费
			    					  $("#thisPayPrice").val(accountPo.confirmPriceSum);
			    					  //支付单位
			    					  $("#CpaymentCompanyName").val(accountPo.orgName);
			    					  $("#CpaymentCompany").val(accountPo.orgId);
			    					  //发货吨位
			    					  $("#forwardingTonnage").val(accountPo.forwardingTonnageSum);
			    					  //到货吨位
			    					  $("#arriveTonnage").val(accountPo.arriveTonnageSum);
			    					  //应付费用
			    					  $("#payablePrice").val(accountPo.confirmPriceSum);
			    					  //证件号
			    					  $("#WidCard").val(accountPo.idCard);
			    					  //开户行
			    					  $("#WbankName").val(accountPo.bankName);
			    					  //银行账号
			    					  $("#WbankCardId").val(accountPo.bankAccount);
			    					  //对账ID
			    					  $("#accountCheckInfoIds").val(accountPo.accIds);
			    					  $("#settlementInfoInfoIdNamf").val(accountPo.accountCheckId);
			    					  //结算or对账
			    					  $("#settOrAcc").val(2);
		    					  }else{
		    						  $.alert(obj.msg);
		    					  }
		    					  
		    					 
		    				  }else{
		    					  commonUtil.showPopup("提示", "系统异常，请稍候再试!");
		    						return false;
		    				  }
		    			  }
		    		  });
		    	  },
		    	  '取消': function () {
		      }
		      }
		});
		
}
