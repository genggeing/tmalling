//评论标签
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:评论标签
const CommifSchema = new Schema({
	label:{
		type:String,
		require:true
	},
	num:{
		type:Number,
		require:true
	},
	commid:{
		type:String,
		require:true
	}
},
	{
		versionKey:false
	}
)

module.exports = Commclassif = mongoose.model('commclassif',CommifSchema)