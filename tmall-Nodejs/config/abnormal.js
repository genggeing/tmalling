// 自定义异常处理中间件
const result = require('./resultdata.js')

 let abnormal = async(ctx,next)=>{
	 try{
	 	await next()
	 }catch(err){
		 console.log('捕获到异常')
		 const isresult = err instanceof result
		 if(isresult){
			 console.log('已知错误')
			 console.log(err)
			 ctx.body = {
				 msg:err.msg
			 }
			 ctx.status = err.code
		 }
		 else{
			 console.log('未知错误')
			 console.log(err)
			 if(err.field){
				 ctx.body = {
				 	 msg:'图片参数不正确'
				 }
				 ctx.status = 400
				 return false
			 }
			 // _id出现错误
			 if(err.kind == 'ObjectId' && err.path == '_id'){
				 ctx.body = {
				 	 msg:'_id字段不正确'
				 }
				 ctx.status = 400
				 return false
			 }
			 ctx.body = {
			 	 msg:'服务器发生错误'
			 }
			 ctx.status = 500
		 }
	 	//TODO handle the exception
	 }
 }
 
 module.exports = abnormal