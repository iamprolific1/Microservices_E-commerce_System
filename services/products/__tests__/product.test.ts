import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/server";
import { Product } from "../src/models/Product";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

// mock the authenticate middleware
jest.mock('../src/middlewares/authMiddleware', ()=> {
    return {
        authenticate: jest.fn().mockImplementation((req, res, next) => {
            req.user = { id: 'test-user-id' };
            next();
        })
    }
})
beforeAll(async()=> {
    await mongoose.connect("mongodb://localhost:27017/test");
});

afterEach(async()=> {
    await Product.deleteMany({});
});

afterAll(async()=> {
    await mongoose.disconnect();
})

describe('Product API test Endpoints', ()=> {
    it('should create a product', async()=> {
        // log the user in first before making request to the product API
        const loginResponse = await request(process.env.USER_SERVICE_LOGIN_URL as string)
            .post('/api/auth/loginUser')
            .send({
                email: "test@email.com",
                password: "password123"
            })
        
        const accessToken = loginResponse.body.accessToken;

        const res = await request(app).post('/api/products/create').send({
            name: 'test-product',
            description: 'test-description',
            price: 1000,
            category: 'test-category',
            stock: 2,
            images: ['test-product-image-1', 'test-product-image-2'],
        }).set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'Product created successfully');
    });

    it('should get all products', async()=> {
        const loginResponse = await request(process.env.USER_SERVICE_LOGIN_URL as string)
            .post('/api/auth/loginUser')
            .send({
                email: "test@email.com",
                password: "password123"
            })
        
        const accessToken = loginResponse.body.accessToken;

        await request(app).post('/api/products/create').send({
            name: 'test-product',
            description: 'test-description',
            price: 1000,
            category: 'test-category',
            stock: 2,
            images: ['test-product-image-1', 'test-product-image-2'],
        }).set('Authorization', `Bearer ${accessToken}`);

        await request(app).post('/api/products/create').send({
            name: 'test-product',
            description: 'test-description',
            price: 9000,
            category: 'test-category',
            stock: 8,
            images: ['test-product-image-3', 'test-product-image-4'],
        }).set('Authorization', `Bearer ${accessToken}`);


        const res = await request(app).get('/api/products/').set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Products retrieved successfully')
    });

    it('should get a product by ID', async()=> {
        const loginResponse = await request(process.env.USER_SERVICE_LOGIN_URL as string)
            .post('/api/auth/loginUser')
            .send({
                email: "test@email.com",
                password: "password123"
            })
        
        const accessToken = loginResponse.body.accessToken;

        const product = await request(app).post('/api/products/create').send({
            name: 'test-product',
            description: 'test-description',
            price: 1000,
            category: 'test-category',
            stock: 2,
            images: ['test-product-image-1', 'test-product-image-2'],
        }).set('Authorization', `Bearer ${accessToken}`);

        const productId = product.body.product._id;

        const res = await request(app).get(`/api/products/${productId}`).set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Product with specified ID retrieved successfully');
    });

    it('should update a product with specified ID', async()=> {
        const loginResponse = await request(process.env.USER_SERVICE_LOGIN_URL as string)
            .post('/api/auth/loginUser')
            .send({
                email: "test@email.com",
                password: "password123"
            })
        
        const accessToken = loginResponse.body.accessToken;

        const product = await request(app).post('/api/products/create').send({
            name: 'test-product',
            description: 'test-description',
            price: 1000,
            category: 'test-category',
            stock: 2,
            images: ['test-product-image-1', 'test-product-image-2'],
        }).set('Authorization', `Bearer ${accessToken}`);

        const productId = product.body.product._id;

        const res = await request(app).put(`/api/products/${productId}`).send({
                name: 'test-product-name-update',
                description: 'test-product-description-update',
                price: 3000
            }).set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Product updated successfully');
    });

    it('should delete a product with specified ID', async()=> {
        const loginResponse = await request(process.env.USER_SERVICE_LOGIN_URL as string)
            .post('/api/auth/loginUser')
            .send({
                email: "test@email.com",
                password: "password123"
            })
        
        const accessToken = loginResponse.body.accessToken;

        const product = await request(app).post('/api/products/create').send({
            name: 'test-product',
            description: 'test-description',
            price: 1000,
            category: 'test-category',
            stock: 2,
            images: ['test-product-image-1', 'test-product-image-2'],
        }).set('Authorization', `Bearer ${accessToken}`);

        const productId = product.body.product._id;

        const res = await request(app).delete(`/api/products/${productId}`).set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Product deleted successfully');
    })
})