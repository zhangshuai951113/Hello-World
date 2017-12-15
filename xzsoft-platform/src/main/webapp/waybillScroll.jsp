<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <base href="<%=basePath%>">
    
    <title>公路运输信息</title>
    
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<!--
	<link rel="stylesheet" type="text/css" href="styles.css">
	-->
	<style type="text/css">
body
{
    margin:0px;
    padding:0px;
    font-size:15px;
    color:white;
    background-color: #000000;
    
}
table{
border-collapse:separate;
border-spacing:18px;
}
td
{
    text-align:center;
    border: 0px solid;
    font-size:22px;
}
tr{
  border: 0px solid;
}
th{
	 border: 0px solid;
	 font-size:22px;
}
#demo
{
    overflow:hidden;
    width:100%;
    height:120px;
}
#demo3
{
    overflow:hidden;
    width:100%;
    height:120px;
}
#goodsource_info{
color:#FFEC8B;
font-weight: bold;
}
#vehicle_info{
font-weight: bold;
color: red;
}
</style>
<script type="text/javascript" src="<%=basePath%>static/js/common/jquery-3.1.1.js"></script>
<script type="text/javascript">
$(document).ready(function(){
	//时间戳转化成固定日期格式
			var format = function(time, format){
			    var t = new Date(time);
			    var tf = function(i){return (i < 10 ? '0' : '') + i};
			    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
			        switch(a){
			            case 'yyyy':
			                return tf(t.getFullYear());
			                break;
			            case 'MM':
			                return tf(t.getMonth() + 1);
			                break;
			            case 'mm':
			                return tf(t.getMinutes());
			                break;
			            case 'dd':
			                return tf(t.getDate());
			                break;
			            case 'HH':
			                return tf(t.getHours());
			                break;
			            case 'ss':
			                return tf(t.getSeconds());
			                break;
			        }
			    });
			}
			
	
		var params = {
				"page" : 1,
				"rows" : 200
			};
		$.ajax({
			url :"<%=basePath%>waybillInfo/getWaybillQueryData_scroll",
			asyn : false,
			type : "POST",
			data : params,
			dataType : "json",
			success : function(data) {
				if (data) {
					if (data.success) {
						var rows = data.list;
						var createTime;
						var html = '';
						for(var i = 0; i < rows.length; i++){
							var info = rows[i];
							html += "<tr>";
							html += "<td width='10%'>"+info.goodsName+"</td>";
							html += "<td width='10%'>"+info.planTransportAmount+"</td>";
							html += "<td width='10%'>"+info.lineName+"</td>";
							html += "<td width='10%'>"+info.forwardingUnit+"</td>";
							html += "<td width='10%'>"+info.consignee+"</td>";
							html += "<td width='10%'>"+info.distance+"</td>";
							if (info.createTime == null || info.createTime == '' || info.createTime == undefined) {
								html += "<td width='10%'>"+info.createTime+"</td>";
							} else {
								createTime = format(new Date(info.createTime).toString(),'yyyy-MM-dd HH:mm:ss');
								html += "<td width='10%'>"+createTime+"</td>";
							}
							
							html += "</tr>";
						}
						$("#goodsource_info").html(html);
						isok3();
					} else {
						alert(data.msg);
						return;
					}
				} else {
					alert("查询运单信息服务异常忙，请稍后重试");
					return;
				}
			},
			error:function(){
				alert("error");
			}
		});
});


function Marquee_goods()
{
    if (demo2.offsetTop <= demo.scrollTop)
    {
       demo.scrollTop -= demo1.offsetHeight;
    }
    else
    {
        demo.scrollTop++;
    }
}
function isok3(){
	demo2.innerHTML = demo1.innerHTML;
	var speed_goods = 50;
	var myInterval_goods = setInterval(Marquee_goods, speed_goods);
	//demo.onmouseover = function() {clearInterval(myInterval_goods);};
	//demo.onmouseout = function() {myInterval_goods = setInterval(Marquee_goods,speed_goods);};
}
</script>
</head>
<body>
<p>
<img src="<%=basePath%>/static/images/web-trans.png" width="100%" height="100" />
</p>
<table class="nav" id="navtb">
		<tr>
			<td class="navtd"  style="text-align: left"><span class="title"><font size="6">公路运输信息</font></span></td>
		</tr>
	</table>
<!-- 货源发布信息和车源发布信息滚动 -->
<div id="scrolldiv" style="height:100%;width:100%;marigin:0 auto;border: 0px solid;">
	<div  id="goodsourcediv" style="height:100%;width:100%; margin:0 auto;float: left;border: 0px solid;">
		<table width="100%"  style="height:25px;margin:0 auto;background-color: red;" align="center">
			<thead>
				<tr>
					<th width="10%">货物品名</th>
					<th width="10%">重量</th>
					<th width="10%">线路</th>
					<th width="10%">发货单位</th>
					<th width="10%">收货单位</th>
					<th width="10%">运距（公里）</th>
					<th width="10%">制单日期</th>
				</tr>
			</thead>
		</table>
		<div id="demo" style="width:100%; height: 750px">
		<div id="demo1">
		<table id="goodsource" class="goodsource_info" width="100%" style="height:100%;margin:0 auto;">
			<tbody id="goodsource_info">
			</tbody>
		</table>
		</div>
			<div id="demo2" style="width:100%; height: 0px"></div>
		</div>
	</div>
</div>
</body>
</html>
