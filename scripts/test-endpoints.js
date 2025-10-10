const http = require('http');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const OPENAPI_PATH = path.join(__dirname, '..', 'openapi.yaml');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// HTTP request helper
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = res.headers['content-type']?.includes('application/json')
            ? JSON.parse(data)
            : data;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Parse URL and create request options
function createRequestOptions(url, method = 'GET') {
  const fullUrl = new URL(url, BASE_URL);
  return {
    hostname: fullUrl.hostname,
    port: fullUrl.port || 3000,
    path: fullUrl.pathname + fullUrl.search,
    method: method,
    headers: {
      'User-Agent': 'OpenAPI-Test-Runner/1.0',
      'Accept': 'application/json'
    }
  };
}

// Validate response against OpenAPI schema
function validateResponse(response, expectedSchema, path, method) {
  const issues = [];

  // Check if response has expected structure for API responses
  if (response.data && typeof response.data === 'object') {
    // Check for standard API response format
    if (!response.data.hasOwnProperty('success')) {
      issues.push('Missing "success" field in response');
    }

    if (!response.data.hasOwnProperty('message')) {
      issues.push('Missing "message" field in response');
    }

    if (!response.data.hasOwnProperty('data')) {
      issues.push('Missing "data" field in response');
    }

    // Validate success field type
    if (response.data.success !== undefined && typeof response.data.success !== 'boolean') {
      issues.push(`"success" field should be boolean, got ${typeof response.data.success}`);
    }

    // Validate message field type
    if (response.data.message !== undefined && typeof response.data.message !== 'string') {
      issues.push(`"message" field should be string, got ${typeof response.data.message}`);
    }
  }

  return issues;
}

