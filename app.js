//app.js
App({
  //校验登录
  checkLogin: function () {
    let expireTime = wx.getStorageSync('expireTime'); //登录有效期
    if (!expireTime) { //没有存储有效期
      wx.showToast({
        title: "请先登录!",
        icon: 'error', //图标
        duration: 1000, //提示的延迟时间，单位毫秒，默认：1500 
        mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false
      });
      setTimeout(function () {
        wx.redirectTo({
          url: '/pages/login/login'
        })
      }, 1000);
      return false;
    } else if (expireTime && expireTime > Date.now()) { //存储了有效期，没有过期
      // 数据未过期，可以直接使用，并将缓存时间更新
      wx.setStorageSync('expireTime', Date.now() + 5 * 60 * 1000); //更新登录有效期
      return true;
    } else { //存储了有效期，过期了
      wx.showToast({
        title: "登录已过期!",
        icon: 'error', //图标，支持"success"、"loading" 
        duration: 1000, //提示的延迟时间，单位毫秒，默认：1500 
        mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false
      });
      setTimeout(function () {
        wx.redirectTo({
          url: '/pages/login/login'
        })
      }, 1000);
      return false;
    }
  },

  //将国际化日期转化为yyyy-MM-dd hh:mi:ss
  formateDate: function (internationalDate) {
    const date = new Date(internationalDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // 月份是从0开始的
    const day = date.getDate()
    const hour = date.getHours()
    const min = date.getMinutes()
    const sec = date.getSeconds()
    const newDate =
      year +
      '-' +
      (month < 10 ? '0' + month : month) +
      '-' +
      (day < 10 ? '0' + day : day) +
      ' ' +
      (hour < 10 ? '0' + hour : hour) +
      ':' +
      (min < 10 ? '0' + min : min) +
      ':' +
      (sec < 10 ? '0' + sec : sec)
    return newDate
  }
})