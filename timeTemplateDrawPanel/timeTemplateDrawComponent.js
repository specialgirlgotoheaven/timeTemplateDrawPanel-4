/**
 * Created by 26110 on 16-7-20.
 */
;(function($,window,document,undefined){
    var pluginName="timeTemplateDrawComponent";
    var defaults={
         paintbrushClass:'normalRecord',//画笔
    };
    var timeTemplateDrawPanel=function(element,opt){
         this.$element=element;
         this.options = $.extend({},defaults,opt);
         this._default=defaults;
         this._name= pluginName;
         this._version="1.0.0";
         this.init();
    }
    timeTemplateDrawPanel.prototype={
         init:function(){

         },
         bind:function(){

         }
    };

})(jQuery,window,document);
