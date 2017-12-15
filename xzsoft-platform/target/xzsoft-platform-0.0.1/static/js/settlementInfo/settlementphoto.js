  var reOrderSPhotos =[];
$(function() {

    	 go(1);
    });

function deloptionRes()
	        {   
		        var obj=document.getElementById("selRes").options; 
		        while (obj.length > 0)
		        {
			        obj.options.remove(obj.length - 1);   
		        }   
	        }
	        function addoptionRes(s)   
	        {
		        var obj=document.getElementById("selRes").options; 
		        var opt = new Option(s, obj.length ); 
		        obj.options.add(opt);   
	        }
	        function deloptionScanSize()
	        {   
		        var obj=document.getElementById("selScanSize").options; 
		        while (obj.length > 0)
		        {
			        obj.options.remove(obj.length - 1);
		        }   
	        }
	        function addoptionScanSize(s)   
	        {
		        var obj=document.getElementById("selScanSize").options; 
		        var opt = new Option(s, obj.length ); 
		        obj.options.add(opt);   
	        }
	        function deloptionColor()
	        {   
		        var obj=document.getElementById("selColor").options; 
		        while (obj.length > 0)
		        {
			        obj.options.remove(obj.length - 1);   
		        }   
	        }
	        function addoptionColor(s)   
	        {
		        var obj=document.getElementById("selColor").options; 
		        var opt = new Option(s, obj.length ); 
		        obj.options.add(opt);   2
	        }
	        function deloptionDev()
	        {   
		        var obj=document.getElementById("selDev").options; 
		        while (obj.length > 0)
		        {
			        obj.options.remove(obj.length - 1);   
		        }   
	        }
	        function addoptionDev(s)   
	        {
		        var obj=document.getElementById("selDev").options; 
		        var opt = new Option(s, obj.length ); 
		        obj.options.add(opt);   
	        }
	        function deloptionRotate()
	        {   
		        var obj=document.getElementById("selRotate").options; 
		        while (obj.length > 0)
		        {
			        obj.options.remove(obj.length - 1);   
		        }   
	        }
	        function addoptionRotate(s)   
	        {
		        var obj=document.getElementById("selRotate").options; 
		        var opt = new Option(s, obj.length ); 
		        obj.options.add(opt);   
	        }
	        function contentLoad()
	        {
			ScanCtrl.EnableDateRecord(true);
		      	fun();  
	        }
	        function fun()
	        {
			deloptionDev();
			var iDevIndex = ScanCtrl.GetCurDevIndex();
			if(iDevIndex != -1)
			{
		        	var count = ScanCtrl.GetDeviceCount();
		        	for(i = 0; i < count; i++)
		        	{
			        	var s = ScanCtrl.GetDevName(i);
					addoptionDev(s);
		        	}
				document.getElementById("selDev").value=iDevIndex;
			}

			deloptionRes();
			var iResIndex = ScanCtrl.GetCurResolutionIndex();
			if(iResIndex != -1)
			{
		        	var count = ScanCtrl.GetResolutionCount(); 
		        	for(i = 0;i < count; i++)
		        	{
			        	var w=ScanCtrl.GetResolutionWidth(i);
			        	var h=ScanCtrl.GetResolutionHeight(i);
			        	var str=w.toString()+"x"+h.toString();
			        	addoptionRes(str);
		        	} 
				document.getElementById("selRes").value=iResIndex;
			}   

			deloptionScanSize();
			var iScanSizeIndex = ScanCtrl.GetCurScanSizeIndex();
			if(iScanSizeIndex != -1)
			{
		        	var count = ScanCtrl.GetScanSizeCount();
		        	for(i = 0; i < count; i++)
		        	{
			        	var str = ScanCtrl.GetScanSizeName(i);
					addoptionScanSize(str);
		        	} 
				addoptionScanSize("自定义");
				
				var bCustom = ScanCtrl.IsCustom();
				if(bCustom)
				{
					document.getElementById("selScanSize").value=count;
				}
				else
				{
					document.getElementById("selScanSize").value=iScanSizeIndex;
				}
			}

			deloptionRotate();
			var iRotateIndex = ScanCtrl.GetCurRotateAngle();
			if(iRotateIndex != -1)
			{
				addoptionRotate("0");
				addoptionRotate("90");
				addoptionRotate("180");
				addoptionRotate("270");
				document.getElementById("selRotate").value=iRotateIndex;
			}

			deloptionColor();
			var iColorIndex = ScanCtrl.GetCurColor();
			if(iColorIndex != -1)
			{
				addoptionColor("彩色");
				addoptionColor("灰度");
				addoptionColor("黑白");
				document.getElementById("selColor").value=iColorIndex;
			}
			
			var bRotateCrop = ScanCtrl.IsRotateCrop();
			document.getElementById("rotatecrop").checked=bRotateCrop;
			var bDelBkColor = ScanCtrl.IsDelBackColor();
//			document.getElementById("delbkcolor").checked=bDelBkColor;
	        }
		function start_preview(url)  
		{   
			//此处高拍仪的分辨率
			ScanCtrl.SetResolution(3);  
			ScanCtrl.StartPreviewEx();
			fun();
		}
		function stop_preview(url) 
		{   
			ScanCtrl.StopPreviewEx();
			fun();
		}
	        function TakePic()    
	        {
			var date=new Date();
			var yy=date.getFullYear().toString();
			var mm=(date.getMonth()+1).toString();
			var dd=date.getDate().toString();
			var hh=date.getHours().toString();
			var nn=date.getMinutes().toString();
			var ss=date.getSeconds().toString();
			var mi=date.getMilliseconds().toString();
			var picName=yy+mm+dd+hh+nn+ss+mi;
		
			var path="D:\\"+picName+".jpg";
			ScanCtrl.EnableDateRecord(1);
		        var flag=ScanCtrl.Scan(path);
		         
			if(flag)
			{
				EThumbnails.AddToDisplay(path);
				alert("拍照成功！");
				
			}
	        }
	        function Property(url) 
          	{
	            	ScanCtrl.Property();
	        }
		function ZoomIn()
		{
			ScanCtrl.SetZoomIn();
		}
		function ZoomOut()
		{
			ScanCtrl.SetZoomOut();
		}
	        function changeresolution()
	        {
		        var num= ScanCtrl.GetResolutionCount();
		        
		        var obj=document.getElementById("selRes").options; 
		        var x = obj.selectedIndex;

			ScanCtrl.SetResolution(x);  
			fun();   
	        }
	        function changedev()
	        {
		        var num= ScanCtrl.GetDeviceCount();
		        var obj=document.getElementById("selDev").options; 
		        var x = obj.selectedIndex;    

			ScanCtrl.SetCurDev(x); 
			fun();
	        }
	        function changescansize()
	        {
		        var   num=ScanCtrl.GetScanSizeCount();
		        var   obj=document.getElementById("selScanSize").options; 
		        var   x = obj.selectedIndex;    

			ScanCtrl.SetScanSize(x);
			fun();
	        }     
	        function changerotate()
	        {
		        var   obj=document.getElementById("selRotate").options; 
		        var   x = obj.selectedIndex;    

			ScanCtrl.SetVideoRotate(x);
			fun();
	        }	  
	        function changecolor()
	        {
		        var obj = document.getElementById("selColor").options; 
		        var x = obj.selectedIndex;    

			ScanCtrl.SetVideoColor(x);
			fun();
	        }
	        function RotateCrop(obj)
	        {
		        ScanCtrl.SetRotateCrop(obj.checked);
			fun();
	        }
	        function RemoveBackColor(obj)
	        {
		        ScanCtrl.DelBackColor(obj.checked);
			fun();
	        }
		function ocr()
		{
			var b = ScanCtrl.IDCardRecognize();
			if(b)
			{
				alert(ScanCtrl.GetIDCardName());
				alert(ScanCtrl.GetIDCardSex());
				alert(ScanCtrl.GetIDCardNation());
				alert(ScanCtrl.GetIDCardBorn());
				alert(ScanCtrl.GetIDCardAddr());
				alert(ScanCtrl.GetIDCardNo());
				alert(ScanCtrl.GetIDCardPolice());
				alert(ScanCtrl.GetIDCardActive());
				ScanCtrl.EnableDateRecord(1);
				ScanCtrl.GetIDCardPICBase64("D:\\10.jpg");
			}
			else
			{
				alert("识别失败");
			}
		    ScanCtrl.EnableDateRecord(1);
			ScanCtrl.GetIDCardPICBase64("D:\\11.jpg");
		}
		function barcode()
		{
			alert(ScanCtrl.ScanBarcode(""));
		}

		function PrintID()
		{
			ScanCtrl.PrintIDCard("D:\\1.jpg");
		}

		
		function check(){
			var filename = document.getElementById("upload").value;
			if(filename == ""){
				
				alert("请选择上传的图片！");
				return false;
			}
		}
		
		 
		/* 	  function look1() {
			    //alert($("form input[type=file]").val())
			    alert($("input[name=upload]").upload("getFileVal"));
			  }
			  function clean1() {
			    $("input[name=upload]").upload("clean");
			  } */
			  
			  //图片上传
			  function ajaxSubmit1() {
//				  
//				  var creator = <%=czy%>;
//				  var doctype2 = $("#doc_type2").val();
//				  if(doctype2 == ''){
//					  alert("请选择图片类型！");
//					  return false;
//				  }
//			    $("input[name=upload]").upload({
//			      url: 'entity/uploadwaybill.action',
//			      // 其他表单数据
//			      params: { doc_type: doctype2, creater:creator, relation_tb:'waybill', p1:v_settlementno},
//			      // 上传完成后, 返回json, text
//			      dataType: 'json',
//			      onSend: function (obj, str) { return true; },
//			      // 上传之后回调
//			      onComplate: function (data) {
//			    	  var dat = eval('(' + data + ')');
//			        alert(dat.msg);
//			      }
//			    });
//			    $("input[name=upload]").upload("ajaxSubmit");
			  }
			  
			  
			  var ppatch="";
			  
			  
			  	//拍照上传至服务器
			  var uploadCountArr = [];
			  var strBase64Arr=[];
			  
			  
