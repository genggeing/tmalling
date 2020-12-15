const mongoose = require('mongoose')
const Schema = mongoose.Schema


// 实例化数据模板:订单字段
const OrderSchema = new Schema({
	// 注册对象模型
	openid:{
		type:String,
		require:true
	},
	Pay_status:{//支付成功与否，成功1，失败未支付0
		type:Number,
		default: 0
	},
	Shi_status:{//发货状态，已发货1，未发货0
		type:Number,
		default: 0
	},
	Rec_status:{//收货状态，已收货1，未收货0
		type:Number,
		default: 0
	},
	total_price:{//总价
		type:Number,
		require:true
	},
	time:{//交易时间
		type:String,
		require:true
	},
	exp_time:{//两个小时之后订单过期时间
		type:String,
		require:true
	},
	out_trade_no:{//商户订单号
		type:String,
		default: '0'
	},
	order_number:{//订单编号
		type:String,
		require:true
	},
	timeStamp:{//时间戳
		type:String,
		default: '0'
	},
	nonceStr:{//随机字符串
		type:String,
		default: '0'
	},
	expire:{//订单是否过期，默认false
		type:Boolean,
		default: false
	},
	package:{//统一下单接口返回的 prepay_id 参数值
		type:String,
		default: '0'
	},
	signType:{//签名算法
		type:String,
		default: '0'
	},
	paySign:{//签名
		type:String,
		default: '0'
	},
	shcart:{//是否是购物车提交的订单
		type:Boolean,
		default: false
	},
	idcard:{//购物车id数组
		type:[String],
		required:true
	},
	consignee:{//收货人
		city:{
			type:String,
			required:true
		},
		address:{
			type:String,
			required:true
		},
		name:{
			type:String,
			required:true
		},
		mobile:{
			type:String,
			required:true
		}
	},
	order:[//商品信息
		{
			id:{
				type:String,
				required:true
			},
			image:{
				type:String,
				required:true
			},
			title:{
				type:String,
				required:true
			},
			size:{
				type:String,
				required:true
			},
			color:{
				type:String,
				required:true
			},
			price:{
				type:Number,
				required:true
			},
			many:{
				type:Number,
				required:true
			},
			evaluate:{//评价，0未评价，1已评价
				type:Number,
				default: 0
			}
		}
	]
},
	{
		versionKey:false
	}
)

module.exports = Userorder = mongoose.model('userorder',OrderSchema)