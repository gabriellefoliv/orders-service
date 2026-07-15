// Publish x Subscribe (com adição de idempotência e DLQ no catch error)

import { orders } from "./channels/orders.ts";
import { db } from "../db/client.ts";
import { schema } from "../db/schema/index.ts";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { OrderCreatedMessage } from "../../../contracts/messages/order-created-message.ts";

orders.consume('orders.created', async message => {
    if (!message) {
        return null
    }

    try {
        const data = JSON.parse(message.content.toString()) as OrderCreatedMessage

        console.log(`[Worker] Recebido pedido: ${data.orderId}`)

        const existingInvoice = await db.query.invoices.findFirst({
            where: eq(schema.invoices.orderId, data.orderId)
        })

        if (existingInvoice) {
            console.log(`[Worker] Invoice já existe para o pedido: ${data.orderId}. Ignorando...`)
            orders.ack(message)
            return
        }

        await db.insert(schema.invoices).values({
            id: randomUUID(),
            orderId: data.orderId,
        })

        console.log(`[Worker] Invoice criada com sucesso para o pedido: ${data.orderId}`)
        orders.ack(message)
    } catch (error) {
        console.error('[Worker] Erro ao processar mensagem, indo para DLQ', error)
        orders.nack(message, false, false)
    }
}, {
    noAck: false,
})

// acknowledge => reconhecer => dizer que a mensagem foi recebida com sucesso
// não quero que isso aconteça automaticamente, eu quero ter esse controle