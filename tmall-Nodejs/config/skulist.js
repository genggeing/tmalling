class Skulist{
	constructor(skuing) {
	    this.skuing = skuing
	}
	
	skuquery(){
		let arrdata = this.skuing.map(item=>{return {size:item.size,color:item.color,image:item.img}})
		// 数组对象去重:尺码
		let hashsize = {};
		const sizedata = arrdata.reduce((preVal, curVal) => {
		    hashsize[curVal.size] ? '' : hashsize[curVal.size] = true && preVal.push(curVal);
		    return preVal 
		}, [])
		// 数组对象去重:颜色
		let hashcolor = {};
		const colordata = arrdata.reduce((preVal, curVal) => {
		    hashcolor[curVal.color] ? '' : hashcolor[curVal.color] = true && preVal.push(curVal);
		    return preVal 
		}, [])
		// log(colordata)
		// 重组新数组:尺码
		let sizeing = sizedata.map(item=>{return item.size})
		// 重组新数组:颜色
		let coloring = colordata.map(item=>{return {color:item.color,image:item.image}})
		let dataing = [sizeing,coloring]
		return dataing
	}
}

module.exports = Skulist