// 路由:()直接实例化
const router = require('koa-router')()
const {log} = console

// 响应
const initdata = require('../../config/init.js')
// 时间模块
let moment = require('moment')
moment.locale('zh-cn')
// token权限
const {Auth} = require('../../token/auth.js')
// 抛出异常
const result = require('../../config/resultdata.js')
// 参数校验
const {querycl,wxpays,usercomms} = require('../../config/checking')
// 订单字段
const Userorder = require('../../models/userorder.js')
// 购物车字段
const Tmallcart = require('../../models/shcartdata')
// 微信支付配置
const Wxpay = require('../../config/wxpay.js')
// 引入百度评论分类文件
const {options,client} = require('../../config/baiduai.js')
// 评论分类字段
const Commclassif = require('../../models/commclassif.js')
// 评论内容字段
const Usercomment = require('../../models/usercomment.js')
// 用户信息字段
const Wxuser = require('../../models/wxuser.js')
// 商品详情
const Detailstmall = require('../../models/detailsdata')
// 商品sku
const Sttritmall = require('../../models/attributes.js')
// 库存自增自减
const {commStocks} = require('../../config/comm-stocks.js')
// 操作数据库
const {Operation} = require('../../config/database')


// 提交订单
router.post('/placeorder', new Auth().m, async ctx=>{
	let {appid,mchid,partnerKey,consignee,commodity,total_price,idcard} = ctx.request.body
	// 校验
	let arr = ['请选择收货地址','商品数据不能为空','合计总价不能为空','idcard是购物车的id,对应的value不能为空且是个Array']
	new wxpays(ctx,consignee,commodity,total_price,idcard).start(arr,consignee)
	// 当前时间
	let time = moment().format('YYYY-MM-DD HH:mm:ss');
	// 两个小时之后的时间：获取订单过期
	let exp_time = moment().add(2,'hours').format('YYYY-MM-DD HH:mm:ss');
	// 商户订单号
	let out_trade_no = new Wxpay().Mon()
	if(appid == undefined || mchid == undefined || partnerKey == undefined){
		// 用户未传
		var API = new Wxpay().Api()
	}else{
		// 用户已传
		var API = new Wxpay(appid,mchid,partnerKey).Api()
	}
	// 统一下单
	try{
		var results = await API.unifiedOrder({
		  out_trade_no,
		  body: '天猫商城小程序下单',
		  total_fee: parseFloat((Number(total_price) * 100).toFixed(10)),
		  openid: ctx.auth.uid
		});
	}catch(e){
		log(e)
		throw new result('支付发生错误,请检查上传的参数是否有误',500)
	}
	// 获取前端所需支付参数
	try{
		let paydata = await API.getPayParamsByPrepay({prepay_id: results.prepay_id})
		// log(paydata)
		var {timeStamp,nonceStr,package,signType,paySign} = paydata
	}catch(e){
		throw new result('支付发生错误',500)
	}
	// 存储订单到数据库7mTcAYFx3yxd3JTajZrchxstHJJrAwNz
	// 是否是购物车来的数据
	let shcart = idcard.length == 0 ? false : true
	let orderData = {
		openid:ctx.auth.uid,
		total_price,
		out_trade_no,//商户订单号
		time,//下单时间
		exp_time,//订单过期时间
		order_number:new Wxpay().Code(),//订单编号
		timeStamp,
		nonceStr,
		package,
		signType,
		paySign,
		shcart,
		idcard,
		consignee,//收货人
		order:commodity//商品数据
	}
	try{
		let Pay = await new Userorder(orderData).save()
		new initdata(ctx,'SUCCESS',{timeStamp,nonceStr,package,signType,paySign,out_trade_no:Pay.out_trade_no,id:Pay._id}).correct()
	}catch(e){
		log(e)
		new initdata(ctx).mistake('支付发生错误',500)
	}
	
})

