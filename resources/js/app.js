import axios from 'axios';
import session from 'express-session';
import { Notyf } from 'notyf';
import {initAdmin} from './admin'
import moment from 'moment';



let addToCart=document.querySelectorAll('.add-to-cart');
let cartCounter=document.querySelector('#cartCounter')


function updateCart(pizza){
    axios.post('/update-cart',pizza).then(res =>{
        
      
        cartCounter.innerText = res.data.totalQty
    })
}

addToCart.forEach((btn)=>{
    btn.addEventListener('click',(e)=>{
        
        let pizza=JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
        
        var notyf = new Notyf();
        notyf.success({
            message:'added to cart !',
            duration: 1000,
            progressBar:false,
            position: {
              x: 'right',
              y: 'top',
            },
        })
    
})
})

// Remove alert message after x seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
    setTimeout(()=>{
        alertMsg.remove()
    },2000)
    
}



// Change order status
let statuses = document.querySelectorAll(".status_line")


let hiddenInput=document.querySelector('#hiddenInput')

let order=hiddenInput ? hiddenInput.value : null
order= JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order){
    statuses.forEach((status)=>{
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted =true;
    statuses.forEach((status )=>{
        let dataProp = status.dataset.status;
        if(stepCompleted){
            status.classList.add('step-completed')
        }
        if(dataProp===order.status){
            stepCompleted=false;
            time.innerText=moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if(status.nextElementSibling){
            status.nextElementSibling.classList.add('current')
            }
        }
    })
}

updateStatus(order);

// Socket
let socket=io()
if(window.location.pathname.includes('admin')){
initAdmin(socket);
}
if(order){
socket.emit('join',`order_${order._id}`)
// order_skdhkfhkfhggk
}

let adminAreaPath= window.location.pathname
//console.log(adminAreaPath)
if(adminAreaPath.includes('admin')){
    socket.emit('join','adminRoom')
}

socket.on('orderUpdated',(data)=>{
    const updatedOrder={...order}
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status= data.status
    updateStatus(updatedOrder)
    var notyf = new Notyf();
    notyf.success({
        message:'order updated !',
        duration: 1000,
        progressBar:false,
        position: {
          x: 'right',
          y: 'top',
        },
    })
})
