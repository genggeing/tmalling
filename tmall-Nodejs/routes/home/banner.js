// 路由:()直接实例化
const router = require('koa-router')()
const {log} = console

// 响应
const initdata = require('../../config/init.js')
// 参数校验
const {wxbanner,delbanner} = require('../../config/checking')
// 上传图片
const {upload,uploadimg} = require('../../oss/oss.js')
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
// 操作数据库
const {Operation} = require('../../config/database')

// 上传轮播
router.post('/banner', upload.single('file'), async ctx=>{
	let {title} = ctx.request.body
	// 校验
	new wxbanner(ctx,title).start()
	// 上传图片到阿里云
	let img = await uploadimg(ctx.file.path)
	let obj = {'image':img,title}
	console.log(obj)
	await new Operation(ctx,Bannertmall,obj).increase()
})

// 删除轮播图片
router.get('/delbanner',async ctx=>{
	let {id} = ctx.query
	// 校验
	new delbanner(ctx,id).start()
	// 删除
	await new Operation(ctx,Bannertmall,id).delete()
})

// 上传推荐
router.post('/recommend',async ctx=>{
	let {title,lable,img} = ctx.request.body
	// 校验
	// 上传
	let obj = {title,lable,image:[]}
	try{
		const datas = await new Recommendtmall(obj).save()
		const uparr = await upta(datas._id)
		log(uparr)
		new initdata(ctx).correct()
	}catch(e){
		new initdata(ctx).mistake('提交失败',500)
	}

	function upta(id){
		return new Promise((resolve,reject)=>{
			let idf = []
			img.forEach(async item=>{
				try{
					const datas = await Recommendtmall.updateOne({ _id: id},{$push: {image: {img: item}}})
					idf.push(datas)
					if(idf.length == img.length){
						resolve('SUCCESS')
					}
				}catch(e){
					reject('失败')
				}
			})
		})
	}

})

// 上传天猫榜单
router.post('/tmalllist', upload.single('file'), async ctx=>{
	let {image,title,want} = ctx.request.body
	// 校验
	// 上传到数据库
	let obj = {image,title,want}
	await new Operation(ctx,Listtmall,obj).increase()
})


// 上传卡片商品
router.post('/homeproducts', async ctx=>{
	let {image,title,freight,Duration,classif,cid,Price} = ctx.request.body
	// 卡片商品
	let obj = {image,title,freight,Duration,cid,classif,Price}
	await new Operation(ctx,Productstmall,obj).increase()
})


module.exports = router.routes()