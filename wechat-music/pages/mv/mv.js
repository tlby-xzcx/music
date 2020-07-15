// pages/mv/mv.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //mv视频地址
    mvAddress:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options包含上个页面传递的所有参数
    var mvId = options.mvId;
    this.getMvByid(mvId);
  },

  /**
   * 根据mvid查询mv视频的地址
   */
  getMvByid:function(mvId){
    var that = this;
    wx.request({
      url: 'https://api.mlwei.com/music/api/mv/?key=523077333&mv=163&type=info&id='+mvId,
      success:function(res){
        var mvAddress = res.data.data.brs[240];
        that.setData({
          mvAddress:mvAddress
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})