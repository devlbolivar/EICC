jest.mock('@/lib/csrf', () => ({ requireCsrf: jest.fn().mockResolvedValue(null) }));
jest.mock('@/lib/auth', () => ({ verifyAccessToken: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/config/db', () => ({ db: { execute: jest.fn(), update: jest.fn() } }));

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { db } from '@/config/db';
import { GET, PUT, DELETE } from '@/app/api/courses/[id]/route';

const courseId = '11111111-1111-4111-8111-111111111111';
const params = { params: Promise.resolve({ id: courseId }) };
const privateCourse = { id: courseId, createdBy: 'owner-a', companyId: 'company-a', isPublic: false, visibility: 'private' };
const query = db.execute as jest.Mock;
const update = db.update as jest.Mock;
const verify = verifyAccessToken as jest.Mock;
function request(method = 'GET') {
  return new NextRequest(`http://localhost/api/courses/${courseId}`, { method, ...(method === 'PUT' ? { body: JSON.stringify({ name: 'Changed' }) } : {}) });
}
beforeEach(() => {
  jest.clearAllMocks();
  (cookies as jest.Mock).mockResolvedValue({ get: () => ({ value: 'test-token' }) });
  query.mockResolvedValue({ rows: [privateCourse] });
  update.mockReturnValue({ set: () => ({ where: () => ({ returning: async () => [privateCourse] }) }) });
});

test('student cannot read a private course belonging to another company', async () => {
  verify.mockReturnValue({ userId: 'student-b', companyId: 'company-b', permissions: ['courses:read'] });
  expect((await GET(request(), params)).status).toBe(403);
});
test('company course editor cannot modify another company course', async () => {
  verify.mockReturnValue({ userId: 'editor-b', companyId: 'company-b', permissions: ['company:admin', 'courses:edit'] });
  expect((await PUT(request('PUT'), params)).status).toBe(403);
  expect(update).not.toHaveBeenCalled();
});
test('company course deleter cannot delete another company course', async () => {
  verify.mockReturnValue({ userId: 'editor-b', companyId: 'company-b', permissions: ['company:admin', 'courses:delete'] });
  expect((await DELETE(request('DELETE'), params)).status).toBe(403);
  expect(update).not.toHaveBeenCalled();
});
test('unaffiliated users do not share access to all company-less private courses', async () => {
  query.mockResolvedValue({ rows: [{ ...privateCourse, companyId: null }] });
  verify.mockReturnValue({ userId: 'student-b', permissions: ['courses:read'] });
  expect((await GET(request(), params)).status).toBe(403);
});
test.each([
  ['own company', { userId: 'student-a', companyId: 'company-a', permissions: ['courses:read'] }, privateCourse],
  ['public course', { userId: 'student-b', permissions: ['courses:read'] }, { ...privateCourse, isPublic: true, visibility: 'public' }],
  ['platform admin', { userId: 'admin', permissions: ['platform:admin'] }, privateCourse],
  ['target company', { userId: 'student-b', companyId: 'company-b', permissions: ['courses:read'] }, { ...privateCourse, visibility: 'specific_companies', targetCompanies: ['company-b'] }],
])('allows reading for %s', async (_name, payload, course) => {
  verify.mockReturnValue(payload);
  query.mockResolvedValue({ rows: [course] });
  expect((await GET(request(), params)).status).toBe(200);
});
