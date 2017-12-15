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
    wayCoverFrozenList(1);
    //全选/全不选
	$("body").on("click",".all_way_cover_frozen",function(){
		if($(".all_way_cover_frozen").is(":checked")){
			//全选时
			$(".sub_way_cover_frozen").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_way_cover_frozen").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//点击返回进入资金账户主页面
function backRootFundAccountPage(){
	window.location.href=basePath+"/fundAccountManagement/goRootFundAccountManagementPage";
}

//运单被冻结金额全查
function wayCoverFrozenList(number){
	
	//禁止多次追加
	$("#wayCoverFrozenTBody").html("");
	
	$.ajax({
		url:basePath+"/fundAccountManagement/findWayCoverFrozenList",
		data:{
			"sign":1,
			"wayCode":$("#wayCode").val(),
			"createStartDate":$("#createStartDate").val(),
			"createEndDate":$("#createEndDate").val(),
			"page":number-1,
			"rows":10
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var obj=eval(resp);
			$.each(obj,function(index,ele){
				
				if(ele.waybillStatus==1){
					ele.waybillStatus="新建";
				}else if(ele.waybillStatus==2){
					ele.waybillStatus="已派发";
				}else if(ele.waybillStatus==3){
					ele.waybillStatus="已撤回";
				}else if(ele.waybillStatus==4){
					ele.waybillStatus="已拒绝";
				}else if(ele.waybillStatus==5){
					ele.waybillStatus="已结单";
				}else if(ele.waybillStatus==6){
					ele.waybillStatus="已装货";
				}else if(ele.waybillStatus==7){
					ele.waybillStatus="在途";
				}else if(ele.waybillStatus==8){
					ele.waybillStatus="已卸货";
				}else if(ele.waybillStatus==9){
					ele.waybillStatus="已挂账";
				}else if(ele.waybillStatus==10){
					ele.waybillStatus="已发布";
				}else if(ele.waybillStatus==11){
					ele.waybillStatus="已回收报价";
				}
				
				if(ele.waybillType==undefined){
					ele.waybillType="";
				}
				
				if(ele.shipperName==undefined){
					ele.shipperName="";
				}
				
				if(ele.driverName==undefined){
					ele.driverName="";
				}
				
				if(ele.goodsName==undefined){
					ele.goodsName="";
				}
				
				if(ele.scatteredGoods==undefined){
					ele.scatteredGoods="";
				}
				
				var tr = " <tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_way_cover_frozen' data-id=\""+ele.id+"\" ></label></td>";
				tr+="<td>"+(index+1)+"</td>";
				tr+="<td>"+ele.waybillId+"</td>";
				tr+="<td>"+ele.waybillStatus+"</td>";
				tr+="<td>"+ele.waybillType+"</td>";
				tr+="<td>"+ele.entrustName+"</td>";
				tr+="<td>"+ele.shipperName+"</td>";
				tr+="<td>"+ele.driverName+"</td>";
				tr+="<td>"+ele.goodsName+"</td>";
				tr+="<td>"+ele.scatteredGoods+"</td>";
				tr+="<td>"+ele.lineStart+"</td>";
				tr+="<td>"+ele.lineEnd+"</td>";
				tr+="<td>"+ele.offerPrice+"</td>";
				tr+="<td>"+ele.cautionMoney+"</td>";
				tr+="<td>"+ele.freezingStartDateStr+"</td>";
				tr+="<td>"+ele.forwardingUnit+"</td>";
				tr+="<td>"+ele.consignee+"</td>";
				tr+="<td>"+ele.createTimeStr+"</td>";
				tr+="<td>"+ele.userName+"</td>";
				tr+="</tr>";
				$("#wayCoverFrozenTBody").append(tr);
			});
		}
	});
	$.ajax({
		url:basePath+"/fundAccountManagement/getWayCoverFrozenListCount",
		data:{
			"sign":1,
			"wayCode":$("#wayCode").val(),
			"createStartDate":$("#createStartDate").val(),
			"createEndDate":$("#createEndDate").val()
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			parent.getWayCoverTotalRecords=resp;
			pagination.setTotalItems(resp);
			$("#way_cover_frozen_num").text("搜索结果共"+resp+"条");
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
		  wayCoverFrozenList (current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getWayCoverTotalRecords+9)/10);
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
	
//重置运单被冻结信息
function resetWayCoverFrozen(){
	setTimeout(function(){
		wayCoverFrozenList(1);
	},500);
}

//拼接选择的id
function getCapIds(){
	var ids=new Array();
	$(".sub_way_cover_frozen").each(function(){
		if($(this).is(":checked")){
			ids.push($(this).attr("data-id"));
		}
	});
	return ids.join(",");
}

//运单被冻结信息导出
function wayCoverFreezeInformationExport(){
	 var ids=getCapIds();

		if(ids.length<1){
			$.alert("请选择要导出的数据!");
			return false;
		}
		
		var url = basePath+ "/fundAccountManagement/wayFreezeInformationExport?ids="+ids+"&sign="+2;
		window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes");
}