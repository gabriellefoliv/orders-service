import { fastify } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { schema } from '../db/schema/index.ts';
import { db } from '../db/client.ts';
import { dispatchOrderCreated } from '../broker/messages/order-created.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.get('/health', () => {
    return 'Ok'
})

app.post('/orders', {
    schema: {
        body: z.object({
            amount: z.coerce.number(),
        })
    }
}, async (request, reply) => {
    const { amount } = request.body

    console.log('Creating an order with amount: ', amount)

    const orderId = randomUUID()

    dispatchOrderCreated({
        orderId,
        amount,
        customer: {
            id: '9d1afddd-5660-4f57-a3f4-fe83d5d97eda',
        }
    })

    await db.insert(schema.orders).values({
        id: randomUUID(),
        customerId: '9d1afddd-5660-4f57-a3f4-fe83d5d97eda',
        amount,
    })
    
    return reply.status(201).send()
})

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
    console.log("[Orders] HTTP Server Running")
})