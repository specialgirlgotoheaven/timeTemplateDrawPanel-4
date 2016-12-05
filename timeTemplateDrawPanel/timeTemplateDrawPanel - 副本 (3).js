/**
 * Created by 26110 on 16-7-20.
 */
(function(){
     /**
      * 声明：录像类型，普通、动检，01表示只有普通录像，10表示只有动检录像
      * */
    /**
     * 1.构建时要把timeSetContent的Ｄiv的id放在js赋值，而不是放在html里面
     *
     * */
    var timePeriodNormalObjArr = new Array(7);
    var timePeriodDynamicDetectObjArr = new Array(7);
    var timePeriodResultObjArr = new Array(7);   //把各类型时间段合并到这个数组里
    var MouseDown=false;
    var MouseUp=false;
    var currentDay;
    var CELLWIDTH = 32;
    var CELLWIDTHexceptSIX = parseInt(CELLWIDTH/6);
    $(function(){
        $("#setTimeDialog").dialog({
            autoOpen:false,
            modal: true,
            width:600,
            height:300,
            open:function(){
                //$("input[type='time']").val("");
                $("input[data-input=time]").val("");
               // $("input[type=checkbox]").attr('checked',false);
                var tempCloneDomArr = $(".theTimeSetInDialogClone");
                for(var i=0;i<tempCloneDomArr.length-1;i++){
                    tempCloneDomArr[i].remove();
                }
                $("#setTimeDialogDiv").hide();
                console.log($(".theTimeSetInDialogClone"));
            },
            buttons: {
                "确认": function() {
                    //$( this ).dialog( "close" );
                    console.log("dialogTimePeriod():"+dialogTimePeriod());

                    displayTimeSet(currentDay,dialogTimePeriod());

                    timePeriodResultObjArr[currentDay]=dialogTimePeriod();

                    splitTypeResult(timePeriodResultObjArr[currentDay],currentDay);

                }
            }
        });

        function splitTypeResult(currentTimePeriodArr,currentDay){
            var tempDynamicDetectObjArr=[];
            var tempNormalObjArr=[];
            for(var i=0;i<currentTimePeriodArr.length;i++){
                var temp=currentTimePeriodArr[i].indexOf(" ");
                var tempTypeArr = currentTimePeriodArr[i].slice(temp+1).split("");
                //tempTypeArr[0] 动检
                if(parseInt(tempTypeArr[0])){     //判断是否有动检
                    tempDynamicDetectObjArr.push(currentTimePeriodArr[i].slice(0,temp+1)+"10");
                }
                if(parseInt(tempTypeArr[1])){
                    tempNormalObjArr.push(currentTimePeriodArr[i].slice(0,temp+1)+"01");
                }
            }
            timePeriodDynamicDetectObjArr[currentDay]=tempDynamicDetectObjArr;
            timePeriodNormalObjArr[currentDay]= tempNormalObjArr;

        }




        $(".timesetButton").click(function(){
            //alert($(this).parent()[0].id.slice(15));
            var thisDay=$(this).parent()[0].id.slice(15);//1表示周一
            currentDay = parseInt(thisDay);
            $("#setTimeDialog").dialog('open');
            console.log("设置");
            console.log(timePeriodResultObjArr[currentDay]);
            outputDayTimesToDialog(timePeriodResultObjArr[currentDay]);
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
/*                   var temp111= timePeriodObjArr($thisCell,"cellGreen");
                   timePeriodNormalObjArr[tempSlice]= arrStringConvert(temp111,0);*/
                   timePeriodNormalObjArr[tempSlice]=timePeriodStringArr($thisCell,"cellGreen","01");
                   console.log(timePeriodNormalObjArr[tempSlice]);
               }
               if($thisCell.parent().hasClass('dynamicDetectRecord')){

                   drawOrClearCells($thisCell,"cellYellow","cellClearColor");
/*                   var temp222= timePeriodObjArr($thisCell,"cellYellow");
                   timePeriodDynamicDetectObjArr[tempSlice]=arrStringConvert(temp222,1);*/
                   timePeriodDynamicDetectObjArr[tempSlice]=timePeriodStringArr($thisCell,"cellYellow","10");
                   console.log(timePeriodDynamicDetectObjArr[tempSlice]);
               }
               /**
                *将普通动检进行合并，后者覆盖前者
                * */
               timePeriodResultObjArr[tempSlice] = combineAndSameTimeReplace(timePeriodNormalObjArr[tempSlice],timePeriodDynamicDetectObjArr[tempSlice]);
               console.log("timePeriodResultObjArr:");
               console.log(timePeriodResultObjArr);
           }

        });

        /**
         *  绘制整个单元格（一小格、一小格）
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
                $thisCell.removeClass(clearClass);
                $thisCell.addClass(drawClass);//待完成，鼠标变成对应颜色的画笔
               // $thisCell.removeClass(clearClass);
            }
        }
        function displayTimeSet(dayNumber,Arr){
            //先清空对应的行
            $("#timeSetContent_"+dayNumber+" .cell").removeClass().addClass("cell").addClass('cellClearColor');
            var dayDiv=$("#timeSetContent_"+dayNumber);
            for(var i=0;i<Arr.length;i++){
                //先找到第几格到第几个
                var start = Arr[i].slice(0,8).split(":");
                var end = Arr[i].slice(9,17).split(":");
                var tempIndex = Arr[i].indexOf(" ");
                var typeArr = Arr[i].slice(tempIndex+1).split("");
                var count = 0;

                //typeArr[0]动检，typeArr[1]普通
                //basicTypeDrawToPanel(start,end,TypeLiClass,TypeClass,bTagTypeColor);
                if(parseInt(typeArr[0])){   //1表示动检存在，0表示动检不存在
                    basicTypeDrawToPanel(dayNumber,start,end,".dynamicDetectRecord","cellYellow","yellow");//动检
                }

                if(parseInt(typeArr[1])){
                    basicTypeDrawToPanel(dayNumber,start,end,".normalRecord","cellGreen","greenyellow"); //普通
                }

/*                if(start[0]==end[0]){
                    var tempSpanEq=parseInt(start[0])+1;
                     $(".normalRecord span:eq("+tempSpanEq+")").attr('starttime', Arr[i].slice(0,8));
                     $(".normalRecord span:eq("+tempSpanEq+")").attr('endtime', Arr[i].slice(9,17));
                     var tagBmarginLeft= (parseInt(start[1])/10) * CELLWIDTHexceptSIX +"px";
                     var tagBwidth =((parseInt(end[1])-parseInt(start[1]))/10) * CELLWIDTHexceptSIX +"px";
                     $(".normalRecord span:eq("+tempSpanEq+")").children().css({"width":tagBwidth,"backgroundColor":"greenyellow","marginLeft":tagBmarginLeft}); //普通和动检做完参数传过来，稍后处理
                     break;
                }
                if(start[1]!="00" ||start[2]!="00") {
                    var tempSpanEqStart=parseInt(start[0])+1;
                    $(".normalRecord span:eq("+tempSpanEqStart+")").attr('starttime', Arr[i].slice(0,8));
                    var tagBwidth2 =  ((60-parseInt(start[1]))/10) * CELLWIDTHexceptSIX +"px";
                    var tagBmarginLeft2= (parseInt(start[1])/10) * CELLWIDTHexceptSIX +"px";
                    $(".normalRecord span:eq("+tempSpanEqStart+")").children().css({"width":tagBwidth2,"backgroundColor":"greenyellow","marginLeft":tagBmarginLeft2}); //普通和动检做完参数传过来，稍后处理
                }
                if(end[1]!="00" || end[2]!="00"){
                    var tempSpanEqEnd=parseInt(end[0])+1;
                    $(".normalRecord span:eq("+tempSpanEqEnd+")").attr('endtime', Arr[i].slice(9,17));
                    var tagBwidth3 = (parseInt(end[1])/10) * CELLWIDTHexceptSIX +"px";
                    $(".normalRecord span:eq("+tempSpanEqEnd+")").children().css({"width":tagBwidth3,"backgroundColor":"greenyellow"});//普通和动检做完参数传过来，稍后处理
                }
                //中间部分直接加class
                if(parseInt(typeArr[0])){//typeArr[0]动检，typeArr[1]普通
                    var tempCellStart = parseInt(start[0])+2;
                    var tempCellEnd = parseInt(end[0])+1;
                    if(tempCellStart<tempCellEnd){
                        for(var p=tempCellStart;p<tempCellEnd;p++){
                            $(".normalRecord span:eq("+p+")").removeClass("cellClearColor").addClass("cellYellow");
                        }
                    }

                }

                if(parseInt(typeArr[1])){
                    var tempCellStart = parseInt(start[0])+2;
                    var tempCellEnd = parseInt(end[0])+1;
                    if(tempCellStart<tempCellEnd){
                        for(var q=tempCellStart;q<tempCellEnd;q++){
                            $(".normalRecord span:eq("+q+")").removeClass("cellClearColor").addClass("cellGreen");
                        }
                    }
                }*/




/*                 //typeArr[0]动检，typeArr[1]普通
                if(parseInt(typeArr[0])){
                   var tempType0 = $("#timeSetContent_"+dayNumber+" li:eq(1)").children();
                    $.each(tempType0,function(i,n){
                          console.log("动检i:"+i);
                          if(i>parseInt(start[0]) && i<=parseInt(end[0])){
                              console.log("typeArr[0]"+i+"start:"+start[0]+"end:"+end[0]);
                              $(n).removeClass("cellClearColor").addClass("cellYellow");
                          }
                    });
                    if(parseInt(start[1])>0){//分钟数大于零

                    }
                }
                //普通
                if(parseInt(typeArr[1])){
                    var tempType0 = $("#timeSetContent_"+dayNumber+" li:eq(0)").children();
                    $.each(tempType0,function(i,n){
                        console.log("普通i:"+i);
                        if(i>parseInt(start[0]) && i<=parseInt(end[0])){
                            console.log("typeArr[1]"+i+"start:"+start[0]+"end:"+end[0]);
                            $(n).removeClass("cellClearColor").addClass("cellGreen");
                        }
                    });
                    if(parseInt(start[1])>0){//分钟数大于零

                    }
                }*/

            }
        }
        /**
         *
         * // $("#timeSetContent_"+dayNumber+" .cell").
         * 特别说明，TypeLiClass要加.号，TypeClass不加.号
         * */
        function basicTypeDrawToPanel(dayNumber,start,end,TypeLiClass,TypeClass,bTagTypeColor){
            var TypeLiClass="#timeSetContent_"+dayNumber+" "+TypeLiClass;
            if(start[0]==end[0]){
                var tempSpanEq=parseInt(start[0])+1;
                //改变data-value;
                var tempDataValue=$(TypeLiClass+" span:eq("+tempSpanEq+")").attr("data-value");
                var tempDataValueIndex = tempDataValue.indexOf(" ");
                var tempTypeString = tempDataValue.slice(tempDataValueIndex+1);
                $(TypeLiClass+" span:eq("+tempSpanEq+")").attr("data-value", start.join(":")+"-"+end.join(":")+" "+tempTypeString);
                //开始绘制
                $(TypeLiClass+" span:eq("+tempSpanEq+")").attr('starttime', start.join(":"));
                $(TypeLiClass+" span:eq("+tempSpanEq+")").attr('endtime', end.join(":"));
                var tagBmarginLeft= (parseInt(start[1])/10) * CELLWIDTHexceptSIX +"px";
                var tagBwidth =((parseInt(end[1])-parseInt(start[1]))/10) * CELLWIDTHexceptSIX +"px";
                $(TypeLiClass+" span:eq("+tempSpanEq+")").children().css({"width":tagBwidth,"backgroundColor":bTagTypeColor,"marginLeft":tagBmarginLeft}); //普通和动检做完参数传过来，稍后处理
                return;
            }
            if(start[1]!="00" ||start[2]!="00") {
                var tempSpanEqStart=parseInt(start[0])+1;

                //改变data-value;
                var tempDataValue=$(TypeLiClass+" span:eq("+tempSpanEqStart+")").attr("data-value");
                var tempDataValueIndex = tempDataValue.indexOf(" ");
                var tempTypeString = tempDataValue.slice(tempDataValueIndex+1);
                var tempDataValueEnd = tempDataValue.slice(9,17);
                $(TypeLiClass+" span:eq("+tempSpanEq+")").attr("data-value", start.join(":")+"-"+tempDataValueEnd+" "+tempTypeString);
                //开始绘制
                $(TypeLiClass+" span:eq("+tempSpanEqStart+")").attr('starttime', start.join(":"));
                var tagBwidth2 =  ((60-parseInt(start[1]))/10) * CELLWIDTHexceptSIX +"px";
                var tagBmarginLeft2= (parseInt(start[1])/10) * CELLWIDTHexceptSIX +"px";
                $(TypeLiClass+" span:eq("+tempSpanEqStart+")").children().css({"width":tagBwidth2,"backgroundColor":bTagTypeColor,"marginLeft":tagBmarginLeft2}); //普通和动检做完参数传过来，稍后处理
            }else if(start[1]=="00" && start[2]=="00"){
                var tempSpanEqStart=parseInt(start[0])+1;
                $(TypeLiClass+" span:eq("+tempSpanEqStart+")").removeClass("cellClearColor").addClass(TypeClass);
            }

            if(end[1]!="59" || end[2]!="59"){
                var tempSpanEqEnd=parseInt(end[0])+1;

                //改变data-value;
                var tempDataValue=$(TypeLiClass+" span:eq("+tempSpanEqEnd+")").attr("data-value");
                var tempDataValueIndex = tempDataValue.indexOf(" ");
                var tempTypeString = tempDataValue.slice(tempDataValueIndex+1);
                var tempDataValueStart = tempDataValue.slice(0,8);
                $(TypeLiClass+" span:eq("+tempSpanEq+")").attr("data-value", tempDataValueStart+"-"+end.join(":")+" "+tempTypeString);

                //开始绘制
                $(TypeLiClass+" span:eq("+tempSpanEqEnd+")").attr('endtime',end.join(":"));
                var tagBwidth3 = (parseInt(end[1])/10) * CELLWIDTHexceptSIX +"px";
                $(TypeLiClass+" span:eq("+tempSpanEqEnd+")").children().css({"width":tagBwidth3,"backgroundColor":bTagTypeColor});//普通和动检做完参数传过来，稍后处理
            }
            //中间部分直接加class
            var tempCellStart = parseInt(start[0])+2;
            var tempCellEnd = parseInt(end[0])+1;
            if(tempCellStart<tempCellEnd){
                for(var p=tempCellStart;p<tempCellEnd;p++){
                    $(TypeLiClass+" span:eq("+p+")").removeClass("cellClearColor").addClass(TypeClass);
                }
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
                                var temp2=newArr[count-1].indexOf(" ");
                                newArr[count-1]=newArr[count-1].slice(0,temp2)+" 11";
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
            newArr.sort(function(a,b){    //按时间段排序
                var tempa = a.slice(0,8).split(":").join("");
                var tempaLast = a.slice(9,17).split(":").join("");
                var tempb = b.slice(0,8).split(":").join("");
                var tempbLast = b.slice(9,17).split(":").join("");
                if(tempa!=tempb){  //开始时间不同则根据开始时间排序
                    return   tempa - tempb;
                }else {
                    return  tempaLast-tempbLast;
                }
            });
            return newArr;
        }

        /**
         * $thisCell表示页面上的Dom元素
         * recordTypeColorClass表示要画的颜色
         * return 每天的时间段对象，一个时间段用一个属性表示
         * */
        function timePeriodObjArr($thisCell,recordTypeColorClass){
            var tempSpanCells = $thisCell.parent().children();
            var timeObj={};
            var timecount=0;
            var tempStr = "timecount0";
            timeObj[tempStr]=[];

            $.each(tempSpanCells,function(i,n){
                // console.log("i:"+i+"   n:"+ n.className);
                if(n.className.indexOf(recordTypeColorClass)!=-1){     //可以写一个函数把这个做为入参
                    timeObj[tempStr].push(i);
                    console.log("data-value:"+ $(n).attr("data-value"));
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
         * （替换上面那个函数）生成时间段字符串
         * */
        function timePeriodStringArr($thisCell,recordTypeColorClass,type){




            var tempSpanCells = $thisCell.parent().children();
            // timeObj={};
            var timecount=0;
            //var tempStr = "timecount0";
            //timeObj[tempStr]=[];
            var timePeriodArr=[];
            var tempString="";

            if($thisCell[0].hasAttribute("starttime")){
                var tempReplace0 = $thisCell.attr("starttime");
                $thisCell.removeAttr("starttime");
                $thisCell.children().css({'width':'0px'});

                var tempReplace1=  $thisCell.attr("data-value").slice(8);
                $thisCell.attr("data-value",tempReplace0.slice(0,2)+":00:00"+tempReplace1);
            }
            if($thisCell[0].hasAttribute("endtime")){
                var tempReplace2 = $thisCell.attr("endtime").slice(0,2);
                $thisCell.removeAttr("endtime");
                $thisCell.children().css({'width':'0px'});

                var tempReplace3=  $thisCell.attr("data-value");
                var tempNumber = parseInt(tempReplace3.slice(0,2))+1;
                var tempNumberString=  tempNumber>9?tempNumber:("0"+ tempNumber);
                $thisCell.attr("data-value",tempReplace3.slice(0,9)+tempNumberString+":59:59");
            }

            var tempEachArr=[];
            $.each(tempSpanCells,function(i,n){
                // console.log("i:"+i+"   n:"+ n.className);
/*                if($(n)[0].hasAttribute('starttime') && $(n)[0].hasAttribute('endtime') ){
                    tempString +=$(n).attr()
                }*/



                if((n.className.indexOf(recordTypeColorClass)!=-1 || $(n)[0].hasAttribute("starttime")||$(n)[0].hasAttribute("endtime")) ){//先找到(第一个)对应单元格
                    //&& (i>0?$(n).prev().attr("data-value").slice(9,17)==$(n).attr("data-value").slice(0,8):true)

                    if( $(n)[0].hasAttribute("starttime")){
                        var tempStartTime =  $(n).attr("starttime");
                        var tempReplaceStart=  $(n).attr("data-value");
                        $(n).attr("data-value",tempStartTime+tempReplaceStart.slice(8));
                    }

                    if( $(n)[0].hasAttribute("endtime")){
                        var tempEndTime =  $(n).attr("endtime");
                        var tempReplaceEnd=  $(n).attr("data-value");
                        $(n).attr("data-value",tempReplaceEnd.slice(0,9)+tempEndTime);    //将前面一段和后面一段相加
                    }

                    //tempString +=$(n).attr("data-value");
                    tempEachArr.push($(n).attr("data-value"));

/*                    if(i>0){   //i>0时要满足前一个的开始时间==结束时间
                         if($(n).prev().attr("data-value").slice(9,17)==$(n).attr("data-value").slice(0,8)){
                             if( $(n)[0].hasAttribute("starttime")){
                                 var tempStartTime =  $(n).attr("starttime");
                                 var tempReplaceStart=  $(n).attr("data-value");
                                 $(n).attr("data-value",tempStartTime+tempReplaceStart.slice(8));
                             }

                             if( $(n)[0].hasAttribute("endtime")){
                                 var tempEndTime =  $(n).attr("endtime");
                                 var tempReplaceEnd=  $(n).attr("data-value");
                                 $(n).attr("data-value",tempReplaceEnd.slice(0,9)+tempEndTime);    //将前面一段和后面一段相加
                             }

                             tempString +=$(n).attr("data-value");
                         }
                    }else{

                    }*/

                }/*else{
                    if(tempString!=""){//如果存在就push一个时间段
                        //对tempString进行首尾处理
                        var firstPosition = tempString.indexOf("-");
                        var lastPosition = tempString.lastIndexOf("-");
                        var firstString = tempString.slice(0,firstPosition);
                        var lastString = tempString.slice(lastPosition);
                        var resultString=firstString+lastString+" "+type;
                        timePeriodArr.push(resultString);
                        timecount++;
                        tempString="";
                    }
                }*/


            });
            console.log("each:");
            console.log(tempEachArr);
            if(tempEachArr.length>0){
                var count=0;

                for(var j=0;j<tempEachArr.length;j++){
                    //var tempStartBefore=j>0?tempEachArr[j-1].slice(0,8):"";
                    var tempEndBefore=j>0?tempEachArr[j-1].slice(9,17):"";
                    var tempStart = tempEachArr[j].slice(0,8);
                    var tempEnd = tempEachArr[j].slice(9,17);
                    var tempAfterStart=j<tempEachArr.length-1?tempEachArr[j+1].slice(0,8):"";
                    timePeriodArr[timecount]=timePeriodArr[timecount]==undefined?tempEachArr[j]:timePeriodArr[timecount] ;
                    if(timePeriodArr[timecount]==undefined){
                        timePeriodArr[timecount]=tempEachArr[j];
                    }else if(TimeIncrement(tempEnd) == tempAfterStart ){
                        timePeriodArr[timecount]+=","+tempEachArr[j];
                       // timePeriodArr[timecount] == undefined ?
                       //timePeriodArr[timecount] += "," +tempEachArr[j];
                    }else{
                        timecount++;
                    }
                    /* if(tempEachArr[j].slice(9,17)){
                     *//**
                     * 在这里对timePeriodArr进行赋值（0728还没有赋值）
                     * 并进行连续性的判断，把连续的时间段拎出来，是否连续用data-value的开始时间是不是等于前一个的结束时间
                     * *//*
                     }*/
                }

                //时间段划分好后，在对其进行加工，形成00:00:00-10:00:00 11这种样式
                for(var m=0;m<timePeriodArr.length;m++){
                    var tempArrEx= timePeriodArr[m].split(",");
                    var tempLen=tempArrEx.length-1;
                    if(tempLen>0){
                        timePeriodArr[m]=tempArrEx[0].slice(0,9)+tempArrEx[tempLen].slice(9,17)+" "+type;
                    }else{
                        timePeriodArr[m]=tempArrEx[0]+" "+type;
                    }
                }

            }

            return  timePeriodArr;
        }

        /* 把当前时间+1秒，例如20:30:59变成20：31：00 */
        function TimeIncrement(currentTime) {
            var currentTimeArr = currentTime.split(":");
            var resultArr = [];
            if (currentTimeArr[2] == '59') {
                resultArr[2] = "00";
                if (currentTimeArr[1] == '59') {
                    resultArr[1] = "00";
                    if (currentTimeArr[0] == "23") {
                        resultArr[0] = "00";
                    } else {
                        resultArr[0] = parseInt(currentTimeArr[0]) + 1;
                        resultArr[0] = resultArr[0] < 10 ? ("0" + resultArr[0])
                            : resultArr[0];
                    }
                } else {
                    resultArr[1] = parseInt(currentTimeArr[1]) + 1;
                    resultArr[1] = resultArr[1] < 10 ? ("0" + resultArr[1])
                        : resultArr[1];
                    resultArr[0] = currentTimeArr[0];
                }
            } else {
                resultArr[2] = parseInt(currentTimeArr[2]) + 1;
                resultArr[2] = resultArr[2] < 10 ? ("0" + resultArr[2]) : resultArr[2];
                resultArr[1] = currentTimeArr[1];
                resultArr[0] = currentTimeArr[0];
            }
            return resultArr.join(":");
        }



        function outputDayTimesToDialog(dayTimeArr){

                if(dayTimeArr && dayTimeArr.length>0){
                        if(dayTimeArr.length>1){
                            //直接给第一行赋值
                            var firstTimeString = dayTimeArr[0];
                            var temp = dayTimeArr[0].indexOf("-");
                            var firstTimeArr=[];
                            firstTimeArr[0] = firstTimeString.slice(0,temp);
                            var temp2=  dayTimeArr[0].indexOf(" ");
                            firstTimeArr[1] = firstTimeString.slice(temp+1,temp2);
                            //$("input[type=time]:eq(0)").val(firstTimeArr[0]);
                            $("input[data-input=time]:eq(0)").val(firstTimeArr[0]);
                            //$("input[type=time]:eq(1)").val(firstTimeArr[1]);
                            $("input[data-input=time]:eq(1)").val(firstTimeArr[1]);

                            var tempType= dayTimeArr[0].slice(temp2+1);
                            var tempTypeArr=tempType.split("");
                            //数组第一位是动检，倒数第一位是从普通开始
                            if(tempTypeArr[0]=='1'){   //判断是不是动检
                                $("input[type=checkbox]:eq(1)").attr('checked',true);
                            }else{
                                $("input[type=checkbox]:eq(1)").attr('checked',false);
                            }
                            if(tempTypeArr[1]=='1'){   //判断是不是普通
                                $("input[type=checkbox]:eq(0)").attr('checked',true);
                            }else{
                                $("input[type=checkbox]:eq(0)").attr('checked',false);
                            }

                            for(var i=1;i<dayTimeArr.length;i++){
                                var firstTimeString = dayTimeArr[i];
                                var temp = dayTimeArr[i].indexOf("-");
                                var tempTimeArr=[];
                                tempTimeArr[0] = firstTimeString.slice(0,temp);
                                var temp2=  dayTimeArr[i].indexOf(" ");
                                tempTimeArr[1] = firstTimeString.slice(temp+1,temp2);
                                //tempTimeArr[1] = firstTimeString.slice(temp);

                                var tempCloneDiv =  $("#setTimeDialogDiv").clone(true);
                                tempCloneDiv.show();
                                tempCloneDiv.children("#cloneTimeInput1").val(tempTimeArr[0]);
                                tempCloneDiv.children("#cloneTimeInput2").val(tempTimeArr[1]);


                                var tempType= dayTimeArr[i].slice(temp2+1);
                                var tempTypeArr=tempType.split("");
                                //数组第一位是动检，倒数第一位是从普通开始
                                if(tempTypeArr[0]=='1'){   //判断是不是动检
                                   // $("input[type=checkbox]:eq(1)").attr('checked',true);
                                    tempCloneDiv.children("#cloneCheckbox2").attr('checked',true);
                                }else{
                                    tempCloneDiv.children("#cloneCheckbox2").attr('checked',false);
                                }
                                if(tempTypeArr[1]=='1'){   //判断是不是普通
                                    tempCloneDiv.children("#cloneCheckbox1").attr('checked',true);
                                }else{
                                    tempCloneDiv.children("#cloneCheckbox1").attr('checked',false);
                                }

                                $("#setTimeDialog").append(tempCloneDiv);
                            }
                            //var cloneDivs=$(".theTimeSetInDialogClone")
                        }else{
                            //直接给第一行赋值
                            var firstTimeString = dayTimeArr[0];
                            var temp = dayTimeArr[0].indexOf("-");
                            var firstTimeArr=[];
                            firstTimeArr[0] = firstTimeString.slice(0,temp);
                            var temp2=  dayTimeArr[0].indexOf(" ");
                            firstTimeArr[1] = firstTimeString.slice(temp+1,temp2);
                            //$("input[type=time]:eq(0)").val(firstTimeArr[0]);
                            $("input[data-input=time]:eq(0)").val(firstTimeArr[0]);
                            //$("input[type=time]:eq(1)").val(firstTimeArr[1]);
                            $("input[data-input=time]:eq(1)").val(firstTimeArr[1]);
                            var tempType= dayTimeArr[0].slice(temp2+1);
                            var tempTypeArr=tempType.split("");
                            //数组第一位是动检，倒数第一位是从普通开始
                            if(tempTypeArr[0]=='1'){   //判断是不是动检
                                $("input[type=checkbox]:eq(1)").attr('checked',true);
                            }else{
                                $("input[type=checkbox]:eq(1)").attr('checked',false);
                            }
                            if(tempTypeArr[1]=='1'){//判断是不是普通
                                $("input[type=checkbox]:eq(0)").attr('checked',true);
                            }else{
                                $("input[type=checkbox]:eq(0)").attr('checked',false);
                            }

                        }

                }
        }
        /**
         *将对话框里的时间段存到数组里Arr=[时间段1，时间段2，时间段3，......]
         * 备注，它是不分星期几的
         * */
        function dialogTimePeriod(){
              var divs=$("#setTimeDialog").children();
              var dialogResultArr=[];
              $.each(divs,function(i,n){
                  var inputs= n.children;
                  var divResult="";
                  var tempTimeStringArr=[];
                  var tempTypeStringArr=[];
                  $.each(inputs,function(i,n){
                       if($(n).attr("data-input")=="time"){
                           if($(n)[0].value!=""){
                               //console.log("time:"+$(n)[0].value);
                               //tempTimeString += $(n)[0].value;
                               tempTimeStringArr.push($(n)[0].value);
                           }else{
                               return false;    //一行里有一个为空就跳出循环
                           }
                       }else if($(n).attr("type")=="checkbox"){
                           //console.log("type:"+$(n)[0].checked);
                           //tempTimeString += $(n)[0].checked?"1":"0";
                           tempTypeStringArr.push($(n)[0].checked?"1":"0");
                       }

                  });
                  divResult=tempTimeStringArr.join("-")+" "+tempTypeStringArr.reverse().join("");
                  //console.log("divResult:"+divResult);
                  if(divResult!=" "){
                      dialogResultArr.push(divResult);
                  }

              });

            return dialogResultArr.sort(function(a,b){    //按时间段排序
                var tempa = a.slice(0,8).split(":").join("");
                var tempaLast = a.slice(9,17).split(":").join("");
                var tempb = b.slice(0,8).split(":").join("");
                var tempbLast = b.slice(9,17).split(":").join("");
                if(tempa!=tempb){  //开始时间不同则根据开始时间排序
                    return   tempa - tempb;
                }else {
                    return  tempaLast-tempbLast;
                }
            });
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


    }); //domReady--end
})();
