// 支付成功，减少库存
class commStocks{
	constructor(orderfile,id,Detailfile,Sttrifile) {
	    this.orderfile = orderfile
		this.id = id
		this.Detailfile = Detailfile
		this.Sttrifile = Sttrifile
	}
	// 数据库自增自减
	async Pointer(){
			const data = await this.orderfile.find({_id:this.id})
			data[0].order.forEach(async item=>{
				// 销量自增
				await this.Detailfile.updateOne({id: item.id},{$inc:{"describe.sales_volume": item.many }})
				// 总库存自减
				await this.Detailfile.updateOne({id: item.id},{$inc:{"describe.Total_stock": -item.many }})
				// sku库存自减
				await this.Sttrifile.updateOne({id: item.id,color:item.color,size:item.size},{$inc:{stock: -item.many }})
			})
	}
}

module.exports = {commStocks}