var _m = "s";
var _u,_o;
var myChart;
var upNames = [];
var fullScreen = false;
var welcomeId;

var dompar = document.getElementById('chartCard');
var dom = document.getElementById('container');
var myChart = echarts.init(dom, null);

$("#selectionCard").hide();
$("#chartCard").hide();

function createSelections(){
    //box = $("#selectOptBox");
    for (var i = 0;i < selections[1].length;i++){
        $("#selectOptBox").append(`
            <div class="form-check">
                <label class="form-check-label">
                <input class="form-check-input" type="checkbox" name="`+selections[0]+`" value="`+selections[1][i][0]+`" `+selections[1][i][1]+`>
                `+optNames[selections[1][i][0]]+`</label>
            </div>
        `);
    }
    $("#selectOptSpin").hide();
}
function requestUPs(){
    $.ajax({
        url:"api.php",
        type:"get",
        data:"m=getups",
        dataType:"json",
        success:function(json){
            //$("#selectUPBox").html(result);
            for (var i = 0;i < json.length;i++){
                ifChecked = "";
                if (defaultCheckedUP == json[i][0]){
                    ifChecked = "checked";
                }1
                $("#selectUPBox").append(`
                    <div class="form-check">
                        <label class="form-check-label">
                        <input class="form-check-input" type="radio" name="ups" value="`+json[i][0]+`" `+ifChecked+`>
                        `+json[i][1]+`</label>
                    </div>
                `);
                upNames.push({
                    id: json[i][0],
                    name: json[i][1]
                });
            }
            $("#selectUPSpin").hide();
        },
        error:function(xhr){
            //ajaxErrorReturn(xhr,"请求UP主列表");
            showAlert("错误","请求UP主列表"+" "+xhr.status+" "+xhr.statusText);
        }
    });
}
function showAlert(type,text){
    /*switch (type){
        case "danger":
            chType = "错误";
            break;
    }*/
    /*$("#alertArea").append(`
    <div class="alert alert-`+type+` alert-dismissible fade show">
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        <strong>`+chType+`!</strong> `+text+`。
    </div>
    `);*/
    $("#alertArea").append(`
    <div class="modal fade" id="alertModal">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">`+type+`</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    `+text+`
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>
    `);
    $('#alertModal').modal('show');
    document.querySelector("#alertArea").innerHTML = "";
}

function changeType(ele,t){
    var ups = $("[name="+ele+"]");
    for(var i = 0;i<ups.length;i++){
        ups[i].type = t;
    }
}
$("#s").click(function(){toS()});
function toS(){
    _m = "s";
    changeType("ups","radio");
    changeType("opt","checkbox");
}
$("#dd").click(function(){toDD()});
function toDD(){
    _m = "dd";
    changeType("opt","radio");
    changeType("ups","checkbox");
}
$(document).ready(function(){
    /*setTimeout(function () {
        setWelcome();
    }, 0)*/
    anime("showSelectionCard");
    anime("showChartCard");
    createSelections();
    requestUPs();
    
});

function anime(k){
    switch (k){
        case "showSelectionCard":
            $("#selectionCard").fadeIn("slow");
        case "showChartCard":
            $("#chartCard").fadeIn("slow");
    }
}

$("#submit").click(function(){
    var ups_elem = $("[name=ups]:checked");
    var opt_elem = $('[name=opt]:checked');
    if (ups_elem.length == 0){
        showAlert("提示","请选择UP主");
        return;
    }
    if (opt_elem.length == 0){
        showAlert("提示","请选择数据类型");
        return;
    }
    if (welcomeId != null){
        clearInterval(welcomeId);
    }
    $("#container").fadeOut(100,function(){
        var ups = "";
        var opt = "";

        switch (_m){
            case "dd":
                for(var i = 0;i < ups_elem.length;i++){
                    ups += ups_elem[i].value + ",";
                }
                ups = ups.slice(0,-1);
                opt = opt_elem[0].value;
                break;
            case "s":
                ups = ups_elem[0].value;
                _u = ups;
                for(var i = 0;i<opt_elem.length;i++){
                    opt += opt_elem[i].value + ",";
                }
                opt = opt.slice(0,-1);
                break;
        }
        _o = opt;
        console.log(_m+" "+ups+" "+opt);
        $.ajax({
            url:"api.php",
            type:"get",
            crossDomain: true,
            data:"m=getinf&type="+_m+"&id="+ups+"&opt="+opt,
            dataType:"json",
            success:function(json){
                console.log(json);
                chartMain(json);
            },
            error:function(xhr){
                showAlert("错误","请求UP主数据"+" "+xhr.status+" "+xhr.statusText);
            }
        });
    });
});

function fNIA(array,key,value){
    for (var i = 0;i < array.length;i++){
        if (array[i][key] == value){
            return i;
        }
    }
    return false;
}