// 查询订单
router.post('/queryorder', new Auth().m, async ctx=>{
	let {appid,mchid,partnerKey,outno,id} = ctx.request.body
	// 检验
	let arr = ['缺少商户订单号','缺少订单id']
	new querycl(ctx,outno,id).start(arr)
	if(appid == undefined || mchid == undefined || partnerKey == undefined){
		// 用户未传
		var API = new Wxpay().Api()
	}else{
		// 用户已传
		var API = new Wxpay(appid,mchid,partnerKey).Api()
	}
	try{
		let result = await API.orderQuery({out_trade_no: outno});
		if(result.trade_state === 'SUCCESS'){
			// 1.支付成功更改订单数据库Pay_status为1
			await Userorder.findByIdAndUpdate({_id:id},{Pay_status:1})
			// 2.查询订单数据库是否有购物车来的数据
			let idcaedarr = await Userorder.find({_id:id,out_trade_no:outno,shcart:true})
			if(idcaedarr.length > 0){
				// 3.支付成功删除从购物车下单的购物车数据
				await Tmallcart.deleteMany({openid:ctx.auth.uid,_id:{$in: idcaedarr[0].idcard}})
			}
			// 4.自增商品销量,减少总库存，减去单个商品sku的库存
			await new commStocks(Userorder,id,Detailstmall,Sttritmall).Pointer()
			new initdata(ctx,'SUCCESS','支付成功').correct()
		}else if(result.trade_state === 'NOTPAY'){
			// 订单未支付
			new initdata(ctx,'not','订单未支付').correct()
		}
	}catch(e){
		new initdata(ctx).mistake('不存在该商户订单号',400)
	}
})

// 待付款
router.get('/tobepaid', new Auth().m, async ctx=>{
	let ta = moment().format('YYYY-MM-DD HH:mm:ss');
	let tb = new Date(ta).getTime()
	let exd = await Userorder.find({openid:ctx.auth.uid},{exp_time:1})
	// 两个小时后订单过期，更改expire为true
	exd.forEach(async item=>{
		if(new Date(item.exp_time).getTime() < tb){
			await Userorder.findByIdAndUpdate({_id:item._id},{expire:true})
		}
	})
	let listdata = await Userorder.find({openid:ctx.auth.uid,Pay_status:0},{total_price:1,order:1,timeStamp:1,nonceStr:1,package:1,signType:1,paySign:1,out_trade_no:1,expire:1}).sort({time:-1})
	new initdata(ctx,'SUCCESS',listdata).correct()
})

// 订单详情：待付款，待发货，待收货
router.get('/tobedetail', new Auth().m, async ctx=>{
	let{id} = ctx.query
	// 检验
	let arr = ['缺少订单id']
	new querycl(ctx,id).start(arr)
	let listdata = await Userorder.find({openid:ctx.auth.uid,_id:id},{total_price:1,order:1,consignee:1,order_number:1,time:1,
	 timeStamp:1,nonceStr:1,package:1,signType:1,paySign:1,out_trade_no:1
	 })
	new initdata(ctx,'SUCCESS',listdata).correct()
})

// 待发货
router.get('/tbdelivered', new Auth().m, async ctx=>{
	let listdata = await Userorder.find({openid:ctx.auth.uid,Pay_status:1,Shi_status:0,Rec_status:0},{ total_price: 1, order: 1}).sort({time:-1})
	new initdata(ctx,'SUCCESS',listdata).correct()
})

// 待收货
router.get('/gtbreceived', new Auth().m, async ctx=>{
	let listdata = await Userorder.find({openid:ctx.auth.uid,Pay_status:1,Shi_status:1,Rec_status:0},{ total_price: 1, order: 1 }).sort({time:-1})
	new initdata(ctx,'SUCCESS',listdata).correct()
})

// 确认收货
router.get('/conreceipt', new Auth().m, async ctx=>{
	let{id} = ctx.query
	// 检验
	let arr = ['缺少订单id']
	new querycl(ctx,id).start(arr)
	let bnv = await Userorder.findByIdAndUpdate(id,{Rec_status:1})
	if(bnv == null){
		new initdata(ctx).mistake('确认收货失败,未存在该商品信息',400)
	}else{
		new initdata(ctx).correct()
	}
})

