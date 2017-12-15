
var pagination = $(".pagination-list").operationList({
    "current":1,    //当前目标
    "maxSize":4,  //前后最大列表
    "itemPage":10,  //每页显示多少条
    "totalItems":19,  //总条数
    "chagePage":function(current){
      //调用ajax请求拿最新数据
    	list(current); 
    }
  });

function jumpPage(e) {
	  var value = $(e).prev().find('input').val();
	  pagination.setCurrentPage(value);
}

//调用全查
$(function(){
	list(1);
});

//进入地点管理页面查询
function list(number){
	$("#tableList").html("");
	var province=$("#province").val();
	var city=$("#city").val();
	var county=$("#county").val();
	$.ajax({
		url:"findLocationInfo",
		data:{province:province,city:city,county:county,"page":number-1,"rows":10},
		type:"post",
		async:false,
		dataType:"json",
		success:function(responseText){
			var objs=eval(responseText);
			$.each(objs,function(index,ele){
				var tr = " <tr class='table-body'>";
					tr+="		<td>"+ele.nation+"</td>";
					tr+="		<td>"+ele.province+"</td>";
					tr+="		<td>"+ele.provinceSimple+"</td>";
					tr+="		<td>"+ele.city+"</td>";
					tr+="		<td>"+ele.citySimple+"</td>";
					tr+="		<td>"+ele.county+"</td>";
					tr+="</tr>";
				//将tr追加到
				$("#tableList").append(tr);
			});
		}
	});
	
	//获取最大数据记录数
	$.ajax({
		 url:"getCount",
		 type:"post",
		 data:{province:province,city:city,county:county,"page":number-1,"rows":2},
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
}

//模糊查询
$("#searchLocationInfo").click(function(){
	list(1);
});
