$(function(){
	// 百度地图API功能
	var map = new BMap.Map("allmap");
	map.centerAndZoom(new BMap.Point(116.331398,39.897445),11);
	map.enableScrollWheelZoom(true);
	
	// 用经纬度设置地图中心点
			if(document.getElementById("longitude").value != "" && document.getElementById("latitude").value != ""){
				map.clearOverlays(); 
				var new_point = new BMap.Point(document.getElementById("longitude").value,document.getElementById("latitude").value);
				var marker = new BMap.Marker(new_point);  // 创建标注
				map.addOverlay(marker);              // 将标注添加到地图中
				map.panTo(new_point);      
			}
});