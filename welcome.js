var option;

function gPD(text,offx,offy,font){
	var c=document.createElement("canvas");
    c.width = 200;
    c.height = 40;
	var ctx=c.getContext("2d");
	ctx.save();
	var arr = [];
	for (var i = 0;i<text.length;i++){
		t = text.slice(i, i+1);
		ctx.font=font;
		ctx.fillStyle="#FF0000";
		ctx.fillText(text,10,30);
		var s = [];
		var y_max = 0;
		var y_min = 0;
		for (var y = 0;y < c.height;y++){
			for (var x = 0;x < c.width;x++){
				if (ctx.getImageData(x,y,1,1).data[0] != 0){
					s.push([x,y])

					if (y > y_max){
						y_max = y;
					}
					if (y < y_min){
						y_min = y;
					}
				}
			}
		}
		var cen = (y_max + y_min) / 2;
		//cen = findYCenter(s);
		for (var i = 0;i < s.length;i++){
			arr.push([s[i][0]+offx,2 * cen - s[i][1]+offy])
		}
		ctx.restore();
	}
	return arr;
}

var font = "30px 幼圆";
var dataList = [
	[
		gPD("欢迎来到",0,24,font),
		gPD("BILIUP",0,0,font)
	],[
		gPD("请在左侧",0,30,font),
		gPD("选择 提交",0,0,font),
	],[
		gPD("本项目",0,80,font),
		gPD("基于：",0,48,font),
		gPD("Bootstrap",0,20,font),
		gPD("Echarts",0,0,font)
	],[
		gPD("Have",0,48,font),
		gPD("a good",0,24,font),
		gPD("time!",0,0,font)
	]/*,[
		gPD("Welcome to",0,24,font),
		gPD("BILIUP",0,0,font)
	],[
		gPD("Please Select",0,48,font),
		gPD("and Submit",0,24,font),
		gPD("on the Left",0,0,font)
	],[
		gPD("This Project",0,72,font),
		gPD("is Based on",0,48,font),
		gPD("Bootstrap",0,20,font),
		gPD("Echarts",0,0,font)
	],[
		gPD("Have",0,48,font),
		gPD("a good",0,24,font),
		gPD("time!",0,0,font)
	]*/
];


var ob = {
	xAxis: {
		scale: false
	},
	yAxis: {
		scale: false
	},
	toolbox: {
		show: true,
		feature: {
			myTool1: chartOptionBasic.toolbox.feature.myTool1
		}
	}
};

var se = []
for (var i = 0;i < dataList[0].length;i++){
	se.push({
		type: 'scatter',
		universalTransition: {
			enabled: true,
		},
		data: dataList[0][i]
	})
}
myChart.setOption({
	...ob,
	series: se
}, true);

var a = 1;
welcomeId = setInterval(function () {
	
	var se = []
	for (var i = 0;i < dataList[a].length;i++){
		se.push({
			type: 'scatter',
			universalTransition: {
				enabled: true,
			},
			data: dataList[a][i]
		})
	}
	myChart.setOption({
		...ob,
		series: se
	}, true);
	if (dataList.length - a > 1){
		a++;
	}
	else{
		a = 0;
	}
}, 2000);

window.addEventListener('resize', myChart.resize);

ct = 0;
document.getElementById("chartTitle").ondblclick = function(){
	ct++;
	console.log(ct);
	switch (ct){
		case 4:
			dataList = [
				[
					gPD("椎名菜羽",0,48,font),
					gPD("Shiina",0,24,font),
					gPD(" Nanoha",0,0,font)
				]/*,[
					gPD("古守血游",0,52,font),
					gPD("Komori",0,28,font),
					gPD(" Chiiyu",0,0,font)
				],[
					gPD("真白花音",0,48,font),
					gPD("Mashiro",0,24,font),
					gPD(" Kanon",0,0,font)
				],[
					gPD("夏诺雅",0,24,font),
					gPD("Shanoa",0,0,font),
				],[
					gPD("铃宫铃",0,48,font),
					gPD("Suzumiyaaa",0,20,font),
					gPD(" Rin",0,0,font)
				]*/
			];
			break;
		case 20:
			dataList = [
				[
					gPD("四季夏目",0,24,font),
					gPD("YYDS",0,0,font)
				],[
					gPD("YYDS",0,30,font),
					gPD("四季夏目",0,0,font),
				],[
                    gPD("四季夏目",0,0,font),
					gPD(" ",0,80,font),
				],[
					gPD("YYDS",0,0,font),
                    gPD(" ",0,80,font),
				]
			];
			break;
	}
}