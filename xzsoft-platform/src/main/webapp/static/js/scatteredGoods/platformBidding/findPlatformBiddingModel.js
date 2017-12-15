$(function(){
	OFList(1);
	//全选/全不选
	$("body").on("click",".all_platform_bidding_check",function(){
		if($(".all_platform_bidding_check").is(":checked")){
			//全选时
			$(".sub_platform_bidding_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_platform_bidding_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//根据零散货物ID查询报价信息
function OFList(number){
	//禁止多次追加
	$("#platformBiddingTBody").html("");
	
	$.ajax({
	url:basePath+"/scatteredGoods/findPlatformBiddingMation",
	data:{"dGIds":$("#PBid").val(),"page":number-1,"rows":5},
	dataType:"json",
	type:"post",
	async:false,
	success:function(resp){
		var objs=eval(resp);
		$.each(objs,function(index,ele){
			
			var role="司机";
			if(ele.offerUserRole==1){
				role="物流公司";
			}
			
			var tr="<tr  class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_platform_bidding_check' data-id=\""+ele.id+"\" ></label></td>";
			   /* tr+="<td>"+ele.id+"</td>";
			    tr+="<td>"+ele.orgName+"</td>";*/
				tr+="<td>"+ele.offerPartyName+"</td>";
			    tr+="<td style='color:red'>"+ele.offerPrice+"</td>";
			    tr+="<td>"+role+"</td>";
			    tr+="<td>"+"<a onclick='findOfferPosition("+ele.id+")'>查看位置</a>"+"</td>";
			    tr+="<td>"+"良好"+"</td>";
			    if(ele.offerImg!=null && ele.offerImg!=''){
			    	tr+="<td><img title='点击查看图片' style='width:40px' src='"+fastdfsServer+'/'+ele.offerImg+"'></td>";
			    }else{
			    	tr+="<td>暂无附件</td>";
			    }
			    tr+="<td>"+ele.offerTimeStr+"</td>";
			    tr+="</tr>"
			    $("#platformBiddingTBody").append(tr);
		});
	}
});
	//查询总数
	$.ajax({
		url:basePath+"/scatteredGoods/getPlatformBiddingCount",
		data:{"dGIds":$("#PBid").val(),"page":number-1,"rows":5},
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
		  PBList(current);
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

//点击确认按钮
function submitPBMation(){
	
	var PBIds=new Array();
	$(".sub_platform_bidding_check").each(function(){
		if($(this).is(":checked")){
			PBIds.push($(this).attr("data-id"));
		}
	});
	var PBIdsLength=PBIds.length;
	
	selectWinningBidderById(PBIds.join(","),PBIdsLength);
}

//选择中标方
function selectWinningBidderById(PBIds,PBIdsLength){
	
	//判断选择条数
	if(PBIdsLength>1){
		xjValidate.showTip("请选择一条数据!");
	}else if(PBIdsLength<1){
		xjValidate.showTip("请选择一条数据!");
	}else if(PBIdsLength=1){
		
		$.confirm({
		      title: '提示',
		      content: '您确定要选择该报价方吗？',
		      buttons: {
		          '确定': function () {
		        	  
		        	  //修改报价信息中标状态
		        	  $.ajax({
		        		  url:basePath+"/scatteredGoods/updaeOfferInfoIsBidStatus",
		        		  data:{PBIds:PBIds,"dGIds":$("#PBid").val()},
		        		  dataType:"json",
		        		  type:"post",
		        		  async:false,
		        		  success:function(resp){
		        			  
		        			  if(resp){
		        				  
		        				  if(resp.success){
		        					  xjValidate.showPopup(resp.msg,"提示",true);
		        					  $("#platformBiddingModel").html("");
		        					  PBList(1);
		        				  }else{
		        					 xjValidate.showPopup(resp.msg,"提示",true);
		        				  }
		        				  
		        			  }else{
		        				 xjValidate.showPopup("选择中标方异常!","提示",true);
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

//点击查看超链接报价方位置
function findOfferPosition(offerId){
	$("#hidden_offer_id").val(offerId);
	$("#form_offer").attr("action",basePath + "/scatteredGoods/findOfferPosition");
	$("#form_offer").submit();
}