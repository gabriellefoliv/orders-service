import '@opentelemetry/auto-instrumentations-node/register'

import { fastify } from 'fastify';
import { randomUUID } from 'node:crypto';
import {setTimeout} from 'node:timers/promises';
import { z } from 'zod'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { schema } from '../db/schema/index.ts';
import { db } from '../db/client.ts';
import { dispatchOrderCreated } from '../broker/messages/order-created.ts';
import { trace } from '@opentelemetry/api';
import { tracer } from '../tracer/tracer.ts';

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

    
    await db.insert(schema.orders).values({
        id: randomUUID(),
        customerId: '9d1afddd-5660-4f57-a3f4-fe83d5d97eda',
        amount,
    })

    
    const span = tracer.startSpan('eu acho que aqui ta dando merda')
    
    span.setAttribute('teste', 'hello world')

    await setTimeout(2000)
    
    span.end()

    trace.getActiveSpan()?.setAttribute('order_id', orderId)
    
    dispatchOrderCreated({
        orderId,
        amount,
        customer: {
            id: '9d1afddd-5660-4f57-a3f4-fe83d5d97eda',
        }
    })

    return reply.status(201).send()
})

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
    console.log("[Orders] HTTP Server Running")
})