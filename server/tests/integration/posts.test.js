const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const Post = require('../../src/models/Post');
const User = require('../../src/models/User');
const { generateToken } = require('../../src/utils/auth');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await Post.deleteMany();
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();   // ✅ disconnect from test DB
  await mongo.stop();            // ✅ shut down the in-memory server
});

describe('POST /api/posts', () => {
  test('should create a new post when authenticated', async () => {
    const user = new User({ name: 'Test User', email: 'test@example.com' });
    await user.save();

    const token = generateToken(user._id);

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', token)
      .send({ title: 'Hello', content: 'World', category: 'general' });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Hello');
  }, 20000); // Optional: extend timeout
});
