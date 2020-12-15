const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:卡片商品
const ProductsSchema = new Schema({
	image:{
		type:String,
		require:true
	},
	title:{
		type:String,
		require:true
	},
	freight:{
		type:String,
		require:true
	},
	Duration:{
		type:Number,
		require:true
	},
	classif:{
		type:String,
		require:true
	},
	cid:{
		type:String,
		require:true
	},
	Price:{
		type:Number,
		require:true
	},
	sales_volume:{
		type:Number,
		default: 0
	}
},
	{
		versionKey:false
	}
)

module.exports = Productstmall = mongoose.model('productstmall',ProductsSchema)