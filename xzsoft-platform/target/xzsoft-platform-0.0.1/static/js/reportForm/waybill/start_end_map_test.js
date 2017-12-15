var reportDataA = {
  "geoCoord" : null,
  "allLines" : null
}; //报表数据
var pointNameA; // 地点名称
var myChartA;

$(function(){
	// 测试数据
	reportDataA.geoCoord = getGeoCoor();
	reportDataA.allLines = getAllLines();
	showReportForm();
});


/**
 * 显示报表数据
 */
function showReportForm() {

	myChartA = echarts.init(document.getElementById('startEndMain'));

	var option = getDefaultOption();
	myChartA.setOption(option);

	myChartA.on('click', function(params) {
		console.log(params);
		var seriesIndex = params.seriesIndex;
		if (seriesIndex == 0) {
			pointNameA = params.name;
			var newData = getInAndOutData(pointNameA);
			var op = getOptionTest(newData);
			myChartA.setOption(op, true);
		}
	});
}

/**
 * 返回默认视图界面
 * 
 * @return {[type]} [description]
 */
function myChartRefresh(){
    var option = getDefaultOption();
    myChartA.setOption(option,true);
}

/**
 * [getInAndOutData description]
 * @param  {[type]} pointName [description]
 * @return {[type]}           [description]
 */
function getInAndOutData(pointName){
  var allLines = reportDataA.allLines;

  var inMarkLines = [];
  var inMarkPoints = [];
  var outMarkLines = [];
  var outMarkPoints = [];
  
  //var inMarkLinesCount = 0;
  allLines.forEach(function(ele,index){
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

      // inMarkLines inMarkPoints
      if (endName == pointName) {
    	  //inMarkLinesCount += ele[1].value;
          inMarkLines.push(
        		  [{name : startName,value:ele[1].value},{name:endName}]
          );
          inMarkPoints.push({
              name : startName
          });
      }
  });
  
//  for (var i = 0; i < inMarkLines.length; i++) {
//	  var ele = inMarkLines[i];
//	  ele[1].value = inMarkLinesCount;
//  }

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
  var geoCoord = reportDataA.geoCoord;

  // 所有地点
  var allPoints = [];
  for (pro in geoCoord) {
    var pointName = pro;
    allPoints.push({name:pointName});
  }
  //console.log(allPoints);

  // 所有线路
  var allLines = reportDataA.allLines;
  var allLines1 = [];
  var minValue = 0; // 线路value最小值  dataRange
  var maxValue = 0; // 线路value最大值
  allLines.forEach(function(ele,index){
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
      title : {
          text: '运单线路图',
          x:'center',
          textStyle : {
              color: '#fff'
          }
      },
      tooltip : {
          trigger: 'item',
          formatter: '{b}'
      },
      legend: {
          orient: 'vertical',
          x:'left',
          data:['全部'],
          selectedMode : 'single',
          selected:{},
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
                          label:{show:false}
                      },
                      emphasis: {
                          label:{position:'top'}
                      }
                  },
                  data : allPoints
              },
              geoCoord: geoCoord
          }
      ]
    };
return option;
}

