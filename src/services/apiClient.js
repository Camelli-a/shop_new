export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('无法连接后端服务，请先运行 npm run server');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('后端返回了无效数据');
  }

  if (!response.ok || result.code !== 200) {
    throw new Error(result.message || '请求失败');
  }

  return result.data;
}
