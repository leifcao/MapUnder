/*
* 默认显示全国
* @cityName 点击时候存储的城市名称
* @parentCode 点击时候存储的城市行政区code
* @rootUrl  根目录路径
* @rootName  根路径名称
* @childCity 市模块路径
* @childDistrict 镇模块路径
* */

var cityName = ['全国'];
var parentCode = [100000];
let rootUrl = 'data/';
let rootName = [''];

//获取div
let chartPanel = document.getElementById('chart-panel');
let myChart = echarts.init(chartPanel);

getJson(100000);

//根据城市的行政区code 编号获取相应的json文件
function getJson(cityCode) {
  let url = `${rootUrl}${rootName.join('')}${cityCode}.json`;
  console.log(url, '路径');
  $.get(url, function (areaJson, err) {
    // console.log(areaJson);
    getMapData(areaJson);
  }).fail(function () {
    alert('小编正在努力开发中');
    listPop();
  });
}


$('.back').click(function () {
  if (parentCode.length === 1) return;

  //删除最后一位
  listPop();
  getJson(parentCode[parentCode.length - 1]);
})


// var parentCode = [100000];
// getGeoJson(100000);


/**
 *   cityCode 行政区code 编号
 **/
//获取数据，这里我们用随机数模拟数据
function getMapData(Json) {
  let mapData = Json.features.map(item => {
    return ({
      name: item.properties.name,
      value: Math.random() * 1000,
      level: item.properties.level,
      cityCode: item.properties.adcode
    })
  });
  //去渲染echarts
  initEcharts(mapData, Json)
}


function initEcharts(mapData, mapJson) {

  // console.log(mapJson)

  //注册
  echarts.registerMap('Map', mapJson);

  //这里加true是为了让地图重新绘制，不然如果你有筛选的时候地图会飞出去
  myChart.setOption({
    backgroundColor: 'rgb(20,28,52)',
    tooltip: {
      trigger: "item",
      formatter: p => {
        let val = p.value;
        if (window.isNaN(val)) {
          val = 0;
        }
        let txtCon =
          p.name + "<br>" + "<hr>" + "数值 : " + val.toFixed(2);
        return txtCon;
      }
    },
    title: {
      show: true,
      x: "center",
      y: "top",
      text: cityName[cityName.length - 1] + "地图实现点击下钻",
      textStyle: {
        color: "#fff",
        fontSize: 16
      }
    },
    dataRange: {
      right: "2%",
      bottom: "3%",
      icon: "circle",
      align: "left",
      splitList: [{
        start: 0,
        end: 0,
        label: '未发生',
        color: "#20ade5"
      },
        {
          start: 0,
          end: 250,
          label: '0-150',
          color: "#007ed3"
        },
        {
          start: 250,
          end: 500,
          label: '250-500',
          color: "#3685F2"
        },
        {
          start: 500,
          end: 750,
          label: '500-750',
          color: "#2291aa"
        },
        {
          start: 750,
          label: '750以上',
          color: "#71aaff"
        }
      ],
      textStyle: {
        color: "#0fccff",
        fontSize: 16
      }
    },
    series: [{
      name: "地图",
      type: "map",
      map: "Map",
      roam: true, //是否可缩放
      zoom: 1.1, //缩放比例
      data: mapData,
      itemStyle: {
        /* normal: {
           show: true,
           areaColor: 'rgba(0,0,0,0)',
           borderColor: 'rgb(185, 220, 227)',
           borderWidth: '1',
         },*/
        normal: {
          borderColor: 'rgba(147, 235, 248, 1)',
          borderWidth: 1,
          areaColor: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.8,
            colorStops: [{
              offset: 0,
              color: 'rgba(147, 235, 248, 0)' // 0% 处的颜色
            }, {
              offset: 1,
              color: 'rgba(147, 235, 248, .2)' // 100% 处的颜色
            }],
            globalCoord: false // 缺省为 false
          },
          shadowColor: 'rgba(128, 217, 248, 1)',
          // shadowColor: 'rgba(255, 255, 255, 1)',
          shadowOffsetX: -2,
          shadowOffsetY: 2,
          shadowBlur: 10
        },
        emphasis: {
          // 地图区域的高亮颜色
          areaColor: "#70e8e1"
        }
      },
      label: {
        normal: {
          show: true, //显示省份标签
          textStyle: {
            color: "rgb(249, 249, 249)", //省份标签字体颜色
            fontSize: 12
          }
        },
        emphasis: {
          //对应的鼠标悬浮效果
          show: true,
          textStyle: {
            // color: "#000",
            color: "#6b6b6b"
          },

        }
      }
    }]

  }, true)

  myChart.on('click', echartsMapClick);
}

//防止点击多次
let clickFlag = true;

//echarts点击事件
function echartsMapClick(params) {
  if (clickFlag) {
    clickFlag = false;
    let cityCode = params.data.cityCode;
    let level = params.data.level;
    let name = params.data.name;
    if (cityCode != parentCode[parentCode.length - 1]) {
      if (level === 'city' || level === 'district') {
        rootName.push(`${level}/`);
      } else {
        proviceName(name);
      }
      parentCode.push(cityCode);
      cityName.push(name);
      getJson(cityCode);
    }
    clickFlag = true;
  }
}

// 数组末尾删除
function listPop() {
  rootName.pop();
  cityName.pop();
  parentCode.pop();
}


window.onresize = function () {
  myChart.resize();
}
