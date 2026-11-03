jest.mock('@/lib/csrf', () => ({ requireCsrf: jest.fn().mockResolvedValue(null) }));
jest.mock('@/lib/auth', () => ({ verifyAccessToken: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/config/db', () => ({ db: { execute: jest.fn() } }));
jest.mock('@/lib/transactional-database', () => ({ transactionalDb: { transaction: jest.fn() } }));

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { PgDialect } from 'drizzle-orm/pg-core';
import { verifyAccessToken } from '@/lib/auth';
import { db } from '@/config/db';
import { transactionalDb } from '@/lib/transactional-database';
import { POST } from '@/app/api/courses/[id]/enroll/route';

const courseId = '11111111-1111-4111-8111-111111111111';
const company = '22222222-2222-4222-8222-222222222222';
const foreignCompany = '33333333-3333-4333-8333-333333333333';
const query = db.execute as jest.Mock;
const transaction = transactionalDb.transaction as jest.Mock;
const txExecute = jest.fn();
const dialect = new PgDialect();
function request() {
  return new NextRequest(`http://localhost/api/courses/${courseId}/enroll`, {
    method: 'POST', headers: { 'x-company-id': foreignCompany }, body: '{}',
  });
}
beforeEach(() => {
  jest.resetAllMocks();
  jest.requireMock('@/lib/csrf').requireCsrf.mockResolvedValue(null);
  (cookies as jest.Mock).mockResolvedValue({ get: () => ({ value: 'test-token' }) });
  (verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'student', companyId: company, email: 'audit@example.invalid', permissions: ['courses:enroll'] });
  transaction.mockImplementation(async callback => callback({ execute: txExecute }));
  txExecute.mockResolvedValue({ rows: [{ id: 'enrollment' }] });
});

test('forged company header cannot change plan lookup or enrollment ownership', async () => {
  query.mockResolvedValueOnce({ rows: [{ id: courseId, isPublic: true, visibility: 'public' }] })
    .mockResolvedValueOnce({ rows: [{ subscriptionPlan: 'pro' }] });
  const response = await POST(request(), { params: Promise.resolve({ id: courseId }) });
  expect(response.status).toBe(201);
  const planParams = dialect.sqlToQuery(query.mock.calls[1][0]).params;
  const insertParams = dialect.sqlToQuery(txExecute.mock.calls[0][0]).params;
  expect(planParams).toContain(company);
  expect(insertParams).toContain(company);
  expect([...planParams, ...insertParams]).not.toContain(foreignCompany);
});

test('enrollment permission alone cannot enroll in another company private course', async () => {
  query.mockResolvedValueOnce({ rows: [{ id: courseId, companyId: foreignCompany, isPublic: false, visibility: 'private' }] });
  expect((await POST(request(), { params: Promise.resolve({ id: courseId }) })).status).toBe(403);
  expect(transaction).not.toHaveBeenCalled();
});
