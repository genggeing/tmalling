const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模板:商品sku
const RecommendSchema = new Schema({
	title:{
		type:String,
		require:true
	},
	lable:{
		type:String,
		require:true
	},
	image:[
		{
			img:{
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

module.exports = Recommendtmall = mongoose.model('Recommendtmall',RecommendSchema)