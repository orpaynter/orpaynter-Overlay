import { describe, expect, it } from 'vitest';
import { assessPropertyPilot, reconstructMatchedTaskReport, type MatchedTaskMetrics, type PilotRecord } from './property-pilot';

const now = Date.parse('2026-10-02T00:00:00Z');

function record(overrides: Partial<PilotRecord> = {}): PilotRecord {
  return {
    tenantId: 'synthetic-tenant',
    actorId: 'synthetic-operator',
    consent: { status: 'granted', evidenceId: 'synthetic-consent', scope: 'synthetic-test-only', recordedAt: '2026-10-01T10:00:00Z' },
    objective: 'Synthetic objective: inspect a reported site after a storm.',
    baseline: {
      currentTools: 'Synthetic manual and GIS workflow',
      matchCriteria: ['same task class', 'same evidence threshold'],
      elapsedMinutes: 90,
      coordinationMinutes: 30,
      cost: { amount: 45, currency: 'USD', laborAssumption: 'synthetic labor rate', aiAssumption: 'no AI spend' },
    },
    property: {
      tenantId: 'synthetic-tenant',
      assetId: 'synthetic-property',
      authorizationEvidenceId: 'synthetic-authorization',
      permittedScope: 'read-only inspection planning',
      reviewedAt: '2026-10-01T10:05:00Z',
      expiresAt: '2026-10-03T10:05:00Z',
      revokedAt: null,
    },
    event: {
      sourceId: 'synthetic-event-1',
      sourceUrl: 'https://example.invalid/synthetic-event-1',
      publisher: 'Synthetic official-source placeholder',
      assetId: 'synthetic-property',
      eventAt: '2026-10-01T08:00:00Z',
      publishedAt: '2026-10-01T08:10:00Z',
      updatedAt: '2026-10-01T08:15:00Z',
      retrievedAt: '2026-10-01T10:00:00Z',
      spatialReference: 'EPSG:4326',
      uncertainty: 'Synthetic uncertainty; not a damage assessment.',
      limitations: 'Synthetic event; exposure does not establish damage.',
      rights: 'Synthetic example only; no real source data.',
    },
    plan: {
      revision: 'plan-1',
      policyRevision: 'policy-1',
      scope: 'read-only inspection planning',
      sourceEvidenceIds: ['synthetic-event-1'],
      claims: [{ kind: 'other' }],
    },
    approval: {
      tenantId: 'synthetic-tenant',
      approverActorId: 'synthetic-approver',
      authorizedActorId: 'synthetic-operator',
      planRevision: 'plan-1',
      policyRevision: 'policy-1',
      scope: 'read-only inspection planning',
      approvedAt: '2026-10-01T10:10:00Z',
      expiresAt: '2026-10-03T10:10:00Z',
      revokedAt: null,
    },
    actions: [{
      tenantId: 'synthetic-tenant',
      actorId: 'synthetic-operator',
      policyRevision: 'policy-1',
      scope: 'read-only inspection planning',
      planRevision: 'plan-1',
      approvalPlanRevision: 'plan-1',
      idempotencyKey: 'synthetic-idempotency-key',
      receiptId: 'synthetic-receipt',
      durableReceipt: true,
      outcome: 'confirmed',
    }],
    verification: {
      tenantId: 'synthetic-tenant',
      assetId: 'synthetic-property',
      verifierActorId: 'synthetic-independent-verifier',
      verifierAuthorizationEvidenceId: 'synthetic-verifier-authorization',
      outcomeEvidenceId: 'synthetic-outcome',
    },
    learning: {
      sourceOutcomeIds: ['synthetic-outcome'],
      permittedUse: 'improve draft ordering only',
      targetPlanRevision: 'plan-1',
      changesPolicy: false,
      broadensAccess: false,
      createsApproval: false,
    },
    ...overrides,
  };
}

function metric(overrides: Partial<MatchedTaskMetrics> = {}): MatchedTaskMetrics {
  const observation = {
    elapsedMinutes: 60,
    coordinationMinutes: 30,
    cost: { amount: 40, currency: 'USD', laborAssumption: 'synthetic labor rate', aiAssumption: 'synthetic AI estimate' },
    evidenceCompleteness: { supported: 3, required: 4 },
    unsupportedClaims: 0,
    unauthorizedActions: 0,
    duplicateConsequencesAfterFailure: 0,
  };
  return {
    taskId: 'synthetic-task',
    matchKey: 'synthetic-task-class',
    outcome: 'completed',
    baseline: { ...observation },
    pilot: { ...observation, coordinationMinutes: 15 },
    ...overrides,
  };
}

