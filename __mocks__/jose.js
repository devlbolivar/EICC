// Mock implementation of jose for Jest tests
// This avoids ESM module issues in Jest

const mockJwtVerify = async (token, secret) => {
  // Simple mock verification - in tests we trust the token
  try {
    // Mock payload extraction
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    return { payload };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const mockSignJWT = (payload) => {
  return {
    setProtectedHeader: function() { return this; },
    setIssuedAt: function() { return this; },
    setExpirationTime: function() { return this; },
    sign: async function(secret) {
      // Create a simple mock JWT
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
      const signature = Buffer.from('mock-signature').toString('base64');
      return `${header}.${payloadStr}.${signature}`;
    }
  };
};

module.exports = {
  jwtVerify: mockJwtVerify,
  SignJWT: mockSignJWT,
  // Add other jose exports as needed
};
