const test = async () => {
  const baseUrl = 'http://localhost:5001/api';

  console.log('--- TEST 1: Buyers Endpoint ---');
  try {
    const buyersRes = await fetch(`${baseUrl}/auth/buyers`);
    const buyersData = await buyersRes.json();
    console.log('Buyers status:', buyersRes.status, 'Success:', buyersData.success, 'Count:', buyersData.count);
  } catch (e) {
    console.error('Buyers failed:', e.message);
  }

  console.log('\n--- TEST 2: Crop Quality Scanner (Non-crop / Fake Data Rejection) ---');
  try {
    // 2a: Empty payload
    const emptyRes = await fetch(`${baseUrl}/ai/quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropName: 'Wheat' })
    });
    const emptyData = await emptyRes.json();
    console.log('Empty image check:', emptyData.quality.isCrop === false ? 'PASS (Rejected)' : 'FAIL', emptyData.quality.rejectionReason);

    // 2b: SVG / Non-camera image payload
    const svgBase64 = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>').toString('base64');
    const svgRes = await fetch(`${baseUrl}/ai/quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropName: 'Soybean', imageBase64: svgBase64 })
    });
    const svgData = await svgRes.json();
    console.log('SVG graphic check:', svgData.quality.isCrop === false ? 'PASS (Rejected)' : 'FAIL', svgData.quality.detectedObject, svgData.quality.rejectionReason);

    // 2c: Solid color / blank dummy file check
    const blankBuf = Buffer.alloc(1000, 0x00);
    // Add JPEG magic bytes at start
    blankBuf[0] = 0xFF; blankBuf[1] = 0xD8; blankBuf[2] = 0xFF;
    const blankBase64 = 'data:image/jpeg;base64,' + blankBuf.toString('base64');
    const blankRes = await fetch(`${baseUrl}/ai/quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropName: 'Soybean', imageBase64: blankBase64 })
    });
    const blankData = await blankRes.json();
    console.log('Blank/monochrome image check:', blankData.quality.isCrop === false ? 'PASS (Rejected)' : 'FAIL', blankData.quality.rejectionReason);

    // 2d: Valid natural image buffer check
    const naturalBuf = Buffer.alloc(4000);
    naturalBuf[0] = 0xFF; naturalBuf[1] = 0xD8; naturalBuf[2] = 0xFF;
    for (let i = 3; i < 4000; i++) naturalBuf[i] = (i * 37) % 256;
    const naturalBase64 = 'data:image/jpeg;base64,' + naturalBuf.toString('base64');
    const natRes = await fetch(`${baseUrl}/ai/quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropName: 'Wheat', imageBase64: naturalBase64 })
    });
    const natData = await natRes.json();
    console.log('Valid produce check:', natData.quality.isCrop ? 'PASS (Verified Produce)' : 'REJECTED', natData.quality.grade, natData.quality.visionSource);
  } catch (e) {
    console.error('Quality scan failed:', e.message);
  }

  console.log('\n--- TEST 3: Live Order Tracking Endpoint ---');
  try {
    const ordersRes = await fetch(`${baseUrl}/orders`);
    const ordersData = await ordersRes.json();
    console.log('Orders status:', ordersRes.status, 'Count:', ordersData.count);
    if (ordersData.orders && ordersData.orders.length > 0) {
      const firstOrder = ordersData.orders[0];
      console.log(`Testing stage update on order #${firstOrder.orderNumber}...`);
      const updateRes = await fetch(`${baseUrl}/orders/${firstOrder._id}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'TRANSPORT_DISPATCHED',
          note: 'Tractor trailer loaded at Sanwer farm, en route to Indore mandi hub',
          location: 'Dewas - Indore Highway Toll'
        })
      });
      const updateData = await updateRes.json();
      console.log('Update result:', updateData.success, 'New stage:', updateData.order?.stage, 'Timeline count:', updateData.order?.timeline?.length);
    }
  } catch (e) {
    console.error('Orders test failed:', e.message);
  }

  console.log('\nAll API feature tests completed!');
};

test();
