import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/server';
import { User } from '../src/models/User';
import { generateAccessToken, generateRefreshToken } from '../src/utils/generateToken';
import bcrypt from 'bcrypt';

beforeAll(async()=> {
    await mongoose.connect('mongodb://localhost:27017/test');
});

afterEach(async()=> {
    await User.deleteMany({});
});

afterAll(async()=> {
    await mongoose.disconnect();
});

describe('User API Endpoint', ()=> {
    it('should register a user', async()=> {
        const hashedPassword = await bcrypt.hash("password123", 10);
        const res = await request(app).post('/api/auth/registerUser').send({
            name: "test-name",
            email: "test@email.com",
            password: hashedPassword
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'User is created successfully!');
    });

    it('should not register user with an existing email', async()=> {
        const hashedPassword = await bcrypt.hash("password123", 10);
        await User.create({
            name: "test-name",
            email: "test@email.com",
            password: hashedPassword
        });

        const res = await request(app).post('/api/auth/registerUser').send({
            name: "test-name",
            email: "test@email.com",
            password: hashedPassword
        });
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message', 'User already exist');
    });

    it('should authenticate user', async()=> {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            name: "test-name",
            email: "test@email.com",
            password: hashedPassword
        })
        const res = await request(app).post('/api/auth/loginUser').send({
            email: 'test@email.com',
            password: 'password123'
        })
        generateAccessToken(user);
        generateRefreshToken(user);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'User authenticated successfully');
    });

    it('should refresh access token', async()=> {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            name: "test-name",
            email: "test@email.com",
            password: hashedPassword
        })

        await request(app).post('/api/auth/loginUser').send({
            email: 'test@email.com',
            password: 'password123'
        })
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const res = await request(app).post('/api/auth/refresh-token')
            .send({ token: refreshToken })
            .set('Authorization', `Bearer ${accessToken}`)

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Access token refreshed successfully');
    });

    it('should get all users from the database', async()=> {
        await User.create({
            name: "user1",
            email: "user1@email.com",
            password: await bcrypt.hash('password123', 10),
            role: "User"
        });

        await User.create({
            name: "user2",
            email: "user2@email.com",
            password: await bcrypt.hash('password124', 10),
            role: 'User'
        });

        const admin = await User.create({
            name: 'test-admin',
            email: 'admin@email.com',
            password: await bcrypt.hash('admin123', 10),
            role: 'Admin'
        });

        await request(app).post('/api/auth/loginUser').send({
            email: 'admin@email.com',
            password: await bcrypt.hash('admin123', 10)
        });
        const accessToken = generateAccessToken(admin);
        const refreshToken = generateRefreshToken(admin);

        const res = await request(app).get('/api/auth/getAllUsers').set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Users data retrieved successfully');
    });

    it('should get user by ID', async()=> {
        const user = await User.create({
            name: 'test-name',
            email: 'test@email.com',
            password: await bcrypt.hash('password123', 10)
        })

        const admin = await User.create({
            name: 'test-admin',
            email: 'testadmin@email.com',
            password: await bcrypt.hash('admin123', 10),
            role: 'Admin'
        })

        const token = generateAccessToken(admin);

        const res = await request(app).get(`/api/auth/getUser/${user._id}`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'User with specified ID found');
    });

    it('should update user data', async()=> {
        const user = await User.create({
            name: 'test-name',
            email: 'test@email.com',
            password: await bcrypt.hash('password123', 10)
        })

        const admin = await User.create({
            name: 'test-admin',
            email: 'testadmin@email.com',
            password: await bcrypt.hash('admin123', 10),
            role: 'Admin'
        })

        const token = generateAccessToken(admin);
        const res = await request(app).post(`/api/auth/updatedata/${user._id}`)
            .send({
                name: 'update-testuser',
                email: 'update-test@email.com'
            }).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'User data updated successfully')
    })
})