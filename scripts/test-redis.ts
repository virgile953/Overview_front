import { createClient } from "redis";

async function testRedis() {
  console.log('🔴 Starting Redis connection test...\n');

  // Create Redis client
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  // Handle errors
  client.on('error', (err) => console.error('❌ Redis Client Error:', err));

  try {
    // Connect
    console.log('📡 Connecting to Redis...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Test 1: Set and Get
    console.log('Test 1: Basic SET/GET');
    await client.set('test:key', 'Hello Redis!');
    const value = await client.get('test:key');
    console.log(`  SET test:key = "Hello Redis!"`);
    console.log(`  GET test:key = "${value}"`);
    console.log(`  ✅ Result: ${value === 'Hello Redis!' ? 'PASS' : 'FAIL'}\n`);

    // Test 2: Set with expiration
    console.log('Test 2: SET with expiration (5 seconds)');
    await client.setEx('test:expiring', 5, 'This will expire');
    const ttl = await client.ttl('test:expiring');
    console.log(`  TTL: ${ttl} seconds`);
    console.log(`  ✅ Result: ${ttl > 0 ? 'PASS' : 'FAIL'}\n`);

    // Test 3: Hash operations
    console.log('Test 3: Hash operations');
    await client.hSet('test:device:001', {
      name: 'Test Device',
      status: 'online',
      lastSeen: new Date().toISOString(),
    });
    const device = await client.hGetAll('test:device:001');
    console.log('  HSET test:device:001');
    console.log('  Device data:', device);
    console.log(`  ✅ Result: ${device.name === 'Test Device' ? 'PASS' : 'FAIL'}\n`);

    // Test 4: List operations
    console.log('Test 4: List operations');
    await client.rPush('test:devices', ['device1', 'device2', 'device3']);
    const devices = await client.lRange('test:devices', 0, -1);
    console.log('  RPUSH test:devices [device1, device2, device3]');
    console.log('  LRANGE test:devices:', devices);
    console.log(`  ✅ Result: ${devices.length === 3 ? 'PASS' : 'FAIL'}\n`);

    // Test 5: Set operations
    console.log('Test 5: Set operations');
    await client.sAdd('test:orgs', ['org1', 'org2', 'org3']);
    const orgCount = await client.sCard('test:orgs');
    const isMember = await client.sIsMember('test:orgs', 'org1');
    console.log('  SADD test:orgs [org1, org2, org3]');
    console.log(`  SCARD test:orgs: ${orgCount}`);
    console.log(`  SISMEMBER org1: ${isMember}`);
    console.log(`  ✅ Result: ${orgCount === 3 && isMember ? 'PASS' : 'FAIL'}\n`);

    // Test 6: JSON operations (if RedisJSON is installed)
    console.log('Test 6: JSON operations (requires RedisJSON module)');
    try {
      await client.json.set('test:json', '$', {
        device: {
          id: '001',
          name: 'Test Device',
          metrics: { cpu: 45, memory: 60 },
        },
      });
      const jsonData = await client.json.get('test:json');
      console.log('  JSON.SET test:json');
      console.log('  JSON data:', jsonData);
      console.log('  ✅ Result: PASS (RedisJSON available)\n');
    } catch (error) {
      console.log('  ⚠️  RedisJSON not available (optional)\n', error);
    }

    // Cleanup
    console.log('🧹 Cleaning up test keys...');
    await client.del([
      'test:key',
      'test:expiring',
      'test:device:001',
      'test:devices',
      'test:orgs',
      'test:json',
    ]);
    console.log('✅ Cleanup complete\n');

    // Get Redis info
    console.log('📊 Redis Server Info:');
    const info = await client.info('server');
    const lines = info.split('\r\n').filter(l => l && !l.startsWith('#'));
    lines.slice(0, 5).forEach(line => console.log(`  ${line}`));

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await client.quit();
    console.log('\n👋 Disconnected from Redis');
  }
}

// Run the test
testRedis()
  .then(() => {
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
