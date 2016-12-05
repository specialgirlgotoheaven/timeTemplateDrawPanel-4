/**
 * Created by 26110 on 16-7-20.
 */
/**
 * 待完成，左边的小方块，自动清空和自动全选填充，要先去判断对应那一条面板上有没有值，有值就执行清空，没有值就执行全选。
 * 判断有没有值，不仅要去判断有没有class，还要去判断有没有starttime endtime属性
 *
 * */

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
    var NORMALRecordType = 1;//普通
    var ALARMRecordType = 2; //动检
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
                    var checkTheDialog = dialogInputCompare();
                    if(checkTheDialog){
                        //$( this ).dialog( "close" );
                        console.log("dialogTimePeriod():"+dialogTimePeriod());
                        var dialogResultArr = dialogTimePeriod();
                        var tempDialogTypeNormal = [];
                        var tempDialogTypeDynamicDetect = [];
                        // var tempDialogTypeNormalAndDynamicDetect = [];
                        var tempResultCombine=[];

                        for(var i=0;i<dialogResultArr.length;i++){
                            var tempIndexOf=dialogResultArr[i].indexOf(" ")+1;
                            var tempTypeArr=dialogResultArr[i].slice(tempIndexOf).split("");
                            var recordType = parseInt(tempTypeArr);
                            var RecordNormal = 1;
                            var RecordDynamicDetect = 2;

                            if( recordType & RecordNormal) // 普通
                            {
                                tempDialogTypeNormal.push(dialogResultArr[i].slice(0,18)+"1");

                            }

                            if(recordType & RecordDynamicDetect ) // 动检
                            {
                                tempDialogTypeDynamicDetect.push(dialogResultArr[i].slice(0,18)+"2");
                            }
                        }  //-end for
                        //要对设置完的时间段做重叠判断
                        if(tempDialogTypeNormal.length>0){
                            tempDialogTypeNormal= removeRepeatTimePeriod(tempDialogTypeNormal);
                        }
                        if(tempDialogTypeDynamicDetect.length>0){
                            tempDialogTypeDynamicDetect= removeRepeatTimePeriod(tempDialogTypeDynamicDetect);
                        }
                        timePeriodDynamicDetectObjArr[currentDay]=tempDialogTypeDynamicDetect;
                        timePeriodNormalObjArr[currentDay]= tempDialogTypeNormal;
                        timePeriodResultObjArr[currentDay]=combineAndSameTimeReplace(tempDialogTypeNormal,tempDialogTypeDynamicDetect);
                        displayTimeSet(currentDay,timePeriodResultObjArr[currentDay]);
                    }else{
                        alert("第"+(checkTheDialog+1)+"行输入非法,"+"提示：开始时间不能大于结束时间！");
                    }
                }
            }
        });

        $(".timesetButton").click(function(){
            //alert($(this).parent()[0].id.slice(15));
            var thisDay=$(this).parent()[0].id.slice(15);//1表示周一
            currentDay = parseInt(thisDay);
            var chineseArr=['零','星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
            //$("#setTimeDialog").attr('title',chineseArr[currentDay]);
            $("#setTimeDialog").dialog('option','title',chineseArr[currentDay]).dialog('open');
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

       $(".timesetul .cell").bind('mousedown mouseover',function(){
           if(MouseDown && !MouseUp){
               var $thisCell= $(this);

               var $thisContent=  $thisCell.parent().parent().parent();
               //console.log($thisContent[0].id);
               var tempSlice= $thisContent[0].id.slice(15);

               if($thisCell.parent().hasClass('normalRecord')){

                   drawOrClearCells($thisCell,"cellGreen","cellClearColor");
                   timePeriodNormalObjArr[tempSlice]=timePeriodStringArr($thisCell,"cellGreen","1");
                   console.log(timePeriodNormalObjArr[tempSlice]);
               }
               if($thisCell.parent().hasClass('dynamicDetectRecord')){

                   drawOrClearCells($thisCell,"cellYellow","cellClearColor");
                   timePeriodDynamicDetectObjArr[tempSlice]=timePeriodStringArr($thisCell,"cellYellow","2");
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

        $("#firstDialogLineEmpty").click(function(){
              $("#DialogFirstLineStart")[0].value="";
              $("#DialogFirstLineEnd")[0].value="";
        });

        $(".normalRecordHead").click(function(){
            var thisDay=$(this).parent().parent().parent()[0].id.slice(15);//1表示周一
            currentDay = parseInt(thisDay);
            if($(this).hasClass("normalRecordHeadClear")){
                $(this).removeClass("normalRecordHeadClear");
                //先清空再全选
                timePeriodNormalObjArr[currentDay]=clearLine(this,timePeriodNormalObjArr[currentDay]);
                //全选
                timePeriodNormalObjArr[currentDay]=lineSelectAll(this,"cellGreen",timePeriodNormalObjArr[currentDay],1);
                timePeriodResultObjArr[currentDay]=combineAndSameTimeReplace(timePeriodNormalObjArr[currentDay],timePeriodDynamicDetectObjArr[currentDay]);
            }else{
                $(this).addClass("normalRecordHeadClear");
                //清空
                //clearLine(this,".normalRecord",currentDay,timePeriodNormalObjArr[currentDay]);
                timePeriodNormalObjArr[currentDay]=clearLine(this,timePeriodNormalObjArr[currentDay]);
                timePeriodResultObjArr[currentDay]=combineAndSameTimeReplace(timePeriodNormalObjArr[currentDay],timePeriodDynamicDetectObjArr[currentDay]);
            }
        });
        $(".dynamicDetectRecordHead").click(function(){
            var thisDay=$(this).parent().parent().parent()[0].id.slice(15);//1表示周一
            currentDay = parseInt(thisDay);
            if($(this).hasClass("dynamicDetectRecordClear")){
                $(this).removeClass("dynamicDetectRecordClear");
                //先清空再全选
                timePeriodDynamicDetectObjArr[currentDay]=clearLine(this,timePeriodDynamicDetectObjArr[currentDay]);
                //全选
                timePeriodDynamicDetectObjArr[currentDay]=lineSelectAll(this,"cellYellow",timePeriodDynamicDetectObjArr[currentDay],2);
                timePeriodResultObjArr[currentDay]=combineAndSameTimeReplace(timePeriodNormalObjArr[currentDay],timePeriodDynamicDetectObjArr[currentDay]);
            }else{
                $(this).addClass("dynamicDetectRecordClear");
                //清空
                //clearLine(this,".normalRecord",currentDay,timePeriodNormalObjArr[currentDay]);
                timePeriodDynamicDetectObjArr[currentDay]=clearLine(this,timePeriodDynamicDetectObjArr[currentDay]);
                timePeriodResultObjArr[currentDay]=combineAndSameTimeReplace(timePeriodNormalObjArr[currentDay],timePeriodDynamicDetectObjArr[currentDay]);
            }
        });


    }); //domReady--end

    /**
     * 要先清空，再全选
     * */
    function lineSelectAll(that,addClass,Arr,type){
        Arr=[];
        Arr[0]="00:00:00-23:59:59"+" "+type;
        //var thisDay=$(this).parent().parent().parent()[0].id.slice(15);//1表示周一
        //currentDay = parseInt(thisDay);
        $(that).nextAll().removeClass("cellClearColor").addClass(addClass);
        //$(liClass+" "+".cell").addClass(addClass);
        return Arr;
    }

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
                $thisCell.addClass(clearClass);   //cellClearColor
            }else{
                $thisCell.removeClass(clearClass);
                $thisCell.addClass(drawClass);//待完成，鼠标变成对应颜色的画笔
               // $thisCell.removeClass(clearClass);
            }
        }
        /**
         * 清空对应的行
         * */
        function clearLine(that,arr){
            arr=[];
            //先清空对应的行
            $(that).nextAll().removeClass().addClass("cell").addClass('cellClearColor');
            //将对应的b标签的宽度设置为0
            $(that).nextAll('b').css({'width':'0px'});
            var tempCells=$(that).nextAll();
            //把属性也清空，并初始化
            $.each(tempCells,function(i,n){
                if($(n)[0].hasAttribute("starttime")){
                    var tempReplace0 = $(n).attr("starttime");
                    $(n).removeAttr("starttime");
                    $(n).children().css({'width':'0px'});

                    var tempReplace1=  $(n).attr("data-value").slice(8);
                    $(n).attr("data-value",tempReplace0.slice(0,2)+":00:00"+tempReplace1);
                }
                if($(n)[0].hasAttribute("endtime")){
                    var tempReplace2 = $(n).attr("endtime").slice(0,2);
                    $(n).removeAttr("endtime");
                    $(n).children().css({'width':'0px'});

                    var tempReplace3=  $(n).attr("data-value");
                    var tempNumber = parseInt(tempReplace3.slice(0,2));
                    var tempNumberString=  tempNumber>9?tempNumber:("0"+ tempNumber);
                    // $(n).attr("data-value",tempReplace3.slice(0,9)+tempNumberString+":59:59");
                    $(n).attr("data-value",tempReplace3.slice(0,11)+":59:59");
                }
            });
            return arr;
        }

        /**
         * 将对话框里面的设置，显示到面板上
         * */
        function displayTimeSet(dayNumber,Arr){
            //先清空对应的行
            $("#timeSetContent_"+dayNumber+" .cell").removeClass().addClass("cell").addClass('cellClearColor');
            //将对应的b标签的宽度设置为0
            $("#timeSetContent_"+dayNumber+" .cell").children().css({'width':'0px'});
            var tempCells=$("#timeSetContent_"+dayNumber+" .cell");
            //把属性也清空，并初始化
            $.each(tempCells,function(i,n){
                if($(n)[0].hasAttribute("starttime")){
                    var tempReplace0 = $(n).attr("starttime");
                    $(n).removeAttr("starttime");
                    $(n).children().css({'width':'0px'});

                    var tempReplace1=  $(n).attr("data-value").slice(8);
                    $(n).attr("data-value",tempReplace0.slice(0,2)+":00:00"+tempReplace1);
                }
                if($(n)[0].hasAttribute("endtime")){
                    var tempReplace2 = $(n).attr("endtime").slice(0,2);
                    $(n).removeAttr("endtime");
                    $(n).children().css({'width':'0px'});

                    var tempReplace3=  $(n).attr("data-value");
                    var tempNumber = parseInt(tempReplace3.slice(0,2));
                    var tempNumberString=  tempNumber>9?tempNumber:("0"+ tempNumber);
                   // $(n).attr("data-value",tempReplace3.slice(0,9)+tempNumberString+":59:59");
                    $(n).attr("data-value",tempReplace3.slice(0,11)+":59:59");
                }
            });
            var dayDiv=$("#timeSetContent_"+dayNumber);
            for(var i=0;i<Arr.length;i++){
                //先找到第几格到第几个
                var start = Arr[i].slice(0,8).split(":");
                var end = Arr[i].slice(9,17).split(":");
                var tempIndex = Arr[i].indexOf(" ");

                var recordType = parseInt( Arr[i].slice(tempIndex+1) );     // 1 2 3
                if( recordType & NORMALRecordType ) //normal
                {
                    basicTypeDrawToPanel(dayNumber,start,end,".normalRecord","cellGreen","greenyellow","1"); //普通
                }

                if(recordType & ALARMRecordType) // alarm
                {
                    basicTypeDrawToPanel(dayNumber,start,end,".dynamicDetectRecord","cellYellow","yellow","2");//动检
                }
            }
        }

        /**
         * 时间段去重
         * */
        function removeRepeatTimePeriod(Arr){
            var copyArr1 = Arr;
            var copyArr2 = Arr;
            var Len=Arr.length;
            var thisResult=[];
            var ArrLen = Arr.length;
            var i=1;j=0;
            thisResult[j] = copyArr1[0];
            while( i<=Len-1){
                if(timeToSeconds(copyArr1[i].slice(0,8))>timeToSeconds(thisResult[j].slice(9,17))+1){
                    j++;
                    thisResult[j]= copyArr1[i];
                    i++;
                }else{
                    var tempEnd= (timeToSeconds(copyArr1[i].slice(9,17)) > timeToSeconds(thisResult[j].slice(9,17))) ? (copyArr1[i].slice(9)):(thisResult[j].slice(9));
                    thisResult[j]=thisResult[j].slice(0,9)+ tempEnd;
                    i++;
                }
            }

            return  thisResult;
        }


        /**
         *
         * // $("#timeSetContent_"+dayNumber+" .cell").
         * 特别说明，TypeLiClass要加.号，TypeClass不加.号
         * 对每一段时间段进行绘制
         * */
        function basicTypeDrawToPanel(dayNumber,start,end,TypeLiClass,TypeClass,bTagTypeColor,typeString){
            var TypeLiClass="#timeSetContent_"+dayNumber+" "+TypeLiClass;
            if(start[0]==end[0]){
                if(!(end[1]=="59" && end[2]=="59") ){
                    var tempSpanEq=parseInt(start[0])+1;
                    //改变data-value;
                    var tempDataValue=$(TypeLiClass+" span:eq("+tempSpanEq+")").attr("data-value");
                    var tempDataValueIndex = tempDataValue.indexOf(" ");
                    //var tempTypeString = tempDataValue.slice(tempDataValueIndex+1);
                    $(TypeLiClass+" span:eq("+tempSpanEq+")").attr("data-value", start.join(":")+"-"+end.join(":")+" "+typeString);
                    //开始绘制
                    $(TypeLiClass+" span:eq("+tempSpanEq+")").attr('starttime', start.join(":"));
                    $(TypeLiClass+" span:eq("+tempSpanEq+")").attr('endtime', end.join(":"));
                    var tagBmarginLeft= (parseInt(start[1])/10) * CELLWIDTHexceptSIX +"px";
                    var tagBwidth =((parseInt(end[1])-parseInt(start[1]))/10) * CELLWIDTHexceptSIX +"px";
                    $(TypeLiClass+" span:eq("+tempSpanEq+")").children().css({"width":tagBwidth,"backgroundColor":bTagTypeColor,"marginLeft":tagBmarginLeft}); //普通和动检做完参数传过来，稍后处理
                }else{
                     if(!(start[1]=="00" && start[2]=="00") ){
                         var tempSpanEqStart=parseInt(start[0])+1;

                         //改变data-value;
                         var tempDataValue=$(TypeLiClass+" span:eq("+tempSpanEqStart+")").attr("data-value");
                         var tempDataValueIndex = tempDataValue.indexOf(" ");
                         //var tempTypeString = tempDataValue.slice(tempDataValueIndex+1);
                         var tempDataValueEnd = tempDataValue.slice(9,17);
                         $(TypeLiClass+" span:eq("+tempSpanEqStart+")").attr("data-value", start.join(":")+"-"+tempDataValueEnd+" "+typeString);
                         //开始绘制
                         $(TypeLiClass+" span:eq("+tempSpanEqStart+")").attr('starttime', start.join(":"));
                         var tagBwidth2 =  ((60-parseInt(start[1]))/10) * CELLWIDTHexceptSIX +"px";
                         var tagBmarginLeft2= (parseInt(start[1])/10) * CELLWIDTHexceptSIX +"px";
                         $(TypeLiClass+" span:eq("+tempSpanEqStart+")").children().css({"width":tagBwidth2,"backgroundColor":bTagTypeColor,"marginLeft":tagBmarginLeft2}); //普通和动检做完参数传过来，稍后处理
                     } else{
                         var tempSpanEqStart=parseInt(start[0])+1;
                         $(TypeLiClass+" span:eq("+tempSpanEqStart+")").removeClass("cellClearColor").addClass(TypeClass);
                     }
                }
                return;
            }


            if(start[1]!="00" ||start[2]!="00") {
                var tempSpanEqStart=parseInt(start[0])+1;

                //改变data-value;
                var tempDataValue=$(TypeLiClass+" span:eq("+tempSpanEqStart+")").attr("data-value");
                var tempDataValueIndex = tempDataValue.indexOf(" ");
                //var tempTypeString = tempDataValue.slice(tempDataValueIndex+1);
                var tempDataValueEnd = tempDataValue.slice(9,17);
                $(TypeLiClass+" span:eq("+tempSpanEqStart+")").attr("data-value", start.join(":")+"-"+tempDataValueEnd+" "+typeString);
                //开始绘制
                $(TypeLiClass+" span:eq("+tempSpanEqStart+")").attr('starttime', start.join(":"));
                var tagBwidth2 =  ((60-parseInt(start[1]))/10) * CELLWIDTHexceptSIX +"px";
                var tagBmarginLeft2= (parseInt(start[1])/10) * CELLWIDTHexceptSIX +"px";
                $(TypeLiClass+" span:eq("+tempSpanEqStart+")").children().css({"width":tagBwidth2,"backgroundColor":bTagTypeColor,"marginLeft":tagBmarginLeft2}); //普通和动检做完参数传过来，稍后处理
                //return;
            }else if(start[1]=="00" && start[2]=="00"){
                var tempSpanEqStart=parseInt(start[0])+1;
                $(TypeLiClass+" span:eq("+tempSpanEqStart+")").removeClass("cellClearColor").addClass(TypeClass);
            }

            if((end[1]!="59" || end[2]!="59")){
                var tempSpanEqEnd=parseInt(end[0])+1;

                //改变data-value;
                var tempDataValue=$(TypeLiClass+" span:eq("+tempSpanEqEnd+")").attr("data-value");
                var tempDataValueIndex = tempDataValue.indexOf(" ");
                //var tempTypeString = tempDataValue.slice(tempDataValueIndex+1);
                var tempDataValueStart = tempDataValue.slice(0,8);
                $(TypeLiClass+" span:eq("+tempSpanEq+")").attr("data-value", tempDataValueStart+"-"+end.join(":")+" "+typeString);

                //开始绘制
                $(TypeLiClass+" span:eq("+tempSpanEqEnd+")").attr('endtime',end.join(":"));
                var tagBwidth3 = (parseInt(end[1])/10) * CELLWIDTHexceptSIX +"px";
                $(TypeLiClass+" span:eq("+tempSpanEqEnd+")").children().css({"width":tagBwidth3,"backgroundColor":bTagTypeColor});//普通和动检做完参数传过来，稍后处理
            }else if((end[1]=="59" && end[2]=="59")){
                var tempSpanEqEnd=parseInt(end[0])+1;
                //var tagBwidth3 = (parseInt(end[1])/10) * CELLWIDTHexceptSIX +"px";
                $(TypeLiClass+" span:eq("+tempSpanEqEnd+")").removeClass("cellClearColor").addClass(TypeClass);;
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

            if(Arr1==undefined && Arr2!=undefined){
                newArr=Arr2;
            }
            if(Arr2==undefined && Arr1!=undefined){
                newArr=Arr1;
            }

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
                                newArr[count-1]=newArr[count-1].slice(0,temp2)+" 3";
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
         * 生成时间段字符串，例如：时间段[1]：....  ,时间段[2].....
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
                var tempNumber = parseInt(tempReplace3.slice(0,2));
                var tempNumberString=  tempNumber>9?tempNumber:("0"+ tempNumber);
                $thisCell.attr("data-value",tempReplace3.slice(0,9)+tempNumberString+":59:59");
            }

            var tempEachArr=[];
            $.each(tempSpanCells,function(i,n){
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
                }


            });
            console.log("each:");
            console.log(tempEachArr);
            if(tempEachArr.length>0){
                var count=0;
                var flag=false;
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
                        flag=true;
                    }else{
                        if(flag){
                            timePeriodArr[timecount]+=","+tempEachArr[j];
                        }
                        flag=false;
                        timecount++;
                    }
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

        function timeToSeconds(TimeString){
               var timeStringArr=TimeString.split(":");
               return  parseInt(timeStringArr[0])*60*60+parseInt(timeStringArr[1])*60+parseInt(timeStringArr[2]);
        }

        function outputDayTimesToDialog(dayTimeArr){

                //var normalRecordType2 = 1;
                //var alarmRecordType2 = 2;
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
                            ///

                            var recordType2 = parseInt(dayTimeArr[0].slice(temp2+1));

                            $("input[type=checkbox]:eq(0)").prop('checked',recordType2 & NORMALRecordType ? true : false ); // 普通
                            $("input[type=checkbox]:eq(1)").prop('checked',recordType2 & ALARMRecordType ? true : false); // 动检

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


                                var tempType2 = parseInt(dayTimeArr[i].slice(temp2+1));
                                tempCloneDiv.children("#cloneCheckbox1").prop('checked',tempType2 & NORMALRecordType ? true : false );  //普通
                                tempCloneDiv.children("#cloneCheckbox2").prop('checked',tempType2 & ALARMRecordType ? true : false );  //动检

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

                            var tempType2= parseInt(dayTimeArr[0].slice(temp2+1));

                            $("input[type=checkbox]:eq(0)").prop('checked',tempType2 & NORMALRecordType ? true : false); // 普通
                            $("input[type=checkbox]:eq(1)").prop('checked',tempType2 & ALARMRecordType ? true : false); // 动检

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
                  var recordType = 0;
                  var tmp = 0;  // 移位
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

                           recordType |= ( $(n)[0].checked? 1 : 0 ) << tmp;
                           tmp++;
                       }

                  });
                  var timeClip = tempTimeStringArr.join("-");
                  divResult=timeClip+" "+ recordType ;
                  //console.log("divResult:"+divResult);
                  if(tempTimeStringArr.join("")!=""){
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
         * 要先做不为空判断
         * 比较对话框内每一行开始、结束时间验证判断，开始时间不能大于结束时间
         * */
        function dialogInputCompare(){
            var timeSetInputArr = $(".theTimeSetInDialog");
            for(var i=0;i<timeSetInputArr.length;i++){
                var tempChildren=  $(timeSetInputArr[i]).children();
                var tempStart = $(tempChildren[0]).val();
                var tempEnd = $(tempChildren[1]).val();
                if(tempStart!=""&&tempEnd!="" ){
                    var tempStartNum = parseInt(tempStart.split(":").join(""));
                    var tempEndNum = parseInt(tempEnd.split(":").join(""));
                    if(tempStartNum>tempEndNum){
                        break;
                    }
                }
                //var tempStart = parseInt($(timeSetInputArr[i]).eq(0).val().split(":").join(""));
                //var tempEnd = parseInt($(timeSetInputArr[i]).eq(1).val().split(":").join(""));
            }
            if(i==timeSetInputArr){
                return true;
            }else{
                return i;
            }
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
         *
         * 将对话框里得到的数组进行录像类型分类处理
         * */
        function  dialogResultArrSplit(dialogResultArr){
            /*            for(var i=0;i<dialogResultArr.length;i++){
             var tempIndexOf=dialogResultArr[i].indexOf(" ")+1;
             var tempString=dialogResultArr[i].slice(tempIndexOf);
             if(tempString="01"){//普通
             tempDialogTypeNormal.push(dialogResultArr[i]);
             }
             if(tempString="10"){
             tempDialogTypeDynamicDetect.push(dialogResultArr[i]);
             }
             if(tempString="11"){
             tempDialogTypeNormalAndDynamicDetect.push(dialogResultArr[i])
             }
             }
             if(tempDialogTypeNormal.length>0){
             tempDialogTypeNormal= removeRepeatTimePeriod(tempDialogTypeNormal);
             }
             if(tempDialogTypeDynamicDetect.length>0){
             tempDialogTypeDynamicDetect= removeRepeatTimePeriod(tempDialogTypeDynamicDetect);
             }
             if(tempDialogTypeNormalAndDynamicDetect.length>0){
             tempDialogTypeNormalAndDynamicDetect= removeRepeatTimePeriod(tempDialogTypeNormalAndDynamicDetect);
             }*/

        }

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



})();
