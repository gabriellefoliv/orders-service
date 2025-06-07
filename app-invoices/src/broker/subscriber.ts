// Publish x Subscribe

import { orders } from "./channels/orders.ts";

orders.consume('orders', async message => {
    if (!message) {
        return null
    }
    
    console.log(message?.content.toString())

    orders.ack(message)
}, {
    noAck: false,
})

// acknowledge => reconhecer => dizer que a mensagem foi recebida com sucesso
// não quero que isso aconteça automaticamente, eu quero ter esse controle