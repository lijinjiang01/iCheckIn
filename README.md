# iCheckIn
![IDE](https://img.shields.io/badge/IDE-WeChatDevTools-brightgreen.svg) 
![License](https://img.shields.io/badge/License-Apache2-orange.svg)

> WeChatDevTools : WeChatDevTools Stable 1.06.2303220
> 
> WeChat : 8.0.35
>
> 调试基础库 : 2.32.0

## 介绍
iCheckIn 为微信小程序项目，通过调用手机蓝牙功能搜索 Beacon 设备，实现课程签到的功能，该项目我只完成了微信小程序端的实现，流程设计和原型设计都是参考我们小组组长给的样例，重新设计的。这里是他的[GitHub主页链接](https://github.com/tokgocode)，有兴趣大家可以去点下关注

## 流程设计
![](https://gitee.com/lijinjiang01/images/raw/master/icheckin/01.png)

## 原型设计
[墨刀原型设计链接](https://modao.cc/app/KsyPQPKKrukzxa2eCfnkvE)

原型设计截图
![](https://gitee.com/lijinjiang01/images/raw/master/icheckin/02.png)

## 关键代码
这里使用 wx.startBeaconDiscovery 方法查找附近的 Beacon 设备，uuids 为筛选列表，我们只需要查询对应这些 uuid 的 Beacon 设备，查找成功后我们就可以调用该 Beacon 设备信息进行签到处理了
``` javascript
  //开始寻找信标设备
  startFindDevices: function () {
    let that = this;
    timer = setTimeout(function () {
      that.stopFindDevices('false', "搜索设备超时")
    }, 10000) //搜索超时 停止扫描设备
    wx.startBeaconDiscovery({
      //设置ibeacons的参数
      //000FFFF-0000-1000-8000-00805F9B34FB，这是一个通用的 UUID，可以用于扫描大多数 Beacon 设备
      uuids: ['0000FFFF-0000-1000-8000-00805F9B34FB', 'FDA50693-A4E2-4FB1-AFCF-C6EB07647801', 'FDA50693-A4E2-4FB1-AFCF-C6EB07647802', 'FDA50693-A4E2-4FB1-AFCF-C6EB07647803', 'FDA50693-A4E2-4FB1-AFCF-C6EB07647804', 'FDA50693-A4E2-4FB1-AFCF-C6EB07647805', 'FDA50693-A4E2-4FB1-AFCF-C6EB07647806'],
      //连接成功
      success: function () {
        that.doSignIn();
      },
      fail: function (res) {
        console.log(res);
        if(res.errCode == '11003'){
          that.doSignIn();//如果已经打开了扫描设备，则直接进行签到
        } else {
          that.stopFindDevices('false', res.errMsg); //停止扫描设备，返回结果
        }
      },
    })
  },
```

这里通过将查到的 Beacon 设备的 UUID 和用户的学号，传到后台进行签到处理
``` javascript
//进行签到
  doSignIn: function () {
    let that = this;
    //监听iBeacon设备的更新事件
    wx.onBeaconUpdate(function (res) {
      wx.getBeacons({
        success: (result) => {
          if (res.beacons) {
            let count = res.beacons.length;
            if (count >= 1) { //显示正在签到
              clearTimeout(timer); //扫描信标成功后，清除定时器
              if (!hasSignIn) { //如果没有签到，则进行签到
                hasSignIn = true; //标识已签到
                that.setData({
                  promptInfo: '正在签到......'
                });
                let selectIndex = 0;
                for (let i = 0; i < count; i++) {
                  if (Math.abs(res.beacons[i].RSSI) < Math.abs(res.beacons[selectIndex].RSSI)) {
                    selectIndex = i; //如果RSSI绝对值更小，取更小的这个beacon
                  }
                }
                let ibeacon1 = res.beacons[selectIndex]
                let uuid = ibeacon1.uuid; //uuid
                let rssi = Math.abs(ibeacon1.rssi); //rssi
                let stu_name = wx.getStorageSync('stu_name'); //姓名
                let stu_number = wx.getStorageSync('stu_number'); //学号
                let postHeader = {
                  'content-type': 'application/json',
                };
                let postData = {
                  "studentNo": stu_number,
                  "studentName": stu_name,
                  "beacons": [{
                    "beaconName": uuid,
                    "rssi": rssi
                  }]
                };

                let result = '';
                let message = '';
                wx.request({
                  url: 'https://sjtu.yangzezhi.com/api/checkin',
                  header: postHeader,
                  method: 'POST',
                  data: JSON.stringify(postData),
                  success(res) {
                    if (res.data.success) {
                      result = res.data.success;
                      message = res.data.data.classroom;
                    } else {
                      if (res.data.message) {
                        result = res.success;
                        message = res.data.message;
                      } else {
                        result = false;
                        message = res.data.status + " " + res.data.error;
                      }
                    }
                  },
                  fail(res) {
                    result = false;
                    message = res.errMsg;
                  },
                  complete() {
                    that.stopFindDevices(result, message);
                  }
                })
              }
            }
          }
        },
      })
    })
  },
```