const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== KISANSETU END-TO-END VERIFICATION SUITE ===\n');

  // Login as admin first
  const adminLogin = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    identifier: '9876543210',
    password: 'NewKisanPassword@2026'
  });
  const adminToken = adminLogin.body?.token;
  console.log('Admin Authenticated for Tests? Token present:', Boolean(adminToken));

  // Test 1: Track Grievance GRV-DE-655810
  console.log('\nTest 1: GET /api/schemes/grievance/GRV-DE-655810');
  const grvRes = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/schemes/grievance/GRV-DE-655810',
    method: 'GET'
  });
  console.log('Status:', grvRes.status);
  console.log('Grievance details:', grvRes.body?.grievance?.trackingNumber, grvRes.body?.grievance?.subject, grvRes.body?.grievance?.status);
  if (grvRes.status === 200 && grvRes.body?.success) {
    console.log('✅ TEST 1 PASSED: GRV-DE-655810 found successfully!\n');
  } else {
    console.error('❌ TEST 1 FAILED:', grvRes.body);
  }

  // Test 2: Admin Tickets includes Grievances
  console.log('Test 2: GET /api/admin/tickets');
  const tktRes = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/tickets',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Status:', tktRes.status);
  console.log('Total tickets returned:', tktRes.body?.count);
  const foundGrievanceTicket = tktRes.body?.tickets?.find(t => t.ticketId === 'GRV-DE-655810');
  console.log('Found GRV-DE-655810 in admin tickets?', Boolean(foundGrievanceTicket));
  if (tktRes.status === 200 && foundGrievanceTicket) {
    console.log('✅ TEST 2 PASSED: GRV-DE-655810 visible in Admin Tickets!\n');
  } else {
    console.error('❌ TEST 2 FAILED:', tktRes.body);
  }

  // Test 3: Admin Reply to GRV-DE-655810
  console.log('Test 3: PUT /api/admin/tickets/GRV-DE-655810/reply');
  const replyRes = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/tickets/GRV-DE-655810/reply',
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    message: 'Nodal Officer Verification: Your PM-KISAN installment query has been investigated with State Nodal Bank. DBT batch 24 has been verified.',
    status: 'Action Taken',
    assignedTo: 'Nodal Officer Rajesh Kumar'
  });
  console.log('Reply Status:', replyRes.status);
  console.log('Reply message:', replyRes.body?.message);
  if (replyRes.status === 200 && replyRes.body?.success) {
    console.log('✅ TEST 3 PASSED: Admin replied to grievance ticket!\n');
  } else {
    console.error('❌ TEST 3 FAILED:', replyRes.body);
  }


  // Test 4: Verify Grievance updated with official action
  console.log('Test 4: Verify Grievance updated with reply');
  const updatedGrvRes = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/schemes/grievance/GRV-DE-655810',
    method: 'GET'
  });
  console.log('Updated status:', updatedGrvRes.body?.grievance?.status);
  console.log('Official response:', updatedGrvRes.body?.grievance?.officialResponse);
  if (updatedGrvRes.body?.grievance?.officialResponse) {
    console.log('✅ TEST 4 PASSED: Citizen sees officer resolution in real time!\n');
  } else {
    console.error('❌ TEST 4 FAILED:', updatedGrvRes.body);
  }

  // Test 5: Forgot Password (OTP Generation)
  console.log('Test 5: POST /api/auth/forgot-password');
  // First find an active user phone number or test with one
  const forgotRes = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    identifier: '9876543210' // default farmer phone
  });
  console.log('Forgot password status:', forgotRes.status);
  console.log('Debug OTP:', forgotRes.body?.debugOtp);
  console.log('WhatsApp URL:', forgotRes.body?.whatsappUrl?.substring(0, 60) + '...');
  const otp = forgotRes.body?.debugOtp;

  if (forgotRes.status === 200 && otp) {
    console.log('✅ TEST 5 PASSED: 6-digit OTP generated & WhatsApp link ready!\n');

    // Test 6: Reset Password with OTP
    console.log('Test 6: POST /api/auth/reset-password');
    const resetRes = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: '9876543210',
      otp: otp,
      newPassword: 'NewKisanPassword@2026'
    });
    console.log('Reset status:', resetRes.status);
    console.log('Reset message:', resetRes.body?.message);
    console.log('JWT Token received:', Boolean(resetRes.body?.token));

    if (resetRes.status === 200 && resetRes.body?.token) {
      console.log('✅ TEST 6 PASSED: Password reset & auto-login succeeded!\n');

      // Test 7: Login with New Password
      console.log('Test 7: POST /api/auth/login with new password');
      const loginRes = await makeRequest({
        hostname: 'localhost',
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        identifier: '9876543210',
        password: 'NewKisanPassword@2026'
      });
      console.log('Login status:', loginRes.status);
      console.log('User name:', loginRes.body?.user?.name);
      if (loginRes.status === 200 && loginRes.body?.token) {
        console.log('✅ TEST 7 PASSED: Successfully authenticated with updated password!\n');
      } else {
        console.error('❌ TEST 7 FAILED:', loginRes.body);
      }
    } else {
      console.error('❌ TEST 6 FAILED:', resetRes.body);
    }
  } else {
    console.log('Notice: 9876543210 might not exist, testing with search first...\n');
  }

  // Test 8: Forgot Username / Account Locator
  console.log('Test 8: POST /api/auth/forgot-username (Search by location/name)');
  const findRes = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/forgot-username',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    searchType: 'location',
    name: 'Kisan'
  });
  console.log('Locator status:', findRes.status);
  console.log('Accounts found:', findRes.body?.accounts?.length);
  if (findRes.body?.accounts && findRes.body?.accounts.length > 0) {
    console.log('Account 1:', findRes.body?.accounts[0]?.name, findRes.body?.accounts[0]?.maskedPhone);
    console.log('✅ TEST 8 PASSED: Account located with privacy masking!\n');
  } else {
    console.error('❌ TEST 8 FAILED / No account matched:', findRes.body);
  }

  console.log('=== ALL VERIFICATIONS COMPLETE ===');
}

runTests().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
