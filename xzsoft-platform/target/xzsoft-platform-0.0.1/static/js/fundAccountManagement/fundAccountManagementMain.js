$(function(){
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
    findCapitalAccountFlowInfo(1);
  //全选/全不选
	$("body").on("click",".all_my_cap_check",function(){
		if($(".all_my_cap_check").is(":checked")){
			//全选时
			$(".sub_my_cap_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_my_cap_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//点击充值按钮
function recharge(){
	$("#CZZHName").val($("#zhName").text());
	$("#CZZHPrice").val($("#zhPrice").text());
	$("#CZKYPrice").val($("#kyPrice").text());
	$("#recharge_form").attr("action",
			basePath + "/fundAccountManagement/goRechargePage");
	$("#recharge_form").submit();
}

//点击提现按钮
function withdrawals(){
	$("#TXZHName").val($("#zhName").text());
	$("#TXZHPrice").val($("#zhPrice").text());
	$("#TXKYPrice").val($("#kyPrice").text());
	$("#withdrawals_form").attr("action",
			basePath + "/fundAccountManagement/goWithdrawalsPage");
	$("#withdrawals_form").submit();
}

//资金账户流水信息
function findCapitalAccountFlowInfo(number){
	
	var balanceOfPaymentsType=$("#balanceOfPaymentsType").val();
	var transactionStartDate=$("#transactionStartDate").val();
	var transactionEndDate=$("#transactionEndDate").val();
	//禁止多次追加
	$("#findCapitalAccountFlowInfoList").html("");
	
	//调用ajax拼接参数
	$.ajax({
		url:basePath+"/fundAccountManagement/findCapitalAccountFlowInfo",
		data:{
			"balanceOfPaymentsType":balanceOfPaymentsType,
			"transactionStartDate":transactionStartDate,
			"transactionEndDate":transactionEndDate,
			"page":number-1,
			"rows":10
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var obj=eval(resp);
			$.each(obj,function(index,ele){
				
				if(ele.transactionInformation==1){
					transactionInformation="支付宝支付";
				}else if(ele.transactionInformation==2){
					transactionInformation="支付宝提现";
				}else if(ele.transactionInformation==3){
					transactionInformation="微信支付";
				}else if(ele.transactionInformation==4){
					transactionInformation="微信提现";
				}else if(ele.transactionInformation==5){
					transactionInformation="运单保证金冻结";
				}else if(ele.transactionInformation==6){
					transactionInformation="运单保证金解冻";
				}else if(ele.transactionInformation==7){
					transactionInformation="运单支付";
				}else if(ele.transactionInformation==8){
					transactionInformation="运单收款";
				}else if(ele.transactionInformation==9){
					transactionInformation="投标保证金冻结";
				}else if(ele.transactionInformation==10){
					transactionInformation="投标保证金解冻";
				}
				
				if(ele.balanceOfPaymentsType==1){
					ele.balanceOfPaymentsType="充值";
				}else if(ele.balanceOfPaymentsType==2){
					ele.balanceOfPaymentsType="提现";
				}else if(ele.balanceOfPaymentsType==3){
					ele.balanceOfPaymentsType="保证金冻结";
				}else if(ele.balanceOfPaymentsType==4){
					ele.balanceOfPaymentsType="保证金解冻";
				}else if(ele.balanceOfPaymentsType==5){
					ele.balanceOfPaymentsType="现金收款";
				}else if(ele.balanceOfPaymentsType==6){
					ele.balanceOfPaymentsType="现金付款";
				}else if(ele.balanceOfPaymentsType==7){
					ele.balanceOfPaymentsType="综合付款(现金+有价券)";
				}
				
				if(ele.paymentCompanyName===null){
					ele.paymentCompanyName="";
				}
				
				if(ele.couponSupplierName===null){
					ele.couponSupplierName="";
				}
				
				if(ele.transactionChannel==1){
					ele.transactionChannel="网络银行";
				}
				
				var tr = " <tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_my_cap_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="<td>"+(index+1)+"</td>";
				tr+="<td>"+ele.serialNumber+"</td>";
				tr+="<td>"+ele.documentNumber+"</td>";
				tr+="<td>"+transactionInformation+"</td>";
				tr+="<td>"+ele.balanceOfPaymentsType+"</td>";
				tr+="<td>"+ele.couponTransactionAmount+"</td>";
				if(ele.transactionInformation==1 || ele.transactionInformation==3 || ele.transactionInformation==8){
					tr+="<td>"+"转入 "+ele.cashTransactionAmount+"</td>";
				}else if(ele.transactionInformation==2 || ele.transactionInformation==4 || ele.transactionInformation==7){
					tr+="<td>"+"支出 "+ele.cashTransactionAmount+"</td>";
				}else if(ele.transactionInformation==5 || ele.transactionInformation==9){
					tr+="<td>"+"冻结 "+ele.cashTransactionAmount+"</td>";
				}else if(ele.transactionInformation==6 || ele.transactionInformation==10){
					tr+="<td>"+"解冻 "+ele.cashTransactionAmount+"</td>";
				}
				tr+="<td>"+ele.accountBalance+"</td>";
				tr+="<td>"+ele.coverFreezingAmount+"</td>";
				tr+="<td>"+ele.availableBalance+"</td>";
				tr+="<td>"+ele.freezingAmount+"</td>";
				tr+="<td>"+ele.transactionDateStr+"</td>";
				tr+="<td>"+ele.transactionChannel+"</td>";
				tr+="<td>"+ele.paymentCompanyName+"</td>";
				tr+="<td>"+ele.couponSupplierName+"</td>";
				$("#findCapitalAccountFlowInfoList").append(tr);
			});
		}
	});
	
	$.ajax({
		url:basePath+"/fundAccountManagement/getCapitalAccountFlowInfoCount",
		data:{
			"balanceOfPaymentsType":balanceOfPaymentsType,
			"transactionStartDate":transactionStartDate,
			"transactionEndDate":transactionEndDate,
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			parent.getCapTotalRecords=resp;
			pagination.setTotalItems(resp);
			$("#cap-num").text("搜索结果共"+resp+"条");
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
		  findCapitalAccountFlowInfo (current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getCapTotalRecords+9)/10);
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
$("#resetCapMation").click(function(){
	setTimeout(function(){
		$("#balanceOfPaymentsType").val("");
		$("#transactionStartDate").val("");
		$("#transactionEndDate").val("");
		findCapitalAccountFlowInfo(1);
	},400);
});

//获取选择的id
function getCapIds(){
	var capIds=new Array;
	$(".sub_my_cap_check").each(function(){
		if($(this).is(":checked")){
			capIds.push($(this).attr("data-id"));
		}
	});
	return capIds.join(",");
}

//导出
$("#exportSettlement").click(function(){
	
	var ids=getCapIds();
	
	if(ids.length<1){
		$.alert("请选择要导出的数据!");
		return false;
	}
	
	var url = basePath+ "/fundAccountManagement/exportCapitalAccountFlowInfo?ids="+ids;
	window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes");
	
	/*var ids = "";
	var type = 1;
	DownLoadReportIMG('');
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0) {
      xjValidate.showPopup("请选择要导出的数据","提示");
      return;
    }
	$("#SettlementCheck:checked").each(function() {
		   var id = $(this).parents("tr").children().eq(39).html();
		   ids += id+",";
		    });
	var url = basePath+ "/settlementInfo/exportSettlementLosses?ids="+ids+"&type="+type;
	window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes"); */
	/*$.ajax({
    	url:basePath+ "/settlementInfo/exportSettlementLosses",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"ids":ids,"url":url,"name":name},
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	if(data == true){
        		xjValidate.showPopup("导出成功","提示");
        	}
        }
    });*/
});