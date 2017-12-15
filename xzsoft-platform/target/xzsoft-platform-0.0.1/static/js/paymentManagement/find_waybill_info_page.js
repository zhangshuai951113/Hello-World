$(function(){
	FWList(1);
	//全选/全不选
	$("body").on("click",".all_waybillInfo_check",function(){
		if($(".all_waybillInfo_check").is(":checked")){
			//全选时
			$(".sub_waybillInfo_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_waybillInfo_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//选择运单取消按钮
function closeWButton(){
	$("#find_waybill_info_model").html("");
}

//运单信息查询
function FWList(number){
	
	$("#waybillInfoTBody").html("");
	
	$.ajax({
		url:basePath+"/paymentInfo/selectWaybillInfoAllMation",
		data:{"page":number,"rows":10},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				var shipperName=ele.shipperName;
				if(ele.shipperName==null){
					shipperName="";
				}
				
				var goodsName=ele.goodsName;
				if(ele.goodsName==null){
					goodsName="";
				}
				
				var scatteredGoods=ele.scatteredGoods;
				if(ele.scatteredGoods==null){
					scatteredGoods="";
				}
				
				var driverName=ele.driverName;
				if(ele.driverName==null){
					driverName="";
				}
				
				var entrustProjectName=ele.entrustProjectName;
				if(ele.entrustProjectName==null){
					entrustProjectName="";
				}
				
				var carCode=ele.carCode;
				if(ele.carCode==null){
					carCode="";
				}
				var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_waybillInfo_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td>"+ele.id+"</td>";
				tr+="		<td>"+ele.waybillId+"</td>";
				tr+="		<td>"+shipperName+"</td>";
				tr+="		<td>"+goodsName+"</td>";
				tr+="		<td>"+scatteredGoods+"</td>";
				tr+="		<td>"+driverName+"</td>";
				tr+="		<td>"+entrustProjectName+"</td>";
				tr+="		<td>"+carCode+"</td>";
				tr+="</tr>";
				$("#waybillInfoTBody").append(tr);
			});
		}
	});
	//查询总数
	$.ajax({
		url:basePath+"/paymentInfo/getSelectWaybillInfoAllMationCount",
		data:"",
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
		  FWList(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getPlanInfoTotalRecords+9)/10);
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
//点击确定按钮
	function submitFWMation(){
		
		var FWIds=new Array();
		
		$(".sub_waybillInfo_check").each(function(){
			if($(this).is(":checked")){
				FWIds.push($(this).attr("data-id"));
			}
		});
		var FWIdsLength=FWIds.length;
		checkFWMation(FWIds.join(","),FWIdsLength);
	}
	
	function checkFWMation(FWIds,FWIdsLength){
		if(FWIdsLength>1){
			xjValidate.showTip("请选择一条记录!");
		}else if(FWIdsLength>1){
			xjValidate.showTip("请选择一条记录!");
		}else if(FWIdsLength=1){
			
			$.confirm({
			      title: '提示',
			      content: '您确定要选择这条记录吗？',
			      buttons: {
			          '确定': function () {
			        	  
			        	  //根据选择ID查询运单信息
			        	  $.ajax({
			        		  url:basePath+"/paymentInfo/selectWaybillInfoAllMationById",
			        		  data:{FWIds:FWIds},
			        		  dataType:"json",
			        		  type:"post",
			        		  async:false,
			        		  success:function(resp){
			        			  if(resp){
			        				  $("#proxyPersonName").val("");//代理人名称
			        				  $("#proxyPerson").val("");//代理人
			        				  $("#paymentPersonName").val("");//支付人
			        				  $("#paymentPerson").val("");//支付人
			        				  $("#PpaymentCompanyName").val("");//支付单位
									  $("#PpaymentCompany").val("");//支付单位id
									  $("#waybillInfoName").val("");//运单号
			        				  $("#waybillInfoId").val("");
			        				  $("#carCode").val("");//车牌号
			        				  $("#projectInfoName").val("");//项目名称
			        				  $("#projectInfoId").val("");
			        				  //$("#paymentPerson").val(resp.userInfoId);//支付人
			        				  //$("#paymentCompany").val(resp.userInfoId);//支付单位
			        				  $("#goodsInfoName").val("");//货物
			        				  $("#goodsInfoId").val("");//货物编号
			        				  $("#scatteredGoods").val("");//零散货物
				        			  $("#customerName").val("");//客户名称
				        			  $("#customerId").val("");//客户编号
			        				  var shipper=resp.shipper;
			        				  var driverUserRole=resp.driverUserRole;
			        				  if(resp.userInfoId!=null){
			        					  var userInfoId=resp.userInfoId;
			        					  
			        					  //查询代理人是否为空
				        				  $.ajax({
				        						url:basePath+"/paymentInfo/getSelectProxyInfoAllMationCount",
				        						data:"",
				        						dataType:"json",
				        						type:"post",
				        						async:false,
				        						success:function(response){
				        							//不为空，选择代理人
				        							if(response>=1){
				        								 $("#proxy_person").show();
				        								 $("#WidCard").val("");//身份证号
	        											 $("#WbankCardId").val("");//银行账号
	        											 $("#WbankName").val("");//开户行
	        											 $.ajax({
				        										url:basePath+"/paymentInfo/selectDriverInfoMationByUserInfoId",
				        										data:{userInfoId:userInfoId,"driverUserRole":driverUserRole},
				        										dataType:"json",
				        										type:"post",
				        										async:false,
				        										success:function(obj){
					        											$("#PpaymentCompany").val(obj.id);//支付单位id
					        											$("#paymentPerson").val(obj.id);//支付人
				        										}
				        									});
				        							}else 
				        								//为空，不选择代理人,根据司机编号查询司机表信息
				        								if(response==0){
				        									$.ajax({
				        										url:basePath+"/paymentInfo/selectDriverInfoMationByUserInfoId",
				        										data:{userInfoId:userInfoId,"driverUserRole":driverUserRole},
				        										dataType:"json",
				        										type:"post",
				        										async:false,
				        										success:function(obj){
				        												$("#WidCard").val(obj.idCard);//身份证号
					        											$("#WbankCardId").val(obj.bankAccount);//银行账号
					        											$("#WbankName").val(obj.openingBank);//开户行
					        											$("#PpaymentCompany").val(obj.id);//支付单位id
					        											$("#paymentPerson").val(obj.id);//支付人
				        										}
				        									});
				        							}
				        						}
				        					});
				        				  $("#paymentPersonName").val(resp.driverName);//支付人
				        				  //$("#paymentPerson").val(resp.userInfoId);//支付人
				        				  $("#PpaymentCompanyName").val(resp.driverName);//支付单位
										  //$("#PpaymentCompany").val(resp.userInfoId);//支付单位id
				        			  }else if(resp.userInfoId==null){
				        				  $("#proxy_person").hide();
				        				  $("#paymentPersonName").val("");//支付人
				        				  $("#paymentPerson").val("");//支付人
				        				  $("#PpaymentCompanyName").val("");//支付单位
										  $("#PpaymentCompany").val("");//支付单位id
				        				  //根据承运方查询组织机构信息
				        				  $.ajax({
				        					  url:basePath+"/paymentInfo/selectOrgInfoMationById",
				        					  data:{shipper:shipper},
				        					  dataType:"json",
				        					  type:"post",
				        					  async:false,
				        					  success:function(e){
				        						  if(e){
				        							  	$("#WidCard").val(e.idCard);//身份证号码
	        											$("#WbankCardId").val(e.bankAccount);//银行账号
	        											$("#WbankName").val(e.bankName);//开户行
	        											$("#PpaymentCompanyName").val(e.orgName);//支付单位
	        											$("#PpaymentCompany").val(e.orgInfoId);//支付单位
				        						  }else{
				        							  xjValidate.showTip("系统异常!");
				        						  }
				        					  }
				        				  });
				        			  }
			        				 
			        				  $("#waybillInfoName").val(resp.waybillId);//运单号
			        				  $("#waybillInfoId").val(resp.id);
			        				  $("#carCode").val(resp.carCode);//车牌号
			        				  $("#projectInfoName").val(resp.entrustProjectName);//项目名称
			        				  $("#projectInfoId").val(resp.entrustProject);
			        				  //$("#paymentPerson").val(resp.userInfoId);//支付人
			        				  //$("#paymentCompany").val(resp.userInfoId);//支付单位
			        				  $("#goodsInfoName").val(resp.goodsName);//货物
			        				  $("#goodsInfoId").val(resp.goodsInfoId);//货物编号
			        				  $("#scatteredGoods").val(resp.scatteredGoods);//零散货物
				        			  $("#customerName").val(resp.entrustName);//客户名称
				        			  $("#customerId").val(resp.entrust);//客户编号
				        			  if(resp.shipper!=null){
				        				  $("#prePaymentObject").val(1);
				        			  }else if(resp.shipper==null){
				        				  $("#prePaymentObject").val(2);
				        			  }
				        			  
				        			  $("#find_waybill_info_model").html("");
			        			  }else{
			        				  xjValidate.showTip("系统异常!");
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
	