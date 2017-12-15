//调用全查
$(function(){
	openCouponUseInfo(1);
	
});

var pagination = $(".pagination-list").operationList({
    "current":1,    //当前目标
    "maxSize":4,  //前后最大列表
    "itemPage":10,  //每页显示多少条
    "totalItems":0,  //总条数
    "chagePage":function(current){
      //调用ajax请求拿最新数据
    	openCouponUseInfo(current); 
    }
  });

/**
 * 页面跳转
 */
  function jumpPage(e) {
    var value = $(e).prev().find('input').val();
    pagination.setCurrentPage(value);
  }
  

function openCouponUseInfo(number){
	$("#couponUseTableList").html("");
	var couponInfoId = $("#couponInfoId").val();
	$.ajax({
		url:"getCouponUseInfoByCouponInfoId",
		data:{couponInfoId:couponInfoId,"page":number-1,"rows":10},
		type:"post",
		async:false,
		dataType:"json",
		success:function(responseText){
			var objs=eval(responseText);
			$.each(objs,function(index,ele){
				var tr = " <tr class='table-body azure'>";
					tr+="		<td>"+ele.id+"</td>";
					tr+="		<td>"+ele.couponInfoId+"</td>";
					tr+="		<td>"+ele.cardCode+"</td>";
					tr+="		<td>"+ele.orgName+"</td>";
					tr+="		<td>"+ele.money+"</td>";
					tr+="		<td>"+ele.balance+"</td>";
					tr+="		<td>"+ele.remarks+"</td>";
					tr+="		<td>"+ele.userName+"</td>";
					tr+="		<td>"+ele.useTimeStr+"</td>";
					tr+="		<td>"+ele.createUserStr+"</td>";
					tr+="		<td>"+ele.createTimeStr+"</td>";
					tr+="</tr>";
					
				//将tr追加到
				$("#couponUseTableList").append(tr);
			});
		}
	});
	
	//获取最大数据记录数
	$.ajax({
		 url:"getCouponUseInfoCount",
		 type:"post",
		 data:{couponInfoId:couponInfoId},
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
}

function returnCouponInfo(){
	window.location.href = basePath+"/couponInfo/rootCouponInfoInitPage";
}