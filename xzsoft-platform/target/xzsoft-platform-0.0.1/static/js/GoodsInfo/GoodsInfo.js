$(function(){
	list(1);
	//全选/全不选
	$("body").on("click",".all_goods_info_check",function(){
		if($(".all_goods_info_check").is(":checked")){
			//全选时
			$(".sub_good_info_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_good_info_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	//允许表格拖着
	$("#tableDrag").colResizable({
		  liveDrag:true, 
		  gripInnerHtml:"<div class='grip'></div>", 
		  draggingClass:"dragging",
		  ifDel: 'tableDrag'
	});
});

//货物信息全查
function list(number){
	
	$("#driverTBody").html("");
	
	var id=$.trim($("#id").val());
	var goodsName=$.trim($("#goodsName").val());
	var materialType=$.trim($("#materialType").val());
	//拼接分页
	var data={
			"id":id,
			"goodsName":goodsName,
			"materialType":materialType,
			"page":number-1,
			"rows":10
	};
	
	
	$.ajax({
		url:"selectGoodsInfoAll",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				
				//显示条件
				var auditStatus="新建";
				if(ele.auditStatus==2){
					auditStatus="审核中";
				}else if(ele.auditStatus==3){
					auditStatus="审核通过";
				}else if(ele.auditStatus==4){
					auditStatus="审核未通过";
				}
				
				var goodsStatus="启用";
				if(ele.goodsStatus==1){
					goodsStatus="停用";
				}
				
				if(ele.materialTypeName==null){
					ele.materialTypeName="";
				}
				
				if(ele.orgInfoName==null){
					ele.orgInfoName="";
				}
				
				if(ele.orgRootName==null){
					ele.orgRootName="";
				}
				
				if(ele.createTimeStr==null){
					ele.createTimeStr="";
				}
				
				if(ele.userName==null){
					ele.userName="";
				}
				
				var tr="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_good_info_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="<td>"+ele.id+"</td>";
				tr+="<td>"+ele.goodsName+"</td>";
				tr+="<td>"+ele.materialTypeName+"</td>";
				tr+="<td>"+ele.specModel+"</td>";
				tr+="<td>"+ele.units+"</td>";
//				tr+="<td>"+ele.userName+"</td>";
//				tr+="<td>"+ele.orgInfoName+"</td>";
				tr+="<td>"+ele.createTimeStr+"</td>";
//				tr+="<td>"+ele.orgRootName+"</td>";
				tr+="<td>"+auditStatus+"</td>";
				tr+="<td>"+goodsStatus+"</td>";
				if(ele.userRole==1 || ele.userRole==2){
					$("#enable-btn").hide();
					$("#disable-btn").hide();
					$("#audit-btn").hide();
					}
				
				//将tr追加
				$("#driverTBody").append(tr);
			});
		}
	});
	//获取最大数据记录数
	$.ajax({
		 url:"getCountGoods",
		 type:"post",
		 data:data,
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 parent.getTotalRecords=resp;
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
}

//重置按钮
$("#Reset").click(function(){
	$("#id").val("");
	$("#goodsName").val("");
	$("#materialType").val("");
	list(1);
	pagination.setCurrentPage(1);
});

//分页
var pagination = $(".pagination-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  list(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getTotalRecords+9)/10);
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
	
	//判断操作按钮
	function operationBtn(number){
		var goodsIds=new Array();
		$(".sub_good_info_check").each(function(){
			if($(this).is(":checked")){
				goodsIds.push($(this).attr("data-id"));
			}
		});
		
		var goodsIdLength=goodsIds.length;
		
		//修改按钮
		if(number==1){
			updateGoodsInfo(goodsIds.join(","),goodsIdLength);
		}else 
			//删除按钮
			if(number==2){
			delGoodsInfo(goodsIds.join(","),goodsIdLength);
		}else 
			//启用按钮 
			if(number==3){
			enableGoodsInfoStatus(goodsIds.join(","),goodsIdLength);
		}else 
			//停用按钮
			if(number==4){
			disableGoodsInfoStatus(goodsIds.join(","),goodsIdLength);
		}else 
			//提交按钮
			if(number==5){
			submitGoodsInfo(goodsIds.join(","),goodsIdLength);
		}else 
			//审核按钮
			if(number==6){
			auditGoodsInfo(goodsIds.join(","),goodsIdLength);
		}
		
	}
	
	//新增模态框
	$("#addGoodsInfo").click(function(){
		var url=basePath+"/GoodsInfo/addGoodsInfoModel";
		$("#show_goods_info").load(url);
	});
	
	//关闭模态框
	function cancel(){
		$("#show_goods_info").html("");
	}

	function saveGoodsInfos(){
		var sign=1;
		saveOrUpdateGoodsInfo(sign);
	}
	
	//添加/修改货物信息
	function saveOrUpdateGoodsInfo(sign){

		//货物名称
		var goodsName=$.trim($("#goodsNames").val());
		if(goodsName==undefined || goodsName==""){
			xjValidate.showTip("货物名称不能为空!",'#department-data-info .modal-dialog');
			 return false;
		}
		
		if(goodsName.length>200){
			 xjValidate.showTip("货物名称的长度不能超过100个字符!",'#department-data-info .modal-dialog');
			 return false;
		}
		
		//规格型号
		/*
		var specModel=$.trim($("#specModel").val());
	    if(specModel==undefined || specModel==""){
	    	xjValidate.showTip("规格型号不能为空!",'#department-data-info .modal-dialog');
	    	return false;
	    }
	    */
	    if(specModel.length>40){
	    	xjValidate.showTip("规格型号的长度不能超过20个字符!",'#department-data-info .modal-dialog');
	    	return false;
	    }
	    
	    //计量单位
	    var units=$.trim($("#units").val());
	    if(units==undefined || units==""){
	    	xjValidate.showTip("计量单位不能为空!",'#department-data-info .modal-dialog');
	    	return false;
	    }
	   
	    var data=$("#goodsInfo_form").serialize();
		data+="&sign="+sign+"";
	    $.ajax({
	    	url:"addGoodsInfoMation",
	    	data:data,
	    	dataType:"json",
	    	type:"post",
	    	async:false,
	    	success:function(resp){
	    		if(resp.success){
	    			xjValidate.showPopup(resp.msg,"提示",true);
	    			$("#show_goods_info").html("");
	    			pagination.setCurrentPage(1);
	    		}else{
	    			xjValidate.showPopup(resp.msg,"提示",true);
	    		}
	    	}
	    });
	}
	
	//点击修改
	function updateGoodsInfo(goodsIds,goodsIdLength){
		
		//判断选择长度
		if(goodsIdLength>1){
			xjValidate.showPopup("请选择一条数据!","提示",true);
		}else if(goodsIdLength<1){
			xjValidate.showPopup("请选择一条数据!","提示",true);
		}else if(goodsIdLength=1){
			 //根据操作货物id查询货物主机构ID是否与登录用户主机构ID一致
		  	  $.ajax({
		  		  url:basePath+"/GoodsInfo/findOrgRootIdByGoodsId",
		    			data:{"id":goodsIds},
		    			dataType:"json",
		    			type:"post",
		    			async:false,
		    			success:function(resp){
		    				if(resp.success){
		    					//根据ID查询货物的审核状态
		    					$.ajax({
		    						url:"findAuditStatusById",
		    						data:{"id":goodsIds},
		    						dataType:"json",
		    						type:"post",
		    						async:false,
		    						success:function(resp){
		    							//新建/审核未通过
		    							if(resp==1 || resp==4){
		    								var url=basePath+"/GoodsInfo/updateGoodsInfoModel";
		    								$("#show_goods_info").load(url,function(){
		    									$.ajax({
		    										url:"getGoodsInfoById",
		    										data:{"id":goodsIds},
		    										dataType:"json",
		    										type:"post",
		    										async:false,
		    										success:function(resp){
		    											$("#goodsNames").val(resp.goodsName);
		    											$("#specModel").val(resp.specModel);
		    											$("#materialTypes").val(resp.materialType);
		    											$("#units").val(resp.unitsCode);
		    											$("#goodsInfoId").val(resp.id);
		    										}
		    									});
		    								});
		    							}else{
		    								xjValidate.showPopup("货物正在审核或已通过审核,无法修改!","提示",true);
		    							}
		    						}
		    					});
		    				}else{
		    					xjValidate.showPopup("非法操作!","提示",true);
		    				}
		    			}
		  	  });
		  }
	  }
	
	//点击修改按钮修改数据
	function updateGoodsInfoMation(){
		var sign=2;
		//修改货物
		saveOrUpdateGoodsInfo(sign);
	}
	
	//删除货物信息
    function delGoodsInfo(goodsIds,goodsIdLength){

    	$.confirm({
		      title: '删除记录',
		      content: '您确定要删除吗？',
		      buttons: {
		          '确定': function () {
		      			//新建/审核未通过
		      				 $.ajax({
		      	        		  url:"deleteGoodsInfoById",
		      	        		  data:{"id":goodsIds},
		      	        		  dataType:"json",
		      	        		  type:"post",
		      	        		  async:false,
		      	        		  success:function(resp){
		      	        			  xjValidate.showPopup(resp.msg,"提示",true);
		      	        			  pagination.setCurrentPage(1);
		      	        		  }
		      	        	  });
		      			}
		          },
		          '取消': function () {
		          }
		  });
}
	
	//提交按钮
	function submitGoodsInfo(goodsIds,goodsIdLength){
		
		$.ajax({
			url:"updateAuditStatus",
			data:{"id":goodsIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				if(resp.success){
					pagination.setCurrentPage(1);
					xjValidate.showPopup(resp.msg,"提示",true);
				}else{
					xjValidate.showPopup(resp.msg,"提示",true);
				}
			}
		});
		
	}
	
	//启用按钮
	function enableGoodsInfoStatus(goodsIds,goodsIdLength){
		
		if(goodsIdLength>1){
			xjValidate.showPopup("请选择一条数据!","提示",true);
		}else if(goodsIdLength<1){
			xjValidate.showPopup("请选择一条数据!","提示",true);
		}else if(goodsIdLength=1){

			$.ajax({
				url:"enableGoodsInfoStatus",
				data:{"id":goodsIds},
				dataType:"json",
				type:"post",
				async:false,
				success:function(resp){
					if(resp.success){
						xjValidate.showPopup(resp.msg,"提示",true);
						pagination.setCurrentPage(1);
					}else{
						xjValidate.showPopup(resp.msg,"提示",true);
					}
				}
			});
		}
		
	}
	
	//停用按钮
	function disableGoodsInfoStatus(goodsIds,goodsIdLength){
		
		if(goodsIdLength>1){
			xjValidate.showPopup("请选择一条数据!","提示",true);
		}else if(goodsIdLength<1){
			xjValidate.showPopup("请选择一条数据!","提示",true);
		}else if(goodsIdLength=1){

			$.ajax({
				url:"disableGoodsInfoStatus",
				data:{"id":goodsIds},
				dataType:"json",
				type:"post",
				async:false,
				success:function(resp){
					if(resp.success){
						xjValidate.showPopup(resp.msg,"提示",true);
						pagination.setCurrentPage(1);
					}else{
						xjValidate.showPopup(resp.msg,"提示",true);
					}
				}
			});
		}
		
	}
	
	//点击货物审核
	function auditGoodsInfo(goodsIds,goodsIdLength){
		  
		//货物审核模态框
		$.confirm({
			title : '请您填写审核意见:',
			content : ''
					+ '<form action="" class="formName">'
					+ '<div class="form-group">'
					+ '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px" />'
					+ '</div>' + '</form>',
			buttons : {
				formSubmit : {
					text : '通过',
					btnClass : 'btn-blue',
					action : function() {
						var auditOption=this.$content.find('#auditOpinion').val();
						if(!auditOption){
							xjValidate.showTip("审核意见不能为空！");
							return false;
						}
						//提交审核通过信息
						$.ajax({
							url:basePath+"/GoodsInfo/aduitGoodsStatus",
							data:{'auditOption':auditOption,'id':goodsIds,'auditStatus':3},
							dataType:"json",
							type:"post",
							async:false,
							success:function(resp){
								if(resp){
									if(resp.success){
										xjValidate.showPopup(resp.msg,"提示",true);
										pagination.setCurrentPage(1);
									}else{
										xjValidate.showPopup(resp.msg,"提示",true);
										return;
									}
								}else{
									xjValidate.showPopup("保存货物审核意见服务异常繁忙，请稍后重试","提示",true);
							        return;
								}
							}
						});
					}
				},
				formSubmit1 : {
					text : '不通过',
					btnClass : 'btn-red',
					action : function() {
						
						var auditOption=this.$content.find('#auditOpinion').val();
						if(!auditOption){
							xjValidate.showTip("审核意见不能为空!");
							return false;
						}
						//提交审核未通过信息
						$.ajax({
							url:basePath+"/GoodsInfo/aduitGoodsStatus",
							data:{'auditOption':auditOption,'id':goodsIds,'auditStatus':4},
							dataType:"json",
							type:"post",
							async:false,
							success:function(resp){
								if(resp){
									if(resp.success){
										xjValidate.showPopup(resp.msg,"提示",true);
										pagination.setCurrentPage(1);
									}else{
										xjValidate.showPopup(resp,"提示",true);
										return;
									}
								}else{
									xjValidate.showPopup("保存货物审核意见服务异常繁忙，请稍后重试","提示",true);
							        return;
								}
							}
						});
					}
				},
				'取消' : function() {
					
				}
			}
		
		});
		
     }