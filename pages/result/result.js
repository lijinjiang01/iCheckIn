let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: '', //是否签到成功，返回true或false
    resultInfo: '', //成功返回：签到成功!，失败返回：签到失败!
    message: '' //签到返回信息，成功返回教室号，失败返回失败原因
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (app.checkLogin()) { //校验是否登录
      let result = options.result;
      let message = options.message;
      let resultInfo = '';
      if (result === 'true' || result === true) {
        result = true;
        resultInfo = '签到成功!'
      } else {
        result = false;
        resultInfo = '签到失败!'
      }
      // console.log("result = " + result);
      // console.log("resultInfo = " + resultInfo);
      // console.log("message = " + message);
      this.setData({
        result: result,
        resultInfo: resultInfo,
        message: message
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