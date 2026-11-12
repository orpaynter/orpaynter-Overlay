export type EvidenceMethod = 'survey' | 'inspected_lidar' | 'catalogue_lidar' | 'imagery' | 'public_footprint' | 'unknown';

export interface PilotRecord {
  tenantId?: string;
  actorId?: string;
  consent?: { status?: 'granted' | 'missing' | 'revoked'; evidenceId?: string; scope?: string; recordedAt?: string };
  objective?: string;
  baseline?: {
    currentTools?: string;
    matchCriteria?: string[];
    elapsedMinutes?: number | null;
    coordinationMinutes?: number | null;
    cost?: { amount?: number | null; currency?: string; laborAssumption?: string; aiAssumption?: string };
  };
  property?: {
    tenantId?: string;
    assetId?: string;
    authorizationEvidenceId?: string;
    permittedScope?: string;
    reviewedAt?: string;
    expiresAt?: string;
    revokedAt?: string | null;
  };
  event?: {
    sourceId?: string;
    sourceUrl?: string;
    publisher?: string;
    assetId?: string;
    eventAt?: string;
    publishedAt?: string;
    updatedAt?: string;
    retrievedAt?: string;
    spatialReference?: string;
    uncertainty?: string;
    limitations?: string;
    rights?: string;
  };
  plan?: {
    revision?: string;
    policyRevision?: string;
    scope?: string;
    sourceEvidenceIds?: string[];
    claims?: Array<{ kind?: 'measurement' | 'other'; method?: EvidenceMethod; inspected?: boolean; spatialReference?: string; uncertainty?: string; independentCheckId?: string }>;
  };
  approval?: {
    tenantId?: string;
    approverActorId?: string;
    authorizedActorId?: string;
    planRevision?: string;
    policyRevision?: string;
    scope?: string;
    approvedAt?: string;
    expiresAt?: string;
    revokedAt?: string | null;
  };
  actions?: Array<{
    tenantId?: string;
    actorId?: string;
    policyRevision?: string;
    scope?: string;
    planRevision?: string;
    approvalPlanRevision?: string;
    idempotencyKey?: string;
    receiptId?: string;
    durableReceipt?: boolean;
    outcome?: 'confirmed' | 'unknown' | 'reconciled';
  }>;
  verification?: {
    tenantId?: string;
    assetId?: string;
    verifierActorId?: string;
    verifierAuthorizationEvidenceId?: string;
    outcomeEvidenceId?: string;
  };
  learning?: {
    sourceOutcomeIds?: string[];
    permittedUse?: string;
    targetPlanRevision?: string;
    changesPolicy?: boolean;
    broadensAccess?: boolean;
    createsApproval?: boolean;
  };
}

export interface PilotFinding {
  code: string;
  severity: 'blocked' | 'review';
}

export interface PilotAssessment {
  recordSchemaComplete: boolean;
  handoffState: 'blocked';
  executionEnabled: false;
  findings: PilotFinding[];
}

export const PILOT_RUNTIME_READINESS = Object.freeze({
  state: 'blocked',
  liveIntakeEnabled: false,
  aiaIntegration: 'not-available-in-checkout',
  executionEnabled: false,
  pilotPaidProviderEnabled: false,
  missingCapabilities: [
    'tenant-scoped AIA pilot storage and authentication',
    'AIA validation, approval, durable receipt, verification, and reconciliation contract',
    'authorized customer consent, objective, baseline, and property evidence',
  ],
});

const present = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const validTime = (value: unknown): value is string => present(value) && Number.isFinite(Date.parse(value));
const validWebUrl = (value: unknown) => {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
};

