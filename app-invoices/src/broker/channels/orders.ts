import { broker } from '../broker.ts'

export const orders = await broker.createChannel()

await orders.assertExchange('dlx', 'direct', { durable: true })
await orders.assertQueue('orders.created.dlq', { durable: true })
await orders.bindQueue('orders.created.dlq', 'dlx', 'orders.created')

await orders.assertQueue('orders.created', {
    durable: true,
    arguments: {
        'x-dead-letter-exchange': 'dlx',
        'x-dead-letter-routing-key': 'orders.created'
    }
})