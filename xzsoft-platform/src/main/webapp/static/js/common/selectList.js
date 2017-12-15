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
  function selectList(element, options) {
    this.self = $(element);
    this.parent = $(element).parent();
    this.url= options.url; 
    this.data =options.data;
    this.init();
    this.addEvent();
  } 
  selectList.prototype = {
    addEvent:function( ) {
      var that = this;

      this.self.on("keyup", function() {
        that.ajaxData()
      })

      this.self.on("focus", function() {
        that.ajaxData();
      })

      this.self.on('blur', function() {
        var that = this;
        setTimeout(function() {
            $(that).next(".select-list").hide();
        },200)
      })
    },
    init:function() {
      this.parent.append("\<div class='select-list'>\<ul>\</ul>\</div>");
    },
    ajaxData:function() {
      var that = this;
      var value = $.trim(this.self.val());
      if( value!=="") { 
        if(that.url) {
          $.ajax({
            url : that.url,
            asyn : false,
            type : "POST",
            data :{
              "search":value
            },
            dataType : "json" ,
            success : function(res) {
              if(res && res.success){
                that.addList(res.data);
              }
            }
          });
        }
        else {
          var list = [];
          for(var i=0; i< that.data.length; i++) {
            if(that.data[i].indexOf(value)!=-1) {
              list.push(that.data[i])
            }
          }
          that.addList(list);
        }
      } else {
        this.self.next(".select-list").hide();
      }
    },
    addList:function(data) {
      var that = this;
      this.parent.find(".select-list").find("ul").html("");
       for(var i=0; i <data.length; i++) {
          that.parent.find(".select-list ul").append("\<li>"+data[i]+"\<li>");
       }
      this.parent.find(".select-list").show();
      var li = this.parent.find("li");
      li.unbind().bind("click", function() {
        that.self.val($(this).text());
      })
    }
  }
  $.fn.selectList = function (options) {
    return new selectList(this, options)
  };
}));
