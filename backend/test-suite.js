const EventEmitter = require('events');
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const prisma = require('./src/config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'crm-kalpra-super-secret-jwt-key-change-in-production';

/**
 * Lightweight in-memory request dispatcher for Express without TCP sockets
 */
function mockRequest(app, { method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = {
      'content-type': 'application/json',
      ...headers,
    };
    req.body = body || {};
    req.socket = { remoteAddress: '127.0.0.1' };
    req.connection = req.socket;

    const res = new EventEmitter();
    let statusCode = 200;
    const resHeaders = {};
    let responseBody = null;

    res._headers = resHeaders;

    res.status = function (code) {
      statusCode = code;
      return res;
    };

    res.setHeader = function (key, val) {
      resHeaders[key.toLowerCase()] = val;
    };

    res.getHeader = function (key) {
      return resHeaders[key.toLowerCase()];
    };

    res.hasHeader = function (key) {
      return Object.prototype.hasOwnProperty.call(resHeaders, key.toLowerCase());
    };

    res.removeHeader = function (key) {
      delete resHeaders[key.toLowerCase()];
    };

    res.getHeaderNames = function () {
      return Object.keys(resHeaders);
    };

    res.getHeaders = function () {
      return { ...resHeaders };
    };

    res.json = function (obj) {
      responseBody = obj;
      resolve({ statusCode, headers: resHeaders, body: responseBody });
    };

    res.send = function (data) {
      responseBody = data;
      resolve({ statusCode, headers: resHeaders, body: responseBody });
    };

    res.end = function (data) {
      if (data) responseBody = data;
      resolve({ statusCode, headers: resHeaders, body: responseBody });
    };

    app(req, res, (err) => {
      if (err) {
        resolve({ statusCode: 500, headers: resHeaders, body: { error: err.message } });
      } else {
        resolve({ statusCode, headers: resHeaders, body: responseBody });
      }
    });
  });
}

