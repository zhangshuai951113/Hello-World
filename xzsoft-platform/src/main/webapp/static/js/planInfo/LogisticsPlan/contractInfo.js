$(function(){
	Clist(1);
	//全选/全不选
	$("body").on("click",".all_contract_check",function(){
		if($(".all_contract_check").is(":checked")){
			//全选时
			$(".sub_contract_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_contract_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	

	//时间调用插件
    setTimeout(function() {
	       $(".date-time-c").datetimepicker({
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
});

//相关合同信息查询
function Clist(number){
	    
	    var contractCode=$.trim($("#contractCode").val());
	    var contractName=$.trim($("#contractName").val());
	    var entrust=$.trim($("#Centrust").val());
	    var shipper=$.trim($("#Cshipper").val());
	    var startDate=$.trim($("#CstartDate").val());
	    var endDate=$.trim($("#CendDate").val());
	    var cooperateStatus=$.trim($("#cooperateStatus").val());
	    var forwardingUnit=$.trim($("#CforwardingUnit").val());
	    var consignee=$.trim($("#Cconsignee").val());
	    var goodsName=$.trim($("#goodsName").val());
	    var data={
	    		contractCode:contractCode,
	    		contractName:contractName,
	    		entrust:entrust,
	    		shipper:shipper,
	    		startDate:startDate,
	    		endDate:endDate,
	    		cooperateStatus:cooperateStatus,
	    		forwardingUnit:forwardingUnit,
	    		consignee:consignee,
	    		goodsName:goodsName,
	    		"page":(number-1),
	    		"rows":10
	    		};
	    $("#driverTBody").html("");
		//查询数据
		$.ajax({
			url:basePath+"/planInfo/getContractInfo",
			data:data,
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				var objs=eval(resp);
				$.each(objs,function(index,ele){
					//判断显示条件
					var cooperateStatus="半协同";
					if(ele.cooperateStatus==1){
						cooperateStatus="协同";
					}
					
					var goodsStatus="启用";
					if(ele.goodsStatus==1){
						goodsStatus="停用";
					}
					if(ele.shipperProjectName==null){
						ele.shipperProjectName='';
					}
					if(ele.entrustProjectName==null){
						ele.entrustProjectName='';
					}
					var tr="<tr class='table-body'>";
					tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_contract_check' data-id=\""+ele.id+"\" ></label></td>";
					tr+="<td>"+ele.contractCode+"</td>";
					tr+="<td>"+ele.contractName+"</td>";
					tr+="<td>"+ele.entrustProjectName+"</td>";
					tr+="<td>"+ele.shipperProjectName+"</td>";
					tr+="<td>"+ele.entrustName+"</td>";
					tr+="<td>"+ele.shipperName+"</td>";
					tr+="<td>"+ele.goodsName+"</td>";
					tr+="<td>"+ele.lineName+"</td>";
					tr+="<td>"+ele.distance+"</td>";
					tr+="<td>"+ele.forwardingUnit+"</td>";
					tr+="<td>"+ele.consignee+"</td>";
					tr+="<td>"+cooperateStatus+"</td>";
					tr+="<td>"+goodsStatus+"</td>";
					tr+="<td>"+ele.effectiveDateStr+"</td>";
					tr+="<td>"+ele.endDateStr+"</td>";
					tr+="</tr>";
					$("#driverTBody").append(tr);
				});
			}
		});
		
		//查询最大记录数
		$.ajax({
			url:basePath+"/planInfo/getPlanInfoMaxCount",
			data:data,
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				parent.getPlanInfoTotalRecords=resp;
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
	      Clist(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getPlanInfoTotalRecords+9)/10);
	  var myreg=/^[0-9]+.?[0-9]*$/;
	  var re = new RegExp(myreg);
	  var number=$(e).prev().find('input').val();
	  if(!re.test(number)){
		  commonUtil.showPopup("请输入正确的数字!","提示",true);
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

//重置按钮
$("#CReset").click(function(){
	setTimeout(function(){
		Clist(1);
	},500);
});

//获取全选/单选ID (合同ID，逗号分隔)
function submitCMation(){
	var userIds = new Array();
	$(".sub_contract_check").each(function(){
		if($(this).is(":checked")){
			userIds.push($(this).attr("data-id"))
		}
	});
	var userIdsLength=userIds.length;
	submitContractInfoMation(userIds.join(","),userIdsLength);
}

//选择合同信息
function submitContractInfoMation(userIds,userIdsLength){
	
	//判断选择条数
	if(userIdsLength>1){
		commonUtil.showPopup("最多选择一条数据!","提示",true);
	}else if(userIdsLength<1){
		commonUtil.showPopup("请至少选择一条数据!","提示",true);
	}else if(userIdsLength=1){
		$.confirm({
		      title: '提交合同信息',
		      content: '您确定要选择该条合同记录吗？',
		      buttons: {
		          '确定': function () {
		        	  
		        	  //根据选择ID查询合同明细表对应合同名称
		        	  $.ajax({
		        		  url:basePath+"/planInfo/findContractNameById",
		        		  data:{userIds:userIds},
		        		  dataType:"json",
		        		  type:"post",
		        		  async:false,
		        		  success:function(resp){
		        			 $("#find_contract_info_model").html("");
		        			 $("#PcontractDetailInfoId").val(userIds);
		        			 if(resp){
		        				 $("#PcontractName").val(resp.contractName);
		        				 if(resp.image){
		        					 $("#planImg").attr("src",fastdfsServer+'/'+resp.image);
		        					 $("#plan_img").val(resp.image);
		        				 }
		        			 }else{
		        				 commonUtil.showTip("系统异常!");
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

