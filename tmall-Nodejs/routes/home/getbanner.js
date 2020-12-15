// 路由:()直接实例化
const router = require('koa-router')()
const {log} = console

const initdata = require('../../config/init.js')
const result = require('../../config/resultdata.js')
// 参数校验
const {pageing,skuing,querycl} = require('../../config/checking')
// 轮播字段
const Bannertmall = require('../../models/banner')
// 推荐字段
const Recommendtmall = require('../../models/recommend')
// 天猫榜单字段
const Listtmall = require('../../models/listdata')
// 商品分类字段
const Classtmall = require('../../models/classdata')
// 卡片商品
const Productstmall = require('../../models/homeproducts')
// 商品sku
const Sttritmall = require('../../models/attributes.js')
// 商品详情
const Detailstmall = require('../../models/detailsdata')
// 商品参数
const Parametertmall = require('../../models/parameter.js')
// 获取sku的类
const Skulist = require('../../config/skulist.js')

// 拉取轮播图片
router.get('/getbanner',async ctx=>{
	let listdata = await Bannertmall.find()
	if(listdata.length === 0){
		new initdata(ctx,'没有数据').correct()
	}else{
		new initdata(ctx,'SUCCESS',listdata).correct()
	}
})

// 获取推荐版块数据
router.get('/recom',async ctx=>{
	let listdata = await Recommendtmall.find()
	if(listdata.length === 0){
		new initdata(ctx,'没有数据').correct()
	}else{
		new initdata(ctx,'SUCCESS',listdata).correct()
	}
})

// 获取天猫榜单数据
router.get('/billboard',async ctx=>{
	let listdata = await Listtmall.find()
	if(listdata.length === 0){
		new initdata(ctx,'没有数据').correct()
	}else{
		new initdata(ctx,'SUCCESS',listdata).correct()
	}
})

// 获取商品分类：小程序端，一级分类
router.get('/comclass',async ctx=>{
	let listdata = await Classtmall.find()
	if(listdata.length === 0){
		new initdata(ctx,'没有数据').correct()
	}else{
		let classdata = listdata.map(item=>{
			let arr = {sort:item.sort,cid:item.cid}
			return arr
		})
		new initdata(ctx,'SUCCESS',classdata).correct()
	}
})

// 获取商品分类：小程序端，二级分类
router.get('/secondclass',async ctx=>{
	let {cid} = ctx.query
	// 参数检验
	new pageing(ctx,cid).start()
	let listdata = await Classtmall.find({cid})
	if(listdata.length === 0){
		new initdata(ctx,'没有数据').correct()
	}else{
		new initdata(ctx,'SUCCESS',listdata).correct()
	}
})

// 查询商品的分类：小程序端
router.get('/queryclass',async ctx=>{
	let {cid,name} = ctx.query
	// 校验
	let arr = ['缺少一级分类id','缺少二级分类值']
	new querycl(ctx,cid,name).start(arr)
	let listdata = await Productstmall.find({cid,classif:name})
	if(listdata.length === 0){
		new initdata(ctx,'没有更多数据').correct()
	}else{
		new initdata(ctx,'SUCCESS',listdata).correct()
	}
})

// 获取商品分类：后台管理
router.get('/pcclass',async ctx=>{
	let listdata = await Classtmall.find()
	if(listdata.length === 0){
		new initdata(ctx,'没有数据').correct()
	}else{
		let pcdata = listdata.map(item=>{
			let arr = {value: item.cid,label: item.sort}
			let children = item.secon_classif.map(iteming=>{
				let classdata  = {value: iteming.name,label: iteming.name,}
				return classdata
			})
			let obj = {...arr,children:children}
			return obj
		})
		new initdata(ctx,'SUCCESS',pcdata).correct()
	}
})

// 获取首页卡片商品{上拉加载}
router.get('/commodcrad',async ctx=>{
	let {page} = ctx.query
	// 参数检验
	new pageing(ctx,page).start()
	let listdata = await Productstmall.find().limit(6).skip(page * 6)
	if(listdata.length === 0){
		new initdata(ctx,'没有更多数据了').correct()
	}else{
		new initdata(ctx,'SUCCESS',listdata).correct()
	}
})

// 获取sku：小程序
router.get('/wxsku',async ctx=>{
	let {id} = ctx.query
	// 参数检验
	new pageing(ctx,id).start()
	let listdata = await Sttritmall.find({id})
	if(listdata.length === 0){
		new initdata(ctx,'没有sku数据').correct()
	}else{
		let skulist = new Skulist(listdata).skuquery()
		new initdata(ctx,'SUCCESS',skulist).correct()
	}
})

// 查询sku:小程序
router.post('/querysku',async ctx=>{
	let {id,size,color} = ctx.request.body
	// 校验
	new skuing(ctx,id,size,color).start()
	let listdata = await Sttritmall.find({id,size,color})
	let skudata = listdata.map(item=>{return {image:item.img,price:item.Price,totalstock:item.stock}})
	new initdata(ctx,'SUCCESS',skudata).correct()
})

// 获取商品详情：Detailstmall，标题，轮播等：小程序
router.get('/introduce',async ctx=>{
	let {id} = ctx.query
	// 参数检验
	new pageing(ctx,id).start()
	let listdata = await Detailstmall.find({id})
	new initdata(ctx,'SUCCESS',listdata).correct()
})

// 获取商品参数:小程序
router.get('/parameter',async ctx=>{
	let {id} = ctx.query
	// 参数检验
	new pageing(ctx,id).start()
	let listdata = await Parametertmall.find({id})
	new initdata(ctx,'SUCCESS',listdata).correct()
})

// 升序降序：小程序端：查询商品：销量||价格
router.get('/querycod', async ctx=>{
	let {cid,name,spvalue,number} = ctx.query
	// 校验
	let arr = ['缺少一级分类id','缺少二级分类值','缺少查询值','缺少升序或降序值']
	new querycl(ctx,cid,name,spvalue,number).start(arr)
	if(spvalue == '002'){var value = 'Price'}
	else if(spvalue == '001'){var value = 'sales_volume'}
	else{throw new result('查询值不正确',400)}
	let pams = {}
	pams[value] = Number(number)
	// 升序降序查
	let listdata = await Productstmall.find({cid,classif:name}).sort(pams)
	if(listdata.length === 0){
		new initdata(ctx,'没有更多数据').correct()
	}else{
		new initdata(ctx,'SUCCESS',listdata).correct()
	}
})

// 搜索
router.get('/search', async ctx=>{
	const {keyword,page} = ctx.query
	// 校验
	const arr = ['缺少搜索词','缺少请求页数']
	new querycl(ctx,keyword,page).start(arr)
	const reg = new RegExp(keyword, 'i') //不区分大小写
	const query = {
	        $or:[ //多条件，数组
	            {classif : {$regex : reg}},
	            {title : {$regex : reg}}
	        ]
	    }
	const listdata = await Productstmall.find(query).limit(6).skip(page * 6)
	new initdata(ctx,'SUCCESS',listdata).correct()
})


// 后台管理获取所有商品数据，暂时接口，为了方便添加数据，不再分页
// 获取首页卡片商品{上拉加载}
router.get('/houcommod',async ctx=>{
	let listdata = await Productstmall.find()
	if(listdata.length === 0){
		new initdata(ctx,'没有更多数据了').correct()
	}else{
		new initdata(ctx,'SUCCESS',listdata).correct()
	}
})

module.exports = router.routes()