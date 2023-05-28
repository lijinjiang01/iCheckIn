const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0' //默认头像地址

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl, //微信头像
    stu_name: '', //姓名
    stu_number: '' //学号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let tempAvatar = wx.getStorageSync('avatarUrl'); //获取本地缓存头像
    if (tempAvatar) {
      //console.log("localAvatar = " + localAvatar);
      this.setData({
        avatarUrl: tempAvatar
      })
    }
  },

  //获取头像
  onChooseAvatar(e) {
    if(e.detail.avatarUrl){
      wx.setStorageSync("avatarUrl", e.detail.avatarUrl); //本地缓存头像
      this.setData({
        avatarUrl: e.detail.avatarUrl
      })
    }
  },

  // 登录实现
  loginAction: function (e) {
    let stuName = e.detail.value.stu_name; //获取姓名
    let stuNumber = e.detail.value.stu_number; //获取学号
    // console.log("stu_name = " + stuName)
    // console.log("stu_number = " + stuNumber)

    if (!stuName) {
      wx.showToast({
        title: "请输入姓名~",
        icon: 'error', //图标，支持"success"、"loading" 
        duration: 1000, //提示的延迟时间，单位毫秒，默认：1500 
        mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false
      })
    } else if (!stuNumber) {
      wx.showToast({
        title: "请输入学号~",
        icon: 'error', //图标，支持"success"、"loading" 
        duration: 1000, //提示的延迟时间，单位毫秒，默认：1500 
        mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false
      })
    } else {
      wx.setStorageSync('stu_name', stuName); //姓名存入缓存
      wx.setStorageSync('stu_number', stuNumber); //学号存入缓存
      wx.setStorageSync('expireTime', Date.now() + 5 * 60 * 1000); //登录有效期
      wx.redirectTo({
        url: '/pages/index/index'
      });
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
    wx.hideHomeButton(); //取消显示主页按钮
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
  onShareAppMessage() {}
})