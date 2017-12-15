(function($) {
	//showWaybillInfoStatisticsReportForm();
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

/**
 * 运单统计报表嵌套饼状图展示
 */
function waybillInfoReportForm(data) {
	// 基于准备好的dom，初始化echarts实例
	var myChart = echarts.init(document.getElementById('main'));
	var defaultLegend = [ '未接单', '已派发', '已拒绝', '已发布', '在途', '已接单', '已装货',
			'已卸货', '其他' ];
	var dataLegend = [];
	var dataSeries = [];
	console.log(data);
	if (data.missed != 0) {
		dataLegend.push('未接单');
		dataSeries.push({
			value : data.missed,
			name : '未接单'
		});
	}
	if (data.onPassage != 0) {
		dataLegend.push('在途');
		dataSeries.push({
			value : data.onPassage,
			name : '在途'
		});
	}
	if (data.distribute != 0) {
		dataLegend.push('已派发');
		dataSeries.push({
			value : data.distribute,
			name : '已派发'
		});
	}
	if (data.reject != 0) {
		dataLegend.push('已拒绝');
		dataSeries.push({
			value : data.reject,
			name : '已拒绝'
		});
	}
	if (data.release != 0) {
		dataLegend.push('已发布');
		dataSeries.push({
			value : data.release,
			name : '已发布'
		});
	}
	if (data.received != 0) {
		dataLegend.push('已接单');
		dataSeries.push({
			value : data.received,
			name : '已接单'
		});
	}
	if (data.loading != 0) {
		dataLegend.push('已装货');
		dataSeries.push({
			value : data.loading,
			name : '已装货'
		});
	}
	if (data.unloading != 0) {
		dataLegend.push('已卸货');
		dataSeries.push({
			value : data.unloading,
			name : '已卸货'
		});
	}
	if (data.other != 0) {
		dataLegend.push('其他');
		dataSeries.push({
			value : data.other,
			name : '其他'
		});
	}

	option = {
		tooltip : {
			trigger : 'item',
			formatter : "{a} <br/>{b}: {c} ({d}%)"
		},
		legend : {
			orient : 'vertical',
			x : 'left',
			data : [ '未接单', '已派发', '已拒绝', '已发布', '在途', '已接单', '已装货', '已卸货',
					'其他' ]
		},
		toolbox : {
			show : true,
			feature : {
				mark : {
					show : true
				},
				dataView : {
					show : true,
					readOnly : false
				},
				magicType : {
					show : true,
					type : [ 'pie', 'funnel' ],
					option : {
						funnel : {
							x : '25%',
							width : '50%',
							funnelAlign : 'left',
							max : 1700
						}
					}
				},
				restore : {
					show : true
				},
				saveAsImage : {
					show : true
				}
			}
		},
		series : [ {
			name : '运单状态',
			type : 'pie',
			radius : [ '60%', '90%' ],
			label : {
				normal : {
					position : 'outer'
				}
			},
			labelLine : {
				normal : {
					show : true
				}
			},

			data : dataSeries
		} ]
	};
	// 使用刚指定的配置项和数据显示图表。
	myChart.setOption(option);
}

/**
 * 运单统计报表数据查询
 */
function showWaybillInfoStatisticsReportForm() {
	// 时间1
	var startDate = $.trim($("#startDate").val());
	// 时间2
	var endDate = $.trim($("#endDate").val());

	var params = {
		"startDate" : startDate,
		"endDate" : endDate
	};

	$
			.ajax({
				type : "POST",
				url : basePath
						+ "/reportForm/listWaybillInfoStatisticsReportForm",
				data : params,
				success : function(dataStr) {
					if (dataStr) {
						//未接运单
						var missedWaybillInfoList = dataStr.missedWaybillInfoList;
						//已在途运单
						var onPassageWaybillInfoList = dataStr.onPassageWaybillInfoList;
						//已到运单
						var arriveWaybillInfoList = dataStr.arriveWaybillInfoList;
						//已发布运单
						var releaseWaybillInfoList = dataStr.releaseWaybillInfoList;
						//已派发运单
						var distributeWaybillInfoList = dataStr.distributeWaybillInfoList;
						//已接单运单
						var receivedWaybillInfoList = dataStr.receivedWaybillInfoList;
						//已拒绝运单
						var rejectWaybillInfoList = dataStr.rejectWaybillInfoList;
						//已装货运单
						var loadingWaybillInfoList = dataStr.loadingWaybillInfoList;
						//已卸货运单
						var unloadingWaybillInfoList = dataStr.unloadingWaybillInfoList;
						//其它运单
						var otherWaybillInfoList = dataStr.otherWaybillInfoList;
						var isSuccess = dataStr.success;
						if (isSuccess) {
							var data = {
								"missed" : missedWaybillInfoList.length,
								"onPassage" : onPassageWaybillInfoList.length,
								"arrive" : arriveWaybillInfoList.length,
								"release" : releaseWaybillInfoList.length,
								"distribute" : distributeWaybillInfoList.length,
								"received" : receivedWaybillInfoList.length,
								"reject" : rejectWaybillInfoList.length,
								"loading" : loadingWaybillInfoList.length,
								"unloading" : unloadingWaybillInfoList.length,
								"other" : otherWaybillInfoList.length
							}
							waybillInfoReportForm(data);
						}
					}
				}
			});
};

function showReportFrom() {
	var myChart = echarts.init(document.getElementById('main'));
	var option = getOption();
	// 使用刚指定的配置项和数据显示图表
	myChart.setOption(option);
}

/**
 * 生成图表
 */
function getOption(data) {
	var option = {
		baseOption : {
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
				data : [ '2017/01', '2017/02', '2017/03', '2017/04', '2017/05', '2017/06','2017/07', '2017/08', '2017/09', '2017/10', '2017/11', '2017/12' ]
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
			color : [ '#00acee', '#52cdd5', '#79d9f1', '#a7e7ff', '#c8efff' ]
		},

		options : [ { // 这是'2017/01' 对应的 option
			title : {
				text : '2017年1月份库存占比',
			},
			series : [ {
				data : [ {
					value : 45,
					name : 'CARD'
				}, {
					value : 25,
					name : 'SSD'
				}, {
					value : 15,
					name : 'U盘'
				}, {
					value : 8,
					name : '嵌入式'
				}, {
					value : 7,
					name : 'FLASH'
				} ],
			} ]
		}, { // 这是'2017/02' 对应的 option
			title : {
				text : '2017年2月份库存占比'
			},
			series : [ {
				data : [ {
					value : 12,
					name : 'CARD'
				}, {
					value : 35,
					name : 'SSD'
				}, {
					value : 18,
					name : 'U盘'
				}, {
					value : 18,
					name : '嵌入式'
				}, {
					value : 27,
					name : 'FLASH'
				} ],
			} ]
		}, { // 这是'2017/03' 对应的 option
			title : {
				text : '2017年3月份库存占比'
			},
			series : [ {
				data : [ {
					value : 17,
					name : 'CARD'
				}, {
					value : 23,
					name : 'SSD'
				}, {
					value : 12,
					name : 'U盘'
				}, {
					value : 28,
					name : '嵌入式'
				}, {
					value : 21,
					name : 'FLASH'
				} ],
			} ]
		}, { // 这是'2017/04' 对应的 option
			title : {
				text : '2017年4月份库存占比'
			},
			series : [ {
				data : [ {
					value : 14,
					name : 'CARD'
				}, {
					value : 35,
					name : 'SSD'
				}, {
					value : 58,
					name : 'U盘'
				}, {
					value : 13,
					name : '嵌入式'
				}, {
					value : 29,
					name : 'FLASH'
				} ],
			} ]
		}, { // 这是'2017/05' 对应的 option
			title : {
				text : '2017年5月份库存占比'
			},
			series : [ {
				data : [ {
					value : 12,
					name : 'CARD'
				}, {
					value : 33,
					name : 'SSD'
				}, {
					value : 11,
					name : 'U盘'
				}, {
					value : 18,
					name : '嵌入式'
				}, {
					value : 24,
					name : 'FLASH'
				} ],
			} ]
		}, { // 这是'2017/06' 对应的 option
			title : {
				text : '2017年6月份库存占比'
			},
			series : [ {
				data : [ {
					value : 18,
					name : 'CARD'
				}, {
					value : 35,
					name : 'SSD'
				}, {
					value : 14,
					name : 'U盘'
				}, {
					value : 18,
					name : '嵌入式'
				}, {
					value : 21,
					name : 'FLASH'
				} ],
			} ]
		},{ // 这是'2017/07' 对应的 option
			title : {
				text : '2017年7月份库存占比'
			},
			series : [ {
				data : [ {
					value : 18,
					name : 'CARD'
				}, {
					value : 35,
					name : 'SSD'
				}, {
					value : 14,
					name : 'U盘'
				}, {
					value : 18,
					name : '嵌入式'
				}, {
					value : 21,
					name : 'FLASH'
				} ],
			} ]
		}, { // 这是'2017/08' 对应的 option
			title : {
				text : '2017年8月份库存占比'
			},
			series : [ {
				data : [ {
					value : 18,
					name : 'CARD'
				}, {
					value : 35,
					name : 'SSD'
				}, {
					value : 14,
					name : 'U盘'
				}, {
					value : 18,
					name : '嵌入式'
				}, {
					value : 21,
					name : 'FLASH'
				} ],
			} ]
		}, { // 这是'2017/09' 对应的 option
			title : {
				text : '2017年9月份库存占比'
			},
			series : [ {
				data : [ {
					value : 18,
					name : 'CARD'
				}, {
					value : 35,
					name : 'SSD'
				}, {
					value : 14,
					name : 'U盘'
				}, {
					value : 18,
					name : '嵌入式'
				}, {
					value : 21,
					name : 'FLASH'
				} ],
			} ]
		}, { // 这是'2017/10' 对应的 option
			title : {
				text : '2017年10月份库存占比'
			},
			series : [ {
				data : [ {
					value : 18,
					name : 'CARD'
				}, {
					value : 35,
					name : 'SSD'
				}, {
					value : 14,
					name : 'U盘'
				}, {
					value : 18,
					name : '嵌入式'
				}, {
					value : 21,
					name : 'FLASH'
				} ],
			} ]
		}, { // 这是'2017/11' 对应的 option
			title : {
				text : '2017年11月份库存占比'
			},
			series : [ {
				data : [ {
					value : 18,
					name : 'CARD'
				}, {
					value : 35,
					name : 'SSD'
				}, {
					value : 14,
					name : 'U盘'
				}, {
					value : 18,
					name : '嵌入式'
				}, {
					value : 21,
					name : 'FLASH'
				} ],
			} ]
		}, { // 这是'2017/12' 对应的 option
			title : {
				text : '2017年12月份库存占比'
			},
			series : [ {
				data : [ {
					value : 18,
					name : 'CARD'
				}, {
					value : 35,
					name : 'SSD'
				}, {
					value : 14,
					name : 'U盘'
				}, {
					value : 18,
					name : '嵌入式'
				}, {
					value : 21,
					name : 'FLASH'
				} ],
			} ]
		} ]
	};

	return option;
}
