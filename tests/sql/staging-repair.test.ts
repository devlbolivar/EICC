import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const repair = readFileSync('scripts/repair-staging-enrollment-index.sql', 'utf8');

test('staging repair is repeatable, preserves data, and enforces enrollment uniqueness', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE TABLE enroll_course (user_id uuid, course_id uuid); CREATE INDEX user_course_idx ON enroll_course(user_id,course_id)');
    await db.exec("INSERT INTO enroll_course VALUES ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222')");
    await db.transaction(tx => tx.exec(repair));
    await db.transaction(tx => tx.exec(repair));
    await assert.rejects(db.exec('INSERT INTO enroll_course SELECT * FROM enroll_course'), /duplicate key/);
    assert.equal((await db.query('SELECT * FROM enroll_course')).rows.length, 1);
  } finally { await db.close(); }
});

test('staging repair refuses duplicates and rolls back without changing the original index', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE TABLE enroll_course (user_id int, course_id int); CREATE INDEX user_course_idx ON enroll_course(user_id,course_id); INSERT INTO enroll_course VALUES (1,2),(1,2)');
    await assert.rejects(db.transaction(tx => tx.exec(repair)), /Duplicate enrollments/);
    assert.equal((await db.query('SELECT * FROM enroll_course')).rows.length, 2);
    assert.equal((await db.query<{indisunique:boolean}>("SELECT indisunique FROM pg_index WHERE indexrelid='user_course_idx'::regclass")).rows[0].indisunique, false);
  } finally { await db.close(); }
});