/*			  function ajaxSubmit2() {
				  var count = EThumbnails.GetDisplayCount();
				  for(var i=0;i<count;i++){
					  
					  if(EThumbnails.IsChecked(i)){
						 ppatch =  EThumbnails.GetFilePath(i);
						 console.log("ppatch:"+ppatch);
						 uploadCountArr.push(ppatch);
					  }
					  else{
						  continue;
					  }
					  
				  }
				//  var creator = <%=czy%>;
//				  var doctype = $("#doc_type").val();
//				  if(doctype == ''){
//					  alert("请选择图片类型！");
//					  return false;
//				  }
				  
				  if(ppatch == ''){
					  alert("请选择图片");
					  return false;
				  }
				  console.log("uploadCountArr:"+uploadCountArr);
				  
				  for(var i=0;i<uploadCountArr.length;i++){
					  console.log("uploadCountArr:"+uploadCountArr[i]);
					  
					  strBase64 = ScanCtrl.ScanBase64(uploadCountArr[i]);
					
					  strBase64Arr.push(strBase64);
				  }
//				  console.log(strBase64Arr);
				  //上传至服务器端
				  //strBase64Arr = ScanCtrl.ScanBase64(ppatch);
				  
				  
				  $.post(basePath + "/settlementInfo/uploadPhotoBySettlement",
						 
				            {strBase64Arr:strBase64Arr},
				            function(data) {
								if(data){
//									$("#settlementimg").attr("src", fastdfsServer + "/" + data.imageList[0]);
									
									alert(data.msg);
									var reOrderSPhotos = new Array();
									 var json = eval(data.imageList); //数组   
									    $.each(json, function (index, item) { 
									    	var params = {
													"unloadingImg":json[index]
											}
								//$("#dipPhoto").append("<img id='settlementimg"+index+"' style='width: 220px; height: 220px;' src='${fastdfsServer}/"+json[index]+"' title='点击查看图片'/>");
									    	
									    //	console.log($(#"dipPhoto").html());
									    	reOrderSPhotos.push(params);
									    });
									    var reOrderSPhotoJson = JSON.stringify(reOrderSPhotos);
									    sessionStorage.setItem("reOrderSPhoto", reOrderSPhotoJson);
									    var reOrderSettlementPhoto = sessionStorage.getItem("reOrderSPhoto");
									    reOrderSPhotos = [];
//										$("#reOrderSPhoto").val(reOrderSPhotoJson);
								}
							}, "json");
			  
			  }*/
			  
			  //拍照直接上传至服务端
			  function ajaxSubmit3(){
				  var imgUrl = "";
				 /* var timestamp = Date.parse(new Date());
				  timestamp = timestamp / 1000;
				  var imgName = timestamp;  */   
				  
				  var strBase64 = ScanCtrl.ScanBase64(""); //获取图片的Base64编码
				  console.log("strBase64:"+strBase64);
				  
				  console.log("ajaxSubmit3:"+reOrderSPhotos.length);
				  //上传图片至服务端
				  $.post(basePath + "/settlementInfo/uploadPhotoBySettlement",
				            {strBase64:strBase64},
				            function(data) {
				            	
								if(data){
//									$("#settlementimg").attr("src", fastdfsServer + "/" + data.imageList[0]);
									alert(data.msg);
									console.log("data.imagePatch:"+data.imagePatch);
									
									    	var params = {
													"unloadingImg":data.imagePatch
											}
									    	imgUrl = fastdfsServer+"/"+data.imagePatch;
									    	
									  		$("#disPhoto").append("<div class='group-img'>" +
							      					"<div class='view-img'>" +
							      					"<img id='"+data.imagePatch+"' src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
							      					"</div>" +
							      					"</div>" );
									  		
									  		
								//$("#disPhoto").append("<img id='"+data.imagePatch+"' style='width: 220px; height: 220px;' src='${fastdfsServer}/"+data.imagePatch+"' title='点击查看图片'/>");
									    	
									    //	console.log($(#"dipPhoto").html());
									    	reOrderSPhotos.push(params);
									    	console.log("reOrderSPhotos:"+reOrderSPhotos);
									    var reOrderSPhotoJson = JSON.stringify(reOrderSPhotos);
									    sessionStorage.setItem("reOrderSPhoto", reOrderSPhotoJson);
									    var reOrderSettlementPhoto = sessionStorage.getItem("reOrderSPhoto");
									    
									    
									    //reOrderSPhotos = [];
//										$("#reOrderSPhoto").val(reOrderSPhotoJson);
								}
							}, "json");
				  
				  //页面展示
				  
			  }
			 
									function go(menuid) {
								
										if (menuid == 1) {
								
										}
								
										if (menuid == 2) {
								
										}
								
										if (menuid == 3) {
								
										}
								
										$(".pages").each(function() {
											$(this).hide();
										});
								
										$("#pages" + menuid).show();
									}
/**
 * 返回返单结算
 * jiangweiwei 2017-9-29
 */
function returnReOrder(){
	window.history.back();
}



/**
 * 保存磅单图片关联至运单
 */
function submitSelectPhhot(){

	var reOrderSettlementPhoto = sessionStorage.getItem("reOrderSPhoto");
	var settlementInfoId = $("#settlementInfoIdInput").val();
	$("#reOrderSPhoto").val(reOrderSettlementPhoto);
	$.ajax({
		url	: basePath + "/settlementInfo/addDriverWaybillMaintainAndDriverWaybillImgDetail",
		asyn : false,
		type : "POST",
		data : {"reOrderSPhoto" : reOrderSettlementPhoto,"settlementInfoId" : settlementInfoId},
		dataType : "json",
		success : function(dataStr){
			if(dataStr){
				if(dataStr.success){
					//xjValidate.showPopup("影像保存成功","提示");
					$("#settlementPhotoModal").modal('hide');
				}else{
					xjValidate.showPopup(dataStr.msg,"提示");
	   				return;
				}
			}else{
				xjValidate.showPopup("维护磅单信息服务异常忙，请稍后重试","提示");
				return;
			}
		}
		
	});
}

