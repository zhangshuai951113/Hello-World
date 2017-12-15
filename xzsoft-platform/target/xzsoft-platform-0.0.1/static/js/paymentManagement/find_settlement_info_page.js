$(function(){
	SIList(1);
	//全选/全不选
	$("body").on("click",".all_settlement_info_check",function(){
		if($(".all_settlement_info_check").is(":checked")){
			//全选时
			$(".sub_settlement_info_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_settlement_info_check").each(function(){
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
//分页
var pagination = $(".pagination-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  SIList(current);
	  }
	});
//结算信息全查
function SIList(number){
	
	$("#settlementInfoTBody").html("");
	$.ajax({
		url:basePath+"/paymentInfo/findSettlementInfoMationAll",
		data:{
			"page":number,
			"rows":10,
			"waybillId":$("#settWaybillIdS").val(),
			"paymentObject":$("#paymentObject").val(),
			"carCode":$("#carCodeS").val(),
			"goodsName":$("#goodsNameS").val(),
			"forwardingTime":$("#forwardingTimeS").val(),
			"arriveTime":$("#arriveTimeS").val(),
			"forwardingUnit":$("#forwardingUnitS").val(),
			"consignee":$("#consigneeS").val(),
			"forwardingTonnage":$("#forwardingTonnageS").val(),
			"arriveTonnage":$("#arriveTonnageS").val(),
			"incomeTax":$("#incomeTaxS").val(),
			"transportPriceIncomeTax":$("#transportPriceIncomeTaxS").val(),
			"transportPriceCost":$("#transportPriceCostS").val(),
			"couponIncomeTax":$("#couponIncomeTaxS").val(),
			"advancePrice":$("#advancePriceS").val(),
			"otherPrice":$("#otherPriceS").val(),
			"lossDeduction":$("#lossDeductionS").val(),
			"makeTimeStart":$("#makeTimeStartS").val(),
			"makeTimeEnd":$("#makeTimeEndS").val(),
			"settlementId":$("#settlementIdS").val(),
			"proxyName":$("#proxyNameS").val(),
			"projectInfoName":$("projectInfoNameS").val()
			},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				//非空判断
				//货物名称
				if(ele.goodsName==null){
					ele.goodsName="";
				}
				//结算单号
				if(ele.couponUseInfoId==null){
					ele.couponUseInfoId="";
				}
				//运单号
				if(ele.waybillId==null){
					ele.waybillId="";
				}
				//车牌号
				if(ele.carCode==null){
					ele.carCode="";
				}
				//零散货物
				if(ele.scatteredGoods==null){
					ele.scatteredGoods="";
				}
				//发货时间
				if(ele.forwardingTimeStr==null){
					ele.forwardingTimeStr="";
				}
				//到货时间
				if(ele.arriveTimeStr==null){
					ele.arriveTimeStr="";
				}
				//发货吨位
				if(ele.forwardingTonnage==null){
					ele.forwardingTonnage="";
				}
				//到货吨位
				if(ele.arriveTonnage==null){
					ele.arriveTonnage="";
				}
				//线路名称
				if(ele.lineName==null){
					ele.lineName="";
				}
				//承运方名称
				if(ele.shipperName==null){
					ele.shipperName="";
				}
				//司机名称
				if(ele.driverName==null){
					ele.driverName="";
				}
				//代理方名称
				if(ele.proxyName==null){
					ele.proxyName="";
				}
				//代开总额
				if(ele.proxyInvoiceTotal==null){
					ele.proxyInvoiceTotal="";
				}
				//组织部门名称
				if(ele.projectName==null || ele.projectName==''){
					ele.projectName="";
				}
				//当前运价
				if(ele.currentTransportPrice==null){
					ele.currentTransportPrice="";
				}
				//应付运费
				if(ele.payablePrice==null){
					ele.payablePrice="";
				}
				//运费成本
				if(ele.transportPriceCost==null){
					ele.transportPriceCost="";
				}
				//进项税
				if(ele.incomeTax==null){
					ele.incomeTax="";
				}
				//本次付款
				if(ele.thisPayPrice==null){
					ele.thisPayPrice="";
				}
				//工本费
				if(ele.costPrice==null){
					ele.costPrice="";
				}
				//单车保险
				if(ele.singleCarInsurance==null){
					ele.singleCarInsurance="";
				}
				//其他扣款
				if(ele.otherPrice==null){
					ele.otherPrice="";
				}
				if(ele.couponName==null){
					ele.couponName="";
				}
				
				if(ele.settlementStatus==3){
					ele.settlementStatus="未付款";
				}else if(ele.settlementStatus==6){
					ele.settlementStatus="部分付款";
				}
				
				var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_settlement_info_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td>"+ele.settlementId+"</td>";
				tr+="		<td style='color:red'>"+ele.settlementStatus+"</td>";
				tr+="		<td>"+ele.waybillId+"</td>";
				tr+="		<td>"+ele.carCode+"</td>";
				tr+="		<td>"+ele.proxyName+"</td>";
				tr+="		<td>"+ele.goodsName+"</td>";
				tr+="		<td>"+ele.scatteredGoods+"</td>";
				tr+="		<td>"+ele.forwardingTimeStr+"</td>";
				tr+="		<td>"+ele.arriveTimeStr+"</td>";
				tr+="		<td>"+ele.forwardingTonnage+"</td>";
				tr+="		<td>"+ele.arriveTonnage+"</td>";
				tr+="		<td>"+ele.lineName+"</td>";
				tr+="		<td>"+ele.forwardingUnit+"</td>";
				tr+="		<td>"+ele.consignee+"</td>";
				tr+="		<td>"+ele.shipperName+"</td>";
				tr+="		<td>"+ele.driverName+"</td>";
				tr+="		<td>"+ele.proxyInvoiceTotal+"</td>";
				tr+="		<td>"+ele.projectName+"</td>";
				tr+="		<td>"+ele.currentTransportPrice+"</td>";
				tr+="		<td>"+ele.payablePrice+"</td>";
				tr+="		<td>"+ele.transportPriceCost+"</td>";
				tr+="		<td>"+ele.transportPriceIncomeTax+"</td>";
				tr+="		<td>"+ele.incomeTax+"</td>";
				tr+="		<td>"+ele.thisPayPrice+"</td>";
				tr+="		<td>"+ele.costPrice+"</td>";
				tr+="		<td>"+ele.singleCarInsurance+"</td>";
				tr+="		<td>"+ele.otherPrice+"</td>";
				tr+="</tr>";
				$("#settlementInfoTBody").append(tr);
			});
		}
	});
	//查询总数
	$.ajax({
		url:basePath+"/paymentInfo/getSettlementInfoMationAllCount",
		data:{
			"waybillId":$("#settWaybillIdS").val(),
			"paymentObject":$("#paymentObject").val(),
			"carCode":$("#carCodeS").val(),
			"goodsName":$("#goodsNameS").val(),
			"forwardingTime":$("#forwardingTimeS").val(),
			"arriveTime":$("#arriveTimeS").val(),
			"forwardingUnit":$("#forwardingUnitS").val(),
			"consignee":$("#consigneeS").val(),
			"forwardingTonnage":$("#forwardingTonnageS").val(),
			"arriveTonnage":$("#arriveTonnageS").val(),
			"incomeTax":$("#incomeTaxS").val(),
			"transportPriceIncomeTax":$("#transportPriceIncomeTaxS").val(),
			"transportPriceCost":$("#transportPriceCostS").val(),
			"couponIncomeTax":$("#couponIncomeTaxS").val(),
			"advancePrice":$("#advancePriceS").val(),
			"otherPrice":$("#otherPriceS").val(),
			"lossDeduction":$("#lossDeductionS").val(),
			"makeTimeStart":$("#makeTimeStartS").val(),
			"makeTimeEnd":$("#makeTimeEndS").val(),
			"settlementId":$("#settlementIdS").val(),
			"proxyName":$("#proxyNameS").val(),
			"projectInfoName":$("projectInfoNameS").val()
			},
		dataType:"json",
		type:"post",
		success:function(resp){
			parent.getPlanInfoTotalRecords=resp;
			pagination.setTotalItems(resp);
			$("#panel-num").text("搜索结果共"+resp+"条");
		}
	});
}


	
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
	
	//重置
	function resetSettInfo(){
		setTimeout(function(){
			SIList(1);
		},100);
	}
	
	//关闭模态款
	function closeSIutton(){
		$("#find_settlement_info_model").html("");
	}
	
	//点击确定按钮
	function submitSIMation(){
		
		var SIIds=new Array();
		$(".sub_settlement_info_check").each(function(){
			if($(this).is(":checked")){
				SIIds.push($(this).attr("data-id"));
			}
		});
		var SIIdsLength=SIIds.length;
		checkSIMation(SIIds.join(","),SIIdsLength);
	}
	
getFloat = function (number, n) { 
	  n = n ? parseInt(n) : 0; 
	  if (n <= 0) return Math.round(number); 
	  number = Math.round(number * Math.pow(10, n)) / Math.pow(10, n); 
	  return number; 
	};
	
function toDecimal2(x) {  
    var f = parseFloat(x);  
    if (isNaN(f)) {  
        return false;  
    }  
    var f = Math.round(x*100)/100;  
    var s = f.toString();  
    var rs = s.indexOf('.');  
    if (rs < 0) {  
        rs = s.length;  
        s += '.';  
    }  
    while (s.length <= rs + 4) {  
        s += '0';  
    }  
    return s;  
}



//提交选择结算信息
function checkSIMation(SIIds,SIIdsLength){
	
		$.confirm({
		      title: '提示',
		      content: '您确定要选择这些记录吗？',
		      buttons: {
		    	  '确定': function () {
		    		  
		    		  //判断批量选择的结算信息的代理方、承运方、司机编号是否一致
		    		  $.ajax({
		    			  url:basePath+"/paymentInfo/findSettlementInfoMationShipperAndDriverAndProxy",
		    			  data:{"SIIds":SIIds},
	    				  dataType:"json",
	    				  type:"post",
	    				  async:false,
	    				  success:function(obj){
	    					  if(obj){
	    						  if(obj.success){
	    							//根据选择的结算ID查询结算信息
	    							  $.ajax({
	    				    				url:basePath+"/paymentInfo/findSettlementInfoMationById",
	    				    				data:{SIIds:SIIds},
	    				    				dataType:"json",
	    				    				type:"post",
	    				    				async:false,
	    				    				success:function(resp){
	    				    					console.log(resp);
	    				    					if(SIIdsLength>1){
	    				    						$("#thisPayPrice").attr("readonly",true);
	    				    					}else{
	    				    						$("#thisPayPrice").attr("readonly",false);
	    				    					}
	    				    					
	    				    					$("#settlementInfoInfoId").val("");//结算单号
	    				    					/*$("#waybillId").val("");//运单号
	    				    					$("#carCode").val("");//车牌号
	    				    					$("#projectInfoName").val("");//组织部门名称
	    				    					$("#projectInfoId").val("");//组织部门
	    				    					$("#goodsInfoName").val("");//货物名称
	    				    					$("#goodsInfoId").val("");//货物
	    				    					$("#scatteredGoods").val("");//零散货物
	    				    					$("#lineInfoName").val("");//线路名称
	    				    					$("#lineInfoId").val("");//线路
	    				    					$("#forwardingTime").val("");//发货时间
	    				    					$("#arriveTime").val("");//到货时间
	    				    					$("#transportPrice").val("");//运价
	    		*/		    					$("#forwardingTonnage").val("");//发货吨位
	    				    					$("#arriveTonnage").val("");//到货吨位
	    				    					$("#singleCarInsurance").val("");//单车保险
	    				    					$("#costPrice").val("");//工本费
	    				    					$("#otherPrice").val("");//其他扣款
	    				    					$("#transportPriceCost").val("");//运费成本
	    				    					$("#transportPriceIncomeTax").val("");//运费进项税
	    				    					$("#incomeTax").val("");//进项税
	    				    					$("#payablePrice").val("");//因付费用
	    				    					$("#proxyPerson").val("");
	    		    							$("#WidCard").val("");//身份证号
	    										$("#WbankCardId").val("");//银行账号
	    										$("#WbankName").val("");//开户行
	    										$("#paymentPersonName").val("");//支付人名称
	    		    							$("#paymentPerson").val("");//支付人
	    		    							$("#CpaymentCompanyName").val("");//支付单位名称
	    		    							$("#CpaymentCompany").val("");//支付单位
	    		    							/*$("#customerName").val("");//客户名称
	    										$("#customerId").val("");//客户编号
	    		*/								$("#proxyPersonName").val("");//代理人
	    										$("#proxyPerson").val("");//代理人ID
	    										$("#user_role").val(resp.userRole);
	    										if(resp.userRole==2){
	    											$("#customerNamePage").css("display","block");
	    										}
	    										$("#proxy_person").hide();
	    				    					if(resp){
	    				    						var userInfoId=resp.userInfoId; 
	    					    					var isProxyPayment=$("#isProxyPayment").val();//是否代理付款
	    					    					var proxy=resp.proxy;
	    					    					var shipper=resp.shipper;
	    					    					var couponUseInfoId=resp.couponUseInfoId;
	    					    					$("#settlementInfoInfoIdName").val(resp.settlementId);
	    					    					$("#settlementInfoInfoId").val(SIIds);//结算单号
	    					    					$("#forwardingTonnage").val(resp.forwardingTonnageSum);//发货吨位
	    					    					$("#arriveTonnage").val(resp.arriveTonnageSum);//到货吨位
	    					    					$("#singleCarInsurance").val(resp.singleCarInsuranceSum);//单车保险
	    					    					$("#costPrice").val(resp.costPriceSum);//工本费
	    					    					$("#otherPrice").val(resp.otherPriceSum);//其他扣款
	    					    					$("#transportPriceCost").val(resp.transportPriceCostSum);//运费成本
	    					    					$("#transportPriceIncomeTax").val(resp.transportPriceIncomeTaxSum);//运费进项税
	    					    					$("#incomeTax").val(resp.incomeTaxSum);//进项税
	    					    					$("#payablePrice").val(resp.thisPayPriceSum); //应付运费总和
	    					    					
	    					    					
	    					    					
	    					    					/*$("#waybillId").val(resp.waybillId);//运单号
	    					    					$("#carCode").val(resp.carCode);//车牌号
	    					    					$("#projectInfoName").val(resp.projectName);//组织部门名称
	    					    					$("#projectInfoId").val(resp.projectInfoId);//组织部门
	    					    					$("#goodsInfoName").val(resp.goodsName);//货物名称
	    					    					$("#goodsInfoId").val(resp.goodsInfoId);//货物
	    					    					$("#scatteredGoods").val(resp.scatteredGoods);//零散货物
	    					    					$("#lineInfoName").val(resp.lineName);//线路名称
	    					    					$("#lineInfoId").val(resp.lineInfoId);//线路
	    					    					$("#forwardingTime").val(resp.forwardingTimeStr);//发货时间
	    					    					$("#arriveTime").val(resp.arriveTimeStr);//到货时间
	    					    					$("#transportPrice").val(resp.currentTransportPrice);//运价*/
	    					    				/*	$("#forwardingTonnage").val(resp.forwardingTonnage);//发货吨位
	    					    					$("#arriveTonnage").val(resp.arriveTonnage);//到货吨位
	    					    					$("#singleCarInsurance").val(resp.singleCarInsurance);//单车保险
	    					    					$("#costPrice").val(resp.costPrice);//工本费
	    					    					$("#otherPrice").val(resp.otherPrice);//其他扣款
	    					    					$("#transportPriceCost").val(resp.transportPriceCost);//运费成本
	    					    					$("#transportPriceIncomeTax").val(resp.transportPriceIncomeTax);//运费进项税
	    					    					$("#incomeTax").val(resp.incomeTax);//进项税
	    					    					$("#payablePrice").val(resp.payablePrice);//因付费用
*/	    					    					$("#proxyPerson").val("");
	    			    							$("#WidCard").val("");//身份证号
	    											$("#WbankCardId").val("");//银行账号
	    											$("#WbankName").val("");//开户行
	    											$("#thisPayPrice").val("");//本次付费
	    											
	    											if(resp.proxy!=null){
	    												$("#paymentPersonName").val("");//支付人名称
						    							$("#paymentPerson").val("");//支付人
	    												$("#CpaymentCompanyName").val(resp.proxyName);//支付单位名称
    					    							$("#CpaymentCompany").val(resp.proxy);//支付单位
    					    							$("#proxy_person").hide();
    					    							$("#thisPayPrice").val(resp.proxyInvoiceTotalSum);//本次付费
					    								$("#payablePrice").val(resp.proxyInvoiceTotalSum);//因付费用
					    		        				  $.ajax({
					    		        					  url:basePath+"/paymentInfo/selectOrgInfoMationById",
					    		        					  data:{"shipper":proxy},
					    		        					  dataType:"json",
					    		        					  type:"post",
					    		        					  async:false,
					    		        					  success:function(w){
					    		        						  if(w){
					    		        							    $("#CpaymentCompanyName").val(w.orgName);//支付单位名称
					    				    							$("#CpaymentCompany").val(w.orgInfoId);//支付单位
					    		        							  	$("#WidCard").val(w.idCard);//身份证号码
					    												$("#WbankCardId").val(w.bankAccount);//银行账号
					    												$("#WbankName").val(w.bankName);//开户行
					    		        						  }else{
					    		        							  xjValidate.showTip("系统异常!");
					    		        						  }
					    		        					  }
					    		        				  });
    					    							
	    											}else{
	    												
	    												$("#paymentPersonName").val("");//支付人名称
						    							$("#paymentPerson").val("");//支付人
	    												$("#CpaymentCompanyName").val("");//支付单位名称
    					    							$("#CpaymentCompany").val("");//支付单位
    					    							$("#proxy_person").hide();
    					    							$("#thisPayPrice").val(resp.thisPayPriceSum);//本次付费
					    								$("#payablePrice").val(resp.thisPayPriceSum);//因付费用
					    								$("#proxy_person").show();
	    												
	    											}
	    											
	    											
	    											
	    					    					/*//司机编号不为空
	    					    					if(resp.userInfoId!=null){
	    					    						//是否代理付款为否时,支付人默认取司机编号,支付单位默认取司机编号
	    					    						if(isProxyPayment==0){
	    					    							$("#paymentPersonName").val(resp.driverName);//支付人名称
	    					    							$("#paymentPerson").val(resp.userInfoId);//支付人
	    					    							$("#CpaymentCompanyName").val(resp.driverName);//支付单位名称
	    					    							$("#CpaymentCompany").val(resp.userInfoId);//支付单位
	    					    							//查询是否存在代理人数据
	    					    							$.ajax({
	    					    	    						url:basePath+"/paymentInfo/getSelectProxyInfoAllMationCount",
	    					    	    						data:"",
	    					    	    						dataType:"json",
	    					    	    						type:"post",
	    					    	    						async:false,
	    					    	    						success:function(obj){
	    					    	    							//不为空，选择代理人
	    					    	    							if(obj>=1){
	    					    	    								 $("#proxy_person").show();
	    					    	    							}else 
	    					    	    								//为空，不选择代理人,根据司机编号查询司机表信息
	    					    	    								if(obj==0){
	    					    	    									$("#proxy_person").hide();
	    					    	    									$.ajax({
	    					    	    										url:basePath+"/paymentInfo/selectDriverInfoMationByUserInfoId",
	    					    	    										data:{userInfoId:userInfoId},
	    					    	    										dataType:"json",
	    					    	    										type:"post",
	    					    	    										async:false,
	    					    	    										success:function(e){
	    					    	    												$("#WidCard").val(e.idCard);//身份证号
	    					    	        											$("#WbankCardId").val(e.bankAccount);//银行账号
	    					    	        											$("#WbankName").val(e.openingBank);//开户行
	    					    	    										}
	    					    	    									});
	    					    	    							}
	    					    	    						}
	    					    	    					});
	    					    						}else 
	    					    							//如司机编号不为空且是否代理付款为是时支付单位默认取代理方
	    					    							if(isProxyPayment==1){
	    					    								//如果司机编号不为空，且是否代理付款为是，本次付费取代开总额
	    					    								$("#thisPayPrice").val(resp.proxyInvoiceTotalSum);//本次付费
	    					    								//应付费用取结算单代开总额
	    					    								$("#payablePrice").val(resp.proxyInvoiceTotalSum);//因付费用
	    					    								$("#paymentPersonName").val("");//支付人名称
	    						    							$("#paymentPerson").val("");//支付人
	    					    								//根据代理方查询组织机构信息
	    					    								$("#proxy_person").hide();
	    					    		        				  $.ajax({
	    					    		        					  url:basePath+"/paymentInfo/selectOrgInfoMationById",
	    					    		        					  data:{"shipper":proxy},
	    					    		        					  dataType:"json",
	    					    		        					  type:"post",
	    					    		        					  async:false,
	    					    		        					  success:function(w){
	    					    		        						  if(w){
	    					    		        							    $("#CpaymentCompanyName").val(w.orgName);//支付单位名称
	    					    				    							$("#CpaymentCompany").val(w.id);//支付单位
	    					    		        							  	$("#WidCard").val(w.idCard);//身份证号码
	    					    												$("#WbankCardId").val(w.bankAccount);//银行账号
	    					    												$("#WbankName").val(w.bankName);//开户行
	    					    		        						  }else{
	    					    		        							  xjValidate.showTip("系统异常!");
	    					    		        						  }
	    					    		        					  }
	    					    		        				  });
	    					    						}
	    					    					}else if(resp.userInfoId==null){
	    					    						$("#paymentPersonName").val("");//支付人名称
	    				    							$("#paymentPerson").val("");//支付人
	    					    						//根据承运方查询组织机构信息
	    			    								$("#proxy_person").hide();
	    			    		        				  $.ajax({
	    			    		        					  url:basePath+"/paymentInfo/selectOrgInfoMationById",
	    			    		        					  data:{"shipper":shipper},
	    			    		        					  dataType:"json",
	    			    		        					  type:"post",
	    			    		        					  async:false,
	    			    		        					  success:function(w){
	    			    		        						  if(w){
	    			    		        							  	$("#WidCard").val(w.idCard);//身份证号码
	    			    												$("#WbankCardId").val(w.bankAccount);//银行账号
	    			    												$("#WbankName").val(w.bankName);//开户行
	    			    		        						  }else{
	    			    		        							  xjValidate.showTip("系统异常!");
	    			    		        						  }
	    			    		        					  }
	    			    		        				  });
	    					    					}*/
	    					    					/*//如承运方字段不为空支付单位则取承运方
	    					    					if(resp.shipper!=null){
	    					    						$("#CpaymentCompanyName").val(resp.shipperName);//支付单位名称
	    					    						$("#CpaymentCompany").val(resp.shipper);//支付单位
	    					    					}*/
	    					    					/*//客户编号:  如选择结算单数据结算类型为“正常结算”
	    					    					if(resp.settlementType==1){
	    					    						//父运单编号不为空，根据登录用户条件组和父运单编号查询运单信息表委托方字段
	    					    						if(resp.parentWaybillInfoId!=null){
	    					    							//零散货物不为空，客户编好直接取父运单的委托方
	    						    						if(resp.scatteredGoods!=null){
	    						    							$.ajax({
	    						    								url:basePath+"/paymentInfo/findwaybillInfoMationByConditionGroupAndParentWaybillInfoId",
	    						    								data:{"parentWaybillInfoId":resp.parentWaybillInfoId,"status":1},
	    						    								dataType:"json",
	    						    								type:"post",
	    						    								async:false,
	    						    								success:function(response){
	    						    									if(response){
	    						    										$("#customerName").val(response.entrustName);//客户名称
	    						    										$("#customerId").val(response.entrust);//客户编号
	    						    									}
	    						    								}
	    						    							});
	    						    						}else{
	    						    							$.ajax({
	    						    								url:basePath+"/paymentInfo/findwaybillInfoMationByConditionGroupAndParentWaybillInfoId",
	    						    								data:{"parentWaybillInfoId":resp.parentWaybillInfoId,"status":2},
	    						    								dataType:"json",
	    						    								type:"post",
	    						    								async:false,
	    						    								success:function(response){
	    						    									if(response){
	    						    										$("#customerName").val(response.entrustName);//客户名称
	    						    										$("#customerId").val(response.entrust);//客户编号
	    						    									}
	    						    								}
	    						    							});
	    						    						}
	    					    						}else 
	    					    							//父运单编号为空则取选择的结算单数据委托方字段
	    					    							if(resp.parentWaybillInfoId==null){
	    					    								$("#customerName").val(resp.entrustName);//客户名称
	    					    								$("#customerId").val(resp.entrust);//客户编号
	    					    						}
	    					    					}else 
	    					    						//如选择结算单数据结算类型为“返单结算”
	    					    						if(resp.settlementType==2){
	    					    							$("#customerName").val(resp.entrustName);//客户名称
	    					    							$("#customerId").val(resp.entrust);//客户编号
	    					    					}*/
	    											
	    					    					//司机发票税金(如选择结算单数据代理方不为空则代开总额-应付费用，否则默认空)
	    					    					if(resp.proxy!=null){
	    					    						$("#driverInvoiceTax").val(resp.driverInvoiceTax);
	    					    					}else{
	    					    						$("#driverInvoiceTax").val("0");
	    					    					}
	    					    					
	    					    					//有价券金额、有价券进项税
	    					    					if(resp.couponUseTotalPriceSum!=null && resp.couponIncomeTaxSum!=''){
	    					    						$("#couponPrice").val(resp.couponUseTotalPriceSum);
	    											    $("#couponIncomeTax").val(resp.couponIncomeTaxSum);
	    					    					}else{
	    					    						$("#couponPrice").val("0");
	    											    $("#couponIncomeTax").val("0");
	    					    					}
	    					    					$("#settOrAcc").val(1);
	    					    					$("#find_settlement_info_model").html("");
	    				    					}else{
	    				    						xjValidate.showTip("系统异常!");
	    				    					}
	    				    				}
	    				    			});
	    						  }else{
	    							  $.alert(obj.msg);
	    						  }
	    					  }else{
	    						  $.alert("系统异常!");
	    					  }
	    				  }
		    		  });
		    	  },
		    	  '取消': function () {
		      }
		      }
		});
}