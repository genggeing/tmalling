const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:商品属性
const DetailsSchema = new Schema({
	// 注册对象模型
	id:{
		type:String,
		require:true
	},
	media:[
		{
			video:{
				type:String,
				default: ''
			},
			imgArray:{
				type:[String],
				required:true
			}	
		}
	],
	describe:{
		Trueprice:{
			type:Number,
			required:true
		},
		Crossedprice:{
			type:Number,
			required:true
		},
		Goldcoin:{
			type:String,
			required:true
		},
		integral:{
			type:String,
			required:true
		},
		title:{
			type:String,
			required:true
		},
		// 总库存
		Total_stock:{
			type:Number,
			required:true
		},
		// 销量
		sales_volume:{
			type:Number,
			default: 0
		},
		// 优惠券
		coupon:{
			type:Boolean,
			default: false
		},
		// 券后价
		coupon_price:{
			type:Number,
			default: 0
		},
		// 收藏
		collection:{
			type:Boolean,
			default: false
		},
		Detaileddrawing:{
			type:[String],
			required:true
		}
	}
},
	{
		versionKey:false
	}
)

module.exports = Detailstmall = mongoose.model('Detailstmall',DetailsSchema)