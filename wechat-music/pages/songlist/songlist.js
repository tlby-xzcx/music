// pages/songlist/songlist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //定义图片数组
    imgUrls: [],
    //定义变量存储搜索关键字
    kw:"",
    //定义歌曲数组存储搜索结果
    songs:[],
    //定义存储封面的数组
    albumPicUrls:[],
    //定义存放mv的数组
    mvs:[],
    //定义歌曲数组
    //每首歌曲都有id、歌曲名、歌曲封面、歌手名、专辑名     json
    // 学生：name  age
    //定义查询条数的变量
    limit:6
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("页面加载");
  },

  /**
   * 监听播放按钮点击
   * 
   */
  gotoPlay:function(e){
    // e中包含我们所携带的所有参数
    //接受事件传递的参数
    var id = e.currentTarget.dataset.id;
    //定义空数组，存储所有歌曲id
    var ids = [];
    //遍历歌曲列表，将每首歌曲的id添加到数组中
    for(var i=0;i<this.data.songs.length;i++){
      ids.push(this.data.songs[i].id);
    }
    //跳转到play播放页面
    //保留当前页面，还能跳转到新页面
    wx.navigateTo({
      //被跳转页面的路径
      // url: '/pages/play/play',
      // 大碗宽面："../play/play?mid=1359595520"
      //giao ："../play/play?mid=556220425&ids="[1,2,3,4,5]
      //多个参数传递使用&拼接
      url:"../play/play?mid="+id+"&ids="+ids,
    })
  },
  /**
   * 监听mv图标点击事件
   */
  playMv:function(e){
    //跳转到mv页面
    var mvId = e.currentTarget.dataset.mvid;
    //携带mvid跳转到mv页面
    wx.navigateTo({
      url: '/pages/mv/mv?mvId='+mvId,
    })
  },
  /**
   * 获取输入框的关键字
   */
  getKeyword:function(e){
    //获取input通过事件携带的内容
    var keyword = e.detail.value;
    //将keyword赋值给kw
    this.setData({
      kw:keyword
    })
  },
  /**
   * 根据关键字搜索歌曲
   */
  do_search:function(){
    //获取输入的关键字
    var kw = this.data.kw;
    var that = this;
    //定义空数组存储搜索出来的所有id
    var searchIds = [];
    //定义存放歌曲名称的数组
    var names = [];
    //定义存储歌手id的数组
    var artists = [];
    wx.request({
      url: 'https://music.163.com/api/search/get?s='+kw+'&type=1&limit='+that.data.limit,
      success:function(res){
        //搜索结果
        var resultSongs = res.data.result.songs;
        //遍历resultSongs
        for(var i=0;i<resultSongs.length;i++){
          //将搜索出的id添加到searchIds
          searchIds.push(resultSongs[i].id);
          //将搜索出的歌曲名称添加到names中
          names.push(resultSongs[i].name);
          //将搜索出的歌手id添加到artists中
          artists.push(resultSongs[i].artists[0].id);
        }
        //清空封面数组
        that.setData({
          albumPicUrls:[],
          mvs:[]
        })
        //调用查询封面的方法
        that.getMusicImage(searchIds,0,searchIds.length);
        //调用查询mv信息的方法(根据歌曲名和歌手id查询mv)
        that.getMvBySongName(names,0,names.length,artists);
        that.setData({
          songs:resultSongs
        })
      }
    })
  },
  /**
   * 根据搜索的id查询歌曲详情(找歌曲封面)
   * for循环中写异步加载不是按照你for循环执行的顺序执行的，顺序会有错乱，使用递归解决
   *  //需要存放所有id的数组，需要每次递归的下标，需要存储封面结果的数组,截至下标
   */
  getMusicImage:function(searchIds,i,length){
    //递归：自己调用自己
    //获取存储所有封面结果的数组
    var albumPicUrls = this.data.albumPicUrls;
    var that = this;
    //发请求
    wx.request({
      url: 'https://music.163.com/api/song/detail/?id=' + searchIds[i] + '&ids=[' + searchIds[i] +']',
      success:function(res){
        //获取封面
        var albumPic = res.data.songs[0].album.picUrl;
        //获取专辑名称
        var name = res.data.songs[0].album.name;
        //添加封面
        albumPicUrls.push(albumPic);
        that.setData({
          albumPicUrls:albumPicUrls
        })
        //判断递归结束的条件
        // ++i:先计算后赋值   i++：先赋值后计算
        if(++i<length){
          that.getMusicImage(searchIds,i,length);
        }
      }
    })
  },
  /**
   * 根据歌曲名称查询mv
   * for循环中写异步加载不是按照你for循环执行的顺序执行的，顺序会有错乱，使用递归解决
   *  需要存放所有歌名的数组、需要每次递归的下标、需要存储mv结果的数组,截至下标  、歌手id
   */
  getMvBySongName:function(names,i,length,artists){
    //获取存储mv结果的全局变量
    var mvs = this.data.mvs;
    var that = this;
    //发请求
    wx.request({
      url: 'https://api.mlwei.com/music/api/mv/?key=523077333&mv=163&type=so&word='+names[i]+'&page=1',
      success:function(res){
        //获取查询到的mv信息
        var result = res.data.result.mvs;
        var flag = false;
        if(result!=undefined){
          //定义变量
          //对result结果通过歌手id做进一步删选
          for(var j=0;j<result.length;j++){
            //根据当前歌手的id查询对应的mv
            if (artists[i] == result[j].artistId){
              //找到了当前歌手对应的mv
              //将mv的id存放到数组中
              mvs.push(result[j].id);
              flag = true;
              break;
            }
          }

        }
          //判断flag
        if(!flag){
            mvs.push(-1);
        }
        that.setData({
          mvs:mvs
        })
        if (++i < length) {
           that.getMvBySongName(names, i, length, artists);
        }
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
    wx.request({
      url: 'http://47.104.209.44:3333/banner',
      success: res => {
        //搜索结果
        console.log(res);
        var banners = res.data.banners;
        this.setData({
          imgUrls: banners
        })
      }
    })
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
   *  上拉触底时使用搜索歌曲再查询5首歌曲
   */
  onReachBottom: function () {
    //判断输入关键字是否为空
    var keyword = this.data.kw;
    if(keyword!=""){
      //显示loading提示框
      wx.showLoading({
        title: '来了，老弟',
      })
      //定义空数组存储搜索出来的所有id
      var searchIds = [];
      //定义存放歌曲名称的数组
      var names = [];
      //定义存储歌手id的数组
      var artists = [];
      //获取查询条数
      var limit = this.data.limit;
      var that = this;
      limit=limit+5;
      this.setData({
        limit:limit
      })
      wx.request({
        url: 'https://music.163.com/api/search/get?s=' + keyword + '&type=1&limit=' + that.data.limit,
        success:function(res){
          //搜索结果
          var resultSongs = res.data.result.songs;
          //遍历resultSongs
          for (var i = 0; i < resultSongs.length; i++) {
            //将搜索出的id添加到searchIds
            searchIds.push(resultSongs[i].id);
            //将搜索出的歌曲名称添加到names中
            names.push(resultSongs[i].name);
            //将搜索出的歌手id添加到artists中
            artists.push(resultSongs[i].artists[0].id);
          }
          //清空封面数组
          that.setData({
            albumPicUrls: [],
            mvs: []
          })
          //调用查询封面的方法
          that.getMusicImage(searchIds, 0, searchIds.length);
          //调用查询mv信息的方法(根据歌曲名和歌手id查询mv)
          that.getMvBySongName(names, 0, names.length, artists);
          that.setData({
            songs:resultSongs
          })
          //关闭loading提示框
          wx.hideLoading()
        }
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})