const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:卡片商品
const AddressSchema = new Schema({
	city:{
		type:String,
		require:true
	},
	address:{
		type:String,
		require:true
	},
	name:{
		type:String,
		require:true
	},
	mobile:{
		type:String,
		require:true
	},
	openid:{
		type:String,
		require:true
	}
},
	{
		versionKey:false
	}
)

module.exports = Addresstmall = mongoose.model('addresstmall',AddressSchema)