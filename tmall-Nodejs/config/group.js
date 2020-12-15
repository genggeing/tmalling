// 不固定数组对象上传
class Group{
	constructor(arr,model) {
	    this.arr = arr
		this.model = model
	}
	
	arraying(){
		let imgfileID = []
		return new Promise((resolve,reject)=>{
			this.arr.forEach(async item=>{
				const datas = await new this.model(item).save()
				imgfileID.push(datas)
				if(imgfileID.length == this.arr.length){
					resolve(imgfileID)
				}
			})
		})
	}
}

module.exports = {Group}