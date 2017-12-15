<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>
<%
	String path = request.getContextPath(); 
	String basePath = request.getScheme()+"://"+request.getServerName()	+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="cache-control" content="no-cache">
<meta http-equiv="expires" content="0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<title>新疆天顺物流信息平台</title>
<base href="<%=basePath%>"/>
<style type="text/css">
body {
	background: #fff;
	font: 15px/1.5 宋体;
	margin: 0;
	padding: 0;
	overflow:auto;
}
table {
	
	border-collapse: collapse;
	border:0px;
}
img {
	border:0px;
}
#pagehead, #broadcast,#pagefoot {
	width: 100%;
	margin: 0 ;
	
}

#pagehead {
	height: 90px;
	background: #192f85 ;
}
#pagehead td{
	text-align:center;
	vertical-align:middle;
}

#broadcast {
	height: 270px;
	background: url(static/images/Web-gl-bj.jpg) no-repeat center;
}
#castbtn {
	position:relative;
	top:250px;
}
#scrolldiv {
	height:300px;
}

#phone {
	height: 302px;
	background: url(static/images/sm-01.png) no-repeat center;
}

#enty {
	height: 120px;
}
#enty td{
	text-align:center;
	vertical-align:middle;
}


#pagefoot {
	height: 30px;
	background-color: #3d3d3d;
}
.footspan {
	color: #fff;
	font: 14px/1.5 微软雅黑;
}

#pagefoot a {
	text-decoration: none;
}
th,td{
	text-align: center;
}


.lefttd {
	text-align:left;
}
.linetitle{
	color:#0071c0;
	font: 24px/1.5 微软雅黑;
	height:30px;
	line-height:30px;
}

.tbhead {
	color: #fff;
	font: 20px/1.5 微软雅黑;
	table-layout:fixed;
}


.tbhead td{
	word-wrap:break-word;
}

.tbhead td a{
	text-decoration: none;
	color: #fff;
}
.scrolltable {
	color: #333333;
	font: 20px/1.5 微软雅黑;
	table-layout:fixed;
}

.scrolltable td{
	height:25px;
	word-wrap:break-word;
}

.goodssourcetb td{
	text-align: center;
}

.goodssourcetb {
	width:820px;
}

.express{ 
margin-left:-30px; 
margin-right:10px; 
margin-bottom:0px; 
margin-top:0px; 
}

.express li{ 
height:25px; 
border-bottom:dashed 1px #ddd; 
line-height:20px; 
font-size:12px; 
list-style:none; 
}  

</style>
<script type="text/javascript" src="<%=basePath%>/static/common/jquery-3.1.1.js"></script>
<script type="text/javascript">
var currval=500;
var totalrec_agricultural = 0;//农产品循环计数
var totalrec_industry = 0;//工业品循环计数
var totalrec_goodsource = 0;//货源信息循环计数
var totalrec_vehicle = 0;//车源信息循环计数
//索引
var index_agricultural = 0;//
var index_industry = 0;
var index_goodsource = 0;
var index_vehicle = 0;

//判断是否有数据
var industry_falg = false;
var agricultural_falg = false;
var goodsource_falg = false;
var vehicle_falg = false;
//数据源
var industry_data = null;//农业品
var agricultural_data = null;//工业品
var goodsource_data = null;//货源
var vehicle_data = null;//车源
var collect_info_data = null;//货源+车源+统计
var product_info_data = null;//农业品+工业品

var myFunction;
var dome;
var dome1; 
var dome2; 
var vhme;
var vhme1; 
var vhme2; 

var speed=50;//设置向上轮动的速度 
//var recccc=0
function moveTop(){
	var isover_gs=false;
	var isover_vh=false;
	var oldtop = dome.scrollTop;
	
	if (!isover_gs){
		dome.scrollTop++;
		if (oldtop == dome.scrollTop){
			
			isover_gs=true;
			dome.scrollTop=0;
		}
	}
	
	var oldvhtop = 	vhme.scrollTop;
	if (!isover_vh){
	vhme.scrollTop++;
	if (oldvhtop == vhme.scrollTop){
		isover_vh=true;
		vhme.scrollTop=0;
	}
	}
	if (isover_gs && isover_vh){
		window.clearInterval(myFunction);
		gsfunc = window.setInterval('load_goodsource_data()',2000);
	}
} 


