// 路由:()直接实例化
const router = require('koa-router')()
const {log} = console

// 上传图片
const {upload,uploadimg,multigraph} = require('../../oss/oss.js')
// 响应
const initdata = require('../../config/init.js')
// 参数校验
const {chdetail} = require('../../config/checking')
// 商品详情
const Detailstmall = require('../../models/detailsdata')
// 商品sku
const Sttritmall = require('../../models/attributes.js')
// 商品参数
const Parametertmall = require('../../models/parameter.js')
// 操作数据库
const {Operation} = require('../../config/database')
// 不固定的数组对象上传
const {Group} = require('../../config/group')

// 商品详情:轮播,商品标题，价格，详情等
router.post('/picture', upload.array('file'), async ctx=>{
	let {id,title,video,Trueprice,Crossedprice,Goldcoin,integral,
	Total_stock,Detaileddrawing
	} = ctx.request.body
	log(id)
	log(video)
	// 参数校验
	new chdetail(ctx,id,title,Trueprice,Crossedprice,Goldcoin,integral,Total_stock).start(ctx.files,JSON.parse(Detaileddrawing))
	// 详情图的http链接
	// log(JSON.parse(Detaileddrawing))
	// log(video)
	// 轮播多图上传oss
	let banimg = await multigraph(ctx.files)
	// log(banimg)
	log('上传完毕')
	// 上传到数据库
	
	// return false
	let obj = {
		id,
		media:[
			{
				video,
				imgArray:banimg
			}
		],
		describe:{
			Trueprice,
			Crossedprice,
			Goldcoin,
			integral,
			Total_stock,
			title,
			Detaileddrawing:JSON.parse(Detaileddrawing)
		}
	}
	await new Operation(ctx,Detailstmall,obj).increase()
	
})

// 上传图片的接口
router.post('/potimg', upload.single('file'), async ctx=>{
	try{
		let articleimg = await uploadimg(ctx.file.path)
		new initdata(ctx,'SUCCESS',articleimg).correct()
	}catch(e){
		new initdata(ctx).mistake('上传失败',500)
	}
})

// sku接口
router.post('/pictsku',async ctx=>{
	let {sku} = ctx.request.body
	// log(sku)
	try{
		await new Group(sku,Sttritmall).arraying()
		new initdata(ctx).correct()
	}catch(e){
		new initdata(ctx).mistake('提交失败',500)
	}
})

// 商品参数
router.post('/parame',async ctx=>{
	let {parame} = ctx.request.body
	log(parame)
	try{
		let skuing = await new Group(parame,Parametertmall).arraying()
		new initdata(ctx).correct()
	}catch(e){
		new initdata(ctx).mistake('提交失败',500)
	}
})

// 删除测试
router.get('/ceshiing', async ctx=>{
	// let {id} = ctx.request.body
	let arrid = ['5f8c01960ae3c03320fcad0a']
	let data = await Parametertmall.deleteMany({id:{$in: arrid}})
	log(data)
})

module.exports = router.routes()