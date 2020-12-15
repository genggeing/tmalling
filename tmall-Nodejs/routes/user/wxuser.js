// 路由:()直接实例化
const router = require('koa-router')()
const request = require('request')
const qs = require('querystring')
const {log} = console

// 响应
const initdata = require('../../config/init.js')
// 参数校验
const {querycl} = require('../../config/checking')
// 微信用户登录字段
const Wxuser = require('../../models/wxuser.js')
// token
const {gentoken} = require('../../token/jwt.js')
// token权限
const {Auth} = require('../../token/auth.js')
// 收藏字段
const Collecttmall = require('../../models/collections')
// 商品详情
const Detailstmall = require('../../models/detailsdata')

// 微信用户登录
router.post('/wxlogin',async ctx=>{
	let {appid,secret,nickName,avatarUrl,code} = ctx.request.body
	// 检验
	let arr = ['缺少appid','缺少秘钥','缺少头像','缺少昵称','缺少code']
	new querycl(ctx,appid,secret,nickName,avatarUrl,code).start(arr)
	// url请求拼接
	const param = qs.stringify({appid,secret,js_code:code,grant_type:'authorization_code'})
	
	let url = 'https://api.weixin.qq.com/sns/jscode2session?' + param
	try{
		let useropenid = await wxopenid()
		log(useropenid)
		let codes = JSON.parse(useropenid)
		if(codes.errcode){
			new initdata(ctx).mistake('登录失败,请检查字段参数是否填写正确',400)
			return false
		}
		// 查询数据库该用户曾经是否已登陆过
		let listdata = await Wxuser.find({openid:codes.openid})
		if(listdata.length == 0){
			// 没有该用户信息，存储到数据库集合
			const datas = await new Wxuser({nickName,avatarUrl,openid:codes.openid}).save()
			log('数据库没有用户')
			retuuser(datas)
		}else{
			log('数据库已有用户')
			retuuser(listdata[0])
		}
	}catch(e){
		new initdata(ctx).mistake('登录失败,请检查字段参数是否填写正确',400)
	}
	
	function retuuser(data){
		const {nickName,avatarUrl,openid} = data
		const userdata = {nickName,avatarUrl,token:gentoken(openid)}
		new initdata(ctx,'SUCCESS',userdata).correct()
	}
	
	// 获取openid
	function wxopenid(){
		return new Promise((resolve,reject)=>{
			request(url,  (error, response, body)=> {
				if(!error && response.statusCode == 200){
					resolve(body)
				}else{
					reject(error)
				}
			})
		})
	}
})

// 登录状态
router.get('/tokening', new Auth().m, async ctx=>{
	new initdata(ctx,'SUCCESS').correct()
})

//获取是否已经收藏接口
router.get('/collection', new Auth('coll').m, async ctx=>{
	let{id} = ctx.query
	// 校验
	let arr = ['缺少商品id值']
	new querycl(ctx,id).start(arr)
	let listdata = await Collecttmall.find({openid:ctx.auth.uid,goodid:id})
	// log(listdata)
	if(listdata.length == 0){
		new initdata(ctx).collect({errcode:'200',collects:0,msg:'该商品未收藏'},200)
	}else{
		new initdata(ctx).collect({errcode:'200',collects:1,msg:'该商品已收藏'},200)
	}
})

// 收藏和取消收藏
router.post('/enshrine', new Auth().m, async ctx=>{
	let{id,num} = ctx.request.body
	// 校验
	let arr = ['缺少商品id','缺少收藏或未收藏值']
	new querycl(ctx,id,num).start(arr)
	// 收藏
	if(num === 1){
		log('收藏')
		try{
			// 查询是否已经收藏过
			let listdata = await Collecttmall.find({openid:ctx.auth.uid,goodid:id})
			if(listdata.length > 0){
				new initdata(ctx).collect({errcode:'200',collects:1,msg:'收藏成功'},200)
			}else{
				await new Collecttmall({openid:ctx.auth.uid,goodid:id}).save()
				new initdata(ctx).collect({errcode:'200',collects:1,msg:'收藏成功'},200)
			}
		}catch(e){
			new initdata(ctx).collect({errcode:'001',collects:0,msg:'收藏失败'},500)
		}
	}else if(num === 0){
		log('取消收藏')
		let colldata = await Collecttmall.find({openid:ctx.auth.uid,goodid:id})
		if(colldata.length == 0){
			new initdata(ctx).mistake('取消收藏失败,该商品未被收藏过',400)
			return false
		}
		try{
			await Collecttmall.findOneAndRemove({_id:colldata[0]._id})
			new initdata(ctx).collect({errcode:'200',collects:0,msg:'取消收藏成功'},200)
		}catch(e){
			new initdata(ctx).collect({errcode:'001',collects:0,msg:'取消收藏失败'},500)
		}
	}else{
		new initdata(ctx).mistake('num字段填写错误',400)
	}
})

// 获取用户的商品收藏
router.get('/mycollect', new Auth().m, async ctx=>{
	let gooId = await Collecttmall.find({openid:ctx.auth.uid})
	let mapId = gooId.map(item=>item.goodid)
	let mp = await Detailstmall.find({id:{$in: mapId}})
	let me = mp.map(items=>{
		let obj = {
			_id:items.id,
			Trueprice:items.describe.Trueprice,
			title:items.describe.title
		}
		let mv = items.media.map(iteming=>{
			return iteming.imgArray[0]
		})
		return {...obj,image:mv[0]}
	})
	new initdata(ctx,'SUCCESS',me).correct()
})


module.exports = router.routes()