function chartMain(json){
    //title = "";
    seriesData = [];
    function makeOpt_dd(json){
        for(var i = 0;i < json.length;i++){
            title += upNames[fNIA(upNames,"id",json[i]["id"])]["name"] + "、"; 
            switch (fNIA(dd_upSeriesSet,"id",json[i]["id"])){
                default:
                    upSetting = dd_upSeriesSet[fNIA(dd_upSeriesSet,"id",json[i]["id"])]["setting"];
                    break;
                case false:
                    upSetting = dd_upSeriesSet[fNIA(dd_upSeriesSet,"id","default")]["setting"];
                    break;
            }
            o_arr = _o.split("-");
            switch (o_arr.length){
                case 1:
                    var fD = json[i]["data"][0]["data"];
                    break;
                case 2:
                    var fD = [];
                    var oD = json[i]["data"];
                    for (var n = 0;n < oD[0]["data"].length;n++){
                        fD.push([ 
                            oD[0]['data'][n][0] , 
                            (oD[fNIA(oD,"type",o_arr[0])]['data'][n][1] / oD[fNIA(oD,"type",o_arr[1])]['data'][n][1] * 100).toFixed(4) 
                        ]);
                    }
                    break;
            }
            seriesData.push({
                ...all_seriesSet_inner,
                ...upSetting,
                showSymbol: false,
                name: upNames[fNIA(upNames,"id",json[i]["id"])]["name"],
                data: fD
            });
        }
        title = title.substr(0,title.length-1) + " " + optNames[_o];
        return {
            ...chartOptionBasic,
            title: {
                ...chartCommonSet['title'],
                text: title,
                show: false
            },
            yAxis: {
                ...optYAxisSet[_o],
                ...all_yAxisSet_outer,
                ...dd_upYAxisSet,
                name: optNames[_o],
                type: 'value',
            },
            grid: {
                left: 60,
                right: 0
            },
            series: seriesData
        };
    }
    function makeOpt_s(json){
        yAxisData = [];
        title += upNames[fNIA(upNames,"id",json[0]['id'])]['name'] + " ";
        var l_num = 0;
        var r_num = 0;
        for(var i = 0;i < _o.split(",").length;i++){
            var o_loc = _o.split(",")[i];
            title += optNames[o_loc] + "、";
            /*yAxisLoc = {...optYAxisSet[o_loc],...{
                type: 'value',
                name: optNames[o_loc]
            }};*/
            n = (i + 1) / 2;
            if (n % 1 != 0){
                n += n % 1;
            }
            off = (n - 1) * 65;
            
            if (i % 2 == 0){
                pos = 'left';
                l_num++;
                num = i / 2;
                if (num == 0){
                    r = 20;l = 0;
                }
                if (num == 1){
                    r = 0;l = 0;
                }
                if (num > 1){
                    r = 0;l = 20 * num;
                }
            }
            else{
                pos = "right";
                r_num++;
                num = (i - 1) / 2;
                if (num == 0){
                    r = 0;l = 20;
                }
                if (num == 1){
                    r = 0;l = 0;
                }
                if (num > 1){
                    r = 20 * num;l = 0;
                }
            }
            yAxisData.push({
                ...all_yAxisSet_outer,
                ...optYAxisSet[o_loc],
                position: pos,
                type: 'value',
                offset: off,
                name: optNames[o_loc],
                nameTextStyle: {
                    fontStyle: 'oblique',
                    fontSize: 10,
                    overflow: 'truncate',
                    padding:[0,l,0,r]
                }
            });
            
            var oD = json[0]['data'];
            var o_loc_arr = o_loc.split("-");
            switch (o_loc_arr.length){
                case 1:
                    var fD = oD[fNIA(oD,"type",o_loc)]['data'];
                    break;
                case 2:
                    var fD = [];
                    for (var n = 0;n < oD[0]['data'].length;n++){
                        fD.push([ 
                            oD[fNIA(oD,"type",o_loc_arr[0])]['data'][n][0],
                            (oD[fNIA(oD,"type",o_loc_arr[0])]['data'][n][1] / oD[fNIA(oD,"type",o_loc_arr[1])]['data'][n][1] * 100).toFixed(4)
                        ]);
                    }
                    break;
            }
            seriesData.push({
                ...all_seriesSet_inner,
                ...s_optSeriesSet[o_loc],
                showSymbol: false,
                data: fD,
                yAxisIndex: i,
                name: optNames[o_loc]
            });
        }
        chartOptionBasic.legend.left = l_num * 60 + 5;
        title = title.substr(0,title.length-1);
        return {
            ...chartOptionBasic,
            title: {
                ...chartCommonSet['title'],
                text: title,
                show: false
            },
            grid: {
                left: l_num * 60,
                right: r_num * 60
            },
            //yAxis: {...yAxisData,...all_yAxisSet_outer},
            yAxis: yAxisData,
            series: seriesData
        };
    }
    $("#container").show();
    var title = "";
    switch (_m){
        case "dd":
            option = makeOpt_dd(json);
            break;
        case "s":
            option = makeOpt_s(json);
            break;
    }
    console.log(option);

    $("title").text(title);
    $("#chartTitle").html("<small><small><b>"+title+"</b></small></small>");
    

    if (myChart != null && myChart != "" && myChart != undefined) {
        myChart.dispose();//销毁
    }
    myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });
    
    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }
    window.addEventListener('resize', myChart.resize);

    myChart.on('mouseover',function(e){
        const component=e.componentType;
        const value=e.value;
        const offsetX=e.event.offsetX;
        const offsetY=e.event.offsetY;
        if(component==='yAxis'){
            $('#container').find('.echarts_tip').remove();
            $('#container').append(`
                    <div class="echarts_tip" style="top:${offsetY}px;left:${offsetX}px;">
                        ${value}
                    </div>
            `)
        }
    })
    
    myChart.on('mouseout',function(e){
        const component=e.componentType;
        if(e.conponent==='yAxis'){
            $('#container').find('.echarts_tip').remove();
        }
    })
}

var ResizeEles = [
    {
        id: "selectUPBox",
        direction: "s",
        minW: null,
        minH: 100
    },{
        id: "selectOptBox",
        direction: "s",
        minW: null,
        minH: 100
    }
]