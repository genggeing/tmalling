const multer = require('@koa/multer')
const OSS = require('ali-oss');


let client = new OSS({
  endpoint: '绑定阿里云oss的域名',
  accessKeyId: '阿里云accessKeyId',
  accessKeySecret: '阿里云accessKeySecret',
  bucket: '阿里云上传文件名称',
  cname:true
});

// 配置上传的文件目录及文件名
const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'public/uploads/')
    },
    filename:(req, file, cb)=>{
        let fileFormat = (file.originalname).split(".")
		// 时间戳Date.now():1970-1-1-00:00:00到现在的毫秒数
		let num = `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}${"."}${fileFormat[fileFormat.length -1]}`
		cb(null,num)
    }
})

//上传图片到oss
let checkpoint;
let uploadimg = function(image){
	return new Promise((resolve,reject)=>{
		client.put('tianmao/' + image,image)
		.then((res)=>{
			resolve(res.url)
		})
		.catch((err)=>{
			reject(err)
		})
	})
}

// 等待多图上传到oss完毕
let multigraph = function(filesimg){
	var imgfileID = []
	return new Promise((resolve,reject)=>{
		filesimg.forEach(async item=>{
			let img = await uploadimg(item.path)
			// log(img)
			imgfileID.push(img)
			// console.log(imgfileID)
			// 判断数组里图片是否和用户上传的图片一样多
			if(imgfileID.length == filesimg.length){
				resolve(imgfileID)
			}
		})
	})
}

const upload = multer({storage})


module.exports = {upload,uploadimg,multigraph}