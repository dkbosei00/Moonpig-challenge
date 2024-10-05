import * as request from 'supertest'
import { app } from '../server'

test('returns matching card title', async () => {
  const response = await request(app).get('/cards/card001')

  expect(response.status).toBe(200)
  expect(response.body).toEqual(expect.objectContaining({
    title: 'card 1 title',
  }))
})

test('returns null value for size and base price when there is no sizeId', async () => {
  const response = await request(app).get('/cards/card001')

  expect(response.status).toBe(200)
  expect(response.body).toEqual(expect.objectContaining({
    size: null,
    price: "£2.00"
  }))
})

test('returns "Size does not exist" value for size for invalid sizeId', async () => {
  const response = await request(app).get('/cards/card001/abc')

  expect(response.status).toBe(200)
  expect(response.body).toEqual(expect.objectContaining({
    size: "Size does not exist",
  }))
})


test('returns error 404 for invalid Card ID', async () => {
  const response = await request(app).get('/cards/card008')

  expect(response.status).toBe(404)
  expect(response.body).toEqual(expect.objectContaining({
    message: "Card Not Found",
  }))
})

