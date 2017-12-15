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
      throw new Error('selectList requires jQuery to be loaded first');
    }
    factory(root.jQuery);
  }
}(this, function ($) {
    'use strict';
    function operationList(element,options) {
      this.self  = element;
      //console.log(this.self)
      var defaultParam = {
        "current":1,    //当前目标
        "maxSize":4,  //前后最大列表
        "itemPage":10,  //每页显示多少条
        "totalItems":0  //总条数
      }
      this.options = $.extend(defaultParam, options);
      this.totalPage = parseInt(this.options.totalItems / this.options.itemPage); 
      if(this.options.totalItems % this.options.itemPage>0) {
        this.totalPage++;
      }
      this.addPage();
    }

    operationList.prototype = {
      addPage: function () {
        var that = this;
        //清空页面
        that.self.html("");
        //添加坐箭头
        that.self.append('\<div class="pagination-arrow-left">\</div>');
        //向前添加点
        if(that.options.current-that.options.maxSize>1) {
          that.self.append('\<div class="pagination-num">1\</div>');
          if(that.options.current-that.options.maxSize>2) {
            that.self.append('\<div class="pagination-point">...\</div>');
          }
        }

        //向前添加条数
        for(var i=that.options.maxSize; i>0; i--) {
        if(that.options.current-i>0) {
          that.self.append('\<div class="pagination-num">'+(parseInt(that.options.current)-i)+'\</div>');
        }
        }

        //给当前页添加状态
        that.self.append('\<div class="pagination-num active">'+that.options.current+'\</div>');

        //向后添加条数
        for (var i=1; i<=that.options.maxSize; i++) {
          if(that.options.current+i<=that.totalPage) {
            that.self.append('\<div class="pagination-num">'+(parseInt(that.options.current)+i)+'\</div>');
          }
        }

        //向后添加点
        if(that.options.current+that.options.maxSize<that.totalPage) {
          
          if(that.options.current+that.options.maxSize<that.totalPage-1) {
            that.self.append('\<div class="pagination-point">...\</div>');
          }
          that.self.append('\<div class="pagination-num">'+that.totalPage+'\</div>');
        }

        //添加右箭头
        that.self.append('\<div class="pagination-arrow-right">\</div>');
        that.addEvent();
      },
      addEvent:function() {
        var that = this;
        //绑定数字点击事件
        that.self.find('.pagination-num').unbind().bind("click", function() {
          that.options.current = parseInt($(this).text());
          that.setCurrentPage(that.options.current);
        })

        //绑定上一页
        that.self.find('.pagination-arrow-left').unbind().bind("click", function() {
          var indexPage = that.options.current-1;
          //console.log(indexPage)
          if(indexPage >= 1) {
            that.options.current = indexPage;
          }
          that.setCurrentPage(that.options.current);
        })
        //绑定下一页
        that.self.find('.pagination-arrow-right').unbind().bind("click", function() {
          var indexPage = that.options.current+1;
          if(indexPage <= that.totalPage) {
            that.options.current = indexPage;
          }
          that.setCurrentPage(that.options.current);
        })

      
      },
      setCurrentPage:function(index) {
        if(index && parseInt(index) != "NaN" ) {
          if(index>0 && index<=this.totalPage) {
            this.options.current = parseInt(index);
            this.addPage();
             //回调函数传当前页面
            this.options.chagePage && this.options.chagePage(this.options.current);
          }
         
        }
      },
      setTotalItems:function(index) {
        if(index && parseInt(index) != "NaN" ) {
          this.options.totalItems = index;
           this.totalPage = parseInt(this.options.totalItems / this.options.itemPage); 
            if(this.options.totalItems % this.options.itemPage>0) {
              this.totalPage++;
            }
          this.addPage();
        }
      }

    }
    $.fn.operationList = function (options) {
      return new operationList(this, options)
    };
}));