describe('property pilot contract boundary (synthetic data only)', () => {
  it('never promotes schema completeness to AIA handoff or execution authority', () => {
    const result = assessPropertyPilot(record(), now);
    expect(result.recordSchemaComplete).toBe(true);
    expect(result.handoffState).toBe('blocked');
    expect(result.executionEnabled).toBe(false);
    expect(result.findings.map(finding => finding.code)).toContain('aia-validation-approval-receipt-and-verification-backend-unavailable');
  });

  it('blocks absent consent and cross-tenant asset, approval, and action evidence', () => {
    const value = record({
      consent: { status: 'missing' },
      property: { ...record().property, tenantId: 'other-tenant' },
      approval: { ...record().approval, tenantId: 'other-tenant' },
      actions: [{ ...record().actions![0], tenantId: 'other-tenant' }],
    });
    const codes = assessPropertyPilot(value, now).findings.map(finding => finding.code);
    expect(codes).toContain('customer-consent-missing');
    expect(codes).toContain('cross-tenant-property');
    expect(codes).toContain('cross-tenant-approval');
    expect(codes).toContain('cross-tenant-action');
  });

  it('blocks incomplete or stale event provenance without inferring damage', () => {
    const missing = assessPropertyPilot(record({ event: { sourceId: 'event' } }), now);
    expect(missing.findings.map(finding => finding.code)).toContain('event-provenance-incomplete');
    const credentialUrl = assessPropertyPilot(record({ event: { ...record().event, sourceUrl: 'https://user@example.invalid/event' } }), now);
    expect(credentialUrl.findings.map(finding => finding.code)).toContain('event-provenance-incomplete');
    const stale = assessPropertyPilot(record({ event: { ...record().event, retrievedAt: '2026-09-01T00:00:00Z' } }), now);
    expect(stale.findings.map(finding => finding.code)).toContain('event-evidence-stale');
    expect(JSON.stringify(stale)).not.toContain('damage confirmed');
    const unbound = assessPropertyPilot(record({
      event: { ...record().event, assetId: 'another-synthetic-property' },
      plan: { ...record().plan, sourceEvidenceIds: ['some-other-source'] },
    }), now);
    expect(unbound.findings.map(finding => finding.code)).toContain('event-property-binding-mismatch');
    expect(unbound.findings.map(finding => finding.code)).toContain('event-not-linked-to-plan');
  });

  it('rejects unsupported dimensions and permits only inspected, checked survey or LiDAR evidence for review', () => {
    const unsupported = assessPropertyPilot(record({ plan: {
      ...record().plan,
      claims: [{ kind: 'measurement', method: 'imagery', inspected: true, spatialReference: 'EPSG:4326', uncertainty: 'unknown', independentCheckId: 'check' }],
    } }), now);
    expect(unsupported.findings.map(finding => finding.code)).toContain('unsupported-measurement-claim');
    const supported = assessPropertyPilot(record({ plan: {
      ...record().plan,
      claims: [{ kind: 'measurement', method: 'inspected_lidar', inspected: true, spatialReference: 'EPSG:26910', uncertainty: '±0.2 m synthetic', independentCheckId: 'synthetic-check' }],
    } }), now);
    expect(supported.recordSchemaComplete).toBe(true);
    expect(supported.executionEnabled).toBe(false);
  });

  it('invalidates approvals when plan or policy changes and blocks stale, expired, or revoked approval', () => {
    const value = record({
      plan: { ...record().plan, revision: 'plan-2' },
      approval: { ...record().approval, expiresAt: '2026-10-01T00:00:00Z', revokedAt: '2026-10-01T12:00:00Z' },
    });
    const codes = assessPropertyPilot(value, now).findings.map(finding => finding.code);
    expect(codes).toContain('approval-plan-or-policy-stale');
    expect(codes).toContain('approval-missing-stale-or-revoked');
    expect(codes).toContain('approval-expired');
    expect(codes).toContain('action-approval-binding-mismatch');
  });

  it('requires scoped durable receipts and independent authorized verifier evidence', () => {
    const value = record({
      actions: [{ ...record().actions![0], durableReceipt: false, receiptId: undefined }],
      verification: { ...record().verification, verifierActorId: 'synthetic-operator' },
    });
    const codes = assessPropertyPilot(value, now).findings.map(finding => finding.code);
    expect(codes).toContain('consequential-action-receipt-incomplete');
    expect(codes).not.toContain('action-actor-approval-mismatch');
    expect(codes).toContain('verifier-not-independent');
    expect(codes).not.toContain('independent-verification-missing');
    const actorMismatch = assessPropertyPilot(record({
      actions: [{ ...record().actions![0], actorId: 'another-synthetic-actor' }],
    }), now);
    expect(actorMismatch.findings.map(finding => finding.code)).toContain('action-actor-approval-mismatch');
  });

  it('requires reconciliation rather than blind retry for ambiguous outcomes and reports repeated idempotency keys', () => {
    const action = record().actions![0];
    const result = assessPropertyPilot(record({ actions: [
      { ...action, outcome: 'unknown' },
      { ...action, receiptId: 'synthetic-receipt-2' },
    ] }), now);
    const codes = result.findings.map(finding => finding.code);
    expect(codes).toContain('reconciliation-required-no-blind-retry');
    expect(codes).toContain('duplicate-idempotency-key');
  });

  it('allows provenance-linked learning for drafts but blocks any authority escalation', () => {
    const allowed = assessPropertyPilot(record(), now);
    expect(allowed.findings.map(finding => finding.code)).not.toContain('learning-authority-escalation');
    const escalated = assessPropertyPilot(record({ learning: {
      sourceOutcomeIds: ['synthetic-outcome'],
      permittedUse: 'grant broader access',
      targetPlanRevision: 'plan-1',
      changesPolicy: true,
      broadensAccess: true,
      createsApproval: true,
    } }), now);
    expect(escalated.findings.map(finding => finding.code)).toContain('learning-authority-escalation');
    const unlinked = assessPropertyPilot(record({ learning: { ...record().learning, targetPlanRevision: 'different-plan' } }), now);
    expect(unlinked.findings.map(finding => finding.code)).toContain('learning-provenance-missing');
  });

  it('does not treat absent baseline cost or assumptions as zero', () => {
    const result = assessPropertyPilot(record({
      baseline: { ...record().baseline, cost: { amount: null, currency: 'USD' } },
    }), now);
    expect(result.findings.map(finding => finding.code)).toContain('baseline-cost-or-assumptions-missing');
  });
});

describe('reconstructable matched-task report', () => {
  it('keeps the raw observations and denominator, exposing missing, zero, failed, aborted, and excluded cases', () => {
    const records = [
      metric(),
      metric({ taskId: 'missing', baseline: { ...metric().baseline, coordinationMinutes: null }, pilot: { ...metric().pilot } }),
      metric({ taskId: 'zero', baseline: { ...metric().baseline, coordinationMinutes: 0 } }),
      metric({ taskId: 'failed', outcome: 'failed', failureReason: 'Synthetic injected failure' }),
      metric({ taskId: 'aborted', outcome: 'aborted', abortedReason: 'Synthetic operator stop' }),
      metric({ taskId: 'excluded', outcome: 'excluded', exclusionReason: 'Synthetic unmatched task' }),
      metric({ taskId: 'no-match-key', matchKey: '' }),
    ];
    const report = reconstructMatchedTaskReport(records);
    expect(report.denominator).toBe(1);
    expect(report.coordinationReductionPercent.find(item => item.taskId === 'synthetic-task')?.value).toBe(50);
    expect(report.coordinationReductionPercent.find(item => item.taskId === 'missing')?.value).toBeNull();
    expect(report.coordinationReductionPercent.find(item => item.taskId === 'zero')).toMatchObject({ value: null, reason: 'Baseline must be positive' });
    expect(report.failures).toEqual([{ taskId: 'failed', reason: 'Synthetic injected failure' }]);
    expect(report.aborted).toEqual([{ taskId: 'aborted', reason: 'Synthetic operator stop' }]);
    expect(report.excluded).toHaveLength(2);
    expect(report.records[0].baseline.cost.currency).toBe('USD');
    expect(report.records[0].pilot.evidenceCompleteness).toEqual({ supported: 3, required: 4 });
    expect(report.records[0].pilot.unsupportedClaims).toBe(0);
    expect(report.records[0].pilot.unauthorizedActions).toBe(0);
    expect(report.records[0].pilot.duplicateConsequencesAfterFailure).toBe(0);
  });
});
