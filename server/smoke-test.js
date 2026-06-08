const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const testDb = path.join(__dirname, 'data', 'db.test.json');
const port = 5099;
const baseUrl = `http://127.0.0.1:${port}`;

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function request(pathname, options) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  });
  const result = await response.json();
  if (!response.ok || result.code !== 200) {
    throw new Error(`${pathname}: ${result.message || response.status}`);
  }
  return result.data;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await request('/api/products');
      return;
    } catch {
      await wait(100);
    }
  }
  throw new Error('测试服务器启动超时');
}

async function run() {
  fs.rmSync(testDb, { force: true });
  const server = spawn(process.execPath, ['server/server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), MALL_DB_PATH: testDb },
    stdio: 'ignore',
  });

  try {
    await waitForServer();
    const products = await request('/api/products');
    const product = products[0];
    await request('/api/users/1/cart', {
      method: 'POST',
      body: JSON.stringify({ goodId: product.id, sku: '标准版', quantity: 2 }),
    });
    const cart = await request('/api/users/1/cart');
    const order = await request('/api/users/1/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cart,
        receiver: '测试用户',
        receiverPhone: '13800000000',
        address: '测试地址',
      }),
    });
    const paidOrder = await request(`/api/orders/${order.id}/pay`, {
      method: 'PUT',
      body: JSON.stringify({ payMethod: '微信支付' }),
    });
    const adminOrders = await request('/api/admin/orders?page=1&pageSize=10');

    if (paidOrder.status !== 1 || adminOrders.total !== 1) {
      throw new Error('订单支付或前后台联动验证失败');
    }
    console.log('API smoke test passed');
  } finally {
    server.kill();
    await wait(100);
    fs.rmSync(testDb, { force: true });
  }
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
