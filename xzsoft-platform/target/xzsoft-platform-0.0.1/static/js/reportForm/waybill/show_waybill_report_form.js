(function($) {

	showReportFrom();
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


function showReportFrom() {
	// 时间1
	var startDate = $.trim($("#startDate").val());
	// 时间2
	var endDate = $.trim($("#endDate").val());
	// 当前年份
	var year = new Date().getFullYear();
	$.ajax({
		url: basePath + "/waybillInfo/getDataForWaybillReport",
		type: 'POST',
		data: {"startDate":startDate,"endDate":endDate,"year":year},
		dataType: 'json',
		success: function(resp){
			/**
			 * resp 返回参数
			 * success (true,false)
			 * type (0:默认查询（没有日期参数）,1:非默认查询)
			 * data (成功时返回的数据)
			 * msg (失败时返回的数据)
			 */ 
			if (resp) {
				if (resp.success) {
					var myChart = echarts.init(document.getElementById('main'));
					var option = null;
					if (resp.type == 1) {
						option = getOption(resp.data);
					} else {
						option = getOptionDefault(resp.data);
					}
					// 使用刚指定的配置项和数据显示图表
					myChart.setOption(option);
				} else {
					xjValidate.showTip(resp.msg);
				}
			}
		},
		error: function(){
			xjValidate.showTip("服务请求失败");
		}
	});
	
}

/**
 * 生成默认图表
 */
function getOptionDefault(data) {
	
	var date=new Date();
	var year=date.getFullYear(); 
	
	//运单状态（1：新建 2：已派发 3：已撤回 4：已拒绝 5：已接单 6：已装货 7：在途 8：已卸货 9：已挂账 10：已发布 11:已回收报价）
	var waybillStatus = ['新建','已派发','已撤回','已拒绝','已接单',
	                     '已装货','在途','已卸货','已挂账','已发布',
	                     '已回收报价'];
	
	var opData01=[],opData02=[],opData03=[],opData04=[],opData05=[],
		opData06=[],opData07=[],opData08=[],opData09=[],opData10=[],
		opData11=[],opData12=[];

	$.each(data,function(index,ele){
		if (ele.planTransportDateMonth == '01') {
			opData01.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '02') {
			opData02.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '03') {
			opData03.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '04') {
			opData04.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '05') {
			opData05.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '06') {
			opData06.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '07') {
			opData07.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '08') {
			opData08.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '09') {
			opData09.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '10') {
			opData10.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '11') {
			opData11.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		} else if (ele.planTransportDateMonth == '12') {
			opData12.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
		}
	});

	var opDatas = [];
	opDatas.push(opData01);opDatas.push(opData02);opDatas.push(opData03);opDatas.push(opData04);opDatas.push(opData05);
	opDatas.push(opData06);opDatas.push(opData07);opDatas.push(opData08);opDatas.push(opData09);opDatas.push(opData10);
	opDatas.push(opData11);opDatas.push(opData12);
	
	
	
	// 制作timeline数据
	var timeLineData = [];
	/*
	for (var i = 1; i < 13; i++) {
		if (i < 10) {
			timeLineData.push(year+'-0'+i);
		} else {
			timeLineData.push(year+'-'+i);
		}
		
	}

*/
	
	// 生成图表对象
	var ops = [];
	
	for (var i = 0; i < 12; i++) {
		var opData = opDatas[i];
		if (opData.length > 0) {

			if (i < 9) {
				timeLineData.push(year+'-0'+(i+1));
			} else {
				timeLineData.push(year+'-'+(i+1));
			}
			
			var op = {
					title : {
						text : year+'年'+(i+1)+'月份运单统计'
					},
					series : [ {
						data : opData
					} ]
				};
			ops.push(op);
		}
		
		
	}

	var option = {
		baseOption : {
			legend: {
		        x: 'left',
		        orient: 'vertical',
		        top: 'middle',
		        data: ['新建','已派发','已撤回','已拒绝','已接单',
	                   '已装货','在途','已卸货','已挂账','已发布',
	                   '已回收报价']
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
			timeline : {
				itemStyle : {
					normal : {
						color : '#04a5f1'
					},
					emphasis : {
						color : '#04a5f1'
					}
				},
				lineStyle : {
					color : '#ddd'
				},
				checkpointStyle : {
					color : '#04a5f1',
					borderColor : 'rgba(4, 165, 261, .5)'
				},
				loop: true,
				playInterval:2000,
				label:{
					normal : {
						formatter: function (value, index) {
						    // 格式化成月/日，只在第一个刻度显示年份
						    var date = new Date(value);
						    var month = date.getMonth() + 1;
						    if (month < 10) {
						    	return '0'+month;
						    } else {
						    	return month;
						    }
						    
						}
					}
				},
				autoPlay: true,
				data : timeLineData
			},
			tooltip : {
				trigger : 'item',
				formatter : "{a} <br/>{b} : {c} ({d}%)"
			},
			backgroundColor : '#fff',
			series : [ {
				name : '库存情况',
				type : 'pie',
				radius : '68%',
				center : [ '50%', '50%' ],
				clockwise : false,

				label : {
					normal : {
						textStyle : {
							color : '#999',
							fontSize : '12',
							fontWeight : 'normal'
						}
					}
				},
				labelLine : {
					normal : {
						show : true
					}
				},
				itemStyle : {
					normal : {
						borderWidth : 4,
						borderColor : '#ffffff',
					},
					emphasis : {
						borderWidth : 0,
						shadowBlur : 10,
						shadowOffsetX : 0,
						shadowColor : 'rgba(0, 0, 0, 0.5)'
					}
				}
			} ],
			color : [ '#00acee', '#52cdd5', '#79d9f1', '#a7e7ff', '#c8efff',
			          '#00FFFF','#00B2EE','#436EEE','#66CDAA','#4EEE94',
			          '#00FF00'
			]
		},

		options : ops
	};

	return option;
}

/**
 * 生成带日期的图表
 * 
 * @param data
 */
function getOption(data){
	// 时间1
	var startDate = $.trim($("#startDate").val());
	// 时间2
	var endDate = $.trim($("#endDate").val());

	var title = '';
	if (isEmpty(startDate) && !isEmpty(endDate)) {
		title = endDate+'之前运单状态';
	}
	if (!isEmpty(startDate) && isEmpty(endDate)) {
		title = startDate+'之后运单状态';
	}
	if (!isEmpty(startDate) && !isEmpty(endDate)) {
		title = startDate+'至'+endDate+'之间运单状态';
	}
	
	//运单状态（1：新建 2：已派发 3：已撤回 4：已拒绝 5：已接单 6：已装货 7：在途 8：已卸货 9：已挂账 10：已发布 11:已回收报价）
	var waybillStatus = ['新建','已派发','已撤回','已拒绝','已接单',
	                     '已装货','在途','已卸货','已挂账','已发布',
	                     '已回收报价'];
	
	var opData = [];
	$.each(data,function(index,ele){
		opData.push({value : ele.count, name : waybillStatus[ele.waybillStatus-1]});
	});

	var option = {
			title : {
		        text: title,
		        x:'left'
		    },
			tooltip : {
				trigger : 'item',
				formatter : "{a} <br/>{b} : {c} ({d}%)"
			},
			legend: {
		        orient: 'vertical',
		        x: 'left',
		        top: 'middle',
		        data: ['新建','已派发','已撤回','已拒绝','已接单',
	                   '已装货','在途','已卸货','已挂账','已发布',
	                   '已回收报价']
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
			backgroundColor : '#fff',
			series : {
				name : '运单状态',
				type : 'pie',
				radius : '68%',
				center : [ '50%', '50%' ],
				clockwise : false,
				label : {
					normal : {
						textStyle : {
							color : '#999',
							fontSize : '12',
							fontWeight : 'normal'
						}
					}
				},
				labelLine : {
					normal : {
						show : true
					}
				},
				itemStyle : {
					normal : {
						borderWidth : 4,
						borderColor : '#ffffff',
					},
					emphasis : {
						borderWidth : 0,
						shadowBlur : 10,
						shadowOffsetX : 0,
						shadowColor : 'rgba(0, 0, 0, 0.5)'
					}
				},
				data : opData
			},
			color : [ '#00acee', '#52cdd5', '#79d9f1', '#a7e7ff', '#c8efff',
			          '#00FFFF','#00B2EE','#436EEE','#66CDAA','#4EEE94',
			          '#00FF00']
		
	};

	return option;
}

function isEmpty(str){
	if (str == '' || str == null || str == undefined) {
		return true;
	}
	return false;
	
}