export function assessPropertyPilot(record: PilotRecord, now = Date.now(), freshnessMs = 24 * 60 * 60 * 1000): PilotAssessment {
  const findings: PilotFinding[] = [];
  const block = (code: string) => findings.push({ code, severity: 'blocked' });
  const review = (code: string) => findings.push({ code, severity: 'review' });
  const tenant = record.tenantId;

  if (!present(tenant) || !present(record.actorId)) block('tenant-or-actor-missing');
  if (record.consent?.status !== 'granted' || !present(record.consent.evidenceId) ||
      !present(record.consent.scope) || !validTime(record.consent.recordedAt)) block('customer-consent-missing');
  if (!present(record.objective)) block('objective-missing');

  const baseline = record.baseline;
  if (!present(baseline?.currentTools) || !baseline.matchCriteria?.some(present)) block('matched-baseline-missing');
  if (!Number.isFinite(baseline?.elapsedMinutes) || Number(baseline?.elapsedMinutes) < 0 ||
      !Number.isFinite(baseline?.coordinationMinutes) || Number(baseline?.coordinationMinutes) < 0) block('baseline-time-missing');
  if (baseline?.cost?.amount == null || baseline.cost.amount < 0 || !present(baseline.cost.currency) ||
      !present(baseline.cost.laborAssumption) || !present(baseline.cost.aiAssumption)) block('baseline-cost-or-assumptions-missing');

  const property = record.property;
  if (!present(property?.assetId) || !present(property.authorizationEvidenceId) || !present(property.permittedScope) ||
      !validTime(property.reviewedAt) || !validTime(property.expiresAt) || property.revokedAt !== null) block('property-authorization-evidence-missing');
  if (validTime(property?.expiresAt) && Date.parse(property.expiresAt) <= now) block('property-authorization-expired');
  if (present(tenant) && present(property?.tenantId) && property.tenantId !== tenant) block('cross-tenant-property');

  const event = record.event;
  if (!present(event?.sourceId) || !validWebUrl(event?.sourceUrl) || !present(event?.publisher) ||
      !present(event?.assetId) ||
      !validTime(event?.eventAt) || !validTime(event?.publishedAt) || !validTime(event?.updatedAt) ||
      !validTime(event?.retrievedAt) || !present(event?.spatialReference) || !present(event?.uncertainty) ||
      !present(event?.limitations) || !present(event?.rights)) block('event-provenance-incomplete');
  if (validTime(event?.retrievedAt) && now - Date.parse(event.retrievedAt) > freshnessMs) block('event-evidence-stale');
  if (validTime(event?.retrievedAt) && Date.parse(event.retrievedAt) > now) block('event-retrieval-time-in-future');
  if (validTime(event?.retrievedAt) &&
      ((validTime(event?.publishedAt) && Date.parse(event.publishedAt) > Date.parse(event.retrievedAt)) ||
       (validTime(event?.updatedAt) && Date.parse(event.updatedAt) > Date.parse(event.retrievedAt)))) block('event-time-order-invalid');
  if (present(property?.assetId) && present(event?.assetId) && event.assetId !== property.assetId) block('event-property-binding-mismatch');

  const plan = record.plan;
  if (!present(plan?.revision) || !present(plan.policyRevision) || !plan.sourceEvidenceIds?.some(present)) block('inspectable-source-linked-plan-missing');
  if (present(event?.sourceId) && !plan?.sourceEvidenceIds?.includes(event.sourceId)) block('event-not-linked-to-plan');
  if (present(property?.permittedScope) && present(plan?.scope) && plan.scope !== property.permittedScope) block('plan-scope-exceeds-property-authorization');
  for (const claim of plan?.claims ?? []) {
    if (claim.kind !== 'measurement') continue;
    const inspectedMeasurement = (claim.method === 'survey' || claim.method === 'inspected_lidar') &&
      claim.inspected === true && present(claim.spatialReference) && present(claim.uncertainty) && present(claim.independentCheckId);
    if (!inspectedMeasurement) block('unsupported-measurement-claim');
  }

  const approval = record.approval;
  if (!present(approval?.tenantId) || !present(approval.approverActorId) || !present(approval.authorizedActorId) || !validTime(approval.approvedAt) ||
      !validTime(approval.expiresAt) || !present(approval.scope) || approval.revokedAt !== null) block('approval-missing-stale-or-revoked');
  if (present(tenant) && present(approval?.tenantId) && approval.tenantId !== tenant) block('cross-tenant-approval');
  if (approval && plan && (approval.planRevision !== plan.revision || approval.policyRevision !== plan.policyRevision)) block('approval-plan-or-policy-stale');
  if (approval && validTime(approval.approvedAt) && Date.parse(approval.approvedAt) > now) block('approval-time-invalid');
  if (approval && present(plan?.scope) && approval.scope !== plan.scope) block('approval-scope-mismatch');
  if (validTime(approval?.expiresAt) && Date.parse(approval.expiresAt) <= now) block('approval-expired');

  const seenKeys = new Set<string>();
  for (const action of record.actions ?? []) {
    if (!present(action.tenantId) || !present(action.actorId) || !present(action.policyRevision) ||
        !present(action.scope) || !present(action.planRevision) || !present(action.approvalPlanRevision) ||
        !present(action.idempotencyKey) || !present(action.receiptId) || action.durableReceipt !== true) block('consequential-action-receipt-incomplete');
    if (present(tenant) && present(action.tenantId) && action.tenantId !== tenant) block('cross-tenant-action');
    if (present(action.actorId) && action.actorId !== approval?.authorizedActorId) block('action-actor-approval-mismatch');
    if (action.outcome === 'unknown') block('reconciliation-required-no-blind-retry');
    if (present(action.idempotencyKey) && seenKeys.has(action.idempotencyKey)) block('duplicate-idempotency-key');
    if (present(action.idempotencyKey)) seenKeys.add(action.idempotencyKey);
    if (action.planRevision !== plan?.revision || action.approvalPlanRevision !== approval?.planRevision ||
        action.policyRevision !== approval?.policyRevision || action.scope !== approval?.scope) block('action-approval-binding-mismatch');
  }

  const verification = record.verification;
  if (record.actions?.length && (!present(verification?.tenantId) || !present(verification.assetId) ||
      !present(verification.verifierActorId) || !present(verification.verifierAuthorizationEvidenceId) ||
      !present(verification.outcomeEvidenceId))) block('independent-verification-missing');
  if (present(tenant) && present(verification?.tenantId) && verification.tenantId !== tenant) block('cross-tenant-verification');
  if (present(property?.assetId) && present(verification?.assetId) && verification.assetId !== property.assetId) block('verification-asset-mismatch');
  if (record.actions?.some(action => action.actorId === verification?.verifierActorId)) block('verifier-not-independent');

  const learning = record.learning;
  if (learning && (!learning.sourceOutcomeIds?.some(present) || !present(learning.permittedUse) ||
      learning.targetPlanRevision !== plan?.revision ||
      typeof learning.changesPolicy !== 'boolean' || typeof learning.broadensAccess !== 'boolean' ||
      typeof learning.createsApproval !== 'boolean')) block('learning-provenance-missing');
  if (learning && present(verification?.outcomeEvidenceId) && !learning.sourceOutcomeIds?.includes(verification.outcomeEvidenceId)) block('learning-outcome-reference-mismatch');
  if (learning?.changesPolicy || learning?.broadensAccess || learning?.createsApproval) block('learning-authority-escalation');

  review('evidence-authenticity-and-operator-authority-require-human-review');
  review('aia-validation-approval-receipt-and-verification-backend-unavailable');
  return {
    recordSchemaComplete: !findings.some(finding => finding.severity === 'blocked'),
    handoffState: 'blocked',
    executionEnabled: false,
    findings,
  };
}