//平台动态信息汇总,货源信息汇总,车源信息汇总
function load_goodsource_data(){
	 var goodsource_dat ;
	 var vehicle_dat;
	 var grossCensus_dat;
	 $.post("findCarSourceCount",{},
			function(data){
				collect_info_data = eval('('+data+')');
				grossCensus_dat = collect_info_data['grossCensus'];
				goodsource_dat = collect_info_data['goods'];
				vehicle_dat = collect_info_data['vehicle']
				if (goodsource_dat.length>0){
					$("#goodssource_express").empty();
					$("#goodssource_express2").empty();
					$("#vehicle_express").empty();
					$("#vehicle_express2").empty();
					for (index_goodsource=0;index_goodsource<goodsource_dat.length;index_goodsource++){
						$("#goodssource_express").append("<tr><td>"+goodsource_dat[index_goodsource].goodsName+"</td><td>"+goodsource_dat[index_goodsource].startPoint+"</td><td>"+goodsource_dat[index_goodsource].endPoint+"</td><td>"+goodsource_dat[index_goodsource].freeAmount+"</td><td>"+goodsource_dat[index_goodsource].distance+"</td><td>"+goodsource_dat[index_goodsource].endTime+"</td></tr>");
						$("#goodssource_express2").append("<tr><td>"+goodsource_dat[index_goodsource].goodsName+"</td><td>"+goodsource_dat[index_goodsource].startPoint+"</td><td>"+goodsource_dat[index_goodsource].endPoint+"</td><td>"+goodsource_dat[index_goodsource].freeAmount+"</td><td>"+goodsource_dat[index_goodsource].distance+"</td><td>"+goodsource_dat[index_goodsource].endTime+"</td></tr>");
					}
					
					for (index_vehicle=0;index_vehicle<vehicle_dat.length;index_vehicle++){
						
						$("#vehicle_express").append("<tr><td>"+vehicle_dat[index_vehicle].plateNum+"</td><td>"+vehicle_dat[index_vehicle].vehicleType+"</td><td>"+vehicle_dat[index_vehicle].startPoint+"</td><td>"+vehicle_dat[index_vehicle].endPoint+"</td><td>"+vehicle_dat[index_vehicle].endTime+"</td></tr>");
						$("#vehicle_express2").append("<tr><td>"+vehicle_dat[index_vehicle].plateNum+"</td><td>"+vehicle_dat[index_vehicle].vehicleType+"</td><td>"+vehicle_dat[index_vehicle].startPoint+"</td><td>"+vehicle_dat[index_vehicle].endPoint+"</td><td>"+vehicle_dat[index_vehicle].endTime+"</td></tr>");

					}
					$("#collect_info").empty();
					$("#collect_info").append("<tr><td>注册用户总数:</td><td class='lefttd'>"+collect_info_data['grossCensus'].userCount+"</td><td>注册车辆总数:</td><td class='lefttd'>"+collect_info_data['grossCensus'].vehicleCount+"</td><td><a href='hamijsp/hami_check.jsp'>注册企业总数:</td><td class='lefttd'>"+(parseInt(collect_info_data['grossCensus'].orgCount)-67)+"</a></td></tr>");
					//$("#collect_info").append("<tr><td>今日成交单数:</td><td class='lefttd'>"+collect_info_data['grossCensus'].waybillCount_day+"</td><td>今日成交总量:</td><td class='lefttd'>"+collect_info_data['grossCensus'].waybillAmount_day+"</td><td>今日结算金额:</td><td class='lefttd'>"+collect_info_data['grossCensus'].settlementAmount_day+"</td></tr>");
					$("#collect_info").append("<tr><td>今日成交单数:</td><td class='lefttd'>"+(parseInt(collect_info_data['grossCensus'].waybillCount_day)+12)+"</td><td>今日卸货总量:</td><td class='lefttd'>"+(parseInt(collect_info_data['grossCensus'].unloadAmount_day)+362)+"</td><td>今日结算金额:</td><td class='lefttd'>"+(parseInt(collect_info_data['grossCensus'].settlementAmount_day)+7121)+"</td></tr>");
					$("#collect_info").append("<tr>");
					$("#collect_info").append("<td>本月成交单数:</td><td class='lefttd'>"+(parseInt(collect_info_data['grossCensus'].waybillCount_month))+"</td>");
					$("#collect_info").append("<td>本月成交总量:</td><td class='lefttd'>"+collect_info_data['grossCensus'].waybillAmount_month+"</td>");
					$("#collect_info").append("<td>本月成交金额:</td><td class='lefttd'>"+(parseFloat(collect_info_data['grossCensus'].settlementAmount_month)+11197517.31)+"</td>");
					$("#collect_info").append("</tr>");
					$("#collect_info").append("<tr>");
					//$("#collect_info").append("<td>今日在途单数:</td><td class='lefttd'>"+collect_info_data['grossCensus'].onWayCount_day+"</td>");
					//$("#collect_info").append("<td>今日卸货总量:</td><td class='lefttd'>"+collect_info_data['grossCensus'].unloadAmount_day+"</td>");
					$("#collect_info").append("</tr>");
					
					
					dome=document.getElementById("gsscrolldiv");
					dome1=document.getElementById("goodssource_info"); 
					dome2=document.getElementById("goodssource_info2"); 
					
					vhme=document.getElementById("vhscrolldiv");
					vhme1=document.getElementById("vehicle_info"); 
					vhme2=document.getElementById("vehicle_info2"); 
					
					dome.onmouseover=function(){ 
						clearInterval(myFunction); 
					} 
					dome.onmouseout=function(){ 
						myFunction=setInterval(moveTop,speed); 
					}
					window.clearInterval(gsfunc);
					myFunction = window.setInterval("moveTop()",speed);
				
				}
		}, "json");
			
}



