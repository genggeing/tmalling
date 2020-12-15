// 微信支付
const tenpay = require('tenpay');

class Wxpay{
	constructor(appid='微信支付appid',mchid='微信支付账号',partnerKey='微信支付秘钥') {
	    this.appid = appid
		this.mchid = mchid
		this.partnerKey = partnerKey
	}
	
	// 微信支付配置
	Api(){
		const config = {
		  appid: this.appid,
		  mchid: this.mchid,
		  partnerKey: this.partnerKey,
		  notify_url:'http://www.qq.com',
		  spbill_create_ip: '127.0.0.1'
		}
		const api = new tenpay(config);
		return api
	}
	
	// 生成商户订单号
	Mon(){
		var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
		var maxPos = chars.length;
		var pwd = '';
		for(var i = 0; i < 32; i++){
			 pwd += chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return pwd
	}
	
	// 生成订单编号
	Code(){
		  var orderCode='';
		  for (var i = 0; i < 6; i++){ //6位随机数，用以加在时间戳后面。
			orderCode += Math.floor(Math.random() * 10);
		  }
		  orderCode = new Date().getTime() + orderCode;  //时间戳，用来生成订单号。
		  return orderCode;
	}
	
}

module.exports = Wxpay