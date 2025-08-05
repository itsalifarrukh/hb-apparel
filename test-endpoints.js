const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

// Helper function to log test results
function logTest(testName, success, error = null) {
  if (success) {
    console.log(`✅ ${testName} - PASSED`);
    testResults.passed++;
  } else {
    console.log(`❌ ${testName} - FAILED`);
    if (error) {
      console.log(`   Error: ${error.message || error}`);
      testResults.errors.push({ test: testName, error: error.message || error });
    }
    testResults.failed++;
  }
}

// Helper function to simulate authentication (you'll need to replace this with actual auth)
let authToken = null;

async function authenticate() {
  // This is a placeholder - you'll need to implement actual authentication
  console.log('⚠️  Authentication placeholder - Tests will run without auth');
  console.log('   Note: All endpoints require authentication. Tests may fail with 401 errors.');
}

// Test Cart Endpoints
async function testCartEndpoints() {
  console.log('\n🛒 Testing Cart Endpoints...\n');

  try {
    // Test 1: GET /api/cart - Get user's cart
    try {
      const response = await API.get('/api/cart');
      logTest('GET /api/cart (Get user cart)', response.status === 200 || response.status === 401);
    } catch (error) {
      logTest('GET /api/cart (Get user cart)', false, error);
    }

    // Test 2: POST /api/cart - Add item to cart
    try {
      const response = await API.post('/api/cart', {
        productId: 'test-product-id',
        quantity: 2
      });
      logTest('POST /api/cart (Add item to cart)', response.status === 200 || response.status === 401);
    } catch (error) {
      logTest('POST /api/cart (Add item to cart)', false, error);
    }

    // Test 3: POST /api/cart - Add item with invalid data
    try {
      const response = await API.post('/api/cart', {
        // Missing productId
        quantity: 1
      });
      logTest('POST /api/cart (Invalid data - missing productId)', response.status === 400);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logTest('POST /api/cart (Invalid data - missing productId)', true);
      } else {
        logTest('POST /api/cart (Invalid data - missing productId)', false, error);
      }
    }

    // Test 4: POST /api/cart - Add item with invalid quantity
    try {
      const response = await API.post('/api/cart', {
        productId: 'test-product-id',
        quantity: 0
      });
      logTest('POST /api/cart (Invalid quantity)', response.status === 400);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logTest('POST /api/cart (Invalid quantity)', true);
      } else {
        logTest('POST /api/cart (Invalid quantity)', false, error);
      }
    }

    // Test 5: PUT /api/cart/[itemId] - Update cart item quantity
    try {
      const response = await API.put('/api/cart/test-item-id', {
        quantity: 3
      });
      logTest('PUT /api/cart/[itemId] (Update cart item)', response.status === 200 || response.status === 401 || response.status === 404);
    } catch (error) {
      logTest('PUT /api/cart/[itemId] (Update cart item)', false, error);
    }

    // Test 6: PUT /api/cart/[itemId] - Update with invalid quantity
    try {
      const response = await API.put('/api/cart/test-item-id', {
        quantity: 0
      });
      logTest('PUT /api/cart/[itemId] (Invalid quantity)', response.status === 400);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logTest('PUT /api/cart/[itemId] (Invalid quantity)', true);
      } else {
        logTest('PUT /api/cart/[itemId] (Invalid quantity)', false, error);
      }
    }

    // Test 7: DELETE /api/cart/[itemId] - Remove item from cart
    try {
      const response = await API.delete('/api/cart/test-item-id');
      logTest('DELETE /api/cart/[itemId] (Remove cart item)', response.status === 200 || response.status === 401 || response.status === 404);
    } catch (error) {
      logTest('DELETE /api/cart/[itemId] (Remove cart item)', false, error);
    }

  } catch (error) {
    console.log('❌ Cart endpoint testing failed:', error.message);
  }
}

