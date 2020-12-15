// 参数检验
// 空校验
// 数字类型校验
// undefined校验
// 空格校验
// 手机号码
// 密码
const result = require('./resultdata.js')

class checkings{
	constructor(ctx,...obj) {
		this.ctx = ctx
		this.obj = obj
	}
	
	// 检验前端开发者参数错误，为underfind
	Errunder(){
		let bvc = this.obj.indexOf(undefined)
		if(bvc != -1){
			throw new result('参数填写错误',400)
		}
	}
	
	// 校验用户填写为空
	Parameter(list){
		let bvc = this.obj.indexOf('')
		if(bvc != -1){
			throw new result(list[bvc],202)
		}
	}
	
	// 校验空格符号
	Blank(list){
		// console.log(this.obj)
		let vbn = this.obj.filter(item=>{
			return item.split(" ").join("").length === 0
		})
		let bvc = this.obj.indexOf(vbn[0])
		if(bvc != -1){
			throw new result(list[bvc],202)
		}
	}
	
	// 校验空数组
	Arrfun(list,num){
		// console.log(JSON.parse(this.obj[num]))
		if(JSON.parse(this.obj[num]).length === 0){
			throw new result(list,202)
		}
	}
	
	// 校验图片未上传:单图上传
	Checimg(){
		if(this.ctx.file === undefined){
			throw new result('请上传图片',202)
		}
	}
	
	// 校验图片未上传:多图上传
	Manyimg(imgarr,tip){
		if(imgarr.length === 0){
			throw new result(tip,202)
		}
	}
	
	// 校验参数为数字类型
	Checnumber(list,numarr=0){
		if(numarr != 0){
			var numbering = numarr
		}else{
			var numbering = this.obj
		}
		let vbn = numbering.filter(item=>{
			return isNaN(item)
		})
		let bvc = numbering.indexOf(vbn[0])
		if(bvc != -1){
			throw new result(list[bvc],202)
		}
	}
	
	// 数字小于1
	Lessthan(list,num){
		if(num < 1){
			throw new result(list,202)
		}
	}
	
	// 校验手机号码
	Phone(mobile,text){
		let phone = /^1[3456789]\d{9}$/
		if(!phone.test(mobile)){
			throw new result(text,202)
		}
	}
	
	// 密码验证：6-20位数字和字母的组合
	Password(pass){
		let reg = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/
		if(!reg.test(this.obj[1])){
			throw new result(pass,202)
		}
	}
	
	// 验证码
	Codefun(code){
		if(this.obj[2] == ''  || this.obj[2].split(" ").join("").length === 0){
			throw new result(code,202)
		}
	}
	
	// 检验空对象
	Noobj(data,text){
		var arr = Object.keys(data);
		if(arr.length == 0){
			throw new result(text,202)
		}
	}
	
	// 校验单个空格符号
	Space(value,list){
		if(value.split(" ").join("").length === 0){
			throw new result(list,202)
		}
	}
	
	// 校验是否是数组类型
	Ifarr(value,list){
		if(value instanceof Array === false){
			throw new result(list,202)
		}
	}
	
}

// 小程序端轮播
class wxbanner extends checkings{
	start(image){
		let arr = ['请填写描述']
		super.Errunder()
		super.Checimg()
		super.Parameter(arr)
		super.Blank(arr)
	}
}

// 删除轮播图片
class delbanner extends checkings{
	start(){
		let arr = ['请填写id']
		super.Errunder()
		super.Parameter(arr)
		super.Blank(arr)
	}
}

// 上传商品详情
class chdetail extends checkings{
	start(imgarr,manyimg){
		let arr = ['请填写id','请填写商品名称','请填写商品展示价',
		'请填写商品划线价','请填写商品描述','请填写商品描述',
		'请填写总库存','请上传图片'
		]
		super.Errunder()
		super.Parameter(arr)
		super.Blank(arr)
		super.Manyimg(imgarr,'请上传商品图片')
		super.Manyimg(manyimg,'请上传商品详情图片')
	}
}

// get请求的校验
class pageing extends checkings{
	start(){
		let arr = ['请正确填写要传入的值']
		super.Errunder()
		super.Parameter(arr)
	}
}

// 查询sku
class skuing extends checkings{
	start(){
		let arr = ['缺少id值','缺少尺码值','缺少颜色值']
		super.Errunder()
		super.Parameter(arr)
	}
}

// 查询商品的分类：小程序端
class querycl extends checkings{
	start(arr){
		super.Errunder()
		super.Parameter(arr)
	}
}

// 购物车
class shcart extends checkings{
	start(numarr){
		let arr = ['缺少id值','缺少尺码值','缺少颜色值','缺少图片','缺少价格','缺少标题','缺少购买数量']
		let list = ['价格必须是数字类型','购买数量必须是数字类型']
		super.Errunder()
		super.Parameter(arr)
		super.Checnumber(list,numarr)
	}
}

// 加减数量购物车
class prideing extends checkings{
	start(numarr){
		let arr = ['缺少id值','缺少商品单价','缺少商品数量值']
		let list = ['商品单价必须是数字类型','商品购买数量值必须是数字类型']
		super.Errunder()
		super.Parameter(arr)
		super.Checnumber(list,numarr)
		super.Lessthan('商品购买数量值不能小于1',numarr[1])
	}
}

// 购物车重选sku修改数据库
class modify extends checkings{
	start(numarr){
		let arr = ['缺少_id值','缺少skuid值','缺少商品图片值','缺少尺码值','缺少颜色值',
		'缺少商品单价值','缺少商品数量值'
		]
		let list = ['商品单价必须是数字类型','商品购买数量值必须是数字类型']
		super.Errunder()
		super.Parameter(arr)
		super.Checnumber(list,numarr)
		super.Lessthan('商品购买数量值不能小于1',numarr[1])
	}
}

// 用户收货地址
class nameaddress extends checkings{
	start(arr,numarr){
		super.Errunder()
		super.Parameter(arr)
		super.Phone(numarr,'手机号码格式不正确')
	}
}

// 微信支付提交
class wxpays extends checkings{
	start(arr,obj){
		super.Errunder()
		super.Parameter(arr)
		super.Noobj(obj,'请选择收货地址')
	}
}

// 小程序用户评论
// 查询商品的分类：小程序端
class usercomms extends checkings{
	start(arr,comment,coming){
		super.Errunder()
		super.Parameter(arr)
		super.Space(comment,'请填写评论')
		super.Ifarr(coming,'图片的vaule应是个数组类型')
	}
}

module.exports = {wxbanner,delbanner,chdetail,pageing,skuing,querycl,shcart,
prideing,modify,nameaddress,wxpays,usercomms
}