const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const writerPassword = await bcrypt.hash('writer123', 10);
  const readerPassword = await bcrypt.hash('reader123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@devinsights.com' },
    update: {},
    create: {
      email: 'admin@devinsights.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      bio: 'Platform administrator and tech enthusiast',
      avatar: 'https://via.placeholder.com/150'
    }
  });

  const writer = await prisma.user.upsert({
    where: { email: 'writer@devinsights.com' },
    update: {},
    create: {
      email: 'writer@devinsights.com',
      password: writerPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'WRITER',
      bio: 'Senior Full-Stack Developer with 8+ years of experience',
      avatar: 'https://via.placeholder.com/150'
    }
  });

  const reader = await prisma.user.upsert({
    where: { email: 'reader@devinsights.com' },
    update: {},
    create: {
      email: 'reader@devinsights.com',
      password: readerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'READER',
      bio: 'Aspiring developer learning web technologies'
    }
  });

  // Create sample posts
  const posts = [
    {
      title: 'Building Scalable Microservices with Node.js',
      slug: 'building-scalable-microservices-nodejs',
      excerpt: 'Learn how to design and implement microservices architecture using Node.js, Docker, and Kubernetes.',
      content: `
# Building Scalable Microservices with Node.js

Microservices architecture has become the de facto standard for building modern, scalable applications. In this comprehensive guide, we'll explore how to build microservices using Node.js.

## What Are Microservices?

Microservices are an architectural approach where applications are built as a collection of small, independent services that communicate through APIs.

## Key Benefits

- **Scalability**: Scale individual services independently
- **Flexibility**: Use different technologies for different services
- **Resilience**: Failure in one service doesn't bring down the entire system
- **Fast Development**: Teams can work on services independently

## Getting Started

### 1. Service Design

Start by identifying bounded contexts in your application. Each microservice should have a single responsibility.

### 2. Communication Patterns

Choose between synchronous (REST, gRPC) or asynchronous (message queues) communication based on your needs.

### 3. Data Management

Each microservice should own its database to maintain independence.

## Best Practices

- Implement health checks and monitoring
- Use API gateways for routing
- Implement circuit breakers for resilience
- Use containerization (Docker) for deployment
- Implement proper logging and tracing

## Conclusion

Microservices architecture provides flexibility and scalability but comes with complexity. Start small and evolve your architecture as needed.
      `,
      coverImage: 'https://via.placeholder.com/800x400',
      status: 'PUBLISHED',
      publishedAt: new Date('2024-01-15'),
      tags: ['Node.js', 'Microservices', 'Architecture', 'Docker'],
      readTime: 8,
      metaTitle: 'Building Scalable Microservices with Node.js - DevInsights',
      metaDesc: 'Complete guide to designing and implementing microservices architecture using Node.js, Docker, and Kubernetes.',
      authorId: writer.id
    },
    {
      title: 'Understanding React Server Components',
      slug: 'understanding-react-server-components',
      excerpt: 'Deep dive into React Server Components and how they revolutionize server-side rendering in modern React applications.',
      content: `
# Understanding React Server Components

React Server Components represent a paradigm shift in how we build React applications. Let's explore this powerful feature.

## What Are Server Components?

Server Components are React components that run exclusively on the server, reducing JavaScript bundle size and improving performance.

## Key Advantages

- **Zero Bundle Size**: Server components don't add to client-side JavaScript
- **Direct Backend Access**: Query databases directly without APIs
- **Better Performance**: Reduced client-side processing
- **Automatic Code Splitting**: Only necessary code is sent to the client

## How They Work

Server Components render on the server and stream HTML to the client. They can fetch data, access backend resources, and render UI without client-side JavaScript.

## Client vs Server Components

### Server Components
- Run on the server only
- Can access backend resources directly
- Don't have access to browser APIs
- Cannot use hooks like useState or useEffect

### Client Components
- Run on both server (for SSR) and client
- Have access to browser APIs
- Can use all React hooks
- Marked with 'use client' directive

## Best Practices

- Use Server Components by default
- Move interactivity to Client Components
- Keep Client Components small and focused
- Compose Server and Client Components thoughtfully

## Conclusion

React Server Components offer a new way to build faster, more efficient React applications by leveraging server-side rendering capabilities.
      `,
      coverImage: 'https://via.placeholder.com/800x400',
      status: 'PUBLISHED',
      publishedAt: new Date('2024-01-20'),
      tags: ['React', 'Server Components', 'Frontend', 'Performance'],
      readTime: 6,
      metaTitle: 'Understanding React Server Components - DevInsights',
      metaDesc: 'Learn about React Server Components and how they improve performance and developer experience.',
      authorId: writer.id
    },
    {
      title: 'PostgreSQL Performance Optimization Tips',
      slug: 'postgresql-performance-optimization',
      excerpt: 'Essential techniques to optimize PostgreSQL database performance for production applications.',
      content: `
# PostgreSQL Performance Optimization Tips

Database performance is crucial for application success. Here are proven techniques to optimize PostgreSQL.

## Indexing Strategies

### 1. B-Tree Indexes
The most common index type, perfect for equality and range queries.

### 2. Partial Indexes
Index only rows that match specific conditions to reduce index size.

### 3. Composite Indexes
Create indexes on multiple columns for complex queries.

## Query Optimization

### Use EXPLAIN ANALYZE
Always analyze query execution plans to identify bottlenecks.

### Avoid SELECT *
Only select columns you need to reduce data transfer.

### Use Connection Pooling
Reuse database connections to reduce overhead.

## Configuration Tuning

- **shared_buffers**: Set to 25% of RAM
- **effective_cache_size**: Set to 50-75% of RAM
- **work_mem**: Adjust based on concurrent connections
- **maintenance_work_mem**: Increase for faster maintenance operations

## Vacuum and Analyze

Regular VACUUM operations prevent table bloat and maintain performance. Use ANALYZE to keep query planner statistics up to date.

## Monitoring

- Monitor slow queries
- Track index usage
- Watch for table bloat
- Monitor connection pool stats

## Conclusion

PostgreSQL performance optimization is an ongoing process. Monitor, measure, and iterate to achieve optimal performance.
      `,
      coverImage: 'https://via.placeholder.com/800x400',
      status: 'PUBLISHED',
      publishedAt: new Date('2024-01-25'),
      tags: ['PostgreSQL', 'Database', 'Performance', 'Optimization'],
      readTime: 7,
      metaTitle: 'PostgreSQL Performance Optimization Tips - DevInsights',
      metaDesc: 'Essential techniques and best practices for optimizing PostgreSQL database performance.',
      authorId: admin.id
    },
    {
      title: 'JWT Authentication Best Practices',
      slug: 'jwt-authentication-best-practices',
      excerpt: 'Security considerations and best practices for implementing JWT authentication in modern web applications.',
      content: `
# JWT Authentication Best Practices

JSON Web Tokens (JWT) are widely used for authentication, but improper implementation can lead to security vulnerabilities.

## What is JWT?

JWT is a compact, URL-safe token format used to securely transmit information between parties as a JSON object.

## Security Best Practices

### 1. Use Strong Secrets
Always use cryptographically strong, random secrets for signing tokens. Minimum 256 bits.

### 2. Set Appropriate Expiration
Short-lived access tokens (15-30 minutes) with refresh tokens for extended sessions.

### 3. Store Tokens Securely
- Use httpOnly cookies for web applications
- Avoid localStorage for sensitive tokens
- Implement CSRF protection with cookies

### 4. Validate Everything
- Verify signature on every request
- Check expiration time
- Validate issuer and audience claims

## Token Structure

A JWT consists of three parts:
- **Header**: Algorithm and token type
- **Payload**: Claims and user data
- **Signature**: Ensures token integrity

## Refresh Token Strategy

Implement refresh tokens to extend user sessions without compromising security:
- Long-lived refresh tokens (days/weeks)
- Short-lived access tokens (minutes)
- Rotate refresh tokens on use
- Store refresh tokens securely (database)

## Common Pitfalls

- Using 'none' algorithm
- Storing sensitive data in tokens
- Not validating token expiration
- Using weak secrets
- No token revocation mechanism

## Implementation Example

Use established libraries like jsonwebtoken for Node.js. Never implement JWT signing/verification manually.

## Conclusion

JWT authentication is powerful when implemented correctly. Follow these best practices to ensure your application's security.
      `,
      coverImage: 'https://via.placeholder.com/800x400',
      status: 'PUBLISHED',
      publishedAt: new Date('2024-01-28'),
      tags: ['JWT', 'Authentication', 'Security', 'Best Practices'],
      readTime: 9,
      metaTitle: 'JWT Authentication Best Practices - DevInsights',
      metaDesc: 'Learn security considerations and best practices for implementing JWT authentication.',
      authorId: writer.id
    },
    {
      title: 'Introduction to Docker Containerization',
      slug: 'introduction-docker-containerization',
      excerpt: 'A beginner-friendly guide to understanding Docker and containerizing your applications.',
      content: `
# Introduction to Docker Containerization

Docker has revolutionized application deployment. Learn the fundamentals of containerization.

## What is Docker?

Docker is a platform for developing, shipping, and running applications in containers - lightweight, standalone packages containing everything needed to run software.

## Why Use Docker?

- **Consistency**: Same environment everywhere
- **Isolation**: Applications run independently
- **Portability**: Run anywhere Docker runs
- **Efficiency**: Share OS kernel, lightweight

## Core Concepts

### Images
Read-only templates with instructions for creating containers.

### Containers
Runnable instances of images.

### Dockerfile
Text file with instructions to build an image.

### Docker Compose
Tool for defining multi-container applications.

## Getting Started

### Basic Commands
- docker build: Build an image
- docker run: Create and start a container
- docker ps: List running containers
- docker stop: Stop a container
- docker rm: Remove a container

## Best Practices

- Use official base images
- Keep images small
- Use .dockerignore
- Don't run as root
- Use multi-stage builds
- One process per container

## Example Dockerfile

A typical Node.js application Dockerfile includes:
- Base image selection
- Working directory setup
- Dependency installation
- Application code copy
- Port exposure
- Start command

## Docker Compose

Orchestrate multiple containers with docker-compose.yml. Define services, networks, and volumes in one file.

## Conclusion

Docker simplifies development and deployment. Start with simple containers and gradually adopt advanced features.
      `,
      coverImage: 'https://via.placeholder.com/800x400',
      status: 'PUBLISHED',
      publishedAt: new Date('2024-02-01'),
      tags: ['Docker', 'DevOps', 'Containers', 'Tutorial'],
      readTime: 10,
      metaTitle: 'Introduction to Docker Containerization - DevInsights',
      metaDesc: 'Beginner-friendly guide to understanding Docker and containerizing applications.',
      authorId: admin.id
    },
    {
      title: 'Draft: Advanced TypeScript Patterns',
      slug: 'advanced-typescript-patterns',
      excerpt: 'Exploring advanced TypeScript patterns for building robust, type-safe applications.',
      content: 'Draft content for advanced TypeScript patterns article...',
      coverImage: 'https://via.placeholder.com/800x400',
      status: 'DRAFT',
      tags: ['TypeScript', 'Patterns', 'Advanced'],
      readTime: 12,
      authorId: writer.id
    }
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }

  console.log('Seed completed successfully!');
  console.log('\nTest Users:');
  console.log('Admin: admin@devinsights.com / admin123');
  console.log('Writer: writer@devinsights.com / writer123');
  console.log('Reader: reader@devinsights.com / reader123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });