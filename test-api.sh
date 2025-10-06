#!/bin/bash

# Complex API Demo - Test Script
# Tests all API endpoints to ensure proper functionality

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000}"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "PASS")
            echo -e "${GREEN}✅ PASS${NC}: $message"
            ((PASSED_TESTS++))
            ;;
        "FAIL")
            echo -e "${RED}❌ FAIL${NC}: $message"
            ((FAILED_TESTS++))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  INFO${NC}: $message"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  WARN${NC}: $message"
            ;;
    esac
    ((TOTAL_TESTS++))
}

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4

    echo -e "\n${BLUE}Testing:${NC} $method $endpoint"

    response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint")
    http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]*$//')

    if [[ "$http_code" -eq "$expected_status" ]]; then
        # Check if response is valid JSON (for non-YAML endpoints)
        if [[ "$endpoint" != *".yaml" ]]; then
            if echo "$response_body" | jq . >/dev/null 2>&1; then
                success_field=$(echo "$response_body" | jq -r '.success // "null"')
                if [[ "$success_field" == "true" ]] || [[ "$expected_status" -ge 400 && "$success_field" == "false" ]]; then
                    print_status "PASS" "$description (HTTP $http_code, Valid JSON)"
                else
                    print_status "FAIL" "$description (HTTP $http_code, Invalid success field: $success_field)"
                fi
            else
                print_status "FAIL" "$description (HTTP $http_code, Invalid JSON)"
            fi
        else
            print_status "PASS" "$description (HTTP $http_code, YAML response)"
        fi
    else
        print_status "FAIL" "$description (Expected HTTP $expected_status, got $http_code)"
        echo "Response: $response_body" | head -3
    fi
}

# Function to test pagination
test_pagination() {
    local endpoint=$1
    local description=$2

    echo -e "\n${BLUE}Testing Pagination:${NC} $endpoint"

    response=$(curl -s "$BASE_URL$endpoint?page=1&limit=2")

    if echo "$response" | jq . >/dev/null 2>&1; then
        pagination=$(echo "$response" | jq '.pagination // empty')
        if [[ -n "$pagination" ]]; then
            page=$(echo "$pagination" | jq -r '.page')
            limit=$(echo "$pagination" | jq -r '.limit')
            if [[ "$page" == "1" && "$limit" == "2" ]]; then
                print_status "PASS" "$description - Pagination works correctly"
            else
                print_status "FAIL" "$description - Pagination values incorrect (page: $page, limit: $limit)"
            fi
        else
            print_status "FAIL" "$description - No pagination metadata found"
        fi
    else
        print_status "FAIL" "$description - Invalid JSON response"
    fi
}

# Main test execution
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    Complex API Demo - Endpoint Tests${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Testing against: $BASE_URL${NC}"

# Test 1: Health Check
test_endpoint "GET" "/health" 200 "Health check endpoint"

# Test 2: API Documentation
test_endpoint "GET" "/docs" 200 "API documentation (redirects to Swagger UI)"

# Test 3: OpenAPI Specification
test_endpoint "GET" "/api/openapi.yaml" 200 "OpenAPI specification in YAML format"

# Test 4: Users API
test_endpoint "GET" "/api/users" 200 "Get users list"
test_endpoint "GET" "/api/users?page=1&limit=5" 200 "Get users with pagination"
test_pagination "/api/users" "Users endpoint pagination"

# Test 5: Products API
test_endpoint "GET" "/api/products" 200 "Get products list"
test_endpoint "GET" "/api/products?category=electronics" 200 "Get products filtered by category"
test_pagination "/api/products" "Products endpoint pagination"

# Test 6: Orders API
test_endpoint "GET" "/api/orders" 200 "Get orders list"
test_endpoint "GET" "/api/orders?status=pending" 200 "Get orders filtered by status"
test_pagination "/api/orders" "Orders endpoint pagination"

# Test 7: Analytics API
test_endpoint "GET" "/api/analytics" 200 "Get analytics data"
test_endpoint "GET" "/api/analytics?period=last_7_days" 200 "Get analytics for specific period"

# Test 8: Articles API
test_endpoint "GET" "/api/articles" 200 "Get articles list"
test_endpoint "GET" "/api/articles?featured=true" 200 "Get featured articles"
test_endpoint "GET" "/api/articles?category=technology" 200 "Get articles by category"
test_pagination "/api/articles" "Articles endpoint pagination"

# Test 9: Notifications API
test_endpoint "GET" "/api/notifications" 200 "Get notifications list"
test_endpoint "GET" "/api/notifications?type=info" 200 "Get notifications by type"
test_endpoint "GET" "/api/notifications?unread=true" 200 "Get unread notifications"
test_pagination "/api/notifications" "Notifications endpoint pagination"

# Test 10: Search API
test_endpoint "GET" "/api/search?q=test" 200 "Search with query parameter"
test_endpoint "GET" "/api/search?q=test&type=users" 200 "Search users specifically"
test_endpoint "GET" "/api/search" 400 "Search without query (should fail)"

# Test 11: Reports API
test_endpoint "GET" "/api/reports?type=sales" 200 "Generate sales report"
test_endpoint "GET" "/api/reports?type=users&format=json" 200 "Generate users report in JSON"
test_endpoint "GET" "/api/reports" 400 "Generate report without type (should fail)"

# Test 12: Integrations API
test_endpoint "GET" "/api/integrations" 200 "Get integrations list"

# Test 13: Settings API
test_endpoint "GET" "/api/settings" 200 "Get all settings"
test_endpoint "GET" "/api/settings?category=general" 200 "Get general settings"
test_endpoint "GET" "/api/settings?category=invalid" 400 "Get invalid category (should fail)"

# Test 14: 404 Error Handling
test_endpoint "GET" "/api/nonexistent" 404 "Non-existent endpoint should return 404"
test_endpoint "GET" "/invalid/path" 404 "Invalid path should return 404"

# Test 15: Response Format Validation
echo -e "\n${BLUE}Testing Response Format:${NC}"
response=$(curl -s "$BASE_URL/health")
if echo "$response" | jq -e '.data and .success and .message' >/dev/null; then
    print_status "PASS" "Health endpoint has correct response format"
else
    print_status "FAIL" "Health endpoint missing required fields (data, success, message)"
fi

# Summary
echo -e "\n${BLUE}============================================${NC}"
echo -e "${BLUE}              TEST SUMMARY${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"

if [[ $FAILED_TESTS -gt 0 ]]; then
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    echo -e "\n${RED}❌ Some tests failed. Please check the API.${NC}"
    exit 1
else
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    echo -e "\n${GREEN}🎉 All tests passed! API is working correctly.${NC}"
    echo -e "${BLUE}✨ The API is ready for deployment on Unkey platform.${NC}"
    exit 0
fi
