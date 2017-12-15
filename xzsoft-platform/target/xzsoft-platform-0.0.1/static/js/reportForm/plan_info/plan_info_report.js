(function($) {
	report();
	//时间调用插件
	setTimeout(function() {
		$(".date-time").datetimepicker({
			format : "YYYY-MM-DD",
			autoclose : true,
			todayBtn : true,
			todayHighlight : true,
			showMeridian : true,
			pickTime : false
		});
	}, 500);
})(jQuery);

function report(){
	
	var startDate = $.trim($("#startDate").val());// 开始日期
	var endDate = $.trim($("#endDate").val());// 结束日期
	var data = {"startDate":startDate,"endDate":endDate};
	// 获取数据
	$.ajax({
		url: basePath + "/planInfo/getDataForReport",
		asyn: false,
		type: "POST",
		data: data,
		dataType: "json",
		beforeSend: function(){ },
		success: function(resp) { 
			if (resp) {
				if (resp.success) {
					// 基于准备好的dom，初始化echarts实例
					var myChart = echarts.init(document.getElementById('plan_info_report_view'));
					console.log(resp);
					var option = getOption(resp.data);
					myChart.setOption(option);
				} else {
					xjValidate.showTip(resp.msg);
				}
			} else {
				xjValidate.showTip("服务异常忙，请稍后重试");
			}
		},
		error:function(){},
		complete: function(){}
	});	
}

function getOption(data){
	/**
	 * data
	 * list1 第一个饼 [{name:'',count:10},...]
	 * 	name 的值是 1、2、3、4、5、6 计划状态（1：新建 2：审核中 3：审核通过 4：审核驳回 5：已派发 6：已撤回）
	 * 	count 每个状态分别对应的数量
	 * list2 第二个圈 [{name:'',count:10},...]
	 * 	name 的值是 1-0、1-1、2-0、2-1。。。。。。（第一个值是状态，第二个值是是否已拆分） 0：未拆分、1：已拆分
	 * 	count 每个状态分别对应的数量
	 * list3 第三个圈 [{name:'',count:10},...]
	 * 	name 的值是 1-0-0、1-0-1、1-1-0、1-1-1。。。。。。（第一个值是状态，第二个值是是否已拆分，第三个值是是否生成了运单） 0：未生成运单、1：已生成运单
	 * 	count 每个状态分别对应的数量
	 */

	// 样式
	var dataStyle = { 
	    normal: {
	        label: {show:false},
	        labelLine: {show:false},
	        shadowBlur: 40,
	        shadowColor: 'rgba(40, 40, 40, 0.5)',
	    }
	};
	var placeHolderStyle = {
	    normal : {
	        color: 'rgba(0,0,0,0)',
	        label: {show:false},
	        labelLine: {show:false}
	    },
	    emphasis : {
	        color: 'rgba(0,0,0,0)'
	    }
	};
	
	// 计划数据

	/**
	 * list1
	 */
	var list1 = data.list1;
	var statusList = ['新建','审核中','审核通过','审核驳回','已派发','已撤回'];
	var list1Data = [];
	for (var i = 0; i < list1.length; i++) {
		var ele = list1[i];
		list1Data.push({
			name : statusList[ele.name-1],
			value : ele.count
		});
	}
	
	/**
	 * list2
	 * 计划类型（1：物流计划 2：自营计划）
	 * 业务中：自营计划-审核通过、物流计划-已派发 的计划才可以进行计划拆分
	 * 3-0、3-1
	 * 5-0、5-1 
	 * 其它的归为一类
	 */ 
	var list2 = data.list2;
	var splitList = ['未拆分','已拆分'];
	var list2Data = [];

	for (var i = 0; i < list2.length; i++) {
		var ele = list2[i];
		if (ele.name == '3-0' || ele.name == '5-0' ) {
			list2Data.push({
				name : '未拆分',
				value : ele.count,
				itemStyle : dataStyle,
				label: {
	                normal: {
	                	show: true,
	                    position: 'inner'
	                }
	            },
	            labelLine: {
	                normal: {
	                    show: true
	                }
	            },
			});
		} else if (ele.name == '3-1' || ele.name == '5-1') {
			list2Data.push({
				name : '已拆分',
				value : ele.count,
				itemStyle : dataStyle,
				label: {
	                normal: {
	                	show: true,
	                    position: 'inner'
	                }
	            },
	            labelLine: {
	                normal: {
	                    show: true
	                }
	            },
			});
		}else {
			list2Data.push({
				name : ele.name,
				value : ele.count,
				itemStyle : placeHolderStyle
			});
		}
	}

	
	/**
	 * list3
	 * 业务中：只有拆分过的计划才可以生成运单
	 * 3-1-0、3-1-1
	 * 5-1-0、5-1-1
	 * 其它归为一类
	 */
	var list3 = data.list3;
	var createList = ['未生成运单','已生成运单'];
	var list3Data = [];
	for (var i = 0; i < list3.length; i++) {
		var ele = list3[i];
		if (ele.name == '3-1-0' || ele.name == '5-1-0') {
			list3Data.push({
				name : '未生成运单',
				value : ele.count,
				itemStyle : dataStyle,
				label: {
	                normal: {
	                	show: true,
	                    position: 'outside'
	                }
	            },
	            labelLine: {
	                normal: {
	                    show: true
	                }
	            },
			});
		} else if (ele.name == '3-1-1' || ele.name == '5-1-1') {
			list3Data.push({
				name : '已生成运单',
				value : ele.count,
				itemStyle : dataStyle,
				label: {
	                normal: {
	                	show: true,
	                    position: 'outside'
	                }
	            },
	            labelLine: {
	                normal: {
	                    show: true
	                }
	            },
			});
		} else {
			list3Data.push({
				name : ele.name,
				value : ele.count,
				itemStyle : placeHolderStyle
			});
		}
		
	}
	
	// 指定图表的配置项和数据
	var option = {
		    title : {
		        text: '计划报表',
		        x:'center'
		    },
		    tooltip : {
		        trigger: 'item',
		        formatter: "{a} <br/>{b} : {c} ({d}%)"
		    },
		    legend: {
		        orient : 'vertical',
		        x : 'left',
		        data:['新建','审核中','审核通过','审核驳回','已派发','已撤回','已拆分','未拆分','已生成运单','未生成运单']
		    },
		    toolbox: {
		        show : true,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: false},
		            magicType : {
		                show: true, 
		                type: ['pie', 'funnel'],
		                option: {
		                    funnel: {
		                        x: '25%',
		                        width: '50%',
		                        funnelAlign: 'center',
		                        max: 1548
		                    }
		                }
		            },
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    
		    calculable : true,
		    series : [
		        {
		            name:'状态',
		            type:'pie',
		            clockWise:false,
		            radius : [0,100],
		            label: {
		                normal: {
		                    position: 'inner'
		                }
		            },
		            data:list1Data
		        },{
		            name:'计划拆分',
		            type:'pie',
		            clockWise:false,
		            radius : [120, 160],
		            data:list2Data
		        },{
		            name:'运单生成',
		            type:'pie',
		            clockWise:false,
		            radius : [180, 220],
		            data:list3Data
		        }
		        
		    ]
		};

	return option;
}
