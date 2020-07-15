// pages/play/play.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //控制声音播放还是暂停
    action:{
      method:"play"
    },
    //定义歌曲id变量
    id:"",
    //定义存放所有歌曲id的数组变量
    ids:[],
    //定义变量记录歌曲的暂停或者播放状态
    //默认是播放状态
    state:"play",
    //定义默认的播放模式
    mode:"single",
    //定义变量接收当前播放的歌曲详情
    song:null,
    //定义一个歌词数组
    lyricArray:[],
    //竖向滚动条位置初始值为0
    marginTop:0,
    //记录当前唱到的行号
    currentIndex:0,
    //播放时间
    playTime:"00:00",
    //结束时间
    endTime:"00:00",
    //歌曲进度条最大值
    max:100,
    //进度条读取移动的值
    move:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options参数包含上一个页面跳转携带过来的参数
    //获取传递的歌曲id值
    var mid = options.mid;
    //获取传递的所有id数组    经过页面传参之后，接收的是字符串类型，可以将字符串转换为数组
    var idStr = options.ids;
    //使用切割的方法    split:返回的结果就是数组
    var ids = idStr.split(",");
    //给data中的属性赋值
    this.setData({
      id:mid,
      ids:ids
    })
    //调用获取歌曲信息的方法
    this.getSongInfoById();
    //通过id获取歌词
    this.getLyricById();
  },
  /**
   * 根据歌曲id获取歌曲详情的方法
   */
  getSongInfoById:function(){
   //获取当前歌曲的id
   var currentId = this.data.id;
   //获取当前对象(经过异步加载回调函数之后当前对象已经发生了改变)
   var that = this;
   //根据id获取歌曲信息
   //网易云根据id获取歌曲详情的接口
   // https://music.163.com/api/song/detail/?id=1359595520&ids=[1359595520]
   // 客户端向服务器发起的叫请求      服务器根据客户端的请求给出的回应叫响应
   wx.request({
     //url：请求的服务器接口路径
     //服务器接口地址后携带多个参数使用 & 做分隔
     url: 'https://music.163.com/api/song/detail/?id='+currentId+'&ids=['+currentId+']',
     //success:请求成功之后回来执行的函数    fail:请求失败之后回来执行的函数
     // res:请求成功之后服务器给客户端的响应
     success:function(res){
       //层层解析返回的结果，拿到所需的歌曲详情
       var musicInfo = res.data.songs[0];
       //将musicInfo赋值给data中的song
       that.setData({
         song:musicInfo
       })
     }
   })
  },
  /**
   * 通过id获取歌词的方法
   */
  getLyricById:function(){
    var that = this;
    //获取当前歌曲的id
    var currentId = this.data.id;
    //使用歌词接口向网易云服务器发请求
    wx.request({
      url: 'https://music.163.com/api/song/lyric?os=pc&id='+currentId+'&lv=-1&kv=-1&tv=-1',
      //success是请求成功之后回来执行的方法，res是响应结果
      success:function(res){
        //判断nolyric属性
        if(res.data.nolyric!=true){
          //解析歌词所在的字符串
          var lyrics = res.data.lrc.lyric;
          //调用解析歌词的方法
          var result = that.parseLyric(lyrics);
          //调用去掉空歌词的方法
          var finalResult = that.sliceNull(result);
          //给data中的属性赋值
          that.setData({
            lyricArray:finalResult
          })
        }
      }
    })
  },
  /**
   * 解析歌词的方法
   * 正则表达式
   */
  parseLyric:function(lyrics){
    //定义一个数组，存储歌词和时间，而且歌词和时间能够一一对应
    var lyricResult = []; 
    //将所有歌词组成的字符串切割为每句歌词组成的数组      typeof:判断变量的数据类型
    // 张三：嘻嘻
    //使用split(切割方法)对换行字符(\n   \r:回车   \t：tab键位)进行切割
    //split:切割   切割完之后返回的是数组
    var lyricArray = lyrics.split("\n");
    //判断最后一个元素(歌词和时间)是否为空，如果为空，删掉
    if(lyricArray[lyricArray.length-1]==""){
      //删除元素    队列：先进先出    栈：先进后出
      lyricArray.pop();
    }
    //时间满足格式： [xx:xx.xxx] 规律     正则表达式通常被用来检索、替换那些符合某个模式(规则)的文本
    //书写时间正则表达式    \[:使用转义字符仅仅表示中括号   数字：[0-9] ==== \d   {m}:前面字符的数量为m个
    //点 .  :匹配除了换行符以外的任意单个字符     {m,n}:前面字符个数为2位到3位
    var pattern = /\[\d{2}:\d{2}\.\d{2,3}\]/;
    //遍历歌词数组中的每一个元素   forEach循环    index:下标   index:首页
    lyricArray.forEach(function(v/*数组中的每一个元素*/,i/*数组中每一个元素所对应的下标*/,a/*正在遍历的数组*/){
      //使用正则表达式进行正则替换
      //replace：替换
      var real_lyric = v.replace(pattern,"");
      //对每一句歌词处理，将时间单独提取出来   match返回的是数组
      var time = v.match(pattern);     //歌曲播放进度时间是按秒位单位计算的   [00:00.000]--->00：00.000(字符串))->0秒
      // var str = "helloworld";
      // slice(0,3):代表从下标为0开始截取，到下标为3结束，而且是取0不取3，左闭右开区间
      // console.log(str.slice(0,3));
      //去除中括号   slice:截取
      //js中字符串的最后一个元素的下标是长度减一或者-1    java只能是长度减一
      //判断time是否为空
      if(time!=null){
        var timeResult = time[0].slice(1,-1);
        //对result结果切割，an冒号切割，得到一个长度为2的数组，第一个元素是分，第二个元素是秒   ["02","43.336"]
        var timeArray = timeResult.split(":");
        var finalTime = parseFloat(timeArray[0])*60+parseFloat(timeArray[1]);
        //将歌词和对应的时间添加到lyricResult数组中
        //二维数组
        // [1,2,3,4,5]    [
        // [
        //   [0,"作曲：吴亦凡"],
        //   [1,"作词：吴亦凡"],
        //   [1.23,"碗大宽无影"]
        // ]  
        lyricResult.push([finalTime,real_lyric]);
      }
    })
    //返回歌词数组    谁调用方法就把结果返回给谁
    return lyricResult;
  },
  /**
   * 去掉空歌词,保留非空歌词
   */
  sliceNull:function(lyricArray){
    //定义一个数组
    var result = [];
    //遍历每个元素
    for(var i=0;i<lyricArray.length;i++){
      //判断歌词是否为空
      if(lyricArray[i][1]!=""){
        result.push(lyricArray[i]);
      }
    }
    return result;
  },
  /**
   * 播放进度改变时触发的方,能实现歌词滚动
   */
  changeTime:function(e){
    //获取当前播放进度
    var currentTime = e.detail.currentTime;
    //获取当前歌曲的总时长
    var duration = e.detail.duration;
    // 63秒---》01:03     计算分：63/60  计算秒：63%60
    //将播放进度转换为分和秒
    //计算播放时长分钟数  
    //  Math.floor：向下取整     ceil：向上取整     round:四舍五入     toFixed：保留几位小数   random:随机数
    var playMinutes = Math.floor(currentTime/60);
    //计算播放时长秒钟数
    var playSeconds = Math.floor(currentTime%60);
    //计算总时长分钟数
    var endMinutes = Math.floor(duration/60);
    //计算总时长秒钟数
    var endSeconds = Math.floor(duration%60);
    //计算data中的max，进度条最大取值
    var max = duration;
    //计算进度条移动的值
    var move = currentTime;
    //判断分秒是否小于10
    if(playMinutes<10){
      playMinutes = "0"+playMinutes;
    }
    if(playSeconds<10){
      playSeconds = "0"+playSeconds;
    }
    if(endMinutes<10){
      endMinutes = "0"+endMinutes;
    }
    if(endSeconds<10){
      endSeconds = "0"+endSeconds;
    }
    this.setData({
      playTime:playMinutes+":"+playSeconds,
      endTime:endMinutes+":"+endSeconds,
      max:max,
      move:move
    })
    //获取歌词数字
    var lyricArray = this.data.lyricArray;
    //计算滚动条的位置
    if(this.data.currentIndex>=8){
      this.setData({
        marginTop:(this.data.currentIndex-8)*30
      })
    }
    //遍历所有歌词
    //最后一句歌词没有下一句,所以不需要跟下一句的时间做比较
    if(this.data.currentIndex==lyricArray.length-2){
      //判断当前的时间是否大于等于最后一句的时间
      if(currentTime>=lyricArray[lyricArray.length-1][0]){
        //正在唱最后一句
        this.setData({
          currentIndex:lyricArray.length-1
        })
      }
    }else{
      for(var i=0;i<lyricArray.length-1;i++){
        //将每个歌曲进度都跟数组中的歌词比较,在当前歌词的时间到下一句歌词的时间范围之内
        if(currentTime>=lyricArray[i][0] && currentTime<lyricArray[i+1][0]){
          //设置正在播放的行号
          this.setData({
            currentIndex:i
          })
        }
      }

    }
  },
  /**
   * 进度条拖动执行的方法
   */
  tuoDong:function(e){
    //当前拖动的value值
    var value = e.detail.value;
    //修改进度条取值和音频进度
    this.setData({
      move:value
    })
    this.setData({
      action: {
        method: "setCurrentTime",
        data:value
      }
    })
  },
  /**
   * 控制音乐的播放与暂停
   */
  playOrPause:function(){
    //获取当前的状态   如果当前是暂停状态，改为播放状态    如果是播放状态，改为暂停状态
    var musicState = this.data.state;
    //判断
    if(musicState=="play"){
      //改为暂停状态
      //停止音频播放
      this.setData({
        action:{
          method:"pause"
        },
        state:"pause"
      })
    }else{
      //改为播放状态
      this.setData({
        action:{
          method:"play"
        },
        state:"play"
      })
     
    }
  },
  /**
   * 上一首歌曲
   */
  prevSong:function(){
    //获取当前的歌曲id
    var currentId = this.data.id;
    //定义一个变量记录当前歌曲的下标
    var index = 0;
    //根据当前id值找出当前歌曲的下标
    for(var i=0;i<this.data.ids.length;i++){
      //判断id是否一致
      if(currentId==this.data.ids[i]){
          index = i;
          break;
      }
    }
    //上一首歌曲下标
    var prevIndex = index == 0 ? this.data.ids.length-1:index-1;
    //上一首歌曲id
    var prevId = this.data.ids[prevIndex];
    //修改当前歌曲id
    this.setData({
      id:prevId
    })
    //歌曲切换之后action要重新赋值
    this.setData({
      action:{
        method:"play"
      }
    })
    //重新初始化marginTop和行号
    this.setData({
      marginTop:0,
      currentIndex:0
    })
    //调用获取歌曲详情方法和获取歌词的方法
    this.getSongInfoById();
    this.getLyricById();
  },
  /**
   * 下一首歌曲
   */
  nextSong:function(){
    //获取当前的歌曲id
    var currentId = this.data.id;
    //定义一个变量记录当前歌曲的下标
    var index = 0;
    //根据当前id值找出当前歌曲的下标
    for (var i = 0; i < this.data.ids.length; i++) {
      //判断id是否一致
      if (currentId == this.data.ids[i]) {
        index = i;
        break;
      }
    }
    //下一首歌曲下标
    var nextIndex = index==this.data.ids.length-1?0:index+1;
    //上一首歌曲id
    var nextId = this.data.ids[nextIndex];
    //修改当前歌曲id
    this.setData({
      id: nextId
    })
    //歌曲切换之后action要重新赋值
    this.setData({
      action: {
        method: "play"
      }
    })
    //重新初始化marginTop和行号
    this.setData({
      marginTop: 0,
      currentIndex: 0
    })
    //调用获取歌曲详情方法和获取歌词的方法
    this.getSongInfoById();
    this.getLyricById();
  },
  /**
   * 点击切换播放模式
   */
  changeMode:function(){
    //获取当前的播放模式
    var mode = this.data.mode;
    if(mode=="single"){
      //切换列表循环模式
      this.setData({
        mode:'loop'
      })
    }else{
      this.setData({
        //切换为单曲循环模式
        mode:"single"
      })
    }
  },
  /**
   * 当音频播放到末尾时触发的方法
   */
  changeMusic:function(){
    //判断时单曲循环还是列表循环
    var mode = this.data.mode;
    if(mode=="single"){
      //将当前id重新设置
      this.setData({
        id:this.data.id
      })
      this.setData({
        action:{
          method:"play"
        }
      })
    }else{
      this.nextSong();
    }
    //歌词重新滚动，行号也重新初始化
    this.setData({
      marginTop:0,
      currentIndex:0
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