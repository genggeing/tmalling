const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:注册功能字段
const BannerSchema = new Schema({
	// 注册对象模型
	image:{
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

module.exports = Bannertmall = mongoose.model('bannertmall',BannerSchema)