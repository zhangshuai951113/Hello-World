$(function(){
	report();
});


function report(){
	// 获取数据
	$.ajax({
		url: basePath + "/accountCheckInfo/getAccountCheckDataForReport",
		asyn: false,
		type: "POST",
		data: {},
		dataType: "json",
		beforeSend: function(){ },
		success: function(data) { 
			if (data) {
				if (data.success) {
					// 基于准备好的dom，初始化echarts实例
					var myChart = echarts.init(document.getElementById('account_check_report_view'));
					var option = createOption(data.data);
					// 使用刚指定的配置项和数据显示图表。
					myChart.setOption(option);
				} else {
					xjValidate.showTip(data.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
			}
		},
		error:function(){ },
		complete: function(){}
	});	
}

function createOption(data){

	// 对账单状态（1：起草 2：待审核 3：审核通过 4：驳回）
	// 待对账（起草、驳回） 数量、金额
	var ddzCountData = data.ddzCountData;
	var ddzTotalData = data.ddzTotalData;
	changeArrayEmptyValue(ddzCountData);
	changeArrayEmptyValue(ddzTotalData);
	// 待审核 数量、金额
	var dshCountData = data.dshCountData;
	var dshTotalData = data.dshTotalData;
	changeArrayEmptyValue(dshCountData);
	changeArrayEmptyValue(dshTotalData);
	// 审核通过 数量、金额
	var shwcCountData = data.shwcCountData;
	var shwcTotalData = data.shwcTotalData;
	changeArrayEmptyValue(shwcCountData);
	changeArrayEmptyValue(shwcTotalData);
	
	// 指定图表的配置项和数据
	var option = {
	    title: {
	    	show: true,
	        text: '对账报表',
	        x: 'left',
	        y: 'top',
	        padding: 0,
	        textStyle : {
	        	fontFamily:'Arial',
	        	fontSize: 25,
		        fontWeight: "900",
		        fontStyle: 'normal',
		        color:'#54AFDB'
	        }
	    },
	    tooltip : {
	        trigger: 'item'
	    },
	    legend: {
	        data:['待对账','待审核','审核通过']
	    },
	    toolbox: {
	        show : true,
	        feature : {
	            mark : {show: true},
	            dataView : {show: true, readOnly: false},
	            magicType : {show: true, type: ['line', 'bar']},
	            restore : {show: true},
	            saveAsImage : {show: true}
	        }
	    },
	    xAxis: {
	    	type : 'category',
	    	name : '月份',
	    	splitLine:{
	    		show : false
	    	},
	    	data : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
	    },
	    yAxis: [
	            {
	                type : 'value',
	                name : '数量',
	                position : 'left',
	                nameLocation: 'end'
	            }
	    ],
	    series : [
	              {
	                  name:'待对账',
	                  type:'bar',
	                  data:ddzCountData,
	                  tooltip:{
	                	  show:true,
	                	  trigger:'item',
	                	  formatter:function(params){
	                		  var seriesName = params.seriesName;
	                		  var name = params.name;
	                		  var dataIndex = params.dataIndex;
	                		  var data = params.data;
	                		  var payableTotal = ddzTotalData[dataIndex];
	                		  var html = '';
	                		  html += '<div>'+seriesName+'</div>';
	                		  html += '<div>'+name+'</div>';
	                		  html += '<div>数量：'+data+'</div>';
	                		  html += '<div>应付总额：'+payableTotal+'</div>';	              
	                		  return html;
	                	  }
	                  },
	                  itemStyle: {
	                      normal: { 
	                    	  color : function(){
	                    		  return '#2EC7C9';
	                    	  },
	                          label : {
	                              show: true, 
	                              position: 'top',
	                              formatter: function(params){
	                            	  var name = params.name;
	                            	  var dataIndex = 0;
	                            	  if (name == '1月') {dataIndex = 0;}
	                            	  if (name == '2月') {dataIndex = 1;}
	                            	  if (name == '3月') {dataIndex = 2;}
	                            	  if (name == '4月') {dataIndex = 3;}
	                            	  if (name == '5月') {dataIndex = 4;}
	                            	  if (name == '6月') {dataIndex = 5;}
	                            	  if (name == '7月') {dataIndex = 6;}
	                            	  if (name == '8月') {dataIndex = 7;}
	                            	  if (name == '9月') {dataIndex = 8;}
	                            	  if (name == '10月') {dataIndex = 9;}
	                            	  if (name == '11月') {dataIndex = 10;}
	                            	  if (name == '12月') {dataIndex = 11;}
	    	                		  //var dataIndex = params.dataIndex; 
	    	                		  var payableTotal = ddzTotalData[dataIndex]; 
	    	                		  return payableTotal;
	                              }
	                          }
	                      }
	                  }
	                  
	              },
	              {
	                  name:'待审核',
	                  type:'bar',
	                  data:dshCountData,
	                  tooltip:{
	                	  show:true,
	                	  trigger:'item',
	                	  formatter:function(params){
	                		  var seriesName = params.seriesName;
	                		  var name = params.name;
	                		  var dataIndex = params.dataIndex;
	                		  var data = params.data;
	                		  var payableTotal = dshTotalData[dataIndex];
	                		  var html = '';
	                		  html += '<div>'+seriesName+'</div>';
	                		  html += '<div>'+name+'</div>';
	                		  html += '<div>数量：'+data+'</div>';
	                		  html += '<div>应付总额：'+payableTotal+'</div>';	              
	                		  return html;
	                	  }
	                  },itemStyle: {
	                      normal: {
	                    	  color : function(){
	                    		  return '#B6A2DE';
	                    	  },
	                          label : {
	                              show: true, 
	                              position: 'top',
	                              formatter: function(params){
	                            	  var name = params.name;
	                            	  var dataIndex = 0;
	                            	  if (name == '1月') {dataIndex = 0;}
	                            	  if (name == '2月') {dataIndex = 1;}
	                            	  if (name == '3月') {dataIndex = 2;}
	                            	  if (name == '4月') {dataIndex = 3;}
	                            	  if (name == '5月') {dataIndex = 4;}
	                            	  if (name == '6月') {dataIndex = 5;}
	                            	  if (name == '7月') {dataIndex = 6;}
	                            	  if (name == '8月') {dataIndex = 7;}
	                            	  if (name == '9月') {dataIndex = 8;}
	                            	  if (name == '10月') {dataIndex = 9;}
	                            	  if (name == '11月') {dataIndex = 10;}
	                            	  if (name == '12月') {dataIndex = 11;}
	    	                		  //var dataIndex = params.dataIndex; // 7
	    	                		  var payableTotal = dshTotalData[dataIndex];              
	    	                		  return payableTotal;
	                              }
	                          }
	                      }
	                  }
	              },
	              {
	            	  name:'审核通过',
	                  type:'bar',
	                  data:shwcCountData,
	                  tooltip:{
	                	  show:true,
	                	  trigger:'item',
	                	  formatter:function(params){
	                		  var seriesName = params.seriesName; // "审核通过"
	                		  var name = params.name; // 8月
	                		  var dataIndex = params.dataIndex; // 7
	                		  var data = params.data; // 20
	                		  var payableTotal = shwcTotalData[dataIndex];
	                		  var html = '';
	                		  html += '<div>'+seriesName+'</div>';
	                		  html += '<div>'+name+'</div>';
	                		  html += '<div>数量：'+data+'</div>';
	                		  html += '<div>应付总额：'+payableTotal+'</div>';	              
	                		  return html;
	                	  }
	                  },itemStyle: {
	                      normal: {
	                    	  color : function(){
	                    		  return '#70B6E7';
	                    	  },
	                          label : {
	                              show: true, 
	                              position: 'top',
	                              formatter: function(params){
	                            	  var name = params.name;
	                            	  var dataIndex = 0;
	                            	  if (name == '1月') {dataIndex = 0;}
	                            	  if (name == '2月') {dataIndex = 1;}
	                            	  if (name == '3月') {dataIndex = 2;}
	                            	  if (name == '4月') {dataIndex = 3;}
	                            	  if (name == '5月') {dataIndex = 4;}
	                            	  if (name == '6月') {dataIndex = 5;}
	                            	  if (name == '7月') {dataIndex = 6;}
	                            	  if (name == '8月') {dataIndex = 7;}
	                            	  if (name == '9月') {dataIndex = 8;}
	                            	  if (name == '10月') {dataIndex = 9;}
	                            	  if (name == '11月') {dataIndex = 10;}
	                            	  if (name == '12月') {dataIndex = 11;}
	    	                		  //var dataIndex = params.dataIndex; // 7
	    	                		  var payableTotal = shwcTotalData[dataIndex];              
	    	                		  return payableTotal;
	                              }
	                          }
	                      }
	                  }
	              }
	          ]

	};
	
	return option;
}

/**
 * 处理数组中的空元素
 * @param array
 */
function changeArrayEmptyValue(array){
	for (var i = 0; i < array.length; i++) {
		if (array[i] == '' || array[i] == null || array[i] == undefined) {
			array[i] = 0;
		} else {
			array[i] =  Number(array[i]);
		}
	}
}
