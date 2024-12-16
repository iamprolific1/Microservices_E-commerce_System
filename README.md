# **Microservices E-Commerce System**
## **Overview**

This is a scalable and modular e-commerce system built using a microservices architecture. It is designed to handle products, orders, users, and payments in a distributed manner. The system is implemented using **Node.js**, **MongoDB**, **RabbitMQ** for message queues, **Redis** for caching, and **Docker** for containerization.

## **Table Of Contents**
1. [Features]
2. [Technologies]
3. [Architecture]
4. [Installation]
5. [Services]
    -[Auth-Service]
    -[User-Service]
    -[Product-Service]
    -[Order-Service]
    -[Payment-Service]
6. [Redis Implentation]
7. [Running The Application]
8. [Contributing]
9. [License]

## **Features**
    - Scalable microservices architecture for easy scaling and maintenance.
    - **Products:** CRUD operations for managing products, including product recommendations.
    - **Orders:** Management of customer orders, status tracking, and notifications.
    - **Users:** User registration, authentication, and management.
    - **Payments:** Integration with payment gateways for processing transactions.
    - **Caching:** Redis caching for faster data retrieval and performance optimization.

## **Technologies**
    - Language: TypeScript
    - Node.js: JavaScript runtime for backend services.
    - MongoDB: database for storing user, product, order & payment data.
    - RabbitMQ: manages queues for communication between services.
    - Redis: In-memory data store for caching frequently accessed data.
    - Docker: Containerization for deployment.
    - Jest: Testing framework for unit and integration tests.

## **Architecture**
This e-commerce system uses **microservices architecture** where each service is responsible for a distinct part of the system. Communication between services is handled via RabbitMQ. The system is containerized using **Docker** for easy deployment and scalability.

## **Microservices Overview**
    - **Auth Service:** Manages general authentication as well as passing user information across other services, and integrating secured authentication & authorization using JWT.
    - **Products Service:** Manages the products catalog, including CRUD operations.
    - **Orders Service:** Handles order creation, status updates, and order history.
    - **Users Service:** Manages user accounts, registration, authentication, and profile data.
    - **Payments Service:** Integrates with external payment gateways for transaction processing.

## **Installation**
Follow these steps to set up the project locally:

1. Clone the repository:
    ```bash
        git clone https://github.com/iamprolific1/Microservices_E-commerce_System.git
        cd Microservices_E-commerce_System

2. Install dependencies for each services (e.g., products-service, orders-service, etc), navigate to the service folder and run:
    `npm install`

3. Set up environment variables: Create a **.env** file in each service folder and configure the required environment variables (e.g., database URI, Redis URL, RabbitMQ configurations).

4. Start the services using Docker: If Docker Compose is set up:
    `docker-compose up --build`

5. Alternatively, run each service locally using Node.js: 
    `npm start`

## **Services**

## **Product Service**
Manages the product catalog, including CRUD operations and dynamic recommendations.

- ### **Endpoints**
    - **GET /products**: Fetches a list of all products.
    - **GET /products/:id**: Fetches a specific product by ID.
    - **POST /products**: Creates a new product.
    - **PUT /products/:id**: Updates an existing product.
    - **DELETE /products/:id**: Deletes a product.

## **Order Service**
Manages customer orders, tracks their status, and handles notifications.

- ### **Endpoints**
    - **GET /orders**: Fetches a list of all orders.
    - **POST /orders**: Creates a new order.
    - **PUT /orders/:id**: Updates an existing order status.
    - **DELETE /orders/:id**: Deletes an order.
    - **GET /history/:userId**: Gets a list of the order history.
    - **POST /validate**: Validates an order.

## **User Service**
Handles user authentication and profile management.

- ### **Endpoints**
    - **POST /registerUser**: Registers a new user.
    - **POST /loginUser**: Authenticates a user.
    - **POST /refresh-token**: Refresh access token.
    - **GET /getAllUsers**: Fetches a list of all users.
    - **GET /getUser/:id**: Fetches a specific user by ID.
    - **PUT /updatedata/:id**: Update user profile.

## **Payment Service**
Handles payment processing and integrates with external payment gateways.

- ### **Endpoints**
    - **POST /create**: Processes a payment for an order.
    - **POST /verify**: Verify the status of a payment.

## **Redis Implementation**
Redis is used for caching to improve performance and reduce load on the database. It is implemented in the following ways:
- **Caching Product Data:** Frequently accessed product details (e.g., product lists or specific product info) are cached to reduce database queries.
- **Session Management:** Redis is used to store user sessions and authentication tokens for faster access.
- **Order Processing:** During the order checkout process, temporary order data is cached in Redis to ensure a smooth user experience and reduce database dependency.

## **Example Usage**
**Setting Up Redis**
Ensure Redis is installed and running. You can use Docker to run Redis:
`docker run -d --name redis -p 6379:6379 redis`

**Code Example:**
Here is a sample implementation in Node.js:
```bash
    import { createClient } from "redis";
    import dotenv from 'dotenv';
    dotenv.config();

    const redisClient = createClient({
        password: process.env.REDIS_CLIENT_PASSWORD,
        socket: {
            host: process.env.REDIS_CLIENT_HOST,
            port: process.env.REDIS_CLIENT_PORT as number | undefined,
        },
    });

    const initializeRedis = async()=> {
        try{
            if(!redisClient.isOpen) {
                await redisClient.connect();
                console.log("Connected to redis");
            }
        } catch(error) {
            console.error("Error connecting to redis: ", error);
        }
    }

    initializeRedis();

    redisClient.on('error', (err)=> console.error('Redis Error: ', err));

    # caching product data
    app.get('/products/:id', async(req: Request, res: Response)=> {
        try{
             const cacheData = await redisClient.get(`product:${req.params.id}`);
            if(cacheData) {
                res.status(200).json({
                    message: "Product retrieved from cache",
                    product: JSON.parse(cacheData)
                });
                return;
            }
            
            const product = await Product.findById(req.params.id); # fetch product by ID
            if (!product) {
                res.status(404).json({ message: 'Product not found' });
                return;
            }
            // cache the data if found
            await redisClient.setEx(`product:${req.params.id}`, 360, JSON.stringify(product));
            res.status(200).json({ message: "Product with specified ID retrieved successfully", product });
            return;
        } catch (error) {
            console.error("Error retrieving product by ID: ", error);
            res.status(500).json({ message: "Internal server error" });
            return;
        }
    })
```

## **Redis Configuration in .env**
```bash
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_CLIENT_PASSWORD= # this should be used only if you're using an online redis client
```

## **Running The Application**
To run the entire application, ensure all services are up and running using Docker or independently on your local machine.
- Use **Docker Compose** to bring up the full system:
    `docker-compose up --build`
- Alternatively, start each service manually (ensure dependencies like RabbitMQ, Redis, and MongoDB are set up):
    `npm start`

## **Contributing**
Contributions are highly welcomed. To contribute to this project:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -am "Add new feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Create a new pull request.

Please ensure your code follows the existing coding style and is well-documented.