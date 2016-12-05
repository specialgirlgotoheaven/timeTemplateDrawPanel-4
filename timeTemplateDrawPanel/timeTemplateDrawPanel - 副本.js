/**
 * Created by 26110 on 16-7-20.
 */
(function(){

    /**
     * 1.构建时要把timeSetContent的Ｄiv的id放在js赋值，而不是放在html里面
     *
     * */
    var timePeriodNormalObjArr = new Array(7);
    var timePeriodDynamicDetectObjArr = new Array(7);
    var timePeriodResultObjArr = new Array(7);   //把各类型时间段合并到这个数组里
    var MouseDown=false;
    var MouseUp=false;
    $(function(){
        $("#setTimeDialog").dialog({
            autoOpen:false,
            modal: true,
            width:400,
            height:150,
            open:function(){
                var tempCloneDomArr = $(".theTimeSetInDialogClone");
                for(var i=0;i<tempCloneDomArr.length-1;i++){
                    tempCloneDomArr[i].remove();
                }
                console.log($(".theTimeSetInDialogClone"));
            },
            buttons: {
                "确认": function() {
                    $( this ).dialog( "close" );
                }
            }
        });

        $(".timesetButton").click(function(){
            //alert($(this).parent()[0].id.slice(15));
            var thisDay=$(this).parent()[0].id.slice(15);//1表示周一
            $("#setTimeDialog").dialog('open');
        });
        $(".setTimeDialogAdd").bind('click',function(){
            $("#setTimeDialogDiv").clone(true).insertAfter($(this).parent()).show();
        });
        $(".setTimeDialogDelete").bind('click',function(){
            $(this).parent().remove();
        });

       $(".timesetul .cell").bind('mousedown',function(){
            MouseDown=true;
            MouseUp=false;
       });
        $(document).mouseup(function(){
            MouseDown=false;
            MouseUp=true;
        });
/*        $(".timesetul .cell").bind('mouseup',function(){
            MouseDown=false;
            MouseUp=true;
        });*/
       $(".timesetul .cell").bind('mousedown mouseover',function(){
           if(MouseDown && !MouseUp){
               var $thisCell= $(this);
               var $thisContent=  $thisCell.parent().parent().parent();
               //console.log($thisContent[0].id);
               var tempSlice= $thisContent[0].id.slice(15);

               if($thisCell.parent().hasClass('normalRecord')){

                   drawOrClearCells($thisCell,"cellGreen","cellClearColor");
                   var temp111= timePeriodObjArr($thisCell,"cellGreen");
                   timePeriodNormalObjArr[tempSlice]= arrStringConvert(temp111,0);

                   // console.log(timePeriodNormalObjArr[tempSlice]);
               }
               if($thisCell.parent().hasClass('dynamicDetectRecord')){

                   drawOrClearCells($thisCell,"cellYellow","cellClearColor");
                   var temp222= timePeriodObjArr($thisCell,"cellYellow");
                   timePeriodDynamicDetectObjArr[tempSlice]=arrStringConvert(temp222,1);
                   // console.log(timePeriodDynamicDetectObjArr[tempSlice]);
               }
               /**
                *将普通动检进行合并，后者覆盖前者
                * */
               timePeriodResultObjArr[tempSlice] = combineAndSameTimeReplace(timePeriodNormalObjArr[tempSlice],timePeriodDynamicDetectObjArr[tempSlice]);
               console.log(timePeriodResultObjArr);
           }

        });

        /**
         *  $thisCell表示要绘制的dom
         *  drawClass表示要画的颜色
         *  clearClass表示要擦除的颜色
         * */
        function drawOrClearCells($thisCell,drawClass,clearClass){
           // $thisCell.addClass(drawClass);//待完成，鼠标变成对应颜色的画笔
            if($thisCell.hasClass(drawClass)){
                $thisCell.removeClass(drawClass)
               // $thisCell.addClass(clearClass);   //cellClearColor
            }else{
                $thisCell.addClass(drawClass);//待完成，鼠标变成对应颜色的画笔
               // $thisCell.removeClass(clearClass);
            }
        }


        /**
         * 连接Arr1和Arr2
         * Arr1和Arr2相同的项，Arr2会覆盖Arr1对应的项
         * Arr1和Arr2的特点是已经排好序 (取过来就排好序了，不用另外处理)
         * */
        function combineAndSameTimeReplace(Arr1,Arr2){
            var Arr1=Arr1;
            var newArr=[];
            var count=0;
            var markArr2Repeat=[];//和Arr2长度相同，标记Arr2中的重复项,1表示是重复项，0表示不是重复项
            if(Arr1 && Arr1.length>0){
                for(var i=0;i<Arr1.length;i++){
                    newArr[count++]= Arr1[i];
                    if(Arr2 && Arr2.length>0){

                        for(var j=0;j<Arr2.length;j++){
                            if(markArr2Repeat[j]==undefined){
                                markArr2Repeat[j]=0;
                            }
                            if(Arr1[i].slice(0,17)==Arr2[j].slice(0,17)){
                                newArr[count-1]= Arr2[j];     //将动检覆盖其重复的时间段类型
                                markArr2Repeat[j]=1;
                                break;
                            }
                        }
                    }
                }
                /**
                 * 把没有覆盖掉的添加到时间段里面,即插入非重复项
                 * */
                if(Arr2 && Arr2.length>0){
                    for(var k=0;k<Arr2.length;k++){
                        if(markArr2Repeat[k]!=1){
                            newArr[count++]= Arr2[k];
                        }
                    }
                }
            }else if(Arr2 && Arr2.length>0){
                for(var j=0;j<Arr2.length;j++){
                    newArr[count++]= Arr2[j];
                }
            }
            return newArr;
        }
        /**
         * $thisCell表示页面上的Dom元素
         * recordTypeColorClass表示要画的颜色
         * return 每天的时间段对象，一个时间段用一个属性表示
         * */
        function timePeriodObjArr($thisCell,recordTypeColorClass){
            var tempSpanCells=$thisCell.parent().children();
            var timeObj={};
            var timecount=0;
            var tempStr = "timecount0";
            timeObj[tempStr]=[];

            $.each(tempSpanCells,function(i,n){
                // console.log("i:"+i+"   n:"+ n.className);
                if(n.className.indexOf(recordTypeColorClass)!=-1){     //可以写一个函数把这个做为入参
                    timeObj[tempStr].push(i);
                }else{
                    if(timeObj[tempStr].length>0){
                        timecount++;
                        tempStr ="timecount"+timecount;
                        timeObj[tempStr]=[];
                    }
                }
            });
            return  timeObj;
        }



        /**
         * Arr参数的特点是长度相同，Arr[0]表示每天，Arr[1]表示星期一 ……
         * len表示比较的天数
         * */
        function typeTimePeriodCombine(Arr1,Arr2,Arr3,Arr4,len){
           var arrResult=[];
           for(var i=0;i<len;i++){
               var arr1String=JSON.stringify(Arr1[i]).replace(/\"\w*\"\:/g,"");
               var arr2String=JSON.stringify(Arr2[i]).replace(/\"\w*\"\:/g,"");
               var tempArr1=arr1String.split('],');
               var tempArr2=arr2String.split('],');
               for(var i=0;i<tempArr1.length;i++){
                   tempArr1[i].replace(/[^\d\,]/g,"");
               }
               for(var i=0;i<tempArr2.length;i++){
                   tempArr2[i].replace(/[^\d\,]/g,"");
               }

           }
        }

        /**
         * 1. 将每周对应的时间段对象，每个属性对应的数组转化成真实的时间段数据
         * 2.将属性用数组的形式表示，时间段1对应数组0
         * timePeriodNormalObjArr[i] 就是哪一天
         * **/
        function arrStringConvert(daysObj,type){
/*               var timeSetTwoArr=[];
               for(var i=0;i<timePeriodNormalObjArr.length;i++){
                   var tempObj = timePeriodNormalObjArr[i];*/
                   var daysArr=[];
                   var count=0;
                   $.each(daysObj,function(i,n){
                    if(n.length>0){
                        var tempLen= n.length-1;
                        var tempStart= (n[0]-1)<10?("0"+(n[0]-1)):((n[0]-1)+"");
                        var tempEnd= n[tempLen]<10?("0"+n[tempLen]):(n[tempLen]+"");
                        daysArr[count++] = tempStart+":00:00-"+tempEnd+":00:00"+" "+type;
                       }
                   });
            return  daysArr;
             /*  }*/

        }

/*        $(".timesetul li").mousedown(function(){
            var $this=this;
            if(!$this.hasClass('liMouseDown')){
                $(this).addClass('liMouseDown');
            }
            if($(this).hasClass('liMouseUp')){
                $(this).removeClass('liMouseUp');
            }

*//*            var $thisLi=$(this);
            if($thisLi.hasClass('normalRecord')){
                var $thisLiChild = $thisLi.children();
                $thisLiChild.mousemove(function(){
                      this.addClass('cellYellow');
                });
            }*//*
*//*            var $thisCell= $(this);
            var mousedownFlag=true;
            var mouseup=false;
            $thisCell.mousemove(function(){
                if(mousedownFlag && !mouseup && $thisCell.parent().hasClass('normalRecord')){
                    $thisCell.addClass('cellYellow');//待完成，鼠标变成对应颜色的画笔
                }
            }).mouseup(function(){
                mouseup = true;
            });*//*
        });
        $('.timesetul li').mouseup(function(){
            var $this=$(this);
            if($this.hasClass('liMouseUp')){
                $this.addClass('liMouseUp');
            }
            if($this.hasClass('liMouseDown')){
                $this.removeClass('liMouseDown');
            }
        });
        $('.timesetul .cell').bind('mousemove',function(){
            var $thisCell= $(this);
            if($thisCell.parent().hasClass('normalRecord')){
                $thisCell.addClass('cellYellow');//待完成，鼠标变成对应颜色的画笔
            }
        });*/

    }); //domReady--end
})();
