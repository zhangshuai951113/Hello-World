$(function(){
	PPList(1);
	//全选/全不选
	$("body").on("click",".all_pre_payment_info_check",function(){
		if($(".all_pre_payment_info_check").is(":checked")){
			//全选时
			$(".sub_pre_payment_info_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_pre_payment_info_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	//时间调用插件
    setTimeout(function() {
       $(".date-time").datetimepicker({
          format: "YYYY-MM-DD",
          autoclose: true,
          todayBtn: true,
          todayHighlight: true,
          showMeridian: true,
          pickerPosition: "bottom-left",
          startView: 2,//月视图
          minView: 2//日期时间选择器所能够提供的最精确的时间选择视图
        }); 
    },500);
});

//预付款信息全查
function PPList(number){
	
	var prePaymentId=$.trim($("#prePaymentId").val());
	var customerName=$.trim($("#customerName").val());
	var carCode=$.trim($("#carCode").val());
	var projectInfoName=$.trim($("#projectInfoName").val());
	var prePaymentPrice=$.trim($("#prePaymentPrice").val());
	var paymentType=$.trim($("#paymentType").val());
	var prePaymentStatus=$.trim($("#prePaymentStatus").val());
	var makeStartTime=$.trim($("#makeStartTime").val());
	var makeEndime=$.trim($("#makeEndime").val());
	if(new Date(makeStartTime).getTime()>new Date(makeEndime).getTime()){
		 xjValidate.showTip("请输入正确的结束时间!");
		 return false;
	}
	
	
	var data={
			prePaymentId:prePaymentId,
			customerName:customerName,
			carCode:carCode,
			projectInfoName:projectInfoName,
			prePaymentPrice:prePaymentPrice,
			paymentType:paymentType,
			prePaymentStatus:prePaymentStatus,
			makeStartTime:makeStartTime,
			makeEndime:makeEndime,
			"page":number,
			"rows":10
	};
	$("#prePaymentInfoTtableList").html("");
	
	$.ajax({
		url:basePath+"/paymentInfo/findPrePaymentMationAll",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				
				//判断显示条件
				//预付款对象
				var prePaymentObject="物流公司";
				if(ele.prePaymentObject==2){
					prePaymentObject="司机";
				}
				//支付类型
				var paymentType="现金";
				//预付款分类
				var prePaymentClassify="预付款";
				//预付款状态
				var prePaymentStatus="起草";
				if(ele.prePaymentStatus==2){
					prePaymentStatus="待审核";
				}else if(ele.prePaymentStatus==3){
					prePaymentStatus="审核通过";
				}else if(ele.prePaymentStatus==4){
					prePaymentStatus="驳回";
				}
				//支付人
				var paymentPersonName=ele.paymentPersonName;
				if(paymentPersonName==null){
					paymentPersonName="";
				}
				//代理人
				var proxyPersonName=ele.proxyPersonName;
				if(ele.proxyPersonName==null){
					proxyPersonName="";
				}
				//车牌号
				var carCode=ele.carCode;
				if(ele.carCode==null){
					carCode="";
				}
				//支付单位
				var paymentCompanyName=ele.paymentCompanyName;
				if(ele.paymentCompanyName==null){
					paymentCompanyName="";
				}
				//组织部门
				var projectInfoName=ele.projectInfoName;
				if(ele.projectInfoName==null){
					projectInfoName="";
				}
				//货物
				var goodsName=ele.goodsName;
				if(ele.goodsName==null){
					goodsName="";
				}
				var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_pre_payment_info_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td style='color:red'>"+prePaymentStatus+"</td>";
				tr+="		<td>"+ele.prePaymentId+"</td>";
				tr+="		<td>"+prePaymentObject+"</td>";
				tr+="		<td>"+paymentPersonName+"</td>";
				tr+="		<td>"+proxyPersonName+"</td>";
				tr+="		<td>"+ele.idCard+"</td>";
				tr+="		<td>"+ele.bankCardId+"</td>";
				tr+="		<td>"+ele.bankName+"</td>";
				tr+="		<td>"+paymentCompanyName+"</td>";
				tr+="		<td>"+paymentType+"</td>";
				tr+="		<td>"+ele.waybillId+"</td>";
				tr+="		<td>"+ele.customerName+"</td>";
				tr+="		<td>"+ele.prePaymentPrice+"</td>";
				tr+="		<td>"+carCode+"</td>";
				tr+="		<td>"+projectInfoName+"</td>";
				tr+="		<td>"+goodsName+"</td>";
				tr+="		<td>"+ele.scatteredGoods+"</td>";
				tr+="		<td>"+prePaymentClassify+"</td>";
				tr+="		<td>"+ele.purpose+"</td>";
				tr+="		<td>"+ele.remarks+"</td>";
				tr+="		<td>"+ele.makeUserName+"</td>";
				tr+="		<td>"+ele.makeTimeStr+"</td>";
				tr+="</tr>";
				$("#prePaymentInfoTtableList").append(tr);
			});
		}
	});
	//查询预付款总数
	$.ajax({
		url:basePath+"/paymentInfo/getPrePaymentMationAllCount",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			parent.getPlanInfoTotalRecords=resp;
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
		  PPList(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getPlanInfoTotalRecords+9)/10);
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
	  pagination.setCurrentPage(value);
	}
//重置按钮
function resetPPList(){
	 setTimeout(function() {
		 PPList(1);
	  },100)
}

//判断按钮
function ChoicePrePaymentMation(number){
	
	var PPIds=new Array();
	$(".sub_pre_payment_info_check").each(function(){
		if($(this).is(":checked")){
			PPIds.push($(this).attr("data-id"));
		}
	});
	
	var PPIdsLength=PPIds.length;
	
	//新增
	if(number==1){
		$("#pre_payment_id").val("1");
		$("#pre_payment_form").attr("action",
				basePath + "/paymentInfo/addOrSavePaymentInfoMationPage");
		$("#pre_payment_form").submit();
		
	}else 
		//修改
		if(number==2){
		
			updateOrePaymentMationById(PPIds.join(","),PPIdsLength);
	}else 
		//删除
		if(number==3){
		
			deletePrePaymentMationById(PPIds.join(","),PPIdsLength);
			
	}else 
		//提交审核
		if(number==4){
		
			submitAuditPrePayMationById(PPIds.join(","),PPIdsLength);
	}else 
		//审核
		if(number==5){
		auditPrePaymentMationById(PPIds.join(","),PPIdsLength);
	}
	
}


//删除预付款信息
function deletePrePaymentMationById(PPIds,PPIdsLength){
	
	if(PPIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PPIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PPIdsLength=1){
		
		$.confirm({
		      title: '提示',
		      content: '您确定要删除吗？',
		      buttons: {
		          '确定': function () {
		        	  
		        	  //根据预付款ID查询预付款状态(起草，驳回才可删除)
		        	  $.ajax({
		        		  url:basePath+"/paymentInfo/findPrePaymentStatusById",
		        		  data:{"PPIds":PPIds},
		        		  dataType:"json",
		        		  type:"post",
		        		  async:false,
		        		  success:function(resp){
		        			  
		        			  if(resp.msg==1 || resp.msg==4){
		        				  
		        				  //根据预付款ID删除预付款信息
		        				  $.ajax({
		        					  url:basePath+"/paymentInfo/deletePrePaymentMationById",
		        					  data:{"PPIds":PPIds},
		        					  dataType:"json",
		        					  type:"post",
		        					  async:false,
		        					  success:function(response){
		        						  if(response){
		        							  if(response.success){
		        								  xjValidate.showPopup(response.msg,"提示",true);
		        								  PPList(1);
		        							  }else{
		        								  xjValidate.showPopup(response.msg,"提示",true);
		        							  }
		        						  }else{
		        							  xjValidate.showPopup("系统异常！","提示",true);
		        						  }
		        					  }
		        				  });
		        				  
		        			  }else{
		        				  xjValidate.showPopup("预付款已提交审核或已审核！","提示",true);
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

//提交审核
function submitAuditPrePayMationById(PPIds,PPIdsLength){
	if(PPIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PPIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PPIdsLength=1){
		
	 //根据预付款ID查询预付款状态(起草，驳回才可提交审核)
  	  $.ajax({
  		  url:basePath+"/paymentInfo/findPrePaymentStatusById",
  		  data:{"PPIds":PPIds},
  		  dataType:"json",
  		  type:"post",
  		  async:false,
  		  success:function(resp){
  			  
  			  if(resp.msg==1 || resp.msg==4){
  				  
  				  //根据操作id修改预付款信息状态为待审核
  				  $.ajax({
  					  url:basePath+"/paymentInfo/updatePrePaymentStatusById",
  					  data:{"PPIds":PPIds,"status":1},
  					  dataType:"json",
  					  type:"post",
  					  async:false,
  					  success:function(response){
  						  
  						  if(response){
  							  if(response.success){
  								  xjValidate.showPopup(response.msg,"提示",true);
								  PPList(1);
  							  }else{
  								  xjValidate.showPopup(response.msg,"提示",true);
  							  }
  						  }else{
  							xjValidate.showPopup("系统异常!","提示",true);
  						  }
  						  
  					  }
  				  });
  			  }else{
  				  xjValidate.showPopup("预付款已提交审核或已审核！","提示",true);
  			  }
  		  }
  	  });
	}
}

//审核预付款信息
function auditPrePaymentMationById(PPIds,PPIdsLength){
	
	if(PPIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PPIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PPIdsLength=1){
		
	 //根据预付款ID查询预付款状态(起草，驳回才可提交审核)
  	  $.ajax({
  		  url:basePath+"/paymentInfo/findPrePaymentStatusById",
  		  data:{"PPIds":PPIds},
  		  dataType:"json",
  		  type:"post",
  		  async:false,
  		  success:function(resp){
  			  
  			  if(resp.msg==2){
  				  
  				//预付款审核模态框
				$.confirm({
					title : '请您填写审核意见:',
					content : ''
							+ '<form action="" class="formName">'
							+ '<div class="form-group">'
							+ '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px" />'
							+ '</div>' + '</form>',
					buttons : {
						formSubmit : {
							text : '审核通过',
							btnClass : 'btn-blue',
							action : function() {
								var auditOption=this.$content.find('#auditOpinion').val();
								if(!auditOption){
									xjValidate.showTip( "审核意见不能为空！");
									return false;
								}
								
								//根据操作id修改预付款信息状态为待审核
				  				 $.ajax({
				  					  url:basePath+"/paymentInfo/updatePrePaymentStatusById",
				  					  data:{"PPIds":PPIds,"status":2,"auditOption":auditOption},
				  					  dataType:"json",
				  					  type:"post",
				  					  async:false,
				  					  success:function(response){
				  						  
				  						  if(response){
				  							  if(response.success){
				  								  xjValidate.showPopup(response.msg,"提示",true);
												  PPList(1);
				  							  }else{
				  								  xjValidate.showPopup(response.msg,"提示",true);
				  							  }
				  						  }else{
				  							xjValidate.showPopup("系统异常!","提示",true);
				  						  }
				  						  
				  					  }
				  				  });
							}
						},
						formSubmit1 : {
							text : '审核驳回',
							btnClass : 'btn-red',
							action : function() {
								
								var auditOption=this.$content.find('#auditOpinion').val();
								if(!auditOption){
									xjValidate.showTip("审核意见不能为空!");
									return false;
								}
								//审核驳回
								 $.ajax({
				  					  url:basePath+"/paymentInfo/updatePrePaymentStatusById",
				  					  data:{"PPIds":PPIds,"status":3,"auditOption":auditOption},
				  					  dataType:"json",
				  					  type:"post",
				  					  async:false,
				  					  success:function(response){
				  						  
				  						  if(response){
				  							  if(response.success){
				  								  xjValidate.showPopup(response.msg,"提示",true);
												  PPList(1);
				  							  }else{
				  								  xjValidate.showPopup(response.msg,"提示",true);
				  							  }
				  						  }else{
				  							xjValidate.showPopup("系统异常!","提示",true);
				  						  }
				  						  
				  					  }
				  				  });
							}
						},
						'取消' : function() {
							
						}
					}
				
				});
  			  }else{
  				  xjValidate.showPopup("预付款未提交审核或已审核！","提示",true);
  			  }
  		  }
  	  });
	}
}

//修改预付款信息
function updateOrePaymentMationById(PPIds,PPIdsLength){
	if(PPIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PPIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PPIdsLength=1){
		//根据预付款ID查询预付款状态(起草，驳回才可修改)
	  	  $.ajax({
	  		  url:basePath+"/paymentInfo/findPrePaymentStatusById",
	  		  data:{"PPIds":PPIds},
	  		  dataType:"json",
	  		  type:"post",
	  		  async:false,
	  		  success:function(resp){
	  			  
	  			  if(resp.msg==1 || resp.msg==4){
	  				
	  				$("#pre_payment_id").val("2");
	  				$("#update_pre_id").val(PPIds);
	  				$("#pre_payment_form").attr("action",
	  						basePath + "/paymentInfo/addOrSavePaymentInfoMationPage");
	  				$("#pre_payment_form").submit();
	  				
	  			  }else{
	  				  xjValidate.showPopup("预付款已提交审核或已审核！","提示",true);
	  			  }
	  		  }
	  	  });
	}
}