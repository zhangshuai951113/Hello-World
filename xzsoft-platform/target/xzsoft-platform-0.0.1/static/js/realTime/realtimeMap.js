/**
 * @author zhangxuanbin
 * @time 20170817
 * @desc 该功能依靠百度地图api，实时获取服务器端目标坐标，并绘制实时轨迹
 **/
var realtimeMap = function(){
	window.onload = function(){
		realtimeMap.init();
	};


	var map, //百度地图对象
    	car, //汽车图标
    	lushu,
    	centerPoint,
    	timer, //定时器
    	index = 0, //记录播放到第几个point
    	points = [],//获取目标包括当前之前的所有坐标
    	pointsArr = [];//数据源
	return {
		init: function(){
			this.initDoneMap();
//			this.initData();
//			this.initMap();
		},
		
		initDoneMap: function() {
			var waybillInfoId = $("#waybillInfoId").val();
        	var userInfoId = $("#userInfoId").val();
			var _this = this;
			$.ajax({
         		url: basePath+"/waybillReadTimeTrajectory/showWaybillHistoryTrajectory",
         		type: "POST",
         		data : {"waybillInfoId":waybillInfoId,"userInfoId":userInfoId},
         		success: function(data){
         			 if(data){
         				var doneMapArr = [];
         				 if(data.historyTrajectoryList){
         					$.each(data.historyTrajectoryList,function(j, val){
         						doneMapArr.push(new BMap.Point(val.locationLongitude,val.locationLatitude));
         					});
         					console.log(doneMapArr)
         					//起点经度
         					var firstLng = data.historyTrajectoryList[0].locationLongitude;
         					$("#firstLng").val(firstLng);
         					//起点纬度
         					var firstLat = data.historyTrajectoryList[0].locationLatitude;
         					$("#firstLat").val(firstLat);
         					//取最后一条数据的创建时间
         					$("#createTime").val(format(new Date(data.historyTrajectoryList[0].createTime).toString(),'yyyy-MM-dd HH:mm:ss'));
         					//初始化地图,选取第一个点为起始点
         		            map = new BMap.Map('container');
         		            map.setViewport(doneMapArr);
         		            //设置地图级别
         		            map.centerAndZoom(doneMapArr[0], 8);
         		            map.enableScrollWheelZoom();
         		            map.addControl(new BMap.NavigationControl());
         		            map.addControl(new BMap.ScaleControl());
         		            map.addControl(new BMap.OverviewMapControl({ isOpen: true }));

         			        //画面移动到起点和终点的中间
         			       // centerPoint = new BMap.Point((doneMapArr[0].lng + doneMapArr[doneMapArr.length - 1].lng) / 2, (doneMapArr[0].lat + doneMapArr[doneMapArr.length - 1].lat) / 2);
         			       // map.panTo(centerPoint);
         			       // map.addOverlay(new BMap.Polyline(doneMapArr, { strokeColor: '#7fde8a', strokeWeight: 5, strokeOpacity: 1 }));
         			        //_this.initData(firstLng,firstLat);
         			        _this.initMap(doneMapArr);
         				 }
         			 }
         		}
         	});
        },
        
		/**此处为数据源，以后换为ajax获取**/
		initData: function(firstLng,firstLat){
			//获取所有点的坐标
		    points = [//初始数据，至少有一个点，越多越好
		        new BMap.Point(firstLng,firstLat)
		    ];

//		    pointsArr = [//ajax获取的数据
//		    	new BMap.Point(87.600317,43.819174),
//		        new BMap.Point(87.605779,43.810223), new BMap.Point(87.602042,43.800438),
//		        new BMap.Point(87.592843,43.787736), new BMap.Point(87.593993,43.780238),
//		    	new BMap.Point(87.591694,43.774823), new BMap.Point(87.588819,43.769198),
//		        new BMap.Point(87.586232,43.761073), new BMap.Point(87.587957,43.746487),
//		        new BMap.Point(87.605204,43.716678), new BMap.Point(87.646023,43.681222),
//		        new BMap.Point(91.737122,43.220261), new BMap.Point(92.84326,43.053525),
//		        new BMap.Point(93.51936,42.840654)
//		    ];
		},

		initMap: function(doneMapArr){
			var _this = this,
				i = 0;
	        //初始化地图,选取第一个点为起始点
	        /*map = new BMap.Map('container');
	        map.setViewport(points);
	        map.centerAndZoom(points[0], 14);
	        map.enableScrollWheelZoom();
	        map.addControl(new BMap.NavigationControl());
	        map.addControl(new BMap.ScaleControl());
	        map.addControl(new BMap.OverviewMapControl({ isOpen: true }));*/

	        console.log(doneMapArr)
	        map.addOverlay(new BMap.Polyline(doneMapArr, {
	            strokeColor: "#7fde8a",
	            strokeWeight: 5,
	            strokeOpacity: 1
	        })); // 画线
            
            lushu = new BMapLib.LuShu(map,doneMapArr,{
	            defaultContent: '',
	            autoView: true,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
	            icon: new BMap.Icon(basePath+"/static/images/carTrajectory/car.png", new BMap.Size(50,42),{anchor : new BMap.Size(27, 13)}),
	            speed: 28000,
	            enableRotation: true,//是否设置marker随着道路的走向进行旋转
	            landmarkPois: [
	              
	            ]
//	            getPath: function(){
//	            	var waybillInfoId = $("#waybillInfoId").val();
//	            	var userInfoId = $("#userInfoId").val();
//	            	var locationLongitude = $("#lastLng").val();
//	            	var locationLatitude = $("#lastLat").val();
//	            	var createTime = $("#createTime").val();
//	             	$.ajax({
//	             		url: basePath+"/waybillReadTimeTrajectory/showWaybillReadTimeTrajectory",
//	             		type: "POST",
//	             		async: false,
//	             		data : {"waybillInfoId":waybillInfoId,"userInfoId":userInfoId},
//	             		success: function(data){
//	             			 if(data){
//	             				 var pointsArr = [];
//	             				 if(data.currentTrajectoryList){
//	             					var i = 0;
////	             					var firstLng = $("#firstLng").val();
////	             					var firstLat = $("#firstLat").val();
////	             					pointsArr.push(new BMap.Point(firstLng,firstLat));
//	             					$.each(data.currentTrajectoryList,function(j, val){
//	             						 i++;
//	             						 pointsArr.push(new BMap.Point(val.locationLongitude,val.locationLatitude));
//	             					});
//	             					var lastLength = data.currentTrajectoryList.length-1;
//            						$("#createTime").val(format(new Date(data.currentTrajectoryList[lastLength].createTime).toString(),'yyyy-MM-dd HH:mm:ss'));
//            						$("#firstLng").val(data.currentTrajectoryList[lastLength].locationLongitude);
//            						$("#firstLat").val(data.currentTrajectoryList[lastLength].locationLatitude);
//	             				 }
//	             				 lushu._path = pointsArr;
//	             				 lushu.success = data.success;
//	             			 }
//	             		}
//	             	});
////	            	var success = true;
////	            	 lushu.success = success;
////					lushu._path = pointsArr;
//	            	
//	            }
	        }); 
			
            lushu.start(); 
		}
	};
}();

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