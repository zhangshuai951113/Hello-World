$(function(){
	Elist(1);
	
	//全选/全不选
	$("body").on("click",".all_entrust_check",function(){
		if($(".all_entrust_check").is(":checked")){
			//全选时
			$(".sub_entrust_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_entrust_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	
	//允许 表格拖着
    $("#sfdfs").colResizable({
      liveDrag: true,
      gripInnerHtml: "<div class='grip'></div>",
      draggingClass: "dragging"
    });
});

//委托方信息全查
function Elist(number){
	
	$("#entrustTBody").html("");
	
	$.ajax({
		url:basePath+"/scatteredGoods/findEntrustMation",
		data:{"page":number-1,"rows":5},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			console.log(resp);
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				
				//判断显示条件
				var isAvailable="停用";
				if(ele.isAvailable==1){
					isAvailable="启用";
				}
				
				var orgStatus="初始化";
				if(ele.orgStatus==1){
					orgStatus="待审核";
				}else if(ele.orgStatus==2){
					orgStatus="审核不通过";
				}else if(ele.orgStatus==3){
					orgStatus="审核通过";
				}else if(ele.orgStatus==4){
					orgStatus="已注销";
				}
				
				
				var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_entrust_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td>"+ele.id+"</td>";	
				tr+="		<td>"+ele.orgName+"</td>";
				tr+="		<td>"+orgStatus+"</td>";
				tr+="		<td>"+isAvailable+"</td>";
				tr+="</tr>";
				
				//将tr追加
				$("#entrustTBody").append(tr);
			});
		}
	});
	//获取最大数据记录数
	$.ajax({
		 url:basePath+"/scatteredGoods/getEntrustCount",
		 type:"post",
		 data:{"page":number-1,"rows":5},
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
var pagination = $("#entrust-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":5,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  Elist(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getTotalRecordsPlanInfo+4)/5);
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

//获取全选/单选ID (合同ID，逗号分隔)
function submitEMation(){
	var Eids = new Array();
	$(".sub_entrust_check").each(function(){
		if($(this).is(":checked")){
			Eids.push($(this).attr("data-id"))
		}
	});
	var EidsLength=Eids.length;
	submitentrustInfoMation(Eids.join(","),EidsLength);
}


//确认按钮
function submitentrustInfoMation(Eids,EidsLength){
	
	//判断选择条数
	if(EidsLength>1){
		xjValidate.showTip("最多选择一条数据!");
	}else if(EidsLength<1){
		xjValidate.showTip("请至少选择一条数据!");
	}else if(EidsLength=1){
		
		$.confirm({
		      title: '提交委托方信息',
		      content: '您确定要选择该条委托方记录吗？',
		      buttons: {
		          '确定': function () {
		        	  
		        	  //根据选择ID查询组织机构表对应机构名称
		        	  $.ajax({
		        		  url:basePath+"/scatteredGoods/findEnstusNameById",
		        		  data:{Eids:Eids},
		        		  dataType:"json",
		        		  type:"post",
		        		  async:false,
		        		  success:function(resp){
		        			 $("#find_entrust_info_model").html("");
		        			 $("#Eentrust").val(Eids);
		        			  if(resp.success){
		        				  $("#Entrust").val(resp.msg);
		        			  }else{
		        				  xjValidate.showTip(resp.msg);
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