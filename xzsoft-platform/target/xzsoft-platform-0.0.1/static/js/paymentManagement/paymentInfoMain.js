$(function(){
	
	PIMList(1);
	//全选/全不选
	$("body").on("click",".all_payment_info_check",function(){
		if($(".all_payment_info_check").is(":checked")){
			//全选时
			$(".sub_payment_info_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_payment_info_check").each(function(){
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

//付款信息全查
function PIMList(number){
	
	//禁止多次追加
	$("#paymentInfoTtableList").html("");
	
	var paymentId=$.trim($("#paymentId").val());
	var paymentPersonName=$.trim($("#paymentPersonName").val());
	var paymentCompany=$.trim($("#paymentCompany").val());
	var customerName=$.trim($("#customerName").val());
	var projectInfoName=$.trim($("#projectInfoName").val());
	var proxyPersonName=$.trim($("#proxyPersonName").val());
	var payablePrice=$.trim($("#payablePrice").val());
	var paymentType=$.trim($("#paymentType").val());
	var paymentStatus=$.trim($("#paymentStatus").val());
	var makeStartTime=$.trim($("#makeStartTime").val());
	var makeEndime=$.trim($("#makeEndime").val());
	if(new Date(makeStartTime).getTime()>new Date(makeEndime).getTime()){
		 xjValidate.showTip("请输入正确的结束时间!");
		 return false;
	}
	var data={
			paymentId:paymentId,
			paymentPersonName:paymentPersonName,
			paymentCompany:paymentCompany,
			customerName:customerName,
			projectInfoName:projectInfoName,
			proxyPersonName:proxyPersonName,
			payablePrice:payablePrice,
			paymentType:paymentType,
			paymentStatus:paymentStatus,
			makeStartTime:makeStartTime,
			makeEndime:makeEndime,
			"page":number,
			"rows":10
	};
	
	$.ajax({
		url:basePath+"/paymentInfo/findPaymentMationAll",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				
				//判断显示条件
				//预付款对象
				var paymentObject="物流公司";
				if(ele.paymentObject==2){
					paymentObject="司机";
				}if(ele.paymentObject==3){
					paymentObject="代理机构(路歌)";
				}
				//支付类型
				var paymentType="";
				if(ele.paymentType==1){
					paymentType="现金";
				}else if(ele.paymentType==2){
					paymentType="承兑";
				}else if(ele.paymentType==3){
					paymentType="电汇";
				}else if(ele.paymentType==4){
					paymentType="网银";
				}
				//预付款分类
				var paymentClassify="正常付款";
				//预付款状态
				var paymentStatus="起草";
				if(ele.paymentStatus==2){
					paymentStatus="待审核";
				}else if(ele.paymentStatus==3){
					paymentStatus="审核通过";
				}else if(ele.paymentStatus==4){
					paymentStatus="驳回";
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
				//零散货物
				var scatteredGoods=ele.scatteredGoods;
				if(ele.scatteredGoods==null){
					scatteredGoods="";
				}
				//线路
				var lineName=ele.lineName;
				if(ele.lineName==null){
					lineName="";
				}
				//客户编号
				if(ele.customerName==null){
					ele.customerName="";
				}
				var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_payment_info_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td style='color:red'>"+paymentStatus+"</td>";
				tr+="		<td>"+ele.paymentId+"</td>";
				tr+="		<td>"+paymentCompanyName+"</td>";
				tr+="		<td>"+paymentPersonName+"</td>";
				tr+="		<td>"+proxyPersonName+"</td>";
				tr+="		<td>"+ele.thisPayPrice+"</td>";
				tr+="		<td>"+carCode+"</td>";
				tr+="		<td>"+paymentType+"</td>";
				tr+="		<td>"+paymentObject+"</td>";
				tr+="		<td>"+ele.bankName+"</td>";
				tr+="		<td>"+projectInfoName+"</td>";
				tr+="		<td>"+ele.payablePrice+"</td>";
				tr+="		<td>"+ele.customerName+"</td>";
				tr+="		<td>"+goodsName+"</td>";
				tr+="		<td>"+scatteredGoods+"</td>";
				tr+="		<td>"+lineName+"</td>";
				tr+="		<td>"+paymentClassify+"</td>";
				tr+="		<td>"+ele.makeUserName+"</td>";
				tr+="		<td>"+ele.makeTimeStr+"</td>";
				tr+="</tr>";
				$("#paymentInfoTtableList").append(tr);
			});
			//允许表格拖着
			$("#paymentInfoTtable").colResizable({
				  liveDrag:true, 
				  partialRefresh:true,
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  resizeMode: 'overflow'
			});
		}
	});
	//查询付款总数
	$.ajax({
		url:basePath+"/paymentInfo/getPaymentMationAllCount",
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
};

//分页
var pagination = $(".pagination-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  PIMList (current);
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
	
	//重置
	function resetPayment(){
		setTimeout(function() {
			PIMList(1);
		  },100)
	}
	
	
//判断选择按钮
function ChoicePaymentMation(number){
	
	var PMIds=new Array();
	$(".sub_payment_info_check").each(function(){
		if($(this).is(":checked")){
			PMIds.push($(this).attr("data-id"));
		}
	});
	var PMIdsLength=PMIds.length;
	//新增
	if(number==1){
		
		$("#payment_id").val("3");
		$("#payment_form").attr("action",
				basePath + "/paymentInfo/addOrSavePaymentInfoMationPage");
		$("#payment_form").submit();
		
		
	}else 
		//修改
		if(number==2){
			updatePaymentMationById(PMIdsLength,PMIds.join(","));
	}else 
		//删除
		if(number==3){
		
			deletePaymentMationById(PMIdsLength,PMIds.join(","));
	}else 
		//提交审核
		if(number==4){
		
			submitAuditPaymentMation(PMIdsLength,PMIds.join(","));
	}else 
		//审核
		if(number==5){
			AuditPaymentMation(PMIdsLength,PMIds.join(","));
	}
	
}

//删除付款信息
function deletePaymentMationById(PMIdsLength,PMIds){
	if(PMIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PMIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PMIdsLength=1){
		
		//根据选择的付款信息ID判断付款状态
		$.ajax({
			url:basePath+"/paymentInfo/findPaymentInfoMationById",
			data:{PMIds:PMIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				if(resp.msg==1 || resp.msg==4){
					
					$.confirm({
					      title: '提示',
					      content: '您确定要删除吗？',
					      buttons: {
					          '确定': function () {
					        	  //根据付款ID删除付款信息
		        				  $.ajax({
		        					  url:basePath+"/paymentInfo/deletePaymentMationById",
		        					  data:{"PMIds":PMIds},
		        					  dataType:"json",
		        					  type:"post",
		        					  async:false,
		        					  success:function(response){
		        						  if(response){
		        							  if(response.success){
		        								  xjValidate.showPopup(response.msg,"提示",true);
		        								  PIMList(1);
		        							  }else{
		        								  xjValidate.showPopup(response.msg,"提示",true);
		        							  }
		        						  }else{
		        							  xjValidate.showPopup("系统异常！","提示",true);
		        						  }
		        					  }
		        				  });
					          },
					          '取消': function () {
					          }
					      }
					  });
					
				}else {
					xjValidate.showPopup("付款已提交审核或已审核！","提示",true);
				}
			}
		});
	}
}

//提交审核
function submitAuditPaymentMation(PMIdsLength,PMIds){
	if(PMIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PMIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PMIdsLength=1){
		//根据选择的付款信息ID判断付款状态
		$.ajax({
			url:basePath+"/paymentInfo/findPaymentInfoMationById",
			data:{PMIds:PMIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				if(resp.msg==1 || resp.msg==4){
					
					$.confirm({
					      title: '提示',
					      content: '您确定要提交审核吗？',
					      buttons: {
					          '确定': function () {
					        	  //根据付款ID提交审核付款信息
		        				  $.ajax({
		        					  url:basePath+"/paymentInfo/submitAuditOrAuditPaymentMation",
		        					  data:{"PMIds":PMIds,"sign":1},
		        					  dataType:"json",
		        					  type:"post",
		        					  async:false,
		        					  success:function(response){
		        						  if(response){
		        							  if(response.success){
		        								  xjValidate.showPopup(response.msg,"提示",true);
		        								  PIMList(1);
		        							  }else{
		        								  xjValidate.showPopup(response.msg,"提示",true);
		        							  }
		        						  }else{
		        							  xjValidate.showPopup("系统异常！","提示",true);
		        						  }
		        					  }
		        				  });
					          },
					          '取消': function () {
					          }
					      }
					  });
					
				}else {
					xjValidate.showPopup("付款已提交审核或已审核！","提示",true);
				}
			}
		});
	}
}


//审核付款信息
function AuditPaymentMation(PMIdsLength,PMIds){
	if(PMIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PMIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PMIdsLength=1){
		//根据选择的付款信息ID判断付款状态
		$.ajax({
			url:basePath+"/paymentInfo/findPaymentInfoMationById",
			data:{PMIds:PMIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				if(resp.msg==2){
					
					//付款审核模态框
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
									
									//根据操作id修改付款信息状态为审核通过
					  				 $.ajax({
					  					  url:basePath+"/paymentInfo/submitAuditOrAuditPaymentMation",
					  					  data:{"PMIds":PMIds,"sign":2,"auditOption":auditOption},
					  					  dataType:"json",
					  					  type:"post",
					  					  async:false,
					  					  success:function(response){
					  						  
					  						  if(response){
					  							  if(response.success){
					  								  xjValidate.showPopup(response.msg,"提示",true);
					  								 PIMList(1);
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
					  					  url:basePath+"/paymentInfo/submitAuditOrAuditPaymentMation",
					  					data:{"PMIds":PMIds,"sign":3,"auditOption":auditOption},
					  					  dataType:"json",
					  					  type:"post",
					  					  async:false,
					  					  success:function(response){
					  						  
					  						  if(response){
					  							  if(response.success){
					  								  xjValidate.showPopup(response.msg,"提示",true);
					  								  PIMList(1);
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
					
				}else {
					xjValidate.showPopup("付款未提交审核或已审核！","提示",true);
				}
			}
		});
	}
}

//进入修改付款信息模态框
function updatePaymentMationById(PMIdsLength,PMIds){
	if(PMIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PMIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(PMIdsLength=1){
		//根据选择的付款信息ID判断付款状态
		$.ajax({
			url:basePath+"/paymentInfo/findPaymentInfoMationById",
			data:{PMIds:PMIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				if(resp.msg==1 || resp.msg==4){
					$("#payment_id").val("4");
					$("#update_payM_id").val(PMIds);
					$("#payment_form").attr("action",
							basePath + "/paymentInfo/addOrSavePaymentInfoMationPage");
					$("#payment_form").submit();
				}else {
					xjValidate.showPopup("付款已提交审核或已审核！","提示",true);
				}
			}
		});
	}
}