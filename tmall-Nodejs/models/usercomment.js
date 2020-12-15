// 用户评论内容
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:用户评论内容
const UsercommSchema = new Schema({
	commid:{
		type:String,
		require:true
	},
	label:{
		type:String,
		require:true
	},
	isimg:{//是否有评论图片
		type:Boolean,
		default: false
	},
	nickName:{
		type:String,
		require:true
	},
	avatarUrl:{
		type:String,
		require:true
	},
	time:{
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
	text:{
		type:String,
		require:true
	},
	image:{
		type:[String],
		required:true
	}
},
	{
		versionKey:false
	}
)

module.exports = Usercomment = mongoose.model('usercomment',UsercommSchema)