// Test a single endpoint
async function testEndpoint(path, method, operation) {
  const testName = `${method.toUpperCase()} ${path}`;

  try {
    // Build URL with sample query parameters if needed
    let testUrl = path;
    if (method === 'get' && operation.parameters) {
      const queryParams = [];
      operation.parameters.forEach(param => {
        if (param.in === 'query' && param.schema) {
          let sampleValue;

          if (param.schema.example !== undefined) {
            sampleValue = param.schema.example;
          } else if (param.schema.default !== undefined) {
            sampleValue = param.schema.default;
          } else if (param.schema.enum) {
            sampleValue = param.schema.enum[0];
          } else {
            switch (param.schema.type) {
              case 'string':
                sampleValue = param.name === 'q' ? 'test' : 'sample';
                break;
              case 'integer':
                sampleValue = param.minimum || 1;
                break;
              case 'boolean':
                sampleValue = 'true';
                break;
              default:
                sampleValue = 'test';
            }
          }

          if (param.required || Math.random() > 0.5) {
            queryParams.push(`${param.name}=${encodeURIComponent(sampleValue)}`);
          }
        }
      });

      if (queryParams.length > 0) {
        testUrl += '?' + queryParams.join('&');
      }
    }

    const options = createRequestOptions(testUrl, method);
    const response = await makeRequest(options);

    // Get expected response schema
    const expectedResponses = operation.responses || {};
    const expectedSchema = expectedResponses['200'] || expectedResponses['201'] || null;

    // Validate response
    const validationIssues = validateResponse(response, expectedSchema, path, method);

    // Determine test result
    const isSuccess = response.statusCode >= 200 && response.statusCode < 300;
    const hasValidationIssues = validationIssues.length > 0;

    if (isSuccess && !hasValidationIssues) {
      console.log(`${colors.green}✅ PASS${colors.reset} ${testName} (${response.statusCode})`);
      return { success: true, path, method, statusCode: response.statusCode };
    } else if (isSuccess && hasValidationIssues) {
      console.log(`${colors.yellow}⚠️  WARN${colors.reset} ${testName} (${response.statusCode})`);
      validationIssues.forEach(issue => {
        console.log(`   ${colors.yellow}•${colors.reset} ${issue}`);
      });
      return { success: true, warnings: validationIssues.length, path, method, statusCode: response.statusCode };
    } else {
      console.log(`${colors.red}❌ FAIL${colors.reset} ${testName} (${response.statusCode})`);
      if (validationIssues.length > 0) {
        validationIssues.forEach(issue => {
          console.log(`   ${colors.red}•${colors.reset} ${issue}`);
        });
      }
      return { success: false, path, method, statusCode: response.statusCode, issues: validationIssues };
    }

  } catch (error) {
    console.log(`${colors.red}❌ FAIL${colors.reset} ${testName} - ${error.message}`);
    return { success: false, path, method, error: error.message };
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const options = createRequestOptions('/health');
    const response = await makeRequest(options);
    return response.statusCode === 200;
  } catch (error) {
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.bold}${colors.blue}🧪 OpenAPI Endpoint Testing${colors.reset}`);
  console.log(`${colors.cyan}Testing endpoints against: ${BASE_URL}${colors.reset}\n`);

  // Check if server is running
  console.log('🔍 Checking server health...');
  const serverRunning = await checkServerHealth();

  if (!serverRunning) {
    console.log(`${colors.red}❌ Server is not running at ${BASE_URL}${colors.reset}`);
    console.log(`${colors.yellow}💡 Please start the server with: npm run dev${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.green}✅ Server is running${colors.reset}\n`);

  // Load OpenAPI specification
  if (!fs.existsSync(OPENAPI_PATH)) {
    console.log(`${colors.red}❌ OpenAPI specification not found at: ${OPENAPI_PATH}${colors.reset}`);
    console.log(`${colors.yellow}💡 Generate it with: npm run generate:openapi${colors.reset}`);
    process.exit(1);
  }

  const yamlContent = fs.readFileSync(OPENAPI_PATH, 'utf8');
  const spec = yaml.load(yamlContent);

  console.log(`${colors.cyan}📋 Loaded OpenAPI spec: ${spec.info.title} v${spec.info.version}${colors.reset}`);
  console.log(`${colors.cyan}🔗 Testing ${Object.keys(spec.paths).length} endpoints${colors.reset}\n`);

  // Test all endpoints
  const results = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      // Skip non-HTTP methods
      const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
      if (!validMethods.includes(method.toLowerCase())) {
        continue;
      }

      const result = await testEndpoint(path, method, operation);
      results.push(result);

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}📊 Test Summary${colors.reset}`);
  console.log('='.repeat(60));

  const passed = results.filter(r => r.success && !r.warnings);
  const warnings = results.filter(r => r.success && r.warnings);
  const failed = results.filter(r => !r.success);

  console.log(`${colors.green}✅ Passed: ${passed.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${warnings.length}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed.length}${colors.reset}`);
  console.log(`📊 Total: ${results.length}`);

  if (failed.length > 0) {
    console.log(`\n${colors.red}${colors.bold}Failed Tests:${colors.reset}`);
    failed.forEach(result => {
      console.log(`   ${colors.red}•${colors.reset} ${result.method.toUpperCase()} ${result.path} ${result.error ? `(${result.error})` : `(${result.statusCode})`}`);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n${colors.yellow}${colors.bold}Tests with Warnings:${colors.reset}`);
    warnings.forEach(result => {
      console.log(`   ${colors.yellow}•${colors.reset} ${result.method.toUpperCase()} ${result.path} (${result.warnings} issues)`);
    });
  }

  // Performance stats
  const avgResponseTime = results.length > 0 ? 'N/A' : 'N/A';
  console.log(`\n${colors.cyan}⚡ Average response time: ${avgResponseTime}${colors.reset}`);

  // Exit with appropriate code
  const exitCode = failed.length > 0 ? 1 : 0;

  if (exitCode === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 All tests completed successfully!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bold}💥 Some tests failed. Please check the issues above.${colors.reset}`);
  }

  process.exit(exitCode);
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Unhandled promise rejection:${colors.reset}`, error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Testing interrupted by user${colors.reset}`);
  process.exit(130);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error(`${colors.red}Test runner error:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, checkServerHealth };
