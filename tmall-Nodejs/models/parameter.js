const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:商品sku
const ParameterSchema = new Schema({
	id:{
		type:String,
		require:true
	},
	label:{
		type:String,
		require:true
	},
	title:{
		type:String,
		require:true
	}
},
	{
		versionKey:false
	}
)

module.exports = Parametertmall = mongoose.model('Parametertmall',ParameterSchema)