const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:商品分类字段
const ClassdataSchema = new Schema({
	// 注册对象模型
	sort:{
		type:String,
		require:true
	},
	cid:{
		type:String,
		require:true
	},
	secon_classif:[
		{
			name:{
				type:String,
				require:true
			},
			name_image:{
				type:String,
				require:true
			}
		}
	]
},
	{
		versionKey:false
	}
)

module.exports = Classtmall = mongoose.model('classtmall',ClassdataSchema)