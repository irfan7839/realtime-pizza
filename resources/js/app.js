import axios from 'axios';
import session from 'express-session';
import { Notyf } from 'notyf';
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