/**
 * [getOptionTest description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function getOptionTest(data){
  // 所有地点
  var geoCoord = reportDataA.geoCoord;

  // 所有地点
  var allPoints = [];
  for (pro in geoCoord) {
    var pointName = pro;
    allPoints.push({name:pointName});
  }

  // 所有线路
  var allLines = reportDataA.allLines;
  
  var allLines1 = [];
  var minValue = 0;
  var maxValue = 0;
  allLines.forEach(function(ele,index){
	  var value = ele[1].value;
	  if (value > maxValue) {
		  maxValue = value;
	  }
	  var t = [{name:ele[0].name},{name:ele[1].name}];
	  allLines1.push(t);
  });
  // 图例
  var legend = ['全部',pointNameA+'(进)',pointNameA+'(出)'];

  var selected = {};
  selected[legend[0]] = true;
  selected[legend[1]] = false;
  selected[legend[2]] = false;

  var option = {
	color: [
            'rgba(255, 255, 255, 0.8)',
            'rgba(14, 241, 242, 0.8)',
            'rgba(37, 140, 249, 0.8)'
    ],
    title : {
        text: '运单线路图',
        x:'center',
        textStyle : { color: '#fff' }
    },
    tooltip : {
        trigger: 'item',
        formatter: '{b}'
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
                          label:{show:false}
                      },
                      emphasis: {
                          label:{position:'top'}
                      }
                  },
                  data : allPoints
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



function getGeoCoor(){
  var geoCoord = {
                '上海': [121.4648,31.2891],
                '东莞': [113.8953,22.901],
                '东营': [118.7073,37.5513],
                '中山': [113.4229,22.478],
                '丽水': [119.5642,28.1854],
                '乌鲁木齐': [87.9236,43.5883],
                '保定': [115.0488,39.0948],
                '兰州': [103.5901,36.3043],
                '包头': [110.3467,41.4899],
                '北京': [116.4551,40.2539],
                '南京': [118.8062,31.9208],
                '合肥': [117.29,32.0581],
                '呼和浩特': [111.4124,40.4901],
                '咸阳': [108.4131,34.8706],
                '嘉兴': [120.9155,30.6354],
                '大连': [122.2229,39.4409],
                '太原': [112.3352,37.9413],
                '宁波': [121.5967,29.6466],
                '宿迁': [118.5535,33.7775],
                '广州': [113.5107,23.2196],
                '延安': [109.1052,36.4252],
                '张家口': [115.1477,40.8527],
                '德州': [116.6858,37.2107],
                '成都': [103.9526,30.7617],
                '拉萨': [91.1865,30.1465],
                '武汉': [114.3896,30.6628],
                '江门': [112.6318,22.1484],
                '沈阳': [123.1238,42.1216],
                '河源': [114.917,23.9722],
                '泰州': [120.0586,32.5525],
                '济南': [117.1582,36.8701],
                '海口': [110.3893,19.8516],
                '淮安': [118.927,33.4039],
                '深圳': [114.5435,22.5439],
                '郑州': [113.4668,34.6234],
                '重庆': [107.7539,30.1904],
                '长春': [125.8154,44.2584],
                '长沙': [113.0823,28.2568],
                '长治': [112.8625,36.4746],
                '韶关': [113.7964,24.7028],
                '石河子':[85.94,44.27],
                '和田':[79.94,37.12]
            };
    return geoCoord;
}


function getAllLines(){
  var allLines = [
                    [{name:'北京'},{name:'包头',value:10}],
                    [{name:'北京'},{name:'广州',value:30}],
                    [{name:'北京'},{name:'乌鲁木齐',value:40}],
                    [{name:'北京'},{name:'长春',value:50}],
                    [{name:'北京'},{name:'长治',value:60}],
                    [{name:'北京'},{name:'重庆',value:70}],
                    [{name:'北京'},{name:'长沙',value:80}],
                    [{name:'北京'},{name:'成都',value:90}],

                    [{name:'上海'},{name:'乌鲁木齐',value:10}],
                    [{name:'上海'},{name:'广州',value:30}],
                    [{name:'上海'},{name:'郑州',value:40}],
                    [{name:'上海'},{name:'长春',value:50}],
                    [{name:'上海'},{name:'重庆',value:60}],
                    [{name:'上海'},{name:'长沙',value:70}],
                    [{name:'上海'},{name:'北京',value:80}],
                    [{name:'上海'},{name:'沈阳',value:90}],

                    [{name:'乌鲁木齐'},{name:'合肥',value:10}],
                    [{name:'乌鲁木齐'},{name:'兰州',value:500}],
                    [{name:'乌鲁木齐'},{name:'拉萨',value:65}],
                    [{name:'乌鲁木齐'},{name:'北京',value:60}]
                ];
    return allLines;
}

