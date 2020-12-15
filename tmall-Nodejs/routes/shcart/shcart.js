// 路由:()直接实例化
const router = require('koa-router')()
const {log} = console

// 响应
const initdata = require('../../config/init.js')
// 参数校验
const {shcart,prideing,pageing,modify,querycl} = require('../../config/checking')
// 操作数据库
const {Operation} = require('../../config/database')
// token权限
const {Auth} = require('../../token/auth.js')
// 购物车字段
const Tmallcart = require('../../models/shcartdata')
// 获取sku的类
const Skulist = require('../../config/skulist.js')
// 商品sku
const Sttritmall = require('../../models/attributes.js')
// 商品详情
const Detailstmall = require('../../models/detailsdata')

// 加入购物车
router.post('/atcart', new Auth().m, async ctx=>{
	let {id,size,color,image,price,title,many} = ctx.request.body
	// 参数校验
	new shcart(ctx,id,size,color,image,price,title,many).start([price,many])
	// 总价计算parseFloat((numdata).toFixed(10))
	let total_price = Number(price) * Number(many)
	let obj={
		id,
		size,
		color,
		image,
		price:Number(price),
		title,
		many:Number(many),
		total_price:parseFloat((total_price).toFixed(10)),
		openid:ctx.auth.uid
	}
	// 查询购物车是否提交重复：重复则不提交
	let data = await Tmallcart.find({id,size,color,openid:ctx.auth.uid})
	if(data.length === 0){
		await new Operation(ctx,Tmallcart,obj).increase()
	}else{
		new initdata(ctx).correct()
	}
})

// 获取购物车数据
router.get('/mycart', new Auth().m, async ctx=>{
	let data = await Tmallcart.find({openid:ctx.auth.uid},{openid:0})
	// log(data)
	new initdata(ctx,'SUCCESS',data).correct()
})

// 购物车加减价
router.post('/pride', new Auth().m, async ctx=>{
	let {id,price,many} = ctx.request.body
	// 参数校验
	new prideing(ctx,id,price,many).start([price,many])
	let toTal = Number(price) * Number(many)
	let nums = parseFloat((toTal).toFixed(10))
	await Tmallcart.findByIdAndUpdate(id,{many,total_price:nums},{new:true})
	new initdata(ctx).correct()
})

// 购物车重选sku
router.get('/cartsku',new Auth().m, async ctx=>{
	let {id} = ctx.query
	// 参数检验
	new pageing(ctx,id).start()
	// 商品详情
	let detaildata = await Detailstmall.find({id})
	// sku
	let listdata = await Sttritmall.find({id})
	let skulist = new Skulist(listdata).skuquery()
	let mendata = detaildata[0]
	let defaultdata = {
	image:mendata.media[0].imgArray[0],
	price:mendata.describe.Trueprice,
	totalstock:mendata.describe.Total_stock,
	id:mendata.id,
	title:mendata.describe.title
	}
	skulist.push(defaultdata)
	new initdata(ctx,'SUCCESS',skulist).correct()
})

// 购物车重选sku更改数据库
router.post('/skubase', new Auth().m, async ctx=>{
	let {id,skuid,image,size,color,price,many} = ctx.request.body
	// 参数检验
	// log(skuid)
	// log(id)
	new modify(ctx,id,skuid,image,size,color,price,many).start([price,many])
	// 如果重选出现相同的sku则删除该sku
	let alike = await Tmallcart.find({openid:ctx.auth.uid,id:skuid,size,color})//查询数据库是否存在
	if(alike.length === 0){
		log('没有相同的')
		await toUp()
	}else if(alike.length > 0){
		if(id == alike[0]._id){
			log('要更改的是同一个')
			await toUp()
		}else{
			log('要更改的数据库里存在相同的')
			// 删除
			await new Operation(ctx,Tmallcart,id).delete()
		}
	}
	async function toUp(){
		let toTal = Number(price) * Number(many)
		let nums = parseFloat((toTal).toFixed(10))
		await Tmallcart.findByIdAndUpdate(id,{image,size,color,price,many,total_price:nums},{new:true})
		new initdata(ctx).correct()
	}
})

// 单个选中与取消选中
router.post('/selecting', new Auth().m, async ctx=>{
	let {id,nums} = ctx.request.body
	// 校验
	let arr = ['缺少商品_id','缺少选中或未选中标识']
	new querycl(ctx,id,nums).start(arr)
	if(nums == 'select'){
		log('选中')
		let bnv = await Tmallcart.findByIdAndUpdate(id,{choice:true})
		if(bnv == null){
			new initdata(ctx).mistake('选中失败,未存在该商品',400)
		}else{
			new initdata(ctx).correct()
		}
	}else if(nums == 'unchecked'){
		log('未选中')
		let bnv = await Tmallcart.findByIdAndUpdate(id,{choice:false})
		if(bnv == null){
			new initdata(ctx).mistake('未选中失败,未存在该商品',400)
		}else{
			new initdata(ctx).correct()
		}
	}else{
		new initdata(ctx).mistake('选中或未选中标识value不对',400)
	}
})

// 全选与取消全选
router.get('/selectall', new Auth().m, async ctx=>{
	let {idft} = ctx.query
	let arr = ['缺少全选与未全选标识字段']
	new querycl(ctx,idft).start(arr)
	if(idft == 'seall'){
		log('全选')
		let data = await Tmallcart.updateMany({openid:ctx.auth.uid},{choice:true})
		new initdata(ctx).correct()
	}else if(idft == 'deall'){
		log('取消全选')
		let data = await Tmallcart.updateMany({openid:ctx.auth.uid},{choice:false})
		new initdata(ctx).correct()
	}else{
		new initdata(ctx).mistake('全选或取消全选字段标识value不对',400)
	}
})

// 删除购物车：单个删除，多个删除
router.post('/cartdelete',new Auth().m, async ctx=>{
	let {arrid} = ctx.request.body
	let arr = ['缺少id值']
	new querycl(ctx,arrid).start(arr)
	log(arrid[0])
	let data = await Tmallcart.deleteMany({openid:ctx.auth.uid,_id:{$in: arrid}})
	if(data.deletedCount > 0){
		log('删除成功')
		new initdata(ctx).correct()
	}else{
		log('删除失败')
		new initdata(ctx).mistake('删除失败,请检查你上传的值或类型',400)
	}
})

module.exports = router.routes()