// 删除订单
router.get('/deleorder', new Auth().m, async ctx=>{
	let {orderid} = ctx.query
	// 校验
	let arr = ['缺少订单_id']
	new querycl(ctx,orderid).start(arr)
	// 删除
	let deledata = await Userorder.deleteMany({openid:ctx.auth.uid,_id:orderid})
	if(deledata.deletedCount > 0){
		new initdata(ctx).correct()
	}else{
		new initdata(ctx).mistake('删除失败,请检查你上传的值或类型',400)
	}
})

// 待评价
router.get('/tbevaluated', new Auth().m, async ctx=>{//order: { $elemMatch: { evaluate: 0 } } 
	let listdata = await Userorder.find({openid:ctx.auth.uid,Pay_status:1,Shi_status:1,Rec_status:1},{total_price:1,order:1}).sort({time:-1})
	let routerList = []
	listdata.forEach(item=>{
		routerList= [...routerList,...item.order]
	})
	let filterata = routerList.filter(item=>{
		return item.evaluate === 0
	})
	new initdata(ctx,'SUCCESS',filterata).correct()
})


// 待评价详情
router.get('/dtpepage', new Auth().m, async ctx=>{
	let{id} = ctx.query
	// 检验
	let arr = ['缺少商品_id']
	new querycl(ctx,id).start(arr)
	let listdata = await Userorder.find({openid:ctx.auth.uid,'order._id':id},{total_price:1,order:1,consignee:1,order_number:1,time:1 })
	let dgh = listdata.map(item=>{
		let obj = {consignee:item.consignee,_id:item._id,time:item.time,order_number:item.order_number}
		ghn = item.order.filter(items=>{
			return items._id == id
		})
		let vbb = ghn.map(itemd=>{
			return {pri:itemd.price * itemd.many}
		})
		let obb = {...obj,total_price:vbb[0].pri,order:ghn}
		return obb
	})
	new initdata(ctx,'SUCCESS',dgh).correct()
})


// 提交评论
router.post('/subcomm', new Auth().m, async ctx=>{
	let {orderid,commid,size,color,comment,commimage} = ctx.request.body
	// 检验
	let arr = ['缺少订单里的商品_id','缺少商品id','缺少尺码','缺少颜色','请填写评论内容','缺少图片value值']
	new usercomms(ctx,orderid,commid,size,color,comment,commimage).start(arr,comment,commimage)
	// <一>取到评论分类标签
	try{
		let aimessage = await client.commentTag(comment, options)
		if(aimessage.items.length === 0){
			// 没有抽取到观点
			var classif = ''
		}else{
			// 存储到数据库集合
			let aione = aimessage.items[0]
			let [prop,adj] = [aione.prop,aione.adj]
			var classif = prop + adj
		}
		log(classif)
	}catch(e){
		throw new result('提交失败',500)
	}
	// <二>存储评论内容到数据库
	// 1.查询用户头像昵称
	let wxuser = await Wxuser.find({openid:ctx.auth.uid})
	let {nickName,avatarUrl} = wxuser[0]
	let isimg = commimage.length == 0 ? false : true
	let time = moment().format('YYYY-MM-DD HH:mm:ss')// 当前时间
	let commobj = {commid,label:classif,isimg,nickName,avatarUrl,time,size,color,text:comment,image:commimage}
	await new Usercomment(commobj).save()
	// <三>查询评论内容数据库有多少条该分类
	let labelnum = await Usercomment.find({commid,label:classif})
	log(labelnum.length)
	// <四>存储分类标签到数据库：	前提查询相同标签，替换num值
	let findcomm = await Commclassif.find({commid,label:classif})
	if(findcomm.length === 0){
		log('没有该标签')
		// 如果百度分析的为空，则不存储标签
		if(classif != ''){
			await new Commclassif({label:classif,num:labelnum.length,commid}).save()
		}
	}else{
		await Commclassif.updateMany({commid,label:classif},{num:labelnum.length})
	}
	// <五>评论成功更改订单数据库的evaluate字段
	try{
		let dgb = await Userorder.update({"order._id":orderid},
		{$set:{"order.$.evaluate": 1}})
		if(dgb.ok && dgb.ok === 1){
			new initdata(ctx).correct()
		}else{
			new initdata(ctx).mistake('提交评论失败,请开发者检查上传的商品id,orderid是否正确',400)
		}
	}catch(e){
		throw new result('提交失败',500)
	}
	
})


