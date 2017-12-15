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
    biddingFrozenList(1);
    //全选/全不选
	$("body").on("click",".all_bidding_frozen",function(){
		if($(".all_bidding_frozen").is(":checked")){
			//全选时
			$(".sub_bidding_frozen").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_bidding_frozen").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//点击返回进入资金账户主页面
function backRootFundAccountPage(){
	window.location.href=basePath+"/fundAccountManagement/goRootFundAccountManagementPage";
}

//投标被冻结信息全查
function biddingFrozenList(number){
	
	var biddingOrg=$.trim($("#biddingOrg").val());
	var frozenStartDate=$.trim($("#frozenStartDate").val());
	var frozenEndDate=$.trim($("#frozenEndDate").val());
	
	//禁止多次追加
	$("#biddingFrozenList").html("");
	
	$.ajax({
		url:basePath+"/fundAccountManagement/biddingCoverFrozenList",
		data:{
			"biddingOrg":biddingOrg,
			"frozenStartDate":frozenStartDate,
			"frozenEndDate":frozenEndDate,
			"page":number-1,
			"rows":10,
			"sign":1
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var obj=eval(resp);
			$.each(obj,function(index,ele){
				
				if(ele.paymentMethod==1){
					ele.paymentMethod="100%货到付款";
				}else if(ele.paymentMethod==2){
					ele.paymentMethod="预付款100%";
				}else if(ele.paymentMethod==3){
					ele.paymentMethod="预付10%,货到验收合格后付款80%,质保金10%";
				}else if(ele.paymentMethod==4){
					ele.paymentMethod="预付10%,货到验收合格后付款90%";
				}
				
				var tr = " <tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_bidding_frozen' data-id=\""+ele.id+"\" ></label></td>";
				tr+="<td>"+(index+1)+"</td>";
				tr+="<td>"+ele.biddingCode+"</td>";
				tr+="<td>"+ele.biddingOrgName+"</td>";
				tr+="<td>"+ele.biddingName+"</td>";
				tr+="<td>"+ele.paymentMethod+"</td>";
				tr+="<td>"+ele.forwardingUnit+"</td>";
				tr+="<td>"+ele.consignee+"</td>";
				tr+="<td>"+ele.goodsName+"</td>";
				tr+="<td>"+ele.lineName+"</td>";
				tr+="<td>"+ele.offerPrice+"</td>";
				tr+="<td>"+ele.bidPrice+"</td>";
				tr+="<td>"+ele.cautionMoney+"</td>";
				tr+="<td>"+ele.offerName+"</td>";
				tr+="<td>"+ele.freezingStartDateStr+"</td>";
				tr+="<td>"+ele.userName+"</td>";
				$("#biddingFrozenList").append(tr);
			});
		}
	});
	$.ajax({
		url:basePath+"/fundAccountManagement/getBiddingCoverFrozenListCount",
		data:{
			"biddingOrg":biddingOrg,
			"frozenStartDate":frozenStartDate,
			"frozenEndDate":frozenEndDate,
			"sign":1
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			parent.getbiddingCoverTotalRecords=resp;
			pagination.setTotalItems(resp);
			$("#bidding_frozen").text("搜索结果共"+resp+"条");
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
		  biddingFrozenList (current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getbiddingCoverTotalRecords+9)/10);
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
	
//重置招标被冻结信息
function resetBiddingFrozen(){
	setTimeout(function(){
		biddingFrozenList(1);
	},500);
}

//拼接选择的id
function getCapIds(){
	var ids=new Array();
	$(".sub_bidding_frozen").each(function(){
		if($(this).is(":checked")){
			ids.push($(this).attr("data-id"));
		}
	});
	return ids.join(",");
}

//招标冻结信息导出
function biddingFreezeInformationExport(){
    var ids=getCapIds();

	if(ids.length<1){
		$.alert("请选择要导出的数据!");
		return false;
	}
	
	var url = basePath+ "/fundAccountManagement/biddingFreezeInformationExport?ids="+ids+"&sign="+2;
	window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes");
}