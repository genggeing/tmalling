const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:注册功能字段
const CollectSchema = new Schema({
	// 注册对象模型
	openid:{
		type:String,
		require:true
	},
	goodid:{
		type:String,
		require:true
	}
},
	{
		versionKey:false
	}
)

module.exports = Collecttmall = mongoose.model('collecttmall',CollectSchema)