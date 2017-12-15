$(function(){
	PIList(1);
	//全选/全不选
	$("body").on("click",".all_proxy_info_check",function(){
		if($(".all_proxy_info_check").is(":checked")){
			//全选时
			$(".sub_proxy_info_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_proxy_info_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//选择代理人取消按钮
function closePIutton(){
	$("#find_proxy_info_model").html("");
}


//重置按钮
function resetProxyInfo(){
	setTimeout(function(){
		PIList(1);
	},500);
}

//运单信息查询
function PIList(number){
	
	$("#proxyInfoTBody").html("");
	
	$.ajax({
		url:basePath+"/paymentInfo/selectProxyInfoAllMation",
		data:{
			"proxyName":$("#proxyName").val(),
			"idCard":$("#idCard").val(),
			"bankCount":$("#bankCount").val(),
			"bankName":$("#bankName").val(),
			"page":number,
			"rows":10
			},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				
				var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_proxy_info_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td>"+ele.proxyName+"</td>";
				tr+="		<td>"+ele.idCard+"</td>";
				tr+="		<td>"+ele.bankAccount+"</td>";
				tr+="		<td>"+ele.bankName+"</td>";
				tr+="</tr>";
				$("#proxyInfoTBody").append(tr);
			});
		}
	});
	//查询总数
	$.ajax({
		url:basePath+"/paymentInfo/getSelectProxyInfoAllMationCount",
		data:{
			"proxyName":$("#proxyName").val(),
			"idCard":$("#idCard").val(),
			"bankCount":$("#bankCount").val(),
			"bankName":$("#bankName").val()
		},
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
		  PIList(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getPlanInfoTotalRecords+9)/10);
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
//点击确定按钮
	function submitPIMation(){
		
		var PIIds=new Array();
		
		$(".sub_proxy_info_check").each(function(){
			if($(this).is(":checked")){
				PIIds.push($(this).attr("data-id"));
			}
		});
		var PIIdsLength=PIIds.length;
		checkFWMation(PIIds.join(","),PIIdsLength);
	}
	
	function checkFWMation(PIIds,PIIdsLength){
		
		if(PIIdsLength>1){
			xjValidate.showTip("请选择一条记录!");
		}else if(PIIdsLength<1){
			xjValidate.showTip("请选择一条记录!");
		}else if(PIIdsLength=1){
			$.confirm({
			      title: '提示',
			      content: '您确定要选择这条记录吗？',
			      buttons: {
			          '确定': function () {
			        	  
			        	  //根据选择ID查询代理人信息
			        	  $.ajax({
			        		  url:basePath+"/paymentInfo/selectProxyInfoAllMationById",
			        		  data:{PIIds:PIIds},
			        		  dataType:"json",
			        		  type:"post",
			        		  async:false,
			        		  success:function(resp){
			        			  if(resp){
			        				  var objs=eval(resp);
			        				  $.each(objs,function(index,ele){
			        					  	$("#proxyPersonName").val(ele.proxyName);//代理人姓名
			        					  	$("#WidCard").val(ele.idCard);//身份证号
											$("#WbankCardId").val(ele.bankAccount);//银行账号
											$("#WbankName").val(ele.bankName);//开户行
											$("#proxyPerson").val(ele.id);//代理人编号
											$("#find_proxy_info_model").html("");
			        				  });
			        			  }else{
			        				  xjValidate.showPopup("系统异常!","提示",true);
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