// Test Wishlist Endpoints
async function testWishlistEndpoints() {
  console.log('\n💝 Testing Wishlist Endpoints...\n');

  try {
    // Test 1: GET /api/wishlist - Get user's wishlist
    try {
      const response = await API.get('/api/wishlist');
      logTest('GET /api/wishlist (Get user wishlist)', response.status === 200 || response.status === 401);
    } catch (error) {
      logTest('GET /api/wishlist (Get user wishlist)', false, error);
    }

    // Test 2: POST /api/wishlist - Add item to wishlist
    try {
      const response = await API.post('/api/wishlist', {
        productId: 'test-product-id'
      });
      logTest('POST /api/wishlist (Add item to wishlist)', response.status === 200 || response.status === 401);
    } catch (error) {
      logTest('POST /api/wishlist (Add item to wishlist)', false, error);
    }

    // Test 3: POST /api/wishlist - Add item with missing productId
    try {
      const response = await API.post('/api/wishlist', {
        // Missing productId
      });
      logTest('POST /api/wishlist (Missing productId)', response.status === 400);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logTest('POST /api/wishlist (Missing productId)', true);
      } else {
        logTest('POST /api/wishlist (Missing productId)', false, error);
      }
    }

    // Test 4: DELETE /api/wishlist/[productId] - Remove item from wishlist
    try {
      const response = await API.delete('/api/wishlist/test-product-id');
      logTest('DELETE /api/wishlist/[productId] (Remove wishlist item)', response.status === 200 || response.status === 401 || response.status === 404);
    } catch (error) {
      logTest('DELETE /api/wishlist/[productId] (Remove wishlist item)', false, error);
    }

    // Test 5: POST /api/wishlist/move-to-cart - Move all wishlist items to cart
    try {
      const response = await API.post('/api/wishlist/move-to-cart', {});
      logTest('POST /api/wishlist/move-to-cart (Move all to cart)', response.status === 200 || response.status === 401 || response.status === 400);
    } catch (error) {
      logTest('POST /api/wishlist/move-to-cart (Move all to cart)', false, error);
    }

  } catch (error) {
    console.log('❌ Wishlist endpoint testing failed:', error.message);
  }
}

// Test Response Structure
async function testResponseStructure() {
  console.log('\n📋 Testing Response Structure...\n');

  try {
    // Test Cart response structure
    try {
      const response = await API.get('/api/cart');
      if (response.data && typeof response.data === 'object') {
        const hasSuccess = 'success' in response.data;
        const hasMessage = 'message' in response.data;
        logTest('Cart Response Structure (success & message fields)', hasSuccess && hasMessage);
      }
    } catch (error) {
      // Expected for unauthorized requests
      if (error.response && error.response.data) {
        const hasSuccess = 'success' in error.response.data;
        const hasMessage = 'message' in error.response.data;
        logTest('Cart Error Response Structure (success & message fields)', hasSuccess && hasMessage);
      }
    }

    // Test Wishlist response structure
    try {
      const response = await API.get('/api/wishlist');
      if (response.data && typeof response.data === 'object') {
        const hasSuccess = 'success' in response.data;
        const hasMessage = 'message' in response.data;
        logTest('Wishlist Response Structure (success & message fields)', hasSuccess && hasMessage);
      }
    } catch (error) {
      // Expected for unauthorized requests
      if (error.response && error.response.data) {
        const hasSuccess = 'success' in error.response.data;
        const hasMessage = 'message' in error.response.data;
        logTest('Wishlist Error Response Structure (success & message fields)', hasSuccess && hasMessage);
      }
    }

  } catch (error) {
    console.log('❌ Response structure testing failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Cart & Wishlist API Endpoint Tests...\n');
  
  await authenticate();
  await testCartEndpoints();
  await testWishlistEndpoints();
  await testResponseStructure();

  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.passed + testResults.failed}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 Error Details:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }

  console.log('\n✨ Testing completed!');
}

// Run the tests
runTests().catch(console.error);
