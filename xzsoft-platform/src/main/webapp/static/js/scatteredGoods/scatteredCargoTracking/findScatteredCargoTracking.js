$(function(){
	FSCTList(1);
});

function FSCTList(number){
	
	$("#findScatteredCargoTrackingTBody").html("");
	
	$.ajax({
		url:basePath+"/scatteredGoods/getFindScatteredCargoTrackingAllMation",
		data:{"STIds":$("#FSCTId").val(),"page":number,"rows":5},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				//判断显示条件
				//运单状态
				var waybillStatus="新建";
				if(ele.waybillStatus==2){
					waybillStatus="已派发";
				}else if(ele.waybillStatus==3){
					waybillStatus="已撤回";
				}else if(ele.waybillStatus==4){
					waybillStatus="已拒绝";
				}else if(ele.waybillStatus==5){
					waybillStatus="已接单";
				}else if(ele.waybillStatus==6){
					waybillStatus="已装货";
				}else if(ele.waybillStatus==7){
					waybillStatus="在途";
				}else if(ele.waybillStatus==8){
					waybillStatus="已卸货";
				}else if(ele.waybillStatus==9){
					waybillStatus="已挂账";
				}else if(ele.waybillStatus==10){
					waybillStatus="已发布";
				}else if(ele.waybillStatus==11){
					waybillStatus="已回收报价";
				}
				
				var shipperName=ele.shipperName;
				if(ele.shipperName==null || ele.shipperName==''){
					shipperName='';
				}
				
				var driverName=ele.driverName;
				if(ele.driverName==null || ele.driverName==''){
					driverName='';
				}
				
				var carCode=ele.carCode;
				if(ele.carCode==null || ele.carCode==''){
					carCode='';
				}
				
			var tr ="<tr class='table-body'>";
				tr+="<td>"+ele.entrustName+"</td>";
				tr+="<td>"+shipperName+"</td>";
				tr+="<td>"+driverName+"</td>";
				tr+="<td>"+ele.scatteredGoods+"</td>";
				tr+="<td>"+ele.lineInfoName+"</td>";
				tr+="<td>"+carCode+"</td>";
				tr+="<td>"+ele.currentTransportPrice+"</td>";
				tr+="<td>"+waybillStatus+"</td>";
				tr+="</tr>";
				$("#findScatteredCargoTrackingTBody").append(tr);
			});
		}
	});
	//查询总数
	$.ajax({
		url:basePath+"/scatteredGoods/getFindScatteredCargoTrackingAllCount",
		data:{"STIds":$("#FSCTId").val()},
		dataType:"json",
		type:"post",
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
	  "itemPage":5,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  STList(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getTotalRecordsPlanInfo+4)/5);
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


function closeWWButton(){
	$("#find_scattered_cargo_tracking").html("");
}

