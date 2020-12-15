// 获取解密token
var basicAuth = require('basic-auth')
// token
const jwt = require('jsonwebtoken');
// token过期时间
const security = require('./tokentime.js').security
// 响应接收
const result = require('../config/resultdata.js')

class Auth{
	constructor(name='') {
	    this.name = name
	}
	
	get m(){
		return async(ctx,next)=>{
			const token = basicAuth(ctx.req)
			if(!token || !token.name){
				throw new result({errcode:'401',msg:'没有访问权限'},401)
			}
			try{
				var authcode = jwt.verify(token.name,security.secretkey)
			}catch(error){
				console.log(error)
				if(error.name == 'TokenExpiredError'){
					if(this.name == 'coll'){
						throw new result({errcode:'302',collects:0,msg:'token过期,收藏默认未收藏状态'},302)
					}
					throw new result({errcode:'401',msg:'token过期'},401)
				}
				if(this.name == 'coll'){
					throw new result({errcode:'302',collects:0,msg:'未登录,收藏默认未收藏状态'},302)
				}
				throw new result({errcode:'401',msg:'没有访问权限'},401)
			}
			
			ctx.auth = {
				uid:authcode.uid,
				scope:authcode.scope
			}
			await next()
		}
	}
}

module.exports = {Auth}