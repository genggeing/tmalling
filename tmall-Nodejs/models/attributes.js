const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:商品sku
const SttriSchema = new Schema({
	id:{
		type:String,
		require:true
	},
	checked:{
		type:Boolean,
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
	img:{
		type:String,
		require:true
	},
	Price:{
		type:Number,
		require:true
	},
	stock:{//库存
		type:Number,
		require:true
	}
},
	{
		versionKey:false
	}
)

module.exports = Sttritmall = mongoose.model('Sttritmall',SttriSchema)