import { beforeEach, describe, expect, it, vi } from 'vitest';

let goodService;

beforeEach(async () => {
  vi.resetModules();
  vi.restoreAllMocks();
  const mod = await import('../../src/services/goodService.js');
  goodService = mod.default;
});

describe('goodService.getGoodPage', () => {
  it('应携带分页、关键词和分类参数请求商品列表', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        code: 200,
        data: { list: [], total: 0, page: 2, pageSize: 8, hasMore: false },
      }),
    });

    const result = await goodService.getGoodPage({
      page: 2,
      pageSize: 8,
      keyword: '鼠标',
      categoryId: 'digital',
    });

    expect(result.page).toBe(2);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/products?page=2&pageSize=8&keyword=%E9%BC%A0%E6%A0%87&categoryId=digital',
      expect.objectContaining({ headers: {} })
    );
  });

  it('分类为 all 时不传 categoryId 参数', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        code: 200,
        data: { list: [], total: 0, page: 1, pageSize: 8, hasMore: false },
      }),
    });

    await goodService.getGoodPage({ categoryId: 'all' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/products?page=1&pageSize=8',
      expect.objectContaining({ headers: {} })
    );
  });
});
