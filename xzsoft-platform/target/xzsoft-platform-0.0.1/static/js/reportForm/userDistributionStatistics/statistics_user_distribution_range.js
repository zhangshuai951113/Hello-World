$(function(){
	staticsUserAddress();
});

var strongList = "";
var inList = "";
var weakList = ""; 
var currentMonth =""
function staticsUserAddress(){
	 $.ajax({
	    	url:"userStatistics/findAddressDetailForMonth",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        dataType:'json',//数据传输格式：json
	        success:function(userData){
	        	var jsonAll = userData;
	        	strongList = jsonAll.strongList;
	        	inList = jsonAll.inList;
	        	weakList = jsonAll.weakList;
	        	currentMonth = jsonAll.currentMonth;
	        }
	    })
	    		
	  /*  var strongList = [var inList = [ var weakList = [ 
    {name:'天峻县', geoCoord:[99.02 ,37.30]},
    {name:'都兰县', geoCoord:[98.08 ,36.30]},
    {name:'库尔勒', geoCoord:[86.06,41.68]},
    {name:'石河子', geoCoord:[85.94, 44.27]},
    {name:'吐鲁番', geoCoord:[89.19,42.91]},
    {name:'鄯善', geoCoord:[90.25	,42.82]},
    {name:'哈密', geoCoord:[93.44	,42.78]},
    {name:'尼勒克', geoCoord:[82.53, 43.82]},
    {name:'伊宁', geoCoord:[81.33, 43.91]},
    {name:'温泉', geoCoord:[81.08, 44.95]},
    {name:'咯什', geoCoord:[75.94, 39.52]},
    {name:'乌什', geoCoord:[79.25, 41.22]},
    {name:'阿瓦提', geoCoord:[80.34, 40.64]},
    {name:'阿克苏', geoCoord:[80.29, 41.15]},
    {name:'蓬莱', geoCoord:[120.75, 37.8]},
    {name:'嘉峪关', geoCoord:[98.289152, 39.77313]},
    {name:'广州', geoCoord:[113.23, 23.16]},
    {name:'察布察尔', geoCoord:[81.12, 43.82]},
    {name:'霍城', geoCoord:[80.87, 44.07]},
    {name:'昭苏', geoCoord:[81.08, 43.15]},
    {name:'特克斯', geoCoord:[81.81, 40.13]},
    {name:'奎屯', geoCoord:[84.89, 44.45]},
    {name:'巩留', geoCoord:[82.23, 43.35]},
    {name:'新源', geoCoord:[83.27, 43.41]},
    {name:'哈巴河', geoCoord:[86.41, 48.05]},
    {name:'布尔津', geoCoord:[86.92, 47.7]},
    {name:'吉木乃', geoCoord:[87.51, 47.15]},
    {name:'福海', geoCoord:[89.44, 47.05]},
    {name:'青河', geoCoord:[90.37, 46.71]},
    {name:'阿勒泰', geoCoord:[85.13, 46.78]},
    {name:'和布克赛尔', geoCoord:[119.46, 35.42]}
	]
	 
	 var inList = [ var weakList = [ 
    {name:'德令哈市', geoCoord:[97.37 ,37.37]},
    {name:'格尔木市', geoCoord:[94.90 ,36.42]},
    {name:'和静县', geoCoord:[86.40 , 42.32]},
    {name:'焉耆回族自治县', geoCoord:[86.57, 42.07]},
    {name:'尼玛县', geoCoord:[87.23 , 31.78]},
    {name:'班戈县', geoCoord:[90.02  , 31.37]},
    {name:'巴青县', geoCoord:[94.03  , 31.93]},
    {name:'伊吾县', geoCoord:[94.70 , 43.25]},
    {name:'玉门', geoCoord:[97.58, 36.6]},
    {name:'酒泉', geoCoord:[98.5, 39.71]},
    {name:'敦煌', geoCoord:[94.71, 40.13]},
    {name:'金塔', geoCoord:[98.92, 39.97]},
    {name:'安西', geoCoord:[95.77, 40.51]},
    {name:'阿克塞', geoCoord:[94.25, 38.46]},
    {name:'肃北', geoCoord:[94.89, 39.49]},
    {name:'延安', geoCoord:[109.47, 36.6]},
    {name:'太原', geoCoord:[112.53, 37.87]},
    {name:'中山', geoCoord:[113.38, 22.52]},
    {name:'昆明', geoCoord:[102.73, 25.04]},
    {name:'盘锦', geoCoord:[122.070714, 41.119997]},
    {name:'长治', geoCoord:[113.08, 36.18]},
    {name:'深圳', geoCoord:[114.07, 22.62]},
    {name:'铜川', geoCoord:[109.11, 35.09]},
    {name:'佛山', geoCoord:[113.11, 23.05]},
    {name:'大连', geoCoord:[121.62, 38.92]},
    {name:'临汾', geoCoord:[111.5, 36.08]},
    {name:'石嘴山', geoCoord:[106.39, 39.04]},
    {name:'沈阳', geoCoord:[123.38, 41.8]},
    {name:'长春', geoCoord:[125.35, 43.88]},
    {name:'银川', geoCoord:[106.27, 38.47]},
    {name:'沙湾', geoCoord:[82.94, 46.21]},
    {name:'托里', geoCoord:[84.62, 45.92]},
    {name:'克拉玛依', geoCoord:[84.77, 45.59]},
    {name:'渭南', geoCoord:[109.5, 34.52]},
    {name:'马鞍山', geoCoord:[118.48, 31.56]},
    {name:'宝鸡', geoCoord:[107.15, 34.38]},
    {name:'北京', geoCoord:[116.46, 39.92]},
    {name:'包头', geoCoord:[110, 40.58]},
    {name:'乌鲁木齐', geoCoord:[87.68, 43.77]},
    {name:'鞍山', geoCoord:[122.85, 41.12]},
    {name:'库尔勒', geoCoord:[86.06, 41.68]},
    {name:'张家港', geoCoord:[120.555821, 31.875428]}
    ]
	 var weakList = [ 
    {name:'巴青县', geoCoord:[94.03,31.93]},
    {name:'嘉黎县', geoCoord:[93.25,30.65]},
    {name:'博湖县', geoCoord:[86.63,41.98]},
    {name:'巴音郭楞蒙古自治州', geoCoord:[86.15,41.77]},
    {name:'轮台县 ', geoCoord:[84.27,41.78]},
    {name:'和硕县', geoCoord:[86.87,42.27]},
    {name:'和静县', geoCoord:[86.40,42.32]},
    {name:'焉耆回族自治县', geoCoord:[86.57,42.07]},
    {name:'锦州', geoCoord:[121.15,41.13]},
    {name:'南昌', geoCoord:[115.89,28.68]},
    {name:'柳州', geoCoord:[109.4,24.33]},
    {name:'吉林', geoCoord:[126.57,43.87]},
    {name:'西宁', geoCoord:[101.74,36.56]},
    {name:'宜宾', geoCoord:[104.56,29.77]},
    {name:'呼和浩特', geoCoord:[111.65,40.82]},
    {name:'成都', geoCoord:[104.06,30.67]},
    {name:'大同', geoCoord:[113.3,40.12]},
    {name:'镇江', geoCoord:[119.44,32.2]},
    {name:'桂林', geoCoord:[110.28,25.29]},
    {name:'张家界', geoCoord:[110.479191,29.117096]},
    {name:'西安', geoCoord:[108.95,34.27]},
    {name:'金坛', geoCoord:[119.56,31.74]},
    {name:'东营', geoCoord:[118.49,37.46]},
    {name:'重庆', geoCoord:[106.54,29.59]},
    {name:'台州', geoCoord:[121.420757,28.656386]},
    {name:'南京', geoCoord:[118.78,32.04]},
    {name:'渭南', geoCoord:[109.5,34.52]},
    {name:'马鞍山', geoCoord:[118.48,31.56]},
    {name:'宝鸡', geoCoord:[107.15,34.38]},
    {name:'北京', geoCoord:[116.46,39.92]},
    {name:'包头', geoCoord:[110,40.58]},
    {name:'乌鲁木齐', geoCoord:[87.68,43.77]},
    {name:'鞍山', geoCoord:[122.85,41.12]},
    {name:'库尔勒', geoCoord:[86.06,41.68]},
    {name:'开封', geoCoord:[114.35,34.79]},
    {name:'济南', geoCoord:[117,36.65]},
    {name:'邯郸', geoCoord:[114.47,36.6]},
    {name:'兰州', geoCoord:[103.73,36.03]},
    {name:'天津', geoCoord:[117.2,39.13]},
    {name:'富阳', geoCoord:[119.95,30.07]},
    {name:'郑州', geoCoord:[113.65,34.76]},
    {name:'哈尔滨', geoCoord:[126.63,45.75]},
    {name:'平顶山', geoCoord:[113.29,33.75]},
    {name:'济宁', geoCoord:[116.59,35.38]},
    {name:'洛阳', geoCoord:[112.44,34.7]},
    {name:'石家庄', geoCoord:[114.48,38.03]},
    {name:'保定', geoCoord:[115.48,38.85]},
    {name:'大庆', geoCoord:[125.03,46.58]},
    {name:'沙湾', geoCoord:[82.94,46.21]},
    {name:'托里', geoCoord:[84.62,45.92]}
	    ]
	    */
	    option = {
	        color: [
	            'rgba(255, 255, 255, 0.8)',
	            'rgba(14, 241, 242, 0.8)',
	            'rgba(37, 140, 249, 0.8)'
	        ],
	        title: {
	            text: '用户分布范围统计图',
	            subtext: currentMonth,
	            x: 'center',
	            textStyle: {
	                color: '#f2f2f2'
	            }
	        },
	        legend: {
	            orient: 'vertical',
	            x: 'left',
	            data: ['强', '中', '弱'],
	            textStyle: {
	                color: '#fff'
	            }
	        },
	       
	        series: [{
	                name: '弱',
	                type: 'map',
	                mapType: 'china',
	                hoverable: false,
	                itemStyle: {
	                    normal: {
	                        borderColor: 'rgba(100,149,237,1)',
	                        borderWidth: 1.5,
	                        areaStyle: {
	                            color: '#1b1b1b'
	                        }
	                    }
	                },
	                data:[],
	                markPoint: {
	                    symbolSize: 3,
	                    large: true,
	                    effect: {
	                        show: true
	                    },
	                    data: (function() {
	                        var data = weakList;
	                        var len = weakList.length;
	                        var geoCoord
	                        while (len--) {
	                            geoCoord = weakList[len % weakList.length].geoCoord;
	                            data.push({
	                                name: weakList[len % weakList.length].name + len,
	                                geoCoord: [
	                                    geoCoord[0] + Math.random(),
	                                    geoCoord[1] + Math.random()
	                                ]
	                            })
	                        }
	                        return data;
	                    })()
	                }
	            },
	            {
	                name: '中',
	                type: 'map',
	                mapType: 'china',
	                hoverable: false,
	                data:[],
	                markPoint: {
	                    symbolSize: 4,
	                    large: true,
	                    effect: {
	                        show: true
	                    },
	                    data: (function() {
	                        var data = inList;
	                        var len = inList.length;
	                        var geoCoord
	                        while (len--) {
	                            geoCoord = inList[len % inList.length].geoCoord;
	                            data.push({
	                                name: inList[len % inList.length].name + len,
	                                geoCoord: [
	                                    geoCoord[0] + Math.random(),
	                                    geoCoord[1] + Math.random()
	                                ]
	                            })
	                        }
	                        return data;
	                    })()
	                }
	            },
	            {
	                name: '强',
	                type: 'map',
	                mapType: 'china',
	                hoverable: false,
	                roam: true,
	                data: [],
	                markPoint: {
	                    symbol: 'diamond',
	                    symbolSize: 6,
	                    large: true,
	                    effect: {
	                        show: true
	                    },
	                    data: (function() {
	                        var data = strongList;
	                        var len = strongList.length;
	                        while (len--) {
	                            data.push({
	                                name: strongList[len].name,
	                                geoCoord: strongList[len].geoCoord
	                            })
	                        }
	                        return data;
	                    })()
	                }
	            }
	        ]
	    };
	 
		var main = document.getElementById('amain');
	
	    var myChart = echarts.init(main);
	    myChart.setOption(option);
}


