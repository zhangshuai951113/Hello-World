$(function(){
	Llist(1);
	//全选/全不选
	$("body").on("click",".all_line_check",function(){
		if($(".all_line_check").is(":checked")){
			//全选时
			$(".sub_line_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_line_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//线路全查
function Llist(number){
	
	$("#lineTBody").html("");
	
	$.ajax({
		url:basePath+"/planInfo/findLineInfoAll",
		data:{"page":number-1,"rows":10},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				//线路状态
				var lineStatus="启用";
				if(ele.lineStatus==1){
					lineStatus="停用";
				}
				var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_line_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td>"+ele.id+"</td>";	
				tr+="		<td>"+ele.lineName+"</td>";
				tr+="		<td>"+ele.startPoints+"</td>";
				tr+="		<td>"+ele.endPoints+"</td>";
				tr+="		<td>"+ele.distance+"</td>";
				tr+="		<td>"+lineStatus+"</td>";
				tr+="</tr>";
				$("#lineTBody").append(tr);
			});
		}
	});
	
	//获取最大数据记录数
	$.ajax({
		 url:basePath+"/planInfo/getLineCount",
		 type:"post",
		 data:{"page":number-1,"rows":10},
		 dataType:"json",
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
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
	      Llist(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getTotalRecordsPlanInfo+9)/10);
	  var myreg=/^[0-9]+.?[0-9]*$/;
	  var re = new RegExp(myreg);
	  var number=$(e).prev().find('input').val();
	  if(!re.test(number)){
		  commonUtil.showPopup("提示","请输入正确的数字!");
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

//关闭模态框
function closeLButton(){
	$("#find_line_info_model").html("");
}

//获取全选/单选ID (合同ID，逗号分隔)
function submitLMation(){
	var Lids = new Array();
	$(".sub_line_check").each(function(){
		if($(this).is(":checked")){
			Lids.push($(this).attr("data-id"))
		}
	});
	var LidsLength=Lids.length;
	submitLineInfoMation(Lids.join(","),LidsLength);
}

//确认按钮
function submitLineInfoMation(Lids,LidsLength){
	
	//判断选择条数
	if(LidsLength>1){
		commonUtil.showPopup("提示","最多选择一条数据!");
	}else if(LidsLength<1){
		commonUtil.showPopup("提示","请至少选择一条数据!");
	}else if(LidsLength=1){
		
		$.confirm({
		      title: '提交线路信息',
		      content: '您确定要选择该条线路记录吗？',
		      buttons: {
		          '确定': function () {
		        	  
		        	  //根据选择ID查询线路表对应线路名称
		        	  $.ajax({
		        		  url:basePath+"/planInfo/findLineNameById",
		        		  data:{Lids:Lids},
		        		  dataType:"json",
		        		  type:"post",
		        		  async:false,
		        		  success:function(resp){
		        			  if(resp){
		        				  $("#find_line_info_model").html("");
				        		  $("#LineInfoId").val(Lids);
		        				  $("#LineInfoName").val(resp.lineName);
		        				  $("#distance").val(resp.distance);
		        			  }else{
		        				  commonUtil.showPopup("提示","系统异常,请稍后再试!");
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