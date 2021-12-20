const order = require('../../../models/order')
const moment= require('moment')
function AdminOrderController () {
    return{
        index(req,res){
            // Validate request
            order.find({status:{$ne: 'completed'}},
             null,
             {sort:{'createdAt': -1 }}).populate('customerId','-password').exec((err,orders)=>{
                 if(req.xhr){
                     res.json(orders)
                 } else{
                     return res.render('admin/orders')
                 }
            })
     
    }
    }
}
module.exports=AdminOrderController