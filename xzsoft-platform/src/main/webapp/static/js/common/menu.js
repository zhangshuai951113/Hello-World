//获取菜单数据
function getMenu(url) {
	$.ajax({
		type: "GET",
		url:basePath+url,
		contentType:"application/x-www-form-urlencoded; charset=UTF-8",
		dataType: "json",
		success: function(data){
			//console.log(data);
			//菜单初始化
			showMenu(data)	
		}
	});
}

//菜单数据处理
function menuTree(data) {
	function treeMenu(a){
	    this.tree=a||[];
	    this.groups={};
	};
	function treeMenu(a){
	        this.tree=a||[];
	        this.groups={};
	};
	treeMenu.prototype={
		init:function(id){
	        this.group();
	        return this.getDom(this.groups[id]);
		},
    	group:function(){
	        for(var i=0;i<this.tree.length;i++){
	        	//类型是菜单加入组
	        	if(this.tree[i].type=="menu") {
	        		 if(this.groups[this.tree[i].parentId] ){
	 	                this.groups[this.tree[i].parentId].push(this.tree[i]);
	 	            }else{
	 	                this.groups[this.tree[i].parentId]=[];
	 	                this.groups[this.tree[i].parentId].push(this.tree[i]);
	 	            }
	        	}
	           
	        }
	    },
    	getDom:function(a){
    		if(!a){return ''}
	        var html ='<ul class="nav">';
	        for(var i=0;i<a.length;i++){
				if(a[i].url=='' || a[i].url==undefined ) {
						html += '<li class="nav-item nav-toggle">';
				} else {
						html += '<li class="nav-item">';
				}
				
				//一级添加图片和箭头
				if(a[i].parentId=="1") {
					//一级有地址
					if(a[i].url=='' || a[i].url==undefined) {
						html += '<a class="nav-link"><div class="'+a[i].className+'"></div>';
					} else {
						html += '<a class="nav-link" href="'+basePath+a[i].url +'"><div class="'+a[i].className+'"></div>';
					}
					
					html +='<div class="nav-text">'+a[i].name+'</div><div class="arrrow"></div></a>';	
				} else {
					//非一级级有地址
					if(a[i].url=='' || a[i].url==undefined) {
						html += '<a class="nav-link"><div class="nav-text">'+a[i].name+'</div></a>';	
					} else {
						html += '<a class="nav-link"  href="'+basePath+a[i].url +'"><div class="nav-text">'+a[i].name+'</div></a>';	
					}
					
					
				}	
				html += this.getDom(this.groups[a[i].id])+'</li>';
	        };
	        return html+'</ul>';
	    }
    };
    return menuList =new treeMenu(data).init(1);
}
	
	//显示菜单
function showMenu (data) {
	$(".sidebar-nav").html(menuTree(data));
	$.mCustomScrollbar.defaults.scrollButtons.enable = true; 
  	$.mCustomScrollbar.defaults.axis = "yx"; 
  	$(".sidebar-nav").mCustomScrollbar({
    	theme: "minimal"
  	});
  	
  	var navTop = window.localStorage.getItem('_nav-top');
  	$('nav .mCSB_container').css('top', navTop);
  	$('.mCSB_scrollTools_vertical').css('display','block');
  	window.localStorage.removeItem('_nav-top');

  	$(".nav-item").bind("click", function(event) {
		if($(this).hasClass('nav-toggle')) {
			if($(this).hasClass('open')) {
				//移除当前的open
				$(this).removeClass('open');
			} else {
				$(".nav-toggle").removeClass('open');
				$(this).parents('.nav-toggle').addClass('open');
				$(this).addClass('open');
			}
		} else {
			//移除所有class
			$(".nav-item").removeClass("active");
			$(".nav-item").removeClass("open");
			$(this).addClass("active");
			$(this).parents(".nav-toggle").addClass("open");
		}
		var herf = $(this).children("a").attr("link");
		if (herf) {
			$('.main').load(herf);
		}
		
		event.stopPropagation(); //  阻止事件冒泡
	})
	
	var url= document.location.href;
  	$(".nav-link").each(function() {
  		var currentUrl = $(this).attr("href");
  		if(url.indexOf(currentUrl)!=-1) {
  			$(this).parent().addClass("active");
  			$(this).parents("li.nav-toggle").addClass("open");
  		}
  	})
  	
  	$(".nav-link").on('click',function(){
  		var _top = $('nav .mCSB_container').css('top');
	  	window.localStorage.setItem('_nav-top', _top);
  	});
} 

//zhangbo加   加载消息总数
function readyMessages(){
	$(".info-user-box b").html("");
	$(".info-user-box b").empty();
	$.ajax({
	  	url:basePath+ "/messages/showCount",//请求的action路径
	      async:false,//是否异步
	      cache:false,//是否使用缓存
	      type:'POST',//请求方式：post
	      dataType:'json',//数据传输格式：json
	      error:function(){
	          //请求失败处理函数
	          xjValidate.showPopup("请求失败","提示");
	      },
	      success:function(data){
	    	  $(".info-user-box b").html(data);
	      }
	  });
}
$(document).ready(function(){
	readyMessages();
})