async function runInMemoryTests() {
  console.log('🧪 Starting In-Memory Phase 2 Backend Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  try {
    // --------------------------------------------------------------------------
    // Test 1: Health check
    // --------------------------------------------------------------------------
    const healthRes = await mockRequest(app, { method: 'GET', url: '/api/health' });
    if (healthRes.statusCode === 200 && healthRes.body.status === 'ok') {
      console.log('✅ Test 1: Health Check Passed (/api/health -> 200 OK)');
      passed++;
    } else {
      console.error('❌ Test 1 Failed:', healthRes);
      failed++;
    }

    // --------------------------------------------------------------------------
    // Test 2: Zod Validation on /api/auth/login with missing fields
    // --------------------------------------------------------------------------
    const invalidLoginRes = await mockRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'not-an-email' },
    });
    if (
      invalidLoginRes.statusCode === 400 &&
      invalidLoginRes.body.message === 'Validation failed' &&
      Array.isArray(invalidLoginRes.body.errors)
    ) {
      console.log('✅ Test 2: Zod Validation Rejection Passed (Malformed payload -> 400 Bad Request)');
      passed++;
    } else {
      console.error('❌ Test 2 Failed:', invalidLoginRes);
      failed++;
    }

    // --------------------------------------------------------------------------
    // Test 3: Unauthenticated Protected Route
    // --------------------------------------------------------------------------
    const unauthRes = await mockRequest(app, { method: 'GET', url: '/api/leads' });
    if (unauthRes.statusCode === 401) {
      console.log('✅ Test 3: Unauthenticated Access Blocked Passed (/api/leads -> 401 Unauthorized)');
      passed++;
    } else {
      console.error('❌ Test 3 Failed:', unauthRes);
      failed++;
    }

    // --------------------------------------------------------------------------
    // Test 4: CEO Read-Only Enforcement (blockCeoMutations)
    // --------------------------------------------------------------------------
    const ceoToken = jwt.sign(
      {
        id: '11111111-1111-4111-8111-111111111111',
        email: 'ceo@company.com',
        role: 'CEO',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Mock prisma user lookup
    const originalFindUnique = prisma.user.findUnique;
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === '11111111-1111-4111-8111-111111111111') {
        return {
          id: '11111111-1111-4111-8111-111111111111',
          name: 'Rajesh Sharma',
          email: 'ceo@company.com',
          role: 'CEO',
          isActive: true,
        };
      }
      return null;
    };

    // 4a. CEO attempts POST /api/leads
    const ceoPostRes = await mockRequest(app, {
      method: 'POST',
      url: '/api/leads',
      headers: { authorization: `Bearer ${ceoToken}` },
      body: {
        name: 'Client Acme',
        area: 'Hitec City',
        contact: '9999999999',
        approachType: 'Call',
      },
    });

    if (
      ceoPostRes.statusCode === 403 &&
      ceoPostRes.body.message === 'CEO account has read-only access.'
    ) {
      console.log('✅ Test 4: CEO Read-Only Mutation Block Passed (POST /api/leads -> 403 Forbidden: "CEO account has read-only access.")');
      passed++;
    } else {
      console.error('❌ Test 4 Failed:', ceoPostRes);
      failed++;
    }

    // 4b. CEO attempts PATCH /api/tasks/123/start
    const ceoPatchRes = await mockRequest(app, {
      method: 'PATCH',
      url: '/api/tasks/123/start',
      headers: { authorization: `Bearer ${ceoToken}` },
    });

    if (
      ceoPatchRes.statusCode === 403 &&
      ceoPatchRes.body.message === 'CEO account has read-only access.'
    ) {
      console.log('✅ Test 5: CEO Timer Start Mutation Block Passed (PATCH /api/tasks/:id/start -> 403 Forbidden)');
      passed++;
    } else {
      console.error('❌ Test 5 Failed:', ceoPatchRes);
      failed++;
    }

    // 4c. CEO attempts DELETE /api/notes/123
    const ceoDeleteRes = await mockRequest(app, {
      method: 'DELETE',
      url: '/api/notes/123',
      headers: { authorization: `Bearer ${ceoToken}` },
    });

    if (
      ceoDeleteRes.statusCode === 403 &&
      ceoDeleteRes.body.message === 'CEO account has read-only access.'
    ) {
      console.log('✅ Test 6: CEO Note Deletion Mutation Block Passed (DELETE /api/notes/:id -> 403 Forbidden)');
      passed++;
    } else {
      console.error('❌ Test 6 Failed:', ceoDeleteRes);
      failed++;
    }

    // --------------------------------------------------------------------------
    // Test 7: 404 Route Handler
    // --------------------------------------------------------------------------
    const notFoundRes = await mockRequest(app, { method: 'GET', url: '/api/unknown-endpoint' });
    if (notFoundRes.statusCode === 404 && notFoundRes.body.success === false) {
      console.log('✅ Test 7: 404 Route Handler Passed (/api/unknown-endpoint -> 404 Not Found)');
      passed++;
    } else {
      console.error('❌ Test 7 Failed:', notFoundRes);
      failed++;
    }

    // --------------------------------------------------------------------------
    // Test 8: Empty table / Graceful analytics handling check
    // --------------------------------------------------------------------------
    // Mock prisma queries for empty tables
    const originalCount = prisma.lead.count;
    const originalAggregate = prisma.deal.aggregate;
    const originalFindMany = prisma.lead.findMany;
    const originalTaskCount = prisma.taskSchedule.count;
    const originalUserFindMany = prisma.user.findMany;

    prisma.lead.count = async () => 0;
    prisma.lead.findMany = async () => [];
    prisma.deal.aggregate = async () => ({ _sum: { dealValue: null }, _count: { id: 0 } });
    prisma.taskSchedule.count = async () => 0;
    prisma.user.findMany = async () => [];

    const emptyExecutiveRes = await mockRequest(app, {
      method: 'GET',
      url: '/api/analytics/executive',
      headers: { authorization: `Bearer ${ceoToken}` },
    });

    if (
      emptyExecutiveRes.statusCode === 200 &&
      emptyExecutiveRes.body.overview.totalRevenue === 0 &&
      emptyExecutiveRes.body.overview.overallConversionRate === 0 &&
      Array.isArray(emptyExecutiveRes.body.dealsByStatus) &&
      Array.isArray(emptyExecutiveRes.body.employeeLeaderboard)
    ) {
      console.log('✅ Test 8: Empty Database Analytics Graceful Handling Passed (0s and [] returned, no NaN/crash)');
      passed++;
    } else {
      console.error('❌ Test 8 Failed:', emptyExecutiveRes);
      failed++;
    }

    // Restore original prisma methods
    prisma.user.findUnique = originalFindUnique;
    prisma.lead.count = originalCount;
    prisma.lead.findMany = originalFindMany;
    prisma.deal.aggregate = originalAggregate;
    prisma.taskSchedule.count = originalTaskCount;
    prisma.user.findMany = originalUserFindMany;
  } catch (err) {
    console.error('Test suite error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runInMemoryTests().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
