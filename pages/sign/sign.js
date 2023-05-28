let app = getApp();
let timer; //检测信标定时器
let hasSignIn = false; //是否签到
Page({

  /**
   * 页面的初始数据
   */
  data: {
    promptInfo: '搜索蓝牙信标......'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (app.checkLogin()) { //校验是否登录
      hasSignIn = false; //初始化为未签到
      this.checkBluetooth(); //校验蓝牙权限
    }
  },

  //校验权限
  checkBluetooth: function () {
    let that = this;
    if (wx.openBluetoothAdapter) { //判断兼容性
      wx.openBluetoothAdapter({ //打开蓝牙适配器，如果没有打开 showtoast
        success: function (res) {
          wx.getBluetoothAdapterState({ //获取本机的蓝牙适配器状态
            success: function (res) {
              //console.log("wx.getBluetoothAdapterState success ...");
              that.checkLocation(); //校验位置权限
            },
            fail: function (res) {
              //console.log("获取本机的蓝牙适配器状态失败");
              console.log(res);
              wx.showToast({
                title: '获取本机的蓝牙适配器状态失败',
                icon: 'error', //图标
                duration: 1000
              })
            }
          })
        },
        fail: function (res) {
          console.log(res)
          // fail 本机是否已经打开蓝牙设备
          wx.showToast({
            title: '请开启本机蓝牙',
            icon: 'error', //图标
            duration: 1000
          })
        }
      })
    } else {
      wx.showModal({ // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  //判断是否获得了用户地理位置授权
  checkLocation: function () {
    let that = this;
    wx.getSetting({
      success: (res) => {
        // 查看位置权限的状态 如果是首次授权(undefined)或者之前拒绝授权(false)            
        //!res.authSetting['scope.userLocation']
        if (res.authSetting['scope.userLocation'] == false) {
          //之前拒绝授权(false)
          that.openConfirm();
        } else {
          //如果是首次授权则弹出授权窗口进行授权，如果之前进行了授权，则获取地理位置信息
          that.startFindDevices(); //开始查找设备并签到
        }
      }
    })
  },

  openConfirm: function () {
    let that = this;
    wx.showModal({
      content: '检测到您没打开定位权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        //console.log(res);
        //点击“确认”时打开设置页面
        if (res.confirm) {
          //console.log('用户点击确认')
          wx.openSetting({
            success: (res) => {
              that.startFindDevices(); //开始查找设备并签到
            }
          })
        } else {
          console.log('用户点击取消位置授权')
        }
      }
    });
  },

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

  //进行签到
  doSignIn: function () {
    let that = this;
    console.log("开始扫描设备")
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
                console.log("ibacon的个数" + count);
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
                    //console.log("签到接口响应成功！");
                    //console.log(res.data);
                    if (res.data.success) {
                      //console.log("签到成功！");
                      result = res.data.success;
                      message = res.data.data.classroom;
                    } else {
                      //console.log("签到失败！");
                      if (res.data.message) {
                        //console.log("res.data.message = " + res.data.message);
                        result = res.success;
                        message = res.data.message;
                      } else {
                        //console.log("res.data.error = " + res.data.error);
                        result = false;
                        message = res.data.status + " " + res.data.error;
                      }
                    }
                  },
                  fail(res) {
                    //console.log("签到接口返回失败！");
                    //console.log(res);
                    result = false;
                    message = res.errMsg;
                  },
                  complete() {
                    //console.log("签到结束！");
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

  //停止查找beacon设备
  stopFindDevices: function (result, message) {
    hasSignIn = true; //标识已签到
    wx.stopBeaconDiscovery({
      success: function () {
        console.log("停止扫描设备！");
        if (hasSignIn && (hasSignIn === true || hasSignIn === 'true')) { //已经签到了，就不跳转
          wx.redirectTo({
            url: `/pages/result/result?result=${result}&message=${message}`
          })
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})