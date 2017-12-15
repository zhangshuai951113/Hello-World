$(function(){
	SList(1);
	
	//全选/全不选
	$("body").on("click",".all_allocation_accounting_entity_check",function(){
		if($(".all_allocation_accounting_entity_check").is(":checked")){
			//全选时
			$(".sub_allocation_accounting_entity_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_allocation_accounting_entity_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//核算主体信息全查
function SList(number){
	
	//禁止追加
	$("#allocationAccountingEntityTBody").html("");
	
	$.ajax({
		url:basePath+"/settlementFormula/findAllocationAccountingEntityAll",
		data:{"page":number-1,"rows":10},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				
				//判断显示条件
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
				
				var isAvailable="停用";
				if(ele.isAvailable==1){
					isAvailable="启用";
				}
				if(ele.settStatus==1){
					ele.settStatus="已分配";
				}else if(ele.settStatus==0){
					ele.settStatus="未分配";
				}
				var tr ="<tr class='table-body'>";
					tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_allocation_accounting_entity_check' data-id=\""+ele.id+"\" ></label></td>";
					tr+="<td>"+ele.id+"</td>";
					tr+="<td>"+ele.orgName+"</td>";
					tr+="<td>"+orgStatus+"</td>";
					tr+="<td>"+isAvailable+"</td>";
					tr+="<td>"+ele.settStatus+"</td>";
					tr+="</tr>";
				$("#allocationAccountingEntityTBody").append(tr);
				
			});
		}
	});
	
	//查询最大记录数
	$.ajax({
		 url:basePath+"/settlementFormula/getAllocationAccountingEntityAllCount",
		 type:"post",
		 data:{"page":number-1,"rows":2},
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 parent.getTotalRecordsPlanInfo=resp;
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
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
		  SList(current);
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

//获取全选/单选ID (计划ID，逗号分隔)
function checkAllocationAccountingEntity(){

	var AIds = new Array();
	$(".sub_allocation_accounting_entity_check").each(function(){
		if($(this).is(":checked")){
			AIds.push($(this).attr("data-id"))
		}
	});
	
	var AIdsLength=AIds.length;
	submitAAEMation(AIds.join(","),AIdsLength);
}
	

//确定按钮
function submitAAEMation(AIds,AIdsLength){
	//alert($("#settIds").val());
	//判断选择条数
	if(AIdsLength>1){
		xjValidate.showTip("请选择一条数据!");
	}else if(AIdsLength<1){
		xjValidate.showTip("请选择一条数据!");
	}else if(AIdsLength=1){
		
		$.confirm({
		      title: '提示',
		      content: '您确定要选择该条核算主体记录吗？',
		      buttons: {
		          '确定': function () {
		        	  
		        	//提交数据
		      		$.ajax({
		      			url:basePath+"/settlementFormula/checkAllocationAccountingEntityMation",
		      			data:{"sIds":$("#settIds").val(),"AIds":AIds},
		      			dataType:"json",
		      			type:"post",
		      			async:false,
		      			success:function(resp){
		      				if(resp){
		      					if(resp.success){
		      						$("#find_org_info_page").html("");
		      						xjValidate.showTip(resp.msg);
		      						list(1);
		      					}
		      				}else{
		      					xjValidate.showTip("核算主体异常!");
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