// 小程序端详情页获取评论
router.get('/wxcommnt', async ctx=>{
	let {id} = ctx.query
	// 检验
	let arr = ['缺少商品id']
	new querycl(ctx,id).start(arr)
	// 查询标签分类
	let ma = await Commclassif.find({commid:id}).limit(3)
	// 查询评论内容
	let mb = await Usercomment.find({commid:id}).limit(1)
	// 查询评论内容多少条
	let mc = await Usercomment.find({commid:id})
	let md = [{commtag:ma,parcontent:mb,commlen:mc.length}]
	new initdata(ctx,'SUCCESS',md).correct()
})

// 小程序端评论详情页获取评论分类
router.get('/comtag', async ctx=>{
	let {id} = ctx.query
	// 检验
	let arr = ['缺少商品id']
	new querycl(ctx,id).start(arr)
	// 查询标签分类
	let ma = await Commclassif.find({commid:id})
	if(ma.length > 0){
		ma.unshift(
			{
				"_id": "",
				"label": "全部",
				"num": '',
				"commid": ma[0].commid
			}
		)
	}
	new initdata(ctx,'SUCCESS',ma).correct()
})

// 小程序端分类标签查询评论内容
router.get('/comtconent', async ctx=>{
	let {id,label} = ctx.query
	// 检验
	let arr = ['缺少商品id','缺少评论标签']
	new querycl(ctx,id,label).start(arr)
	// 查询标签分类
	if(label == '全部'){
		var comobj = {commid:id}
	}else{
		var comobj = {commid:id,label}
	}
	let ma = await Usercomment.find(comobj)
	new initdata(ctx,'SUCCESS',ma).correct()
})



// =========================================没有商户号的虚拟支付接口===============================

// 提交订单
router.post('/fictpay', new Auth().m, async ctx=>{
	let {consignee,commodity,total_price,idcard} = ctx.request.body
	// 校验
	let arr = ['请选择收货地址','商品数据不能为空','合计总价不能为空','idcard是购物车的id,对应的value不能为空且是个Array']
	new wxpays(ctx,consignee,commodity,total_price,idcard).start(arr,consignee)
	// 当前时间
	let time = moment().format('YYYY-MM-DD HH:mm:ss');
	// 商户订单号
	let out_trade_no = new Wxpay().Mon()
	// 是否是购物车来的数据
	let shcart = idcard.length == 0 ? false : true
	// 存储订单到数据库
	let orderData = {
		openid:ctx.auth.uid,
		total_price,
		out_trade_no,//商户订单号
		time,//下单时间
		order_number:new Wxpay().Code(),//订单编号
		shcart,
		idcard,
		consignee,//收货人
		order:commodity//商品数据
	}
	try{
		let Pay = await new Userorder(orderData).save()
		// 1.支付成功更改订单数据库Pay_status为1
		await Userorder.findByIdAndUpdate({_id:Pay._id},{Pay_status:1})
		// 2.查询订单数据库是否有购物车来的数据
		let idcaedarr = await Userorder.find({_id:Pay._id,out_trade_no:Pay.out_trade_no,shcart:true})
		if(idcaedarr.length > 0){
			// 3.支付成功删除从购物车下单的购物车数据
			await Tmallcart.deleteMany({openid:ctx.auth.uid,_id:{$in: idcaedarr[0].idcard}})
		}
		// 4.自增商品销量,减少总库存，减去单个商品sku的库存
		await new commStocks(Userorder,Pay._id,Detailstmall,Sttritmall).Pointer()
		new initdata(ctx,'SUCCESS','虚拟支付成功').correct()
	}catch(e){
		new initdata(ctx).mistake('虚拟支付发生错误',500)
	}
})


module.exports = router.routes()