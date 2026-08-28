import test from 'node:test';
import assert from 'node:assert/strict';
import { isAppRole, safeNextPath } from './auth-policy.ts';

test('accepts only the two database roles', () => {
  assert.equal(isAppRole('ADMIN'), true);
  assert.equal(isAppRole('USER'), true);
  assert.equal(isAppRole('admin'), false);
  assert.equal(isAppRole(null), false);
});

test('allows only local next paths after login', () => {
  assert.equal(safeNextPath('/analysis/stockout'), '/analysis/stockout');
  assert.equal(safeNextPath('//evil.example'), '/');
  assert.equal(safeNextPath('https://evil.example'), '/');
  assert.equal(safeNextPath(null), '/');
});
