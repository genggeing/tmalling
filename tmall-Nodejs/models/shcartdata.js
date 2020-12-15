const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:购物车
const CartSchema = new Schema({
	// 注册对象模型
	id:{
		type:String,
		require:true
	},
	size:{
		type:String,
		require:true
	},
	color:{
		type:String,
		require:true
	},
	image:{
		type:String,
		require:true
	},
	price:{
		type:Number,
		require:true
	},
	title:{
		type:String,
		require:true
	},
	many:{
		type:Number,
		require:true
	},
	openid:{
		type:String,
		require:true
	},
	// 总价
	total_price:{
		type:Number,
		require:true
	},
	// 选中与未选中
	choice:{
		type:Boolean,
		default:false
	},
	// 是否有优惠券
	coupon:{
		type:Boolean,
		default: false
	},
	// 优惠价
	discount:{
		type:Number,
		default: 0
	}
},
	{
		versionKey:false
	}
)

module.exports = Tmallcart = mongoose.model('Tmallcart',CartSchema)