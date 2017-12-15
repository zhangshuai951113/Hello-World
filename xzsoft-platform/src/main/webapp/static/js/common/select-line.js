/*
//! version : 1.1.1
  @author liumin
*/
;(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
      // AMD is used - Register as an anonymous module.
      define(['jquery', 'moment'], factory);
  } else if (typeof exports === 'object') {
      factory(require('jquery'), require('moment'));
  }
  else {
    // Neither AMD or CommonJS used. Use global variables.
    if (!jQuery) {
      throw new Error('selectLine requires jQuery to be loaded first');
    }
    factory(root.jQuery);
  }
}(this, function ($) {
    'use strict';
    function lineSelect(element,options) {
      this.self  = element;
      this.parent =  element.parent();
      var defaultParam = {
        "defaultProvinceId":65,    //默认的省id
        "defaultProvinceName":"新疆维吾尔自治区",  //默认的省名称
        "defaultCityId":6501,  //默认的市id
        "defaultCityName":"乌鲁木齐市", //默认的市名称
      }
      this.options = $.extend(defaultParam, options);
     
      this.addHtml();
    }

    lineSelect.prototype = {
      addHtml: function () {
        var that = this;
        //清空页面
        that.parent.remove(".address-box");
        var html ='<div class="address-box" style="display: none;">'+
                    '<div class="tab-box row">'+
                        '<div data-func="getProvince" class="tab-list active">省（州）</div>'+
                        '<div data-func="getCity" class="tab-list">市</div>'+
                        '<div data-func="getArea" class="tab-list">县（区）</div>'+
                    '</div>'+
                    '<div class="address-content row"></div>'+
                  '</div>';
        //添加页面
        that.parent.append(html);
        //绑定事件
        that.parent.find(".address-box .tab-list").unbind().bind("click",function() {
          var func =  $(this).data("func");
          if(func=="getProvince") {
            that.getProvince();
          } else if(func=="getCity") {
            that.getCity();
          } else if(func=="getArea") {
            that.getArea();
          }
        })

        that.self.unbind().bind("click",function() {
            that.addLineData();
        }) 
      },
      /**
       * 调用省函数，显示弹出框
       */
      addLineData:function () {
        this.getProvince();
        this.parent.find(".address-box").show();
        this.parent.find(".address-box").unbind().bind("mouseleave",function() {
          $(this).hide();
        })
      },
      /**
        * 获取省信息
      */
      getProvince:function() {
        var that = this;
        //查询所有的省
        $.ajax({
          url : basePath + "/locationInfo/findLocationProvince", 
          asyn : false,
          type : "POST",
          dataType : "json" ,
          success : function(data) {
            //添加省列表
            var html ="";
            for (var i=0; i<data.length; i++) {
                html += '<div data-id="'+data[i].provinceId+'" data-name="'+data[i].province+'" class="name getCity">'+data[i].province+'</div>';
            }
            that.parent.find(".address-content").html(html);
            
            //改变tab状态
            that.parent.find(".tab-list").removeClass('active');
            that.parent.find(".tab-list").eq(0).addClass('active');
            that.parent.find('.getCity').unbind().bind("click",function(){
              var id = $(this).data("id");
              var name= $(this).data("name");
              that.getCity(id, name);
            })
          }
        });
      },
       /**
        * 获取市信息,传省的id和省的名称
        */
      getCity:function(id,name) {
        var that = this;
       
        if(!id) {
          id = that.options.defaultProvinceId;
        } else {
          that.options.defaultProvinceId = id;
        }
        if(name) {
          // that.parent.find("input").val('');
          that.options.defaultProvinceName = name;
          // that.self.text(name);
        }
        console.log(id);
        
        //查询所有的市
        $.ajax({
          url : basePath + "/locationInfo/findLocationCityByProvince", 
          asyn : false,
          type : "POST",
          data:{
            startPoints:id
          },
          dataType : "json" ,
          success : function(data) {
              //添加市列表
              var html ="";
              for (var i=0; i<data.length; i++) {
                  html += '<div data-id="'+data[i].cityId+'" data-name="'+data[i].city+'" class="name getArea">'+data[i].city+'</div>';
              }
              that.parent.find(".address-content").html(html);

              //改变tab状态
              that.parent.find(".tab-list").removeClass('active');
              that.parent.find(".tab-list").eq(1).addClass('active');
              //点击获取区域
              that.parent.find('.getArea').unbind().bind("click",function(){
                var id = $(this).data("id");
                var name= $(this).data("name");
                that.getArea(id, name);
              })
          }
        });
      
      },
      /**
      * 获取区域信息,传市的id和市的名称
      */
      getArea:function(id,name) {
        var that = this;
        if(!id) {
        id = that.options.defaultCityId;
        } else {
          that.options.defaultCityId = id;
        }
        if(name) {
          // that.parent.find("input").val('');
          that.options.defaultCityName = name;
          // that.self.text(that.options.defaultProvinceName+"/"+name);
        }
        
        
          //查询所有的区
        $.ajax({
          url : basePath + "/locationInfo/findLocationCountyByCity", 
          asyn : false,
          type : "POST",
          data:{
            startPoints:id
          },
          dataType : "json" ,
          success : function(data) {
            var html ="";
            for (var i=0; i<data.length; i++) {
                //选择区域传入是id
                html += '<div data-id="'+data[i].id+'" data-name="'+data[i].county+'" class="name selectAddress">'+data[i].county+'</div>';
            }
            that.parent.find(".address-content").html(html);
            that.parent.find(".tab-list").removeClass('active');
            that.parent.find(".tab-list").eq(2).addClass('active');
            //点击获取选择的信息
            that.parent.find('.selectAddress').unbind().bind("click",function(){
              var id = $(this).data("id");
              var name= $(this).data("name");
              that.selectAddress(id, name);
            })
          }
        });
      },
       /**
        * 获取区信息,当前数据的id值和区域名称
        */
      selectAddress:function (id,name) {
          this.parent.find("input").val(id);
          this.self.text(this.options.defaultProvinceName+"/"+this.options.defaultCityName+"/"+name);
          this.parent.find(".address-box").hide();
      }
    }
    
    $.fn.lineSelect = function (options) {
      return new lineSelect(this, options)
    };
}));

 




 
 
