const Koa = require('koa');
const app = new Koa();
const json = require('koa-json');
var bodyParser = require('koa-bodyparser');
// 路由实例化
const router = require('koa-router')()
const mongoose = require('mongoose')
// 解决跨域
const cors = require('koa-cors');
// 解决警告
mongoose.set('useFindAndModify', false)
// 引入数据库
const mburl = require('./config/base.js').mburl
// 全局异常处理
const abnormal = require('./config/abnormal.js')

app.use(cors());
app.use(json());
app.use(bodyParser());
app.use(abnormal)



// 连接阿里云数据库
mongoose.connect(mburl, {
  useNewUrlParser: true,  
  useUnifiedTopology: true
})
.then((res)=>{
	console.log('数据库连接成功')
})
.catch((err)=>{
	console.log('数据库连接失败')
	console.log(err)
})
 
// 引入home:post文件里的路由
const bannertma = require('./routes/home/banner')
// 引入home:get文件里的路由
const getbanner = require('./routes/home/getbanner')
// 引入detail文件里的路由
const detail = require('./routes/details/details')
// 引入wxuser文件里的路由
const user = require('./routes/user/wxuser')
// 引入shcart文件里的路由
const shcart = require('./routes/shcart/shcart')
// 引入sh-address文件里的路由
const address = require('./routes/sh-address/address')
// 订单：引入user——order文件里的路由
const wxorder = require('./routes/user-order/order.js')
 

router.use('/api',getbanner)
router.use('/api',bannertma)
router.use('/api',detail)
router.use('/api',user)
router.use('/api',shcart)
router.use('/api',address)
router.use('/api',wxorder)
 
 
 
// 启动路由
app.use(router.routes())
app.use(router.allowedMethods())


app.listen(9000);  //服务启动端口：不能跟其他程序造成端口冲突
console.log('启动success')