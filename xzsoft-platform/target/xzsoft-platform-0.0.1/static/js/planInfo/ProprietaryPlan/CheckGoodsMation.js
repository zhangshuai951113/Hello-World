$(function(){
	Glist(1);
	
	//全选/全不选
	$("body").on("click",".all_goods_check",function(){
		if($(".all_goods_check").is(":checked")){
			//全选时
			$(".sub_goods_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_goods_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//货物信息全查
function Glist(number){
	
	$("#goodsTBody").html("");
	
	$.ajax({
		url:basePath+"/planInfo/findGoodsMation",
		data:{"page":number-1,"rows":10},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				//物资类别
				if(ele.materialTypeName==null){
					ele.materialTypeName='';
				}
				
				var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_goods_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td>"+ele.id+"</td>";	
				tr+="		<td>"+ele.goodsName+"</td>";
				tr+="		<td>"+ele.units+"</td>";
				tr+="		<td>"+ele.specModel+"</td>";
				tr+="		<td>"+ele.materialTypeName+"</td>";
				tr+="</tr>";
				
				//将tr追加
				$("#goodsTBody").append(tr);
			});
		}
	});
	//获取最大数据记录数
	$.ajax({
		 url:basePath+"/planInfo/getGoodsCount",
		 type:"post",
		 data:"",
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
	      Glist(current);
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
	
//关闭货物模态框
function closeGButton(){
	$("#find_goods_info_model").html("");
}

//获取全选/单选ID (合同ID，逗号分隔)
function submitGMation(){
	var Gids = new Array();
	$(".sub_goods_check").each(function(){
		if($(this).is(":checked")){
			Gids.push($(this).attr("data-id"))
		}
	});
	var GidsLength=Gids.length;
	submitGoodsInfoMation(Gids.join(","),GidsLength);
}

//确认按钮
function submitGoodsInfoMation(Gids,GidsLength){
	
	//判断选择条数
	if(GidsLength>1){
		commonUtil.showPopup("提示","最多选择一条数据!");
	}else if(GidsLength<1){
		commonUtil.showPopup("提示","请至少选择一条数据!");
	}else if(GidsLength=1){
		
		$.confirm({
		      title: '提交货物信息',
		      content: '您确定要选择该条货物记录吗？',
		      buttons: {
		          '确定': function () {
		        	  
		        	  //根据选择ID查询货物表对应货物名称
		        	  $.ajax({
		        		  url:basePath+"/planInfo/findGoodsNameById",
		        		  data:{Gids:Gids},
		        		  dataType:"json",
		        		  type:"post",
		        		  async:false,
		        		  success:function(resp){
		        			 $("#find_goods_info_model").html("");
		        			 $("#GoodsInfoId").val(Gids);
		        			  if(resp.success){
		        				  $("#GoodsInfoName").val(resp.msg);
		        			  }else{
		        				  commonUtil.showPopup("提示",resp.msg);
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