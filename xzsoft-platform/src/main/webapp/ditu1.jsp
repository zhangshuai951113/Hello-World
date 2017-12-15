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
    
    <title>ditu1</title>
    
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<!--
	<link rel="stylesheet" type="text/css" href="styles.css">
	-->
	<link rel="stylesheet" href="<%=basePath%>/static/css/common/reset.css" type="text/css" />
	<link rel="stylesheet" href="<%=basePath%>/static/css/home/main.css" type="text/css" />
	
	<script type="text/javascript" src="<%=basePath%>/static/js/common/jquery-3.1.1.js"></script>
	<script type="text/javascript" src="<%=basePath%>/static/js/common/countUp.min.js"></script>
	<script type="text/javascript" src="<%=basePath%>/static/js/index/index.js"></script>
	<script type="text/javascript" src="<%=basePath%>/static/js/home/main.js"></script>
	<script type="text/javascript" src="<%=basePath%>/static/js/reportForm/userDistributionStatistics/echarts-all.js"></script> 
    <%-- <script type="text/javascript" src="<%=basePath%>/static/js/reportForm/userDistributionStatistics/statistics_user_distribution_range.js"></script> --%>
	<script type="text/javascript">
	var reportDataTemp = {
			  "geoCoord" : null,
			  "lineList" : null
			}; //报表数据
			var pointNameTemp; // 地点名称
			var pointSimpleNameTemp; // 地点简称
			var myChartTemp;
			var seriesIndexTemp; // 点击点在哪个series中（1在进中，2在出中）
			$(function(){
				
				var data = getData();
				/**
				 * pointList 所有地点
				 * lineList 所有线路
				 */
				var pointList = data.pointList;
				var lineList = data.lineList;

				// 定义geoCoord - 所有涉及到的地点的经纬度
				var geoCoords = {};
				for (var i = 0; i < pointList.length; i++) {
					var point = pointList[i].point;
					var longitude = pointList[i].longitude;
					var latitude = pointList[i].latitude;
					geoCoords[point] = [longitude,latitude];
				}
				
				// 获取全部路线
				var newLineList = [];
				for (var i = 0; i < lineList.length; i++) {
					var start = lineList[i].start;
					var end = lineList[i].end;
					var total = lineList[i].total;
					var line = [];
					line.push({name:start});
					line.push({name:end,value:total});
					newLineList.push(line);
				}
				
				reportDataTemp.geoCoord = geoCoords;
				reportDataTemp.lineList = newLineList;
				
				showReportForm();
			});

			/**
			 * 获取报表数据
			 */
			function getData(){
				var data;
				var requestPath = window.location.origin + "/xzsoft-platform/";
				$.ajax({
					url: "waybillInfo/getDataForStartEndMap",
					async:false,
					type: 'POST',
					data: {},
					dataType: 'json',
					success: function(resp){
						/**
						 * resp 返回参数
						 * success (true,false)
						 * pointList 成功时，所有地点经纬度
						 * lineList 成功时，线路
						 * msg (失败时返回的数据)
						 */ 
						if (resp) {
							if (resp.success) {
								data = resp;
							} else {
								//alert(resp.msg);
							}
						}
					},
					error: function(){
						//alert("服务请求失败");
					}
				});
				return data;
			}

			/**
			 * 显示报表数据
			 */
			function showReportForm() {

				myChartTemp = echarts.init(document.getElementById('startEndMain'));

				var option = getDefaultOption();
				myChartTemp.setOption(option);

				myChartTemp.on('click', function(params) {
					// 当前地图属于第几个地图
					seriesIndexTemp = params.seriesIndex;
					// 地点全称
					pointNameTemp = params.name;
					// 地点简称
					pointSimpleNameTemp = getPointSimpleName(pointNameTemp);
					var newData = getInAndOutData(pointNameTemp);
					var option = getOption(newData);
					myChartTemp.clear();
					myChartTemp.setOption(option);
					//myChartTemp.refresh();
				});
			}

			/**
			 * [getInAndOutData description]
			 * @param  {[type]} pointName [description]
			 * @return {[type]}           [description]
			 */
			function getInAndOutData(pointName){
			  var lineList = reportDataTemp.lineList;

			  var inMarkLines = [];
			  var inMarkPoints = [];
			  var outMarkLines = [];
			  var outMarkPoints = [];
			  
			  //var inMarkLinesCount = 0;
			  lineList.forEach(function(ele,index){
			      // 起点
			      var startName = ele[0].name; 
			      // 终点
			      var endName = ele[1].name; 

			      // outMarkLines outMarkPoints
			      if (startName == pointName) {
			          outMarkLines.push(
			        		  [{name : startName},{name:endName,value:ele[1].value}]
			          );
			          outMarkPoints.push({
			              name : endName
			          });
			      } 
			      if (endName == pointName) {
			          inMarkLines.push(
			        		  [{name : startName,value:ele[1].value},{name:endName}]
			          );
			          inMarkPoints.push({
			              name : startName
			          });
			      }
			  });

			  var data = {
			      "inMarkLines" : inMarkLines,
			      "inMarkPoints" : inMarkPoints,
			      "outMarkLines" : outMarkLines,
			      "outMarkPoints" : outMarkPoints
			  };
			  return data;
			}


			/**
			 * [getDefaultOption description]
			 * @return {[type]} [description]
			 */
			function getDefaultOption(){
			  // 所有地点
			  var geoCoord = reportDataTemp.geoCoord;

			  // 所有地点
			  var pointList = [];
			  for (pro in geoCoord) {
			    var pointName = pro;
			    pointList.push({name:pointName});
			  }
			  //console.log(pointList);

			  // 所有线路
			  var lineList = reportDataTemp.lineList;
			  var allLines1 = [];
			  var minValue = 0; // 线路value最小值  dataRange
			  var maxValue = 0; // 线路value最大值
			  lineList.forEach(function(ele,index){
				  var value = ele[1].value;
				  if (value > maxValue) {
					  maxValue = value;
				  }
				  var t = [{name:ele[0].name},{name:ele[1].name}];
				  allLines1.push(t);
			  });


			  var option = {
				  color: [
				            'rgba(255, 255, 255, 0.8)',
				            'rgba(14, 241, 242, 0.8)',
				            'rgba(37, 140, 249, 0.8)'
				    ],
//				  color: ['gold','aqua','lime'],
			      title : {
			          text: '运单线路图',
			          x:'center',
			          textStyle : {
			              color: '#fff'
			          }
			      },
			      tooltip : {
			          trigger: 'item',
			          formatter:function (params, ticket, callback) {
			        	  var simpleName = getPointSimpleName(params.name);
			        	  return simpleName;
			          }
			      },
			      legend: {
			          orient: 'vertical',
			          x:'left',
			          data:['全部'],
			          selectedMode : 'single',
			          selected:{
			        	  '全部' : true
			          },
			          textStyle : { color: '#fff' }
			      },
			      series : [
			          // 全部
			          {
			              name: '全部',
			              type: 'map',
			              clickable:false,
			              roam: true,
			              hoverable: false,
			              mapType: 'china',
			              itemStyle:{
			                  normal:{
			                      borderColor:'rgba(100,149,237,1)',
			                      borderWidth:1.5,
			                      areaStyle:{
			                          color: '#1b1b1b'
			                      }
			                  }
			              },
			              data:[],
			              markLine : {
			            	  clickable:false,
			                  smooth:true,
			                  symbol: ['none', 'circle'],  
			                  symbolSize : 1,
			                  effect : {
			                      show: true,
			                      scaleSize: 1,
			                      period: 30,
			                      color: '#fff',
			                      shadowBlur: 10
			                  },
			                  itemStyle : {
			                      normal: {
			                          color:'#fff',
			                          borderWidth:1,
			                          borderColor:'rgba(30,144,255,0.5)'
			                          
			                      }
			                  },
			                  data : allLines1,
			              },
			              markPoint : {
			                  symbol:'pin',
			                  symbolSize : 3,
			                  clickable:true,
			                  itemStyle:{
			                      normal:{
			                    	  color:'#BFEFFF',
			                          label:{
			                        	  show:false
			                          }
			                      },
			                      emphasis: {
			                          label:{
			                        	  show:true,
			                        	  position:'top'
			                          }
			                      }
			                  },
			                  data : pointList
			              },
			              geoCoord: geoCoord
			          }
			      ]
			    };
			return option;
			}


			/**
			 * [getOption description]
			 * @param  {[type]} data [description]
			 * @return {[type]}      [description]
			 */
			function getOption(data){
			  // 所有地点
			  var geoCoord = reportDataTemp.geoCoord;

			  // 所有地点
			  var pointList = [];
			  for (pro in geoCoord) {
			    var pointName = pro;
			    pointList.push({name:pointName});
			  }

			  // 所有线路
			  var lineList = reportDataTemp.lineList;
			  
			  var allLines1 = [];
			  var minValue = 0;
			  var maxValue = 0;
			  lineList.forEach(function(ele,index){
				  var value = ele[1].value;
				  if (value > maxValue) {
					  maxValue = value;
				  }
				  var t = [{name:ele[0].name},{name:ele[1].name}];
				  allLines1.push(t);
			  });
			  // 图例
			  var legend = ['全部',pointSimpleNameTemp+'(进)',pointSimpleNameTemp+'(出)'];

			  
			  
			  var selected = {};
			  if (seriesIndexTemp == 1) {
				  selected[legend[0]] = false;
				  selected[legend[1]] = false;
				  selected[legend[2]] = true;
			  } else if (seriesIndexTemp == 2) {
				  selected[legend[0]] = false;
				  selected[legend[1]] = true;
				  selected[legend[2]] = false;
			  } else {
				  if (data.inMarkLines.length > 0) {
					  selected[legend[0]] = false;
					  selected[legend[1]] = true;
					  selected[legend[2]] = false;
				  } else if (data.outMarkLines.length > 0) {
					  selected[legend[0]] = false;
					  selected[legend[1]] = false;
					  selected[legend[2]] = true;
				  } else {
					  selected[legend[0]] = false;
					  selected[legend[1]] = false;
					  selected[legend[2]] = false;
				  }
				  
			  }
			  
			  
			  var option = {
				color: [
			            'rgba(255, 255, 255, 0.8)',
			            'rgba(14, 241, 242, 0.8)',
			            'rgba(37, 140, 249, 0.8)'
			    ],
//			    color: ['gold','aqua','lime'],
			    title : {
			        text: '运单线路图',
			        x:'center',
			        textStyle : { color: '#fff' }
			    },
			    tooltip : {
			        trigger: 'item',
			        formatter:function (params, ticket, callback) {
			      	  var simpleName = getPointSimpleName(params.name);
			      	  return simpleName;
			        }
			    },
			    legend: {
			        orient: 'vertical',
			        x:'left',
			        data:legend,
			        selectedMode:'single',
			        selected : selected,
			        textStyle : { color: '#fff' }
			    },
			    dataRange: {
			    	show:true,
			        min : minValue,
			        max : maxValue,
			        x: 'right',
			        calculable : true,
			        color: ['#ff3333', 'orange', 'yellow','lime','aqua'],
			        itemWidth: 10,
			        textStyle:{ color:'#fff' },
			        
			    },
			    series : [
			          // 全部
			          {
			              name: legend[0],
			              type: 'map',
			              clickable:false,
			              roam: true,
			              hoverable: false,
			              mapType: 'china',
			              itemStyle:{
			                  normal:{
			                      borderColor:'rgba(100,149,237,1)',
			                      borderWidth:1.5,
			                      areaStyle:{
			                          color: '#1b1b1b'
			                      }
			                  }
			              },
			              data:[],
			              markLine : {
			            	  clickable:false,
			                  smooth:true,
			                  symbol: ['none', 'circle'],  
			                  symbolSize : 1,
			                  effect : {
			                      show: true,
			                      scaleSize: 1,
			                      period: 30,
			                      color: '#fff',
			                      shadowBlur: 10
			                  },
			                  itemStyle : {
			                      normal: {
			                          color:'#fff',
			                          borderWidth:1,
			                          borderColor:'rgba(30,144,255,0.5)'
			                      }
			                  },
			                  data : allLines1,
			              },
			              markPoint : {
			            	  clickable:true,
			                  symbol:'pin',
			                  symbolSize : 3,
			                  itemStyle:{
			                      normal:{
			                    	  color:'#BFEFFF',
			                          label:{show:false}
			                      },
			                      emphasis: {
			                          label:{position:'top'}
			                      }
			                  },
			                  data : pointList
			              },
			              geoCoord: geoCoord
			          },
			        // 进
			        {
			            name: legend[1],
			            type: 'map',
			            mapType: 'china',
			            clickable:false,
			            data:[],
			            markLine : {
			            	clickable:false,
			                smooth:true,
			                effect : {
			                    show: true,
			                    scaleSize: 1,
			                    period: 30,
			                    color: '#fff',
			                    shadowBlur: 10
			                },
			                itemStyle : {
			                    normal: {
			                        borderWidth:1,
			                        lineStyle: {
			                            type: 'solid',
			                            shadowBlur: 10
			                        },
						            label: {
						              	show: true,
						              	position:'start',
						              	textStyle: {
						              		align: 'center',
						              		baseline: 'bottom'
						              	}
						            }
			                    }
			                },
			                data : data.inMarkLines
			            },
			            markPoint : {
			            	clickable:true,
			                symbol:'emptyCircle',
			                symbolSize : function (v){
			                    return 10 + v/10
			                },
			                effect : {
			                    show: true,
			                    shadowBlur : 0
			                },
			                itemStyle:{
			                    normal:{
			                        label:{show:false}
			                    },
			                    emphasis: {
			                        label:{position:'top'}
			                    }
			                },
			                data : data.inMarkPoints
			            }
			        },
			        // 出
			        {
			            name: legend[2],
			            type: 'map',
			            mapType: 'china',
			            clickable:false,
			            data:[],
			            markLine : {
			            	clickable:false,
			                smooth:true,
			                effect : {
			                    show: true,
			                    scaleSize: 1,
			                    period: 30,
			                    color: '#fff',
			                    shadowBlur: 10
			                },
			                itemStyle : {
			                    normal: {
			                        borderWidth:1,
			                        lineStyle: {
			                            type: 'solid',
			                            shadowBlur: 10
			                        }
			                    }
			                },
			                data : data.outMarkLines
			            },
			            markPoint : {
			            	clickable:true,
			                symbol:'emptyCircle',
			                symbolSize : function (v){
			                    return 10 + v/10
			                },
			                effect : {
			                    show: true,
			                    shadowBlur : 0
			                },
			                itemStyle:{
			                    normal:{
			                        label:{show:false}
			                    },
			                    emphasis: {
			                        label:{position:'top'}
			                    }
			                },
			                data : data.outMarkPoints
			            }
			        }
			          
			      ]
			  };
			  return option;
			}
			/**
			 * 获得地点名称简称
			 * @param pointName
			 */
			function getPointSimpleName(name){
				var array = name.split('>');
				var length = array.length;
				if ( length == 1) {
					var array1 = array[0].split('/');
					length = array1.length;
					return array1[length - 1];
				} else if (length == 2) {
					var array1 = array[0].split('/');
					var array2 = array[1].split('/');
					var length1 = array1.length;
					var length2 = array2.length;
					var name1 = array1[length1-1];
					var name2 = array2[length2-1];
					return name1 + " > " + name2
				}
				
				return '';
			}

	</script>
</head>
<body>
	<!------------------------数据信息部分------------------------------>
	<div class="data-info">
		<div class="main">
			<!-- <div id="amain" style="width:99%;height:80%;"></div> -->
		<!-- 运单线路报表 -->
			<div id="startEndMain" style="width:99%;height:80%;margin-top:1%"></div>
 			
		</div>
	</div>

	
	
</body>
</html>
