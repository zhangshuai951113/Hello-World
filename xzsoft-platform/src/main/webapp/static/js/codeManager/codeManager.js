function subjectList(){
	$.ajax({
		url : basePath + "/codeManager/subjectList",
		asyn : false,
		type : "POST",
		//data : {"carInfoId" : carInfoId,"carPart" : carPart},
		dataType : "json",
		success : function(data) {
			var str=""
			for(var i=0;i<data.length;i++){
				 str+= "<tr class='table-body'>"+
				           "<td>"+
				             "<label class='i-checks'>"+
				                "<input name='check-box' type='radio' value='"+data[i].itemCode+"' onclick='searchManagerList(this.value)'><i></i>"+
				              	"</label>"+
				           "</td>"+
			           "<td style='border-right: 1px solid #ccc;' >"+data[i].itemName+"</td>"+
			           "</tr>";
			}
			$("#subjectList").append(str);
			
									}
			})
						}


function searchManagerList(data){
	if(data!=undefined)
		searchManagerTemp=data;
	 ManagerCount()
	$.ajax({
		url : basePath + "/codeManager/searchManagerList",
		asyn : false,
		type : "POST",
		data : {"itemName":$("#itemName").val(),"localName":$("#localName").val(),"codeSubjectCode":searchManagerTemp,'page' : currenTemp,'rows' : rows},
		dataType : "json",
		success : function(data) {
			$("#codeManagerList").empty();
			var str=""
			for(var i=0;i<data.length;i++){
				str+="<tr class='table-body'>"+
		             "<td>"+
		                "<label class='i-checks'>"+
		                "<input name='check-box-delete' type='checkbox' value='"+data[i].id+"'><i></i>"+
			            "</label>"+
			            "</td>"+
			            "<td>"+(data[i].codeSubjectName==null?'':data[i].codeSubjectName)+"</td>"+
			            "<td>"+(data[i].itemName==null?'':data[i].itemName)+"</td>"+
			            "<td>"+(data[i].localName==null?'':data[i].localName)+"</td>"+
			            "<td>"+(data[i].itemCode==null?'':data[i].itemCode)+"</td>"+
			            "<td style='border-right: 1px solid #ccc'>"+
			              "<div class='operation-td'>"+
			                "<div class='modify-operation operation-m'>"+
			                  "<div class='modify-icon'></div>"+
			                  "<div class='text' onclick='updateManager("+data[i].id+")'>修改</div>"+
			                "</div>"+
			              "</div>"+
			            "</td>"+
			          "</tr>";
			}
			$("#codeManagerList").append(str);
									}
			})
}

//获取最大数据记录数
function ManagerCount(){
$.ajax({
	url :basePath + "/codeManager/searchManagerCount",
	type : "post",
	data : {"itemName":$("#itemName").val(),"localName":$("#localName").val(),"codeSubjectCode":searchManagerTemp},
	dataType : "json",
	async : false,
	success : function(resp) {
		//parent.getTotalRecords = resp;
		//pagination.setTotalItems(resp);
		//console.log(pagination)
		managerCount=resp
		//console.log(pagination.options.setTotalItems=12)
		//console.log(pagination.options)
		pagination.setTotalItems(resp);
		$("#panel-num-manager").text("搜索结果共" + resp + "条");
	}
		});
		}

function addManager(){
	$("#itemCodeAdd").val("");
	$("#itemNameAdd").val("");
	$("#localNameAdd").val("");
	$("#add_modify").show();
					 }
function cancel(){
	$("#add_modify").hide();
	$("#update_modify").hide();
				}
function deleteManager(){
	var arr=new Array(); 
	var checkbox=document.getElementsByName('check-box-delete'); 
	for(var i=0;i<checkbox.length;i++){ 
	if(checkbox[i].checked==true){ 
		arr.push(checkbox[i].value); 
								 }
	}
	$.ajax({
		url :basePath + "/codeManager/deleteManager",
		type : "post",
		data : {"str":arr.toString()},
		dataType : "json",
		async : false,
		success : function(resp) {
			//parent.getTotalRecords = resp;
			//pagination.setTotalItems(resp);
			//console.log(pagination)
			searchManagerList()
			managerCount=resp
			$("#panel-num-manager").text("搜索结果共" + resp + "条");
		}
			});
										
}
function updateManager(data){
	$("#itemCodeAdd").val("");
	$("#itemNameAdd").val("");
	$("#localNameAdd").val("");
	updateTemp=data;
 	 $("#update_modify").show();
							 }
function update(){
	if(searchManagerTemp==undefined){
		
		xjValidate.showPopup("请选择项目类别","提示",true);
		return;
	}if($("#localNameUpdate").val()==""){
		xjValidate.showPopup("请填写物流平台名称","提示",true);
		return;
	}if($("#itemNameUpdate").val()==""){
		xjValidate.showPopup("请填写项目名称","提示",true);
		return;
	}if($("#itemCodeUpdate").val()==""){
		xjValidate.showPopup("请填写项目编号","提示",true);
		return;
	}
	$.ajax({
		url :basePath + "/codeManager/updateManager",
		type : "post",
		data : {"id":updateTemp,"itemCode":$("#itemCodeUpdate").val(),"itemName":$("#itemNameUpdate").val(),"localName":$("#localNameUpdate").val(),"codeSubjectCode":searchManagerTemp},
		dataType : "json",
		async : false,
		success : function(data) {
				xjValidate.showPopup("成功","提示",true)
				$("#update_modify").hide();
				searchManagerList()
								  },
		error:function(data){
			xjValidate.showPopup("更新信息异常，请稍后重试","提示",true);
		}
		});
}

function save(){
	if(searchManagerTemp==undefined){
		xjValidate.showPopup("请选择项目类别","提示",true);
		return;
	}if($("#localNameAdd").val()==""){
		xjValidate.showPopup("请填写物流平台名称","提示",true);
		return;
	}if($("#itemNameAdd").val()==""){
		xjValidate.showPopup("请填写项目名称","提示",true);
		return;
	}if($("#itemCodeAdd").val()==""){
		xjValidate.showPopup("请填写项目编号","提示",true);
		return;
	}
	 $.ajax({
			url :basePath + "/codeManager/saveManager",
			type : "post",
			data : {"itemCode":$("#itemCodeAdd").val(),"itemName":$("#itemNameAdd").val(),"localName":$("#localNameAdd").val(),"codeSubjectCode":searchManagerTemp},
			dataType : "json",
			async : false,
			success : function(data) {
					xjValidate.showPopup("成功","提示",true)
					$("#add_modify").hide()
					searchManagerList()
									  },
			error:function(data){
				xjValidate.showPopup("保存信息异常，请稍后重试","提示",true);
			}
			});
}
function carJumpPage(e) {
var totalPage = parseInt((parent.getTotalRecords + 9) / 10);
var myreg = /^[0-9]+.?[0-9]*$/;
var re = new RegExp(myreg);
var number = $(e).prev().find('input').val();
if (!re.test(number)) {
	commonUtil.showPopup("提示", "请输入正确的数字!");
	$(e).prev().find('input').val("");
	return false;
}
var value = parseInt(number);
if (value < 1) {
	$(e).prev().find('input').val("1")
	value = 1;
}
if (value >= totalPage) {
	$(e).prev().find('input').val(totalPage);
	value = totalPage;
}
pagination.setCurrentPage(value);
}

