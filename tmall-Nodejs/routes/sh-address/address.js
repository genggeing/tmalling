// 路由:()直接实例化
const router = require('koa-router')()
const {log} = console

// 响应
const initdata = require('../../config/init.js')
// 操作数据库
const {Operation} = require('../../config/database')
// 参数校验
const {nameaddress,querycl} = require('../../config/checking')
// token权限
const {Auth} = require('../../token/auth.js')
// 收货地址字段
const Addresstmall = require('../../models/address')

// 上传收货地址
router.post('/sudeadd',  new Auth().m, async ctx=>{
	let {city,address,name,mobile} = ctx.request.body
	// 校验
	let arr = ['请填写收货城市','请填写详细收货地址','请填写联系人姓名','请填写手机号码']
	new nameaddress(ctx,city,address,name,mobile).start(arr,mobile)
	let obj = {city,address,name,mobile,openid:ctx.auth.uid}
	await new Operation(ctx,Addresstmall,obj).increase()
})

// 获取用户收货地址
router.get('/gainadd', new Auth().m, async ctx=>{
	let listdata = await Addresstmall.find({openid:ctx.auth.uid},{openid:0})
	new initdata(ctx,'SUCCESS',listdata).correct()
})

// 用户修改收货地址
router.post('/modifyadd', new Auth().m, async ctx=>{
	let {id,city,address,name,mobile} = ctx.request.body
	// 校验
	let arr = ['缺少_id值','请填写收货城市','请填写详细收货地址','请填写联系人姓名','请填写手机号码']
	new nameaddress(ctx,id,city,address,name,mobile).start(arr,mobile)
	let obj = {city,address,name,mobile,openid:ctx.auth.uid}
	let dbv = await Addresstmall.findByIdAndUpdate({_id:id},obj)
	if(dbv == null){
		new initdata(ctx).mistake('修改失败,不存在该条地址,请检查上传的_id是否正确',400)
	}else{
		new initdata(ctx).correct()
	}
})

// 删除收货地址
router.get('/deleadd',new Auth().m, async ctx=>{
	let {id} = ctx.query
	// 校验
	let arr = ['缺少_id值']
	new querycl(ctx,id).start(arr)
	// 删除
	await new Operation(ctx,Addresstmall,id).delete()
})

module.exports = router.routes()