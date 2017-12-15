$(function(){
	Dlist(1);
	//全选/全不选
	$("body").on("click",".all_internal_driver_check",function(){
		if($(".all_internal_driver_check").is(":checked")){
			//全选时
			$(".sub_internal_driver_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_internal_driver_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//自有司机全查
function Dlist(number){
	
$("#internalDriverTBody").html("");
	
$.ajax({
	url:basePath+"/scatteredGoods/findInternalDriverMation",
	data:{"page":number-1,"rows":10},
	dataType:"json",
	type:"post",
	asnyc:false,
	success:function(resp){
	
		var objs=eval(resp);
		$.each(objs,function(index,ele){
			
			var driverStatus="未分配车辆";
			if(ele.driverStatus==1){
				driverStatus="已分配车辆";
			}
			var isAvailable="停用";
			if(ele.isAvailable==1){
				isAvailable="启用";
			}
			if(ele.driverName==null){
				ele.driverName='';
			}
			var tr ="<tr class='table-body'>";
			tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_internal_driver_check' data-id=\""+ele.id+"\" ></label></td>";
			tr+="		<td>"+ele.id+"</td>";	
			tr+="		<td>"+ele.driverName+"</td>";
			tr+="		<td>"+driverStatus+"</td>";
			tr+="		<td>"+isAvailable+"</td>";
			tr+="</tr>";
			
			//将tr追加
			$("#internalDriverTBody").append(tr);
		});
	}
	});
		//获取最大数据记录数
		$.ajax({
			 url:basePath+"/scatteredGoods/getInternalDriverCount",
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
};

//分页
var pagination = $("#internal_driver-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  Dlist(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getTotalRecordsPlanInfo+9)/10);
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
	
	//获取全选/单选ID (司机ID，逗号分隔)
	function submitDMation(){
		var Dids = new Array();
		$(".sub_internal_driver_check").each(function(){
			if($(this).is(":checked")){
				Dids.push($(this).attr("data-id"))
			}
		});
		var DidsLength=Dids.length;
		submitInternalDriverMation(Dids.join(","),DidsLength);
	}

	//确认按钮
	function submitInternalDriverMation(Dids,DidsLength){
		
		//判断选择条数
		if(DidsLength>1){
			xjValidate.showTip("最多选择一条数据!");
		}else if(DidsLength<1){
			xjValidate.showTip("请至少选择一条数据!");
		}else if(DidsLength=1){
			
			$.confirm({
			      title: '提示',
			      content: '您确定要选择该条记录吗？',
			      buttons: {
			          '确定': function () {
			        	  
			        	  $.ajax({
			        		  url:basePath+"/scatteredGoods/findInternalDriverNameById",
			        		  data:{Dids:Dids},
			        		  dataType:"json",
			        		  type:"post",
			        		  async:false,
			        		  success:function(resp){
			        			  $("#CshipperName").val("");//发布方名称
		        				  $("#Cshipper").val("");//发布方
		        				  $("#shipperOrgRoot").val("");//发布方主机构
		        				  $("#userInfoId").val("");//发布方
			        			  $("#find_internal_driver_model").html("");
			        			  $("#userInfoId").val(resp.userInfoId);//司机编号
			        			  $("#CshipperName").val(resp.driverName);//司机名称
			        			  $("#role").val(4);
			        		  }
			        	  });
			          },
			          '取消': function () {
			        	  
			          }
			      }
			  });
			
		}
		
	}