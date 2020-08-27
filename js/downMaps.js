

let mapJson = {};

//获取div
let chartPanel = document.getElementById('chart-panel');
let myChart = echarts.init(chartPanel);


$('.back').click(function () {
  if (parentCode.length === 1) return;
  cityName.pop();
  //删除最后一位
  parentCode.pop();
  getGeoJson(parentCode[parentCode.length - 1]);
});


$('.down').click(function () {
  downLoadJson(mapJson);
});

var parentJson = null;
var cityName = ['全国'];
var parentCode = [100000];

getGeoJson(100000);

/**
 *  利用高德api获取行政区边界geoJson
 *   adcode 行政区code 编号
 **/

function getGeoJson(adcode) {
  var map = new AMap.Map('map', {
    resizeEnable: true,
    center: [116.30946, 39.937629],
    zoom: 3
  })
  AMapUI.loadUI(['geo/DistrictExplorer'], DistrictExplorer => {
    var districtExplorer = (window.districtExplorer = new DistrictExplorer({
      eventSupport: true, //打开事件支持
      map: map
    }))
    districtExplorer.loadAreaNode(adcode, function (error, areaNode) {
      if (error) {
        console.error(error);
        return;
      }

      let Json = areaNode.getSubFeatures()
      if (Json.length > 0 && Json[0].properties.level == 'district') {
        parentJson = Json;
      }
      //说明当前是区县
      //这里还有个问题就是获取mapData数据，这里调用getMapData方法又会重新生成一次value值
      //其实应该为之前的数据，不过这只是测试数据，用的随机数，实际项目肯定会调接口
      else if (Json.length == 0) {
        Json = parentJson.filter(item => {
          if (item.properties.adcode == adcode) {
            return item;
          }

        })
      }

      //去获取数据
      getMapData(Json);
    });
  })
}

// getMapData(guangdongList);

//获取数据，这里我们用随机数模拟数据

function getMapData(Json) {
  if (Json[20]) {
    Json[20].geometry.coordinates = Json[20].geometry.coordinates.slice(0, 1);
  }
  let mapData = Json.map(item => {
    return ({
      name: item.properties.name,
      value: Math.random() * 1000,
      level: item.properties.level,
      cityCode: item.properties.adcode
    })
  });

  //geoJson必须这种格式
  mapJson.features = Json;
  //去渲染echarts
  downMaps(mapData, mapJson)

}


// 下载所需地图模块json
function  downLoadJson(mapJson) {
  // 下载所需地图模块json
  var blob = new Blob([JSON.stringify(mapJson)], {
    type: "text/plain;charset=utf-8"
  });
  let filename = parentCode[parentCode.length - 1];
  saveAs(blob, `${filename}.json`); //filename
}


function downMaps(mapData, mapJson) {

  console.log(mapJson)

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
        normal: {
          show: true,
          areaColor: 'rgba(0,0,0,0)',
          borderColor: 'rgb(185, 220, 227)',
          borderWidth: '1',
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


//echarts点击事件
function echartsMapClick(params) {
  let cityCode = params.data.cityCode;
  if (cityCode != parentCode[parentCode.length - 1]) {
    parentCode.push(cityCode)
    getGeoJson(cityCode);
    cityName.push(params.data.name)
  }
}
