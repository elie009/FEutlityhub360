#!/usr/bin/env node

/**
 * Direct API Test for Add Payment Schedule Endpoint
 * Tests the POST /api/Loans/{loanId}/add-schedule endpoint with sample data
 */

const https = require('https');
const http = require('http');

// Test configuration
const config = {
  baseUrl: 'http://localhost:5000', // Change this to your backend URL
  endpoint: '/api/Loans/da188a68-ebe3-4288-b56d-d9e0a922dc81/add-schedule',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-test-token-here' // Add a valid token if needed
  }
};

// Sample request data from the user
const requestData = {
  startingInstallmentNumber: 13,
  numberOfMonths: 3,
  firstDueDate: "2024-07-15T00:00:00Z",
  monthlyPayment: 1200.00,
  reason: "Adding catch-up payments"
};

// Expected response structure
const expectedResponse = {
  success: true,
  message: "Payment schedules added successfully",
  data: {
    schedule: [
      {
        id: "schedule-456",
        loanId: "loan-123",
        installmentNumber: 13,
        dueDate: "2024-07-15T00:00:00Z",
        principalAmount: 1150.00,
        interestAmount: 50.00,
        totalAmount: 1200.00,
        status: "PENDING",
        paidAt: null
      }
      // ... more installments
    ],
    totalInstallments: 3,
    totalAmount: 3600.00,
    firstDueDate: "2024-07-15T00:00:00Z",
    lastDueDate: "2024-09-15T00:00:00Z",
    message: "3 new payment installments added starting from installment #13"
  },
  errors: null
};

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAddScheduleApi() {
  console.log('🚀 Testing Add Payment Schedule API');
  console.log('=====================================');
  console.log(`📍 URL: ${config.baseUrl}${config.endpoint}`);
  console.log(`📊 Method: ${config.method}`);
  console.log('📦 Request Data:');
  console.log(JSON.stringify(requestData, null, 2));
  console.log('');
  
  try {
    const response = await makeRequest(
      `${config.baseUrl}${config.endpoint}`,
      {
        method: config.method,
        headers: config.headers
      },
      requestData
    );
    
    console.log('📥 Response Received:');
    console.log('===================');
    console.log(`🎯 Status Code: ${response.statusCode}`);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Validate response
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('\n✅ API Request Successful!');
      
      if (response.data && response.data.success) {
        console.log('✅ Response has success: true');
        
        if (response.data.data && response.data.data.schedule) {
          console.log(`✅ Generated ${response.data.data.schedule.length} payment installments`);
          
          // Validate first installment
          const firstInstallment = response.data.data.schedule[0];
          if (firstInstallment) {
            console.log('✅ First installment structure validation:');
            console.log(`   - ID: ${firstInstallment.id || 'Missing'}`);
            console.log(`   - Installment Number: ${firstInstallment.installmentNumber || 'Missing'}`);
            console.log(`   - Due Date: ${firstInstallment.dueDate || 'Missing'}`);
            console.log(`   - Total Amount: ${firstInstallment.totalAmount || 'Missing'}`);
            console.log(`   - Status: ${firstInstallment.status || 'Missing'}`);
          }
        } else {
          console.log('⚠️  Response missing schedule data');
        }
      } else {
        console.log('⚠️  Response success is not true');
      }
    } else {
      console.log(`❌ API Request Failed with status code: ${response.statusCode}`);
      
      if (response.statusCode === 404) {
        console.log('💡 This might be because:');
        console.log('   - The backend server is not running');
        console.log('   - The API endpoint URL is incorrect');
        console.log('   - The loan ID "loan-123" does not exist');
      } else if (response.statusCode === 401) {
        console.log('💡 Authentication error - check your token');
      } else if (response.statusCode === 400) {
        console.log('💡 Bad request - check the request data format');
      }
    }
    
  } catch (error) {
    console.log('❌ Network Error:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused - is your backend server running?');
      console.log(`   Make sure the server is running on ${config.baseUrl}`);
    }
  }
  
  console.log('\n📋 Test Summary:');
  console.log('================');
  console.log('This test verifies the add payment schedule endpoint with your sample data.');
  console.log('Expected behavior:');
  console.log('- Should return HTTP 200/201 status');
  console.log('- Should have success: true in response');
  console.log('- Should generate 3 payment installments');
  console.log('- Should start from installment #13');
  console.log('- Should have monthly payment of $1200.00');
  console.log('\nFor testing with the React app, visit: http://localhost:3000/test/add-schedule');
}

// Run the test
testAddScheduleApi().catch(console.error);