export interface MatchedTaskMetrics {
  taskId: string;
  matchKey: string;
  outcome: 'completed' | 'failed' | 'aborted' | 'excluded';
  exclusionReason?: string;
  failureReason?: string;
  abortedReason?: string;
  baseline: TaskMetricObservation;
  pilot: TaskMetricObservation;
}

export interface TaskMetricObservation {
  elapsedMinutes: number | null;
  coordinationMinutes: number | null;
  cost: { amount: number | null; currency: string | null; laborAssumption: string | null; aiAssumption: string | null };
  evidenceCompleteness: { supported: number | null; required: number | null };
  unsupportedClaims: number | null;
  unauthorizedActions: number | null;
  duplicateConsequencesAfterFailure: number | null;
}

export interface MatchedTaskReport {
  denominator: number;
  failures: Array<{ taskId: string; reason: string }>;
  aborted: Array<{ taskId: string; reason: string }>;
  excluded: Array<{ taskId: string; reason: string }>;
  coordinationReductionPercent: Array<{ taskId: string; value: number | null; reason?: string }>;
  records: MatchedTaskMetrics[];
}

export function reconstructMatchedTaskReport(records: MatchedTaskMetrics[]): MatchedTaskReport {
  const excluded = records.filter(record => record.outcome === 'excluded' || (record.outcome === 'completed' && !present(record.matchKey))).map(record => ({
    taskId: record.taskId,
    reason: record.outcome === 'excluded' && present(record.exclusionReason) ? record.exclusionReason :
      record.outcome === 'completed' ? 'Matched-task key not supplied' : 'Exclusion reason not supplied',
  }));
  const comparable = records.filter(record => record.outcome === 'completed' && present(record.matchKey));
  return {
    denominator: comparable.filter(record =>
      Number.isFinite(record.baseline.coordinationMinutes) && Number.isFinite(record.pilot.coordinationMinutes) &&
      Number(record.baseline.coordinationMinutes) > 0 && Number(record.pilot.coordinationMinutes) >= 0).length,
    failures: records.filter(record => record.outcome === 'failed').map(record => ({
      taskId: record.taskId,
      reason: present(record.failureReason) ? record.failureReason : 'Failure reason not supplied',
    })),
    aborted: records.filter(record => record.outcome === 'aborted').map(record => ({
      taskId: record.taskId,
      reason: present(record.abortedReason) ? record.abortedReason : 'Abort reason not supplied',
    })),
    excluded,
    coordinationReductionPercent: comparable.map(record => {
      const baseline = record.baseline.coordinationMinutes;
      const pilot = record.pilot.coordinationMinutes;
      if (!Number.isFinite(baseline) || !Number.isFinite(pilot)) return { taskId: record.taskId, value: null, reason: 'Missing coordination-time observation' };
      if (Number(baseline) <= 0) return { taskId: record.taskId, value: null, reason: 'Baseline must be positive' };
      if (Number(pilot) < 0) return { taskId: record.taskId, value: null, reason: 'Pilot coordination time cannot be negative' };
      return { taskId: record.taskId, value: (Number(baseline) - Number(pilot)) / Number(baseline) * 100 };
    }),
    records,
  };
}
