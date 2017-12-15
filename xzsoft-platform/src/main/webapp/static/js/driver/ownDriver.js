$(function(){
	list(1);
});

/**
 * 绑定上传事件的dom对象
 * @author chengzhihuan 2017年5月18日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn,{
   		action: basePath + '/upload/imageUpload',
   		name: 'myfile',
		dataType: 'json',
   		onSubmit : function(file , ext){
   			//文件上传格式校验
   			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))){
   				$.alert("请上传格式为 jpg|png|bmp 的图片!");
   				return;
   			}
   		},
   		//服务器响应成功时的处理函数
   		onComplete :function(file, resultJson){
   			if(resultJson){
   				resultJson = $.parseJSON(resultJson);
   				//是否成功
   				var isSuccess = resultJson.isSuccess;
   				//上传图片URL
   				var uploadUrl = resultJson.uploadUrl;
   				if(isSuccess=="true"){
   					//图片类型
   					var imgType = btn.attr("img-type");
					btn.attr("src",fastdfsServer+"/"+uploadUrl);
					$("#"+imgType).val(uploadUrl);
   				}else{
   					$.alert(resultJson.errorMsg);
   	   				return;
   				}
   			}else{
   				$.alert("服务器异常，请稍后重试");
   				return;
   			}
		}
	});
}

//页面全查
function list(number){
	$("#driverTBody").html("");
	var driverName=$("#driverName").val();
	var mobilePhone=$("#mobilePhone").val();
	var driverStatus=$("#driverStatus").val();
	$.ajax({
		url:"findOwnDriver",
		async:false,
		data:{driverName:driverName,mobilePhone:mobilePhone,driverStatus:driverStatus,"page":number-1,"rows":10},
		dataType:"json",
		type:"post",
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				
				var driverStatus="未分配";
				if(ele.driverStatus==1){
					driverStatus="已分配";
				}
				
				var driverName=ele.driverName;
				if(driverName==null){
					driverName="";
				}
				
				var carCode=ele.carCode;
				if(carCode==null){
					carCode="";
				}
				
				var drivingLicense=ele.drivingLicense;
				if(ele.drivingLicense==null){
					drivingLicense="";
				}
				
				var tr = " <tr class='table-body'>";
				tr+="		<td>"+driverName+"</td>";
				tr+="		<td>"+ele.mobilePhone+"</td>";
				tr+="		<td>"+carCode+"</td>";
				tr+="		<td>"+ele.orgName+"</td>";
				tr+="		<td>"+driverStatus+"</td>";
				tr+="		<td>"+drivingLicense+"</td>";
				if(ele.idCardImg!=null){
					tr+="<td>";
					tr+="<img title='点击查看图片' src='"+fastdfsServer+'/'+ele.idCardImg+"'>";
					tr+="</td>";
					}else{
						tr+="<td>暂无附件</td>";
					}
				if(ele.idCardImgCopy!=null){
					tr+="<td>";
					tr+="<img title='点击查看图片' src='"+fastdfsServer+'/'+ele.idCardImgCopy+"'>";
					tr+="</td>";
					}else{
						tr+="<td>暂无附件</td>";
					}
				
				if(ele.driverLicenseImg!=null){
				tr+="<td>";
				tr+="<img title='点击查看图片' src='"+fastdfsServer+'/'+ele.driverLicenseImg+"'>";
				tr+="</td>";
				}else{
					tr+="<td>暂无附件</td>";
				}
				if(ele.driverLicenseImgCopy!=null){
					tr+="<td>";
					tr+="<img title='点击查看图片' src='"+fastdfsServer+'/'+ele.driverLicenseImgCopy+"'>";
					tr+="</td>";
				}else{
					tr+="<td>暂无附件</td>";
				}
				if(ele.isAvailable==1){
					tr+="		<td class='operation'>";
					tr+="           <div class='modify-operation operation-m'  onclick='updateDriver(\""+ele.id+"\")'><div class='modify-icon'></div><div class='text'>修改</div></div>";
					tr+="			<div class='delete-operation operation-m'  onclick='updateDriverAvailable(\""+ele.id+"\")'><div class='disable-icon'></div><div class='text'>停用</div></div>";
					tr+="		</td>";
					tr+="</tr>";
				}else{
					tr+="		<td class='operation'>";
					tr+="           <div class='modify-operation operation-m'  onclick='updateDriver(\""+ele.id+"\")'><div class='modify-icon'></div><div class='text'>修改</div></div>";
					tr+="			<div class='delete-operation operation-m'  onclick='updateDriverAvailable(\""+ele.id+"\")'><div class='enabled-icon'></div><div class='text' style='color:#8fc31f'>启用</div></div>";
					tr+="		</td>";
					tr+="</tr>";
				}
				//将tr追加到
				$("#driverTBody").append(tr);
				//图片预览
				$('td img').viewer({
					title:false
				});
			});
		}
	});
	//获取最大数据记录数
	$.ajax({
		 url:"getCount",
		 type:"post",
		 data:{driverName:driverName,mobilePhone:mobilePhone,driverStatus:driverStatus,"page":number-1,"rows":10},
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 parent.getTotalRecords=resp;
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
	
//重置按钮
$("#Reset").click(function(){
	 setTimeout(function() {
		 list(1);
		 pagination.setCurrentPage(1);
	  },100)
});
	
	//修改自有司机模态框
	function updateDriver(id){
		 $.ajax({
			 url:"findDriverRootOrgInfoIdAndUserOrgRootId",
			 data:{"id":id,"sign":1},
			 type:"post",
		     dataType:"json",
		     async:false,
		     success:function(resp){
		    	 if(resp.success){
		    		//请求地址
						var url = basePath + "/driverInfo/updateDriverPage";
						//加载模态框地址
						$("#show_department_info").load(url,function(){
							//上传图片初始化
							$('.upload_img').each(function(){
								uploadLoadFile($(this));
							})
							$.ajax({
								url:basePath+"/driverInfo/findOwnDriverById",
								data:{"id":id,"sign":1},
								dataType:"json",
								type:"post",
								async:false,
								success:function(resp){
									
									var driverStatus="未分配";
									if(resp.driverStatus==1){
										driverStatus="已分配";
									}
									
									var isAvailable="否";
									if(resp.isAvailable==1){
										isAvailable="是";
									}
									
									$("#ownDriverName").val(resp.driverName);
									$("#ownMobilePhone").val(resp.mobilePhone);
									$("#ownIdCard").val(resp.idCard);
									$("#ownDrivingLicense").val(resp.drivingLicense);
									$("#ownOpeningBank").val(resp.openingBank);
									$("#ownAccountName").val(resp.accountName);
									$("#ownBankAccount").val(resp.bankAccount);
									$("#ownCarCode").val(resp.carCode);
									$("#ownOrgInfoId").val(resp.orgName);
									$("#ownDriverStatus").val(driverStatus);
									$("#ownIsAvailable").val(isAvailable);
									$("#idCardImage").val(resp.idCardImg);
									$("#idCardImageCopy").val(resp.idCardImgCopy);
									$("#driverLicenseImg").val(resp.driverLicenseImg);
									$("#driverLicenseImgCopy").val(resp.driverLicenseImgCopy);
									$("#remarks").text(resp.remarks);
									$("#ownId").val(resp.id);
									
									if(resp.idCardImg){
										$("#myIdCardImage").attr("src",fastdfsServer+'/'+resp.idCardImg);
									}
									
									if(resp.idCardImgCopy){
										$("#myIdCardImageCopy").attr("src",fastdfsServer+'/'+resp.idCardImgCopy);
									}
									
									if(resp.driverLicenseImg){
										$("#myDriverLicenseImg").attr("src",fastdfsServer+'/'+resp.driverLicenseImg);
									}
									
									if(resp.driverLicenseImgCopy){
										$("#myDriverLicenseImgCopy").attr("src",fastdfsServer+'/'+resp.driverLicenseImgCopy);
									}
									
									//添加不可编辑状态
									document.getElementById("ownMobilePhone").readOnly=true;
									document.getElementById("ownOrgInfoId").readOnly=true;
									document.getElementById("ownDriverStatus").readOnly=true;
									document.getElementById("ownIsAvailable").readOnly=true;
									document.getElementById("ownCarCode").readOnly=true;
									
								}
							});
						});
		    	 }else{
		    		 xjValidate.showTip(resp.msg,"提示",true);
		    	 }
		 }
		 });
	}
	
	//关闭维护司机模态框
	function closeButton(){
		$("#show_ownDriver_info").html("");
		$("#show_department_info").html("");
	}
	
	//点击添加修改自有司机信息
	function saveDriver(){
		//判断司机姓名是否为空
		var driverName=$.trim($("#ownDriverName").val());
		if(driverName==undefined || driverName==""){
			xjValidate.showTip( "司机名称不能为空!");
			return false;
		}
		//司机姓名长度校验
		if(driverName.length>100){
			xjValidate.showTip( "司机名称的长度不能超过50个字符!");
			return false;
		}
		//校验手机号是否为空
		var mobilePhone=$.trim($("#ownMobilePhone").val());
		if(mobilePhone==undefined || mobilePhone==""){
			xjValidate.showTip( "请输入手机号码!");
			return false;
		}
		//验证手机号码是否符合规则
		var myreg = /^1[34578]\d{9}$/; 
		if(!myreg.test(mobilePhone)){
			xjValidate.showTip( "请输入正确的手机号码!");
			return false;
		}
		//校验身份证号是否为空
		var idCard=$.trim($("#ownIdCard").val());
		if(idCard==undefined || idCard==""){
			xjValidate.showTip( "身份证号码不能为空!");
			return false;
		}
		//校验身份证号码是否符合规范
		var myreg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
		var re = new RegExp(myreg);
		if(!re.test(idCard)){
			xjValidate.showTip( "请输入正确的身份证号码!");
			return false;
		}
		//校验驾驶证编号是否为空
		var drivingLicense=$.trim($("#ownDrivingLicense").val());
		if(drivingLicense==undefined || drivingLicense==""){
			xjValidate.showTip( "驾驶证编号不能为空!");
			return false;
		}
		//校验驾驶证编号长度
		if(drivingLicense.length>100){
			xjValidate.showTip( "驾驶证编号的长度不能超过50个字符!");
			return false;
		}
		//校验开户行是否为空
		var openingBank=$.trim($("#ownOpeningBank").val());
		if(openingBank==undefined || openingBank==""){
			xjValidate.showTip( "开户行不能为空!");
			return false;
		}
		//校验开户行长度
		if(openingBank.length>100){
			xjValidate.showTip( "开户行的长度不能超过50个字符!");
		}
		//校验开户名是否为空
		var accountName=$.trim($("#ownAccountName").val());
		if(accountName==undefined || accountName==""){
			xjValidate.showTip( "开户名不能为空!");
			return false;
		}
		//校验银行账号是否为空
		var bankAccount=$.trim($("#ownBankAccount").val());
		if(bankAccount==undefined || bankAccount==""){
			xjValidate.showTip( "银行账号不能为空!");
			return false;
		}
		//检验银行长号长度
		if(bankAccount.length>40){
			xjValidate.showTip( "银行账号的长度不能超过20个字符!");
		}
		//校验身份证正面附件是否为空  
		var idCardImage=$.trim($("#idCardImage").val());
		if(idCardImage==undefined || idCardImage==""){
			xjValidate.showTip( "请上传身份证正面附件!");
			return false;
		}
		//检验身份证反面附件
		var idCardImageCopy=$.trim($("#idCardImageCopy").val());
		if(idCardImageCopy==undefined || idCardImageCopy==""){
			xjValidate.showTip( "请上传身份证反面附件!");
			return false;
		}
		//校验司机驾驶证正面附件
		var driverLicenseImg=$.trim($("#driverLicenseImg").val());
		if(driverLicenseImg==undefined || driverLicenseImg==""){
			xjValidate.showTip( "请上传驾驶证正面附件!");
			return false;
		}
		//校验司机驾驶证反面附件
		var driverLicenseImgCopy=$.trim($("#driverLicenseImgCopy").val());
		if(driverLicenseImgCopy==undefined || driverLicenseImgCopy==""){
			xjValidate.showTip( "请上传身份证反面附件!");
			return false;
		}
		//获取当前点击司机ID
		var id=$.trim($("#ownId").val());
		//获取备注信息
		var remarks=$.trim($("#remarks").val());
		//全部验证通过
		$.ajax({
			url:basePath+"/driverInfo/findDriverRootOrgInfoIdAndUserOrgRootId",
			data:{id:id,"sign":1},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				if(resp.success){
					$.ajax({
						url:basePath+"/driverInfo/updateOwnDriverInformation",
						data:$("#updateDriverInfo").serialize(),
						dataType:"json",
						type:"post",
						async:false,
						success:function(resp){
							if(resp.success){
								xjValidate.showPopup(resp.msg,"提示",true);
								$("#show_department_info").html("");
								list(1);
							}else{
								xjValidate.showPopup(resp.msg,"提示",true);
							}
						}
					});
				}else{
					xjValidate.showPopup(resp.msg,"提示",true);
				}
			}
		});
	}

	//自有司机启用停用
	function updateDriverAvailable(id){
		$.ajax({
			url:"findOwnDriverIsAvailable",
  			data:{"id":id},
  			dataType:"json",
  			type:"post",
  			async:false,
  			success:function(resp){
  				if(resp==1){
  					$.confirm({
  				      title: '提示',
  				      content: '您确定要启用该司机吗？',
  				      buttons: {
  				          '确定': function () {
  				        	updateDriverIsAvailable(id);
  				          },
  				          '取消': function () {
  				          }
  				      }
  				  });
  				}else if(resp==0){
  					$.confirm({
    				      title: '提示',
    				      content: '您确定要停用该司机吗？',
    				      buttons: {
    				          '确定': function () {
    				        	  updateDriverIsAvailable(id);
    				          },
    				          '取消': function () {
    				          }
    				      }
    				  });
  				}
  			}
		});
	}
	
	//修改司机启用停用状态
	function updateDriverIsAvailable(id){
		 $.ajax({
     			url:"updateOwnDriverIsAvailable",
     			data:{"id":id},
     			dataType:"json",
     			type:"post",
     			async:false,
     			success:function(resp){
     				if(resp.success){
     					list(1);
     				}else{
     					xjValidate.showTip( resp.msg);
     				}
     			}
     		});
	}

	function addOwnDriver(){
		//请求地址
		var url = basePath + "/user/initDriverPage #driver-data-info";
		$("#show_driver_info").load(url,{"userInfoId":null,"operateType":1},function(){})
	}
	
	//关闭企业司机弹框
	$("body").on("click",".driver-info-opt-close",function(){
		$("#show_driver_info").empty();
	});
