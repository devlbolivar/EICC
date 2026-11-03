import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { sql } from 'drizzle-orm';
import { courseReadScope } from '../../lib/course-access';

const user = '11111111-1111-4111-8111-111111111111';
const company = '22222222-2222-4222-8222-222222222222';
const otherCompany = '33333333-3333-4333-8333-333333333333';
const course = '44444444-4444-4444-8444-444444444444';

test('fresh database: migrate, query current columns, reject duplicate enrollments, rollback atomically', async () => {
  const client = new PGlite();
  const db = drizzle(client);
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    await migrate(db, { migrationsFolder: './drizzle' }); // rerun is harmless
    await client.query('SELECT "passwordChangedAt" FROM users');
    await client.query('SELECT * FROM support_tickets');
    await client.query(`INSERT INTO users (id, email, name) VALUES ($1, 'audit@example.invalid', 'Audit')`, [user]);
    await client.query(`INSERT INTO companies (id, name, rut) VALUES ($1, 'A', 'audit-a'), ($2, 'B', 'audit-b')`, [company, otherCompany]);
    await client.query(`INSERT INTO courses (id, cid, name, description, "numberOfChapters", difficulty, category, "createdBy", "companyId", visibility) VALUES ($1, 'audit', 'Course', '', 1, 'basic', 'test', $2, $3, 'private')`, [course, user, company]);
    const insert = 'INSERT INTO enroll_course (course_id,user_id,company_id) VALUES ($1,$2,$3) ON CONFLICT (course_id,user_id) DO NOTHING RETURNING id';
    assert.equal((await client.query(insert, [course,user,company])).rows.length, 1);
    assert.equal((await client.query(insert, [course,user,company])).rows.length, 0);
    await assert.rejects(db.transaction(async tx => {
      await tx.execute(sql`UPDATE enroll_course SET progress = 100`);
      throw new Error('certificate insertion failed');
    }), /certificate insertion failed/);
    assert.equal((await client.query<{progress:number}>('SELECT progress FROM enroll_course')).rows[0].progress, 0);
    const actor = { userId: '55555555-5555-4555-8555-555555555555', companyId: otherCompany, permissions: ['courses:read'] };
    assert.equal((await db.execute(sql`SELECT id FROM courses c WHERE ${courseReadScope(actor)}`)).rows.length, 0);
    await client.query(`UPDATE courses SET visibility='specific_companies', "targetCompanies"=$1::json`, [JSON.stringify([otherCompany])]);
    assert.equal((await db.execute(sql`SELECT id FROM courses c WHERE ${courseReadScope(actor)}`)).rows.length, 1);
  } finally { await client.close(); }
});

test('upgrade accepts a manually renamed table and refuses to erase duplicate data', async () => {
  const client = new PGlite();
  const migrations = readMigrationFiles({ migrationsFolder: './drizzle' });
  try {
    for (const migration of migrations.slice(0,2)) for (const statement of migration.sql) await client.exec(statement);
    await client.exec('ALTER TABLE "enrollCourse" RENAME TO enroll_course');
    for (const statement of migrations[2].sql) await client.exec(statement);
    await client.query(`INSERT INTO users (id,email,name) VALUES ($1,'audit@example.invalid','Audit')`,[user]);
    await client.query(`INSERT INTO courses (id,cid,name,description,"numberOfChapters",difficulty,category,"createdBy") VALUES ($1,'audit','Course','',1,'basic','test',$2)`,[course,user]);
    await client.query('INSERT INTO enroll_course (course_id,user_id) VALUES ($1,$2),($1,$2)',[course,user]);
    await assert.rejects(async () => { for (const statement of migrations[4].sql) await client.exec(statement); }, /Duplicate enrollments/);
    assert.equal((await client.query('SELECT * FROM enroll_course')).rows.length,2);
  } finally { await client.close(); }
});
