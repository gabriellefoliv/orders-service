import { describe, it, expect, beforeAll } from 'vitest'
import { db } from '../src/db/client.ts'
import { schema } from '../src/db/schema/index.ts'

describe('Orders API E2E', () => {

  beforeAll(async () => {
    await db.insert(schema.customers)
      .values({
        id: '9d1afddd-5660-4f57-a3f4-fe83d5d97eda',
        name: 'Usuário de Teste de Oliveira',
        email: 'teste@teste.com',
        address: 'Avenida Testando',
        state: 'RJ',
        zipCode: '00000000',
        country: 'BR',
        dateOfBirth: new Date('2004-12-28')
      })
      .onConflictDoNothing()
  })

  it('should create an order successfully', async () => {
    const payload = {
      amount: 250,
    }

    const response = await fetch('http://localhost:3335/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    expect(response.status).toBe(201)
  })

  it('should reject invalid payloads', async () => {
    const payload = {
      amount: 'isso-nao-e-um-numero',
    }

    const response = await fetch('http://localhost:3335/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    expect(response.status).toBe(400)
  })
})
