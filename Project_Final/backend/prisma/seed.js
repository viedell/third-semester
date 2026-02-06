const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@blog.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const writer = await prisma.user.create({
    data: {
      email: 'writer@blog.com',
      password: hashedPassword,
      name: 'Jane Writer',
      role: Role.WRITER,
    },
  });

  const reader = await prisma.user.create({
    data: {
      email: 'reader@blog.com',
      password: hashedPassword,
      name: 'John Reader',
      role: Role.READER,
    },
  });

  await prisma.post.createMany({
    data: [
      {
        title: 'Getting Started with Node.js',
        slug: 'getting-started-with-nodejs',
        content: 'Node.js has revolutionized server-side JavaScript development. In this comprehensive guide, we will explore the fundamentals of Node.js and how to build scalable applications.\n\n## What is Node.js?\n\nNode.js is a JavaScript runtime built on Chrome V8 JavaScript engine. It allows developers to use JavaScript for server-side scripting.\n\n## Key Features\n\n1. Asynchronous and Event-Driven\n2. Fast Execution\n3. Single Threaded but Highly Scalable\n\nNode.js is perfect for building RESTful APIs, real-time applications, and microservices.',
        excerpt: 'Learn the fundamentals of Node.js and how to build scalable server-side applications with JavaScript.',
        published: true,
        authorId: writer.id,
        tags: ['nodejs', 'javascript', 'backend', 'tutorial'],
        viewCount: 245,
      },
      {
        title: 'Modern React Best Practices',
        slug: 'modern-react-best-practices',
        content: 'React continues to evolve, and staying up-to-date with best practices is crucial for building maintainable applications.\n\n## Functional Components and Hooks\n\nThe introduction of Hooks has fundamentally changed how we write React components.\n\n## State Management\n\nChoose the right state management solution for your needs.\n\n## Performance Optimization\n\nUse React.memo for component memoization and implement useMemo and useCallback for expensive computations.',
        excerpt: 'Discover the latest React patterns, hooks best practices, and performance optimization techniques for modern web development.',
        published: true,
        authorId: writer.id,
        tags: ['react', 'javascript', 'frontend', 'best-practices'],
        viewCount: 312,
      },
      {
        title: 'Database Design Principles',
        slug: 'database-design-principles',
        content: 'Proper database design is the foundation of any robust application. This guide explores key principles and patterns for designing effective databases.\n\n## Normalization\n\nDatabase normalization is the process of organizing data to minimize redundancy.\n\n## Indexing Strategy\n\nProper indexing dramatically improves query performance.\n\n## Relationships\n\nUnderstanding relationship types is crucial for effective database design.',
        excerpt: 'Master the fundamental principles of database design including normalization, indexing, and relationship modeling.',
        published: true,
        authorId: admin.id,
        tags: ['database', 'postgresql', 'design', 'tutorial'],
        viewCount: 189,
      },
      {
        title: 'RESTful API Design Guide',
        slug: 'restful-api-design-guide',
        content: 'Building a well-designed RESTful API is essential for creating scalable and maintainable web services.\n\n## REST Principles\n\nREST is an architectural style with six key constraints.\n\n## Resource Naming\n\nUse nouns, not verbs, for resource names.\n\n## HTTP Methods\n\nUse appropriate HTTP methods: GET, POST, PUT, PATCH, DELETE.\n\n## Status Codes\n\nReturn proper HTTP status codes for all responses.',
        excerpt: 'Learn how to design robust RESTful APIs with proper resource naming, HTTP methods, status codes, and error handling.',
        published: true,
        authorId: writer.id,
        tags: ['api', 'rest', 'backend', 'best-practices'],
        viewCount: 421,
      },
      {
        title: 'Introduction to TypeScript',
        slug: 'introduction-to-typescript',
        content: 'TypeScript has become the standard for building large-scale JavaScript applications.\n\n## Why TypeScript?\n\nTypeScript is a typed superset of JavaScript that compiles to plain JavaScript.\n\n## Type Safety\n\nCatch errors at compile time rather than runtime.\n\n## Better IDE Support\n\nTypeScript enables intelligent code completion, inline documentation, and refactoring tools.',
        excerpt: 'Get started with TypeScript and learn how static typing can improve your JavaScript development experience.',
        published: true,
        authorId: writer.id,
        tags: ['typescript', 'javascript', 'tutorial'],
        viewCount: 278,
      },
      {
        title: 'Draft: Upcoming Features in ES2024',
        slug: 'draft-upcoming-features-es2024',
        content: 'This is a draft article about upcoming JavaScript features. Content to be completed.',
        excerpt: 'A preview of exciting new features coming to JavaScript in ES2024.',
        published: false,
        authorId: writer.id,
        tags: ['javascript', 'es2024', 'draft'],
        viewCount: 0,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('Test credentials:');
  console.log('Admin: admin@blog.com / password123');
  console.log('Writer: writer@blog.com / password123');
  console.log('Reader: reader@blog.com / password123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