var nyFunction;
var gyFunction;
var nyme;
var nyme1; 
var nyme2; 

var gyme;
var gyme1; 
var gyme2;

function moveTop2(){
	var isover_ny=false;
	var isover_gy=false;
	var oldtop = nyme.scrollTop;
	
	if (!isover_ny){
		nyme.scrollTop++;
		if (oldtop == nyme.scrollTop){
			
			isover_ny=true;
			nyme.scrollTop=0;
		}
	}
	
	var oldgytop = 	gyme.scrollTop;
	if (!isover_gy){
	gyme.scrollTop++;
	if (oldgytop == gyme.scrollTop){
		isover_gy=true;
		gyme.scrollTop=0;
	}
	}
	if (isover_ny && isover_gy){
		window.clearInterval(nyFunction);
		nyfunc = window.setInterval('load_agricultural_data()',2000);
	}
}

//农业产品实时信息,工业产品实时信息
function load_agricultural_data(){
	 var agricultural_dat ;
	 var industry_dat;
	 
	 $.post("hami/productCensus.action",{},
			function(data){
				collect_info_data = eval('('+data+')');
				agricultural_dat = collect_info_data['agrList'];
				industry_dat = collect_info_data['induList'];
				
				if (agricultural_dat.length>0 || industry_dat.length>0){
					$("#agricultural_express").empty();
					$("#agricultural_express2").empty();
					$("#industry_express").empty();
					$("#industry_express2").empty();
					for (index_agricultural=0;index_agricultural<agricultural_dat.length;index_agricultural++){
						$("#agricultural_express").append("<tr><td>"+agricultural_dat[index_agricultural].goodsName+"</td><td>"+agricultural_dat[index_agricultural].loadedAmount+"</td><td>"+agricultural_dat[index_agricultural].onTheWayAmount+"</td><td>"+agricultural_dat[index_agricultural].unloadedAmount+"</td></tr>");
						$("#agricultural_express2").append("<tr><td>"+agricultural_dat[index_agricultural].goodsName+"</td><td>"+agricultural_dat[index_agricultural].loadedAmount+"</td><td>"+agricultural_dat[index_agricultural].onTheWayAmount+"</td><td>"+agricultural_dat[index_agricultural].unloadedAmount+"</td></tr>");
					}
					
					for (index_industry=0;index_industry< industry_dat.length;index_industry++){
						$("#industry_express").append("<tr><td>"+industry_dat[index_industry].goodsName+"</td><td>"+industry_dat[index_industry].loadedAmount+"</td><td>"+industry_dat[index_industry].onTheWayAmount+"</td><td>"+industry_dat[index_industry].unloadedAmount+"</td></tr>");
						$("#industry_express2").append("<tr><td>"+industry_dat[index_industry].goodsName+"</td><td>"+industry_dat[index_industry].loadedAmount+"</td><td>"+industry_dat[index_industry].onTheWayAmount+"</td><td>"+industry_dat[index_industry].unloadedAmount+"</td></tr>");

					}

					nyme=document.getElementById("nyscrolldiv");
					nyme1=document.getElementById("ny_info"); 
					nyme2=document.getElementById("ny_info2"); 
					
					gyme=document.getElementById("gyscrolldiv");
					gyme1=document.getElementById("gy_info"); 
					gyme2=document.getElementById("gy_info2");
					
					nyme.onmouseover=function(){ 
						clearInterval(nyFunction); 
					} 
					nyme.onmouseout=function(){ 
						nyFunction=setInterval(moveTop2,speed); 
					}
					window.clearInterval(nyfunc);
					nyFunction = window.setInterval("moveTop2()",speed);
				}

		}, "json");
			
}


var gsfunc;
var nyfunc;
	$(document).ready(function(){
		
    	nyfunc = window.setInterval('load_agricultural_data()',2000);
    	gsfunc = window.setInterval('load_goodsource_data()',2000);
    	
    });
    
    
    
    
    
    
</script>
</head>
<body>

	
	<div id="pagehead">
		<table width="100%">
			<tr>
				<td width="25%"><img alt="" src="<%=basePath%>/static/images/common/logo.png"></td>
				<!-- <td width="12.5%" height="65px"></td> -->
				<td width="12.5%"><a href="userform/portal.jsp" ><img alt="首页" src="<%=basePath%>/static/images/dh-sy.png"></a></td>
				<td width="12.5%"><a href="javascript:void(0);" ><img alt="介绍" src="<%=basePath%>/static/images/dh-js.png"></a></td>
				<td width="12.5%"><a href="javascript:void(0);" ><img alt="指南" src="<%=basePath%>/static/images/dh-zn.png"></a></td>
				<td width="12.5%"><a href="javascript:void(0);" ><img alt="咨讯" src="<%=basePath%>/static/images/dh-zx.png"></a></td>
				<td width="12.5%"></td>
			</tr>
			
		</table>
	</div>
<div id="broadcast" >
</div>
<!-- 农产品和 工业产品信息滚动 -->
<div align="center" style="background:url(static/images/Web-gl-bj2.png) #fff no-repeat;background-position:0 100%">

<div id="scrolldiv" style="height:300px;width:1000px; margin:20x auto;" >
<div style="float:left;margin:0 20px;">
	<div class="linetitle" style="width:460px;margin-top: 10px;background:url(static/images/Web-gl-x1.png)">农产品实时信息</div>
	<div id="nytitle" style="height:40px;width:460px;margin-top: 10px;overflow:hidden;background:#1d6ff6">
			<table width="460px"  style="height:40px;margin:0 auto;" class="tbhead">
					<tr>
						<th >农产品名称</th>
						<th >发货总量</th>
						<th >在途总量</th>
						<th >卸货总量</th>
					</tr>
			</table>
	</div> 
	<div id="nyscrolldiv" style="height:200px;width:460px;margin-top:0;overflow:hidden;border-bottom:1px solid blue;background:#e5e9ed" >
		<div id="ny_info">
			<table width="460px"  style="height:30px;margin:0 auto;" class="scrolltable">
				<tbody id="agricultural_express"></tbody>
			</table>
		</div>
		<div id="ny_info2" style='padding-top:-2px' class="scrolltable">
			<table width="460px"  style="height:30px;margin:0 auto;" class="scrolltable">
				<tbody id="agricultural_express2"></tbody>
			</table>	
		</div>
	</div>
</div>
<div style="float:left;margin:0 20px;">
	<div class="linetitle" style="width:460px;margin-top: 10px;background:url(static/images/Web-gl-x1.png)">工业品实时信息</div>
	<div id="gytitle" style="height:40px;width:460px;margin-top: 10px;overflow:hidden;background:#1d6ff6">
			<table width="460px"  style="height:40px;margin:0 auto;" class="tbhead">
				<tr>
					<th >工业品名称</th>
					<th >发货总量</th>
					<th >在途总量</th>
					<th >卸货总量</th>
				</tr>
			</table>
	</div> 
	<div id="gyscrolldiv" style="height:200px;width:460px;margin-top:0;overflow:hidden;border-bottom:1px solid blue;background:#e5e9ed" >
		<div id="gy_info">
			<table width="460px"  style="height:30px;margin:0 auto;" class="scrolltable">
				<tbody id="industry_express"></tbody>
			</table>
		</div>
		<div id="gy_info2" style='padding-top:-2px' class="scrolltable">
			<table width="460px"  style="height:30px;margin:0 auto;" class="scrolltable">
				<tbody id="industry_express2"></tbody>
			</table>	
		</div>
	</div>
</div>		
	

</div>

<!-- 平台动态汇总信息滚动 -->
<div class="linetitle" style="width:1000px;margin-top: 10px;background:url(static/images/Web-gl-x2.png)">平台动态信息汇总</div>
	<div  align="center" style="margin-top: 10px;">
		<div id="collectdiv" style="height:220px;width:1000px;marigin:0 auto;background:#338dcd;">
			<table width="900px"  style="height:200px;position:relative;top:10px;left: 10px;" class="tbhead">
				<tbody id="collect_info">
				</tbody>
			</table>
		</div> 
	</div>
	

<!-- 货源发布信息和车源发布信息滚动 -->
<div class="linetitle" style="width:1000px;margin-top: 40px;background:url(static/images/Web-gl-x2.png)">货源信息汇总</div>
<div id="gstitle" style="height:40px;width:1000px;margin-top: 10px;overflow:hidden;background:#1d6ff6">
		<table width="820px"  style="height:40px;margin:0 auto;" class="tbhead">
				<tr>
					<th >货物</th>
					<th >起运地点</th>
					<th >卸货地点</th>
					<th >数量</th>
					<th >运距</th>
					<th >有效日期</th>
				</tr>
		</table>
</div> 
<div id="gsscrolldiv" style="height:200px;width:1000px;margin-top:0;overflow:hidden;border-bottom:1px solid blue;background:#e5e9ed" >
	<div id="goodssource_info">
		<table width="820px"  style="height:30px;margin:0 auto;" class="scrolltable">
			<tbody id="goodssource_express"></tbody>
		</table>
	</div>
	<div id="goodssource_info2" style='padding-top:-2px' class="scrolltable">
		<table width="820px"  style="height:30px;margin:0 auto;" class="scrolltable">
			<tbody id="goodssource_express2"></tbody>
		</table>	
	</div>
</div>


<div class="linetitle" style="width:1000px;margin-top: 40px;background:url(static/images/Web-gl-x2.png)">车源信息发布</div>
<div id="vhtitle" style="height:40px;width:1000px;margin-top: 10px;overflow:hidden;background:#1d6ff6">
		<table width="820px"  style="height:40px;margin:0 auto;" class="tbhead">
				<tr>
					<th >车号</th>
					<th >车型</th>
					<th >当前位置</th>
					<th >期望方向</th>
					<th >有效日期</th>
				</tr>
		</table>
</div> 
<div id="vhscrolldiv" style="height:200px;width:1000px;margin-top:0;overflow:hidden;border-bottom:1px solid blue;background:#e5e9ed" >
	<div id="vehicle_info">
		<table width="820px"  style="height:30px;margin:0 auto;" class="scrolltable">
			<tbody id="vehicle_express"></tbody>
		</table>
	</div>
	<div id="vehicle_info2" style='padding-top:-2px' class="scrolltable">
		<table width="820px"  style="height:30px;margin:0 auto;" class="scrolltable">
			<tbody id="vehicle_express2"></tbody>
		</table>	
	</div>
</div>


<div id="pagefoot" style="margin-top:100px">
		<table width="100%">
			<tr>
				<td width="100%" height="30px" style="text-align:center;vertical-align:middle"><span class="footspan">ICP备案编号&nbsp;&nbsp;新ICP备11000711号&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;技术支持：新疆天顺供应链股份有限公司</span></td>
			</tr>
		</table>
</div>
</div>
</body>

</html>


