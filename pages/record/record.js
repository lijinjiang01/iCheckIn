let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recordList: [], //签到记录
    hasRecord: false, //是否存在签到数据
    message: '' //提示信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (app.checkLogin()) { //校验登录
      let that = this;
      let stu_number = wx.getStorageSync('stu_number'); //学号
      //console.log(stu_number)
      wx.request({
        url: 'https://sjtu.yangzezhi.com/api/checkin',
        method: 'GET',
        data: {
          "studentNo": stu_number
        },
        success: (res) => {
          //console.log(res.data.data);
          if (res.data.data) {
            if (res.data.data.length > 0) {
              //console.log("存在签到数据不为空");
              //console.log("数据长度为：" + res.data.data.length);
              let recordData = res.data.data;
              let objList = [];
              for (let item of recordData) {
                //console.log(that.formateDate(item.lastUpdatedTime))
                //console.log(item.classroom)
                let obj = {
                  "signInTime": app.formateDate(item.lastUpdatedTime),
                  "classroom": item.classroom
                }
                objList.push(obj);
              }
              that.setData({
                recordList: objList,
                hasRecord: true
              })
            } else {
              that.setData({
                hasRecord: false,
                message: '暂无数据'
              })
            }
          }
        },
        fail: (res) => {
          that.setData({
            hasRecord: false,
            message: '获取签到数据失败'
          })
          console.log(res);
        }
      })
    }
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