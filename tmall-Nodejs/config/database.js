// 操作数据库增删改查
const initdata = require('./init.js')
class Operation{
	constructor(ctx,model,field){
		this.ctx = ctx
	    this.model = model
		this.field = field
	}
	
	// 增
	async increase(){
		try{
			const datas = await new this.model(this.field).save()
			new initdata(this.ctx).correct()
			return datas
		}catch(e){
			console.log(e)
			new initdata(this.ctx).mistake('提交失败',500)
		}
	}
	
	// 删除
	async delete(){
		try{
			await this.model.findOneAndRemove({_id:this.field})
			new initdata(this.ctx).correct()
		}catch(e){
			new initdata(this.ctx).mistake('删除失败',500)
		}
	}
}

module.exports = {Operation}