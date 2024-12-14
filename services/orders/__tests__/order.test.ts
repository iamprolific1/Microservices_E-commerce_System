// import request from "supertest";
// import nock from "nock";
// import { app } from "../src/server";
// import mongoose from "mongoose";
// import { Order } from "../src/models/Order";
// import dotenv from "dotenv";
// import axios from "axios";

// jest.mock("axios");

// dotenv.config({ path: ".env.test" });

// // mock the authenticate middleware
// jest.mock('../src/middlewares/authMiddleware', () => {
//     return {
//         authenticate: jest.fn().mockImplementation((req, res, next) => {
//             req.user = { id: 'test-user-id' };
//             next();
//         })
//     };
// });

// beforeAll(async () => {
//     await mongoose.connect("mongodb://localhost:27017/test");
// });

// afterEach(async () => {
//     await Order.deleteMany({});
//     nock.cleanAll();
// });

// afterAll(async () => {
//     await mongoose.disconnect();
// });

// jest.setTimeout(10000);

// describe('Order API test endpoints', () => {
//     it('should create an order', async () => {
//         // Step 1: Create a product

//         const loginResponse = await request(process.env.USER_SERVICE_LOGIN_URL as string)
//             .post('/api/auth/loginUser')
//             .send({
//                 email: "test@email.com",
//                 password: "password123"
//             })

//         const accessToken = loginResponse.body.accessToken;

//         const product = await request(process.env.PRODUCT_SERVICE_URL as string).post('/api/products/create').send({
//             name: 'test-product',
//             description: 'test-description',
//             price: 1000,
//             category: 'test-category',
//             stock: 2,
//             images: ['test-product-image-1', 'test-product-image-2'],
//         }).set('Authorization', `Bearer ${accessToken}`);
//         console.log(product.body)

//         const productID = product.body.product._id;

//         // Step 2: Create an order

//         const res = await request(app).post('/api/orders/create').send({
//             items: [
//                 { productId: productID, quantity: 2, price: 2000 }
//             ],
//             totalAmount: 2000
//         }).set('Authorization', `Bearer ${accessToken}`);
//         expect(res.status).toBe(201);
//         expect(res.body).toHaveProperty('message', 'Order created successfully');
//         // Step 3: Validate the order.
//     });
// });


// I have been really having a tough time writing a test file for this order-service, so I would appreciate any help. Thank you very much 😊