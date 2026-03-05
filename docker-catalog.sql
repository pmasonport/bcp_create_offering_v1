-- Docker Catalog Seed Data
-- Based on: https://www.docker.com/pricing/
-- Source: saas-mega Go entitlement definitions
-- Includes: Personal, Pro, Team, and Business tiers
-- Note: Prices and features should be verified against current pricing page

-- =============================================================================
-- 1. SERVICES
-- =============================================================================

INSERT INTO services (id, slug, service_name, description) VALUES
    ('svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'general', 'General', 'Core platform features including seats and billing'),
    ('svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'hub', 'Docker Hub', 'Container registry and image management'),
    ('svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'admin', 'Docker Admin', 'Organization administration and security features'),
    ('svc_1zIJKVviBponckfnsE7hyjkM837a', 'build', 'Docker Build', 'Build minutes and build capabilities'),
    ('svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'scout', 'Docker Scout', 'Security scanning and vulnerability detection');

-- =============================================================================
-- 2. SERVICE FEATURES
-- =============================================================================

-- General service features
INSERT INTO service_features (id, service_id, slug, feature_name, description, feature_type, mutable, metering_type) VALUES
    ('feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'seats', 'Seats', 'Number of user seats in the organization', 'integer', true, 'static');

-- Hub features (matching Go entitlements exactly)
INSERT INTO service_features (id, service_id, slug, feature_name, description, feature_type, mutable, metering_type) VALUES
    ('feat_1RXGtFPSM3asOPxs2H1va6OpReLC', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'trusted_content_catalog_enabled', 'Trusted Content Catalog Enabled', 'Access to trusted content catalog', 'boolean', false, null),
    ('feat_1NFdRltuP87bCSdAP9xGaRpYhqVy', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'webhooks_enabled', 'Webhooks Enabled', 'Support for webhooks', 'boolean', false, null),
    ('feat_1FpNtoYO1T0sKzAyjVjoahE6KdTZ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'automated_tests_enabled', 'Automated Tests Enabled', 'Support for automated tests', 'boolean', false, null),
    ('feat_1RhOD36WibsTQt9TszZUad5Qx06A', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'github_integration_enabled', 'GitHub Integration Enabled', 'GitHub integration support', 'boolean', false, null),
    ('feat_1V3tPvJeo3opKG3JaF6ZFRLQnWh8', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'bitbucket_integration_enabled', 'Bitbucket Integration Enabled', 'Bitbucket integration support', 'boolean', false, null),
    ('feat_1qwb1aexL67VFyGscPOgIx0B2gTS', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'automated_builds_enabled', 'Automated Builds Enabled', 'Support for automated builds', 'boolean', false, null),
    ('feat_1JnGqFqSqD8fXvwX0R7jP6SuCWFa', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'concurrent_builds_limit', 'Concurrent Builds Limit', 'Number of concurrent builds allowed', 'integer', false, 'static'),
    ('feat_1ICu9LZ3sq513iCGUTvPgNYfnVCx', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'public_repositories_limit', 'Public Repositories Limit', 'Number of public repositories allowed', 'integer', false, 'static'),
    ('feat_18a2clmVyxnhIRGDRFkyWptUuUU5', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'public_repositories_storage_gib_limit', 'Public Repositories Storage GiB Limit', 'Storage limit for public repositories in GiB', 'integer', false, 'static'),
    ('feat_118gN6FBPprdJ6gUCKTZDk2x4Nvw', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'image_access_management_enabled', 'Image Access Management Enabled', 'Control which images developers can access', 'boolean', false, null),
    ('feat_1OptAPM9JMJ6FpqKQUJKYujWCkIC', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'image_pull_rate_limit_per_hour', 'Image Pull Rate Limit Per Hour', 'Hourly image pull rate limit', 'integer', false, 'static'),
    ('feat_1a7JyU4qwUI9Pq21axfsYX22jBzn', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'image_pull_count_included_monthly', 'Image Pull Count Included Monthly', 'Monthly included image pulls', 'integer', false, 'static'),
    ('feat_1L1Agb4ZkfYxz7M5DpuqtVwPTKW7', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'image_pull_count_additional_annual', 'Image Pull Count Additional Annual', 'Additional annual image pulls (retain-eligible)', 'integer', true, 'static'),
    ('feat_1x8rMPZnJaPQRjxzypgsVDO7AciE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'private_repositories_limit', 'Private Repositories Limit', 'Number of private repositories allowed', 'integer', false, 'static'),
    ('feat_1mDXSXyoxWDTUEjhtCnkVdWhXwB8', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'private_repositories_storage_gib_included_limit', 'Private Repositories Storage GiB Included Limit', 'Included storage for private repositories in GiB', 'integer', false, 'static'),
    ('feat_1n7mUFqm6Ppi8JFLBmuRIPBbOmn1', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'private_repositories_storage_gib_additional_limit', 'Private Repositories Storage GiB Additional Limit', 'Additional storage for private repositories in GiB (retain-eligible)', 'integer', true, 'static');

-- Admin features (matching Go entitlements exactly)
INSERT INTO service_features (id, service_id, slug, feature_name, description, feature_type, mutable, metering_type) VALUES
    ('feat_1Ymy6uzYcIOp0CD30CuqTmO47P9Y', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'personal_access_tokens_enabled', 'Personal Access Tokens Enabled', 'Support for personal access tokens', 'boolean', false, null),
    ('feat_1dpwUNfiQEG1WdFifyUSxrFBl4Ua', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'organization_access_tokens_limit', 'Organization Access Tokens Limit', 'Maximum number of organization access tokens', 'integer', false, 'static'),
    ('feat_1EDIRimtL1bnTBvzGSS2OlmLs51z', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'add_users_in_bulk_enabled', 'Add Users In Bulk Enabled', 'Ability to add users in bulk', 'boolean', false, null),
    ('feat_1KlOvT9jdUJlnraLPS5htSEmykbY', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'role_based_access_control_enabled', 'Role-Based Access Control Enabled', 'Team permission management (RBAC)', 'boolean', false, null),
    ('feat_1Q72e0hebmsLHuHyIGFkopOgoDBu', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'audit_logs_enabled', 'Audit Logs Enabled', 'Activity audit logging', 'boolean', false, null),
    ('feat_141mflU952H7mCojrbfr96YIZC6X', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'desktop_usage_insight_dashboard_enabled', 'Desktop Usage Insight Dashboard Enabled', 'Access to desktop usage insights', 'boolean', false, null),
    ('feat_15uR0xuJU7SBRIfStQ4IIZwoyxQ5', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'domain_audit_enabled', 'Domain Audit Enabled', 'Domain audit capabilities', 'boolean', false, null),
    ('feat_1BD39XvtBJuRMW1CtgC6HNQ7dCtf', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'account_hierarchy_enabled', 'Account Hierarchy Enabled', 'Support for account hierarchies', 'boolean', false, null),
    ('feat_1F0S8SGgLA6H6dj9Fbjy7039PimJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'account_hierarchy_member_limit', 'Account Hierarchy Member Limit', 'Maximum members in account hierarchy', 'integer', false, 'static'),
    ('feat_1oBQdBLFYEYXN9i3zY4kfz3v6HKI', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'single_sign_on_enabled', 'Single Sign-On Enabled', 'SSO authentication', 'boolean', false, null),
    ('feat_1SAFn7F7sMP5trbYCahqkvsVTyrd', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'system_for_cross_domain_identity_management_enabled', 'SCIM Enabled', 'System for Cross-Domain Identity Management', 'boolean', false, null),
    ('feat_1dxpiOsfAJHlaTcT0b3vf6BEGCSh', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'settings_management_enabled', 'Settings Management Enabled', 'Centralized settings management', 'boolean', false, null),
    ('feat_1z5sG1h7kmFrkKnGcDtszFwIX6ho', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'account_association_enabled', 'Account Association Enabled', 'Account association capabilities', 'boolean', false, null),
    ('feat_1cqsTpFfEPg5tigJtjk0hcJXfRQa', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'oidc_connections_limit', 'OIDC Connections Limit', 'Maximum number of OIDC connections', 'integer', false, 'static'),
    ('feat_1HwyOg8zVoa4zdmeR48uYaXfutEv', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'custom_roles_enabled', 'Custom Roles Enabled', 'Support for custom roles', 'boolean', false, null);

-- Build features (matching Go entitlements exactly)
INSERT INTO service_features (id, service_id, slug, feature_name, description, feature_type, mutable, metering_type) VALUES
    ('feat_1KQ2ne2aAhWwVjzfkDO6NKkyHUG2', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'concurrent_builds_limit', 'Concurrent Builds Limit', 'Number of concurrent builds allowed', 'integer', false, 'static'),
    ('feat_1P93kehpeMsMsJPlS0fU9DbGS5wp', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'cloud_builders_type', 'Cloud Builders Type', 'Type of cloud builders (none, basic, standard)', 'string', false, null),
    ('feat_1H4oL3iyKctvRqAmVVeD4VA9h57w', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'storage_gib_limit', 'Storage GiB Limit', 'Build storage limit in GiB', 'integer', false, 'static'),
    ('feat_1aFWGyzD3RdEzh0PsL07nR4fC76x', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'build_minutes_included_monthly', 'Build Minutes Included Monthly', 'Monthly included build minutes', 'integer', false, 'static'),
    ('feat_1qKDpC9z71UYfX0zrjjPMdmJAKW6', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'build_minutes_additional_annual', 'Build Minutes Additional Annual', 'Additional annual build minutes (retain-eligible)', 'integer', true, 'static');

-- Scout features (matching Go entitlements exactly)
INSERT INTO service_features (id, service_id, slug, feature_name, description, feature_type, mutable, metering_type) VALUES
    ('feat_1EoOgSb3d4r3l1n1a66rQpOPvZnw', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'health_scores_enabled', 'Health Scores Enabled', 'Access to health scores', 'boolean', false, null),
    ('feat_16eSchjGFelOXCVq91AdcVVqle0A', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'local_vulnerability_analysis_enabled', 'Local Vulnerability Analysis Enabled', 'Local vulnerability scanning', 'boolean', false, null),
    ('feat_1cutxJqhUVUFCvtiimRcvhgZ6S0Z', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'image_remediation_enabled', 'Image Remediation Enabled', 'Image remediation guidance', 'boolean', false, null),
    ('feat_1VCDFZwGhJqB0o2WdT8PHrXqUKbQ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'docker_integrations_enabled', 'Docker Integrations Enabled', 'Docker-specific integrations', 'boolean', false, null),
    ('feat_1RU4uSBgvqlkppgN50T3PfFhbSC8', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'sdlc_integrations', 'SDLC Integrations', 'Number of SDLC integrations allowed', 'integer', false, 'static'),
    ('feat_1A1k27pKrtKCnnCu0jwji5l8cxgh', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'policy_library_and_evaluation_type', 'Policy Library and Evaluation Type', 'Policy library type (none, basic, standard)', 'string', false, null),
    ('feat_1lacqaWYhXeeTXFxjEKVxmGxgc1G', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'alerting_and_notifications_type', 'Alerting and Notifications Type', 'Alerting type (none, basic, standard)', 'string', false, null),
    ('feat_1EkfLOUJPsDzgjxGPC6iZ8oZj9zQ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'vulnerability_reporting_enabled', 'Vulnerability Reporting Enabled', 'Vulnerability reporting capabilities', 'boolean', false, null),
    ('feat_1ngYjostIs259530Kln6bmniEzzT', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'cve_suppression_and_exception_enabled', 'CVE Suppression and Exception Enabled', 'CVE suppression capabilities', 'boolean', false, null),
    ('feat_1kvaLHrvLHeLXPFOigGlhfASMi4k', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'api_integrations_enabled', 'API Integrations Enabled', 'Scout API integration support', 'boolean', false, null),
    ('feat_1WDgl7GgOCInCrRvZ1BMH1kqN7rd', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'remote_repositories', 'Remote Repositories', 'Number of Scout-enabled remote repositories', 'integer', false, 'static');

-- =============================================================================
-- 3. STRATEGY GROUP
-- =============================================================================

INSERT INTO offering_groups (id, slug, group_name, display_name, description) VALUES
    ('grp_1zSlAC5QvmV054mB6oSajONG2LoZ', 'dsop', 'DSoP', 'Docker Suite of Products', 'Docker core subscription tiers');

-- =============================================================================
-- 4. MONETIZATION STRATEGIES
-- =============================================================================

INSERT INTO offerings (id, slug, group_id, offering_name, description, offering_package, monetization_strategy, account_type, requires_offering_id, external_id, external_system, status) VALUES
    ('off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'docker-personal', 'grp_1zSlAC5QvmV054mB6oSajONG2LoZ', 'Docker Personal', 'Free tier for individual developers', 'bundle', 'subscription', 'user', null, null, null, 'active'),
    ('off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'docker-pro', 'grp_1zSlAC5QvmV054mB6oSajONG2LoZ', 'Docker Pro', 'Professional tier for individual developers', 'bundle', 'subscription', 'user', null, 'prod_QqPZPZDJRDnd34', 'stripe', 'active'),
    ('off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'docker-team', 'grp_1zSlAC5QvmV054mB6oSajONG2LoZ', 'Docker Team', 'Collaboration tier for small teams', 'bundle', 'subscription', 'organization', null, 'prod_QqPabxfCWUTM7J', 'stripe', 'active'),
    ('off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'docker-business', 'grp_1zSlAC5QvmV054mB6oSajONG2LoZ', 'Docker Business', 'Enterprise tier with security and admin features', 'bundle', 'subscription', 'organization', null, 'prod_QqPbfBWnS2YrwE', 'stripe', 'active');

-- =============================================================================
-- 5. STRATEGY GROUP MEMBERSHIPS
-- =============================================================================

INSERT INTO offering_group_memberships (offering_id, group_id) VALUES
    ('off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'grp_1zSlAC5QvmV054mB6oSajONG2LoZ'),
    ('off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'grp_1zSlAC5QvmV054mB6oSajONG2LoZ'),
    ('off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'grp_1zSlAC5QvmV054mB6oSajONG2LoZ'),
    ('off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'grp_1zSlAC5QvmV054mB6oSajONG2LoZ');

-- =============================================================================
-- 6. OFFERING SERVICES (What services each offering includes)
-- =============================================================================

-- Personal includes: general, hub, scout
INSERT INTO offering_services (offering_id, service_id) VALUES
    ('off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k'),
    ('off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht'),
    ('off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT');

-- Pro includes: general, hub, scout, build
INSERT INTO offering_services (offering_id, service_id) VALUES
    ('off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k'),
    ('off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht'),
    ('off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT'),
    ('off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1zIJKVviBponckfnsE7hyjkM837a');

-- Team includes: general, hub, scout, build, admin
INSERT INTO offering_services (offering_id, service_id) VALUES
    ('off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k'),
    ('off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht'),
    ('off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT'),
    ('off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1zIJKVviBponckfnsE7hyjkM837a'),
    ('off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN');

-- Business includes: general, hub, scout, build, admin
INSERT INTO offering_services (offering_id, service_id) VALUES
    ('off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k'),
    ('off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht'),
    ('off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT'),
    ('off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1zIJKVviBponckfnsE7hyjkM837a'),
    ('off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN');

-- =============================================================================
-- 7. STRATEGY SERVICE FEATURES (Default values for each tier)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- DOCKER PERSONAL (Free)
-- Based on: FreeUserPlan entitlements from saas-mega
-- -----------------------------------------------------------------------------

-- General: 1 seat (fixed)
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1d1sbIYGrdIIECYtylAIM3wy5b9J', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', '1');

-- Hub: 1 private repo, 40 pulls/hour
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1bft37optaWMMmjGOl9OToR62CEw', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1RXGtFPSM3asOPxs2H1va6OpReLC', 'false'),
    ('ofeat_1RfLnqU1Ld09qaI6CIzHU747mqps', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1NFdRltuP87bCSdAP9xGaRpYhqVy', 'false'),
    ('ofeat_1PDIdOax0LleHfogztGFW7BzQf9t', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1FpNtoYO1T0sKzAyjVjoahE6KdTZ', 'false'),
    ('ofeat_1DJz9rgbzRinOi1yvL5BAE2tRarn', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1RhOD36WibsTQt9TszZUad5Qx06A', 'false'),
    ('ofeat_1PIqcimxLSUil1YOxAacqIZ6bgkz', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1V3tPvJeo3opKG3JaF6ZFRLQnWh8', 'false'),
    ('ofeat_1dkp0bDKze2qMafAMviSaYSjKVMj', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1qwb1aexL67VFyGscPOgIx0B2gTS', 'false'),
    ('ofeat_17GLwfSR1EtMtehxudvM1Ob9QIYV', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1JnGqFqSqD8fXvwX0R7jP6SuCWFa', '0'),
    ('ofeat_18AnTluL0CWozeEQUZ14St6E9WDZ', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1ICu9LZ3sq513iCGUTvPgNYfnVCx', NULL),  -- Unlimited
    ('ofeat_14A03RqpEByaJPUp9gKMmxqDkpWK', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_18a2clmVyxnhIRGDRFkyWptUuUU5', NULL),  -- Unlimited
    ('ofeat_1ty0XGkJgKG18AwqYd3xTUJTA51q', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_118gN6FBPprdJ6gUCKTZDk2x4Nvw', 'false'),
    ('ofeat_1r4hHk2luSCGBa2emR4PQCvA1qNZ', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1OptAPM9JMJ6FpqKQUJKYujWCkIC', '40'),
    ('ofeat_1ObciMBnj6vxX3h4Ma3W3DDDBfWi', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1a7JyU4qwUI9Pq21axfsYX22jBzn', '0'),
    ('ofeat_1K0516m93xpuc1HZAMNuxLFu0480', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1L1Agb4ZkfYxz7M5DpuqtVwPTKW7', '0'),
    ('ofeat_1tgA0JxCUhuKR0R2yEWtx5rmN966', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1x8rMPZnJaPQRjxzypgsVDO7AciE', '1'),
    ('ofeat_1UFdOS1obIal7FIbXqIRxKxu1r6x', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1mDXSXyoxWDTUEjhtCnkVdWhXwB8', '0'),
    ('ofeat_1bffY2mvmzEHJIi7YGcsGyBcmdMa', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1n7mUFqm6Ppi8JFLBmuRIPBbOmn1', '0');

-- Scout: 1 repo (FreeUserPlanScoutReposLimit = 1)
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1ffd0is23etc6dx1BS1juWOedPZD', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1EoOgSb3d4r3l1n1a66rQpOPvZnw', 'true'),
    ('ofeat_12eROdxwboZYejWXR4ioryDJ4vX8', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_16eSchjGFelOXCVq91AdcVVqle0A', 'true'),
    ('ofeat_12PhAlTIEkQg2cYEDhJxFWfLa5CU', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1cutxJqhUVUFCvtiimRcvhgZ6S0Z', 'false'),
    ('ofeat_1aycTkXx6YWAWbFLpqEd1SJxrrUK', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1VCDFZwGhJqB0o2WdT8PHrXqUKbQ', 'false'),
    ('ofeat_1coj9Jjyugjv4Y7UnqKkzXkFSlDZ', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1RU4uSBgvqlkppgN50T3PfFhbSC8', '0'),
    ('ofeat_1C0r8p9FoELGkzGtDNaaOboTYjZn', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1A1k27pKrtKCnnCu0jwji5l8cxgh', 'none'),
    ('ofeat_1izZVl2QPSVI1ev9vklNAxOkWOZI', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1lacqaWYhXeeTXFxjEKVxmGxgc1G', 'none'),
    ('ofeat_1FPeFIKCgiNivaZ87FfroaDkQdnN', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1EkfLOUJPsDzgjxGPC6iZ8oZj9zQ', 'false'),
    ('ofeat_1CF9VEalnzurYFV32UgjNS4svx1t', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1ngYjostIs259530Kln6bmniEzzT', 'false'),
    ('ofeat_1ZWOMgWtGI25DzSkMxE5xcELkUmt', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1kvaLHrvLHeLXPFOigGlhfASMi4k', 'false'),
    ('ofeat_1eBzgC99o8VkooJrMg8BCrpJh0Ex', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1WDgl7GgOCInCrRvZ1BMH1kqN7rd', '1');

-- -----------------------------------------------------------------------------
-- DOCKER PRO ($11/month, $108/year)
-- Based on: PaidUserPlan entitlements from saas-mega
-- -----------------------------------------------------------------------------

-- General: 1 seat (fixed)
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1Li4yqgr1IZDmGmbQ1iUkO1hINGK', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', '1');

-- Hub: Unlimited private repos, 25k pulls monthly, 5 concurrent builds
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1Iene4wi8JQVdxNlvF7cP4eyLgQD', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1RXGtFPSM3asOPxs2H1va6OpReLC', 'false'),
    ('ofeat_1iyeGXOgcOyWnNxGGlqdYMFqyoTX', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1NFdRltuP87bCSdAP9xGaRpYhqVy', 'false'),
    ('ofeat_1nI3dMGDwHWWlFXicq2qU8aA0r0p', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1FpNtoYO1T0sKzAyjVjoahE6KdTZ', 'false'),
    ('ofeat_162OREnXmdzqnSw89f73GRiGXtnk', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1RhOD36WibsTQt9TszZUad5Qx06A', 'false'),
    ('ofeat_18UbKAA9NKBbSJ23Q2eFeb2UFMCB', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1V3tPvJeo3opKG3JaF6ZFRLQnWh8', 'false'),
    ('ofeat_1aAdb2zvq3VQMPJyrGkyEat0dloO', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1qwb1aexL67VFyGscPOgIx0B2gTS', 'false'),
    ('ofeat_1I0225e1db7kR8ylykisyK3UNOn7', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1JnGqFqSqD8fXvwX0R7jP6SuCWFa', '5'),
    ('ofeat_1nO9UQhIkyAqyIgSYhH9BsCcEdmR', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1ICu9LZ3sq513iCGUTvPgNYfnVCx', NULL),  -- Unlimited
    ('ofeat_1TUaRBQO6QyHTMeVrQm0r1vUkzG4', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_18a2clmVyxnhIRGDRFkyWptUuUU5', NULL),  -- Unlimited
    ('ofeat_1AELdiBluViTX5p1Givg13409gSv', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_118gN6FBPprdJ6gUCKTZDk2x4Nvw', 'false'),
    ('ofeat_1gyw1ogMdAcr9zOrlR7AviQYD1TX', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1OptAPM9JMJ6FpqKQUJKYujWCkIC', '0'),  -- No hourly limit
    ('ofeat_14BV0TVCgNsViLr4uTNMwSeEmLui', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1a7JyU4qwUI9Pq21axfsYX22jBzn', '25000'),
    ('ofeat_19Rupv3Hh3Z7WgQCHouNZ7jEyaer', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1L1Agb4ZkfYxz7M5DpuqtVwPTKW7', '0'),
    ('ofeat_1YKG3xA8phX17z2M7Y09VyuMlOo7', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1x8rMPZnJaPQRjxzypgsVDO7AciE', NULL),  -- Unlimited
    ('ofeat_1t9Qc0vGUbmemgkmDdNqfcAmznFp', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1mDXSXyoxWDTUEjhtCnkVdWhXwB8', '0'),
    ('ofeat_1iUaDTIpDlWvEAgdqDrJXtxaXDHl', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1n7mUFqm6Ppi8JFLBmuRIPBbOmn1', '0');

-- Build: 200 minutes monthly, 4 concurrent, 50GB storage, basic builders
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_171lcpTj7ml7s2csxVp3KN0Uu3Yz', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1KQ2ne2aAhWwVjzfkDO6NKkyHUG2', '4'),
    ('ofeat_1JwCEzdMa3SeOtnSnW9VmnA4gOAp', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1P93kehpeMsMsJPlS0fU9DbGS5wp', 'basic'),
    ('ofeat_1JxLFV2Nj2RvVaCiFOIqJs9Qkusw', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1H4oL3iyKctvRqAmVVeD4VA9h57w', '50'),
    ('ofeat_1wEM6c1VijLDR9E4yXDuDE57YoKy', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1aFWGyzD3RdEzh0PsL07nR4fC76x', '200'),
    ('ofeat_13RZOs1eRZJ2RtYCrON0YHlOGSxm', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1qKDpC9z71UYfX0zrjjPMdmJAKW6', '0');

-- Scout: 2 repos (PaidUserPlanScoutReposLimit = 2)
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_15RqTuej4k8whbTel32yn2xEg7C7', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1EoOgSb3d4r3l1n1a66rQpOPvZnw', 'true'),
    ('ofeat_1PyHOpMLrpP8eujd6urcL4amYRLa', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_16eSchjGFelOXCVq91AdcVVqle0A', 'true'),
    ('ofeat_1dPEZfW4PRy2TZH2XvQbA9rTUkaq', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1cutxJqhUVUFCvtiimRcvhgZ6S0Z', 'true'),
    ('ofeat_1owm3ypS0PCqmBVet9DsrUQvCqQm', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1VCDFZwGhJqB0o2WdT8PHrXqUKbQ', 'false'),
    ('ofeat_1GEPzK8JBSZfI1YfrwYirj3pbYeK', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1RU4uSBgvqlkppgN50T3PfFhbSC8', '0'),
    ('ofeat_1JXi7IAIM5ZSbZMv0CXPrkF7X7YW', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1A1k27pKrtKCnnCu0jwji5l8cxgh', 'basic'),
    ('ofeat_1FZmflEZxncsnPHezoWhp7JMVOTP', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1lacqaWYhXeeTXFxjEKVxmGxgc1G', 'basic'),
    ('ofeat_1ye7Kk1dZPVYwqQyomoXnTvh04wx', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1EkfLOUJPsDzgjxGPC6iZ8oZj9zQ', 'false'),
    ('ofeat_1RS9CmdZhXorKPKnd5Gl4uBMBVXD', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1ngYjostIs259530Kln6bmniEzzT', 'false'),
    ('ofeat_17rOEJLYbnjGoXbjRS2fHY9jV9ow', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1kvaLHrvLHeLXPFOigGlhfASMi4k', 'false'),
    ('ofeat_1XhZEdjEJxxcfNcaVyv7dYfyiduZ', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1WDgl7GgOCInCrRvZ1BMH1kqN7rd', '2');

-- -----------------------------------------------------------------------------
-- DOCKER TEAM ($16/month, $180/year per seat - minimum 5 seats)
-- Based on: PaidOrgPlan entitlements from saas-mega
-- -----------------------------------------------------------------------------

-- General: 5 seats minimum
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1FFAe3TiPCpeZjeXCGJA8lWFFv66', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', '5');

-- Hub: Unlimited repos, 100k pulls monthly, 15 concurrent builds
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1UsVzuUJQ5BQfcrkivwNKrzvtS0H', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1RXGtFPSM3asOPxs2H1va6OpReLC', 'false'),
    ('ofeat_12MmxEoWqlbXGvDOKkgBqeVvqsby', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1NFdRltuP87bCSdAP9xGaRpYhqVy', 'false'),
    ('ofeat_1gvO1CcY3VGPmyJPzYz0Ld1H5IfX', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1FpNtoYO1T0sKzAyjVjoahE6KdTZ', 'false'),
    ('ofeat_1ZFucQ2gmCfcWrPvvuXNqJjt64Q5', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1RhOD36WibsTQt9TszZUad5Qx06A', 'false'),
    ('ofeat_1vPCcGApLEZP8YejANrATb3SCBzG', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1V3tPvJeo3opKG3JaF6ZFRLQnWh8', 'false'),
    ('ofeat_1DEhaU2eNYh8W7jsXtyvpbeUw0MC', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1qwb1aexL67VFyGscPOgIx0B2gTS', 'false'),
    ('ofeat_1dSIgmHEnL5aVEjuGQLEWMFlcbTs', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1JnGqFqSqD8fXvwX0R7jP6SuCWFa', '15'),
    ('ofeat_1SWo5Dvi8rYVMjLf9Cfsa60jtpf9', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1ICu9LZ3sq513iCGUTvPgNYfnVCx', NULL),  -- Unlimited
    ('ofeat_1g2DdbqBIJ8Qi6VzbolmGkZdmHjz', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_18a2clmVyxnhIRGDRFkyWptUuUU5', NULL),  -- Unlimited
    ('ofeat_1Sbze7Ko71c8qb56I0R88F3V8inf', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_118gN6FBPprdJ6gUCKTZDk2x4Nvw', 'false'),
    ('ofeat_1lMrcI5WVoJCpYPPZqJ1Zo8yoR48', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1OptAPM9JMJ6FpqKQUJKYujWCkIC', '0'),  -- No hourly limit
    ('ofeat_18A8sbbfCUNiCvFqABZYJDCuonRy', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1a7JyU4qwUI9Pq21axfsYX22jBzn', '100000'),
    ('ofeat_1um06EubOBHVHzrgtkld3r7iHt2Y', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1L1Agb4ZkfYxz7M5DpuqtVwPTKW7', '0'),
    ('ofeat_11Ev4zlDHvid3hFhsUIfRPccSRqR', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1x8rMPZnJaPQRjxzypgsVDO7AciE', NULL),  -- Unlimited
    ('ofeat_1mWQ97HCVvpaSWI2sm4Y1BfR9HHU', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1mDXSXyoxWDTUEjhtCnkVdWhXwB8', '0'),
    ('ofeat_1vdMczD8qHyde7zicmr84H4rwhcY', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1n7mUFqm6Ppi8JFLBmuRIPBbOmn1', '0');

-- Build: 500 minutes monthly, unlimited concurrent, 100GB storage, standard builders
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_15UYy8adhidLEqSusAVKyApNKcW2', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1KQ2ne2aAhWwVjzfkDO6NKkyHUG2', NULL),  -- Unlimited
    ('ofeat_1OnDFv2MURIAkICyJcbx1RYnSILD', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1P93kehpeMsMsJPlS0fU9DbGS5wp', 'standard'),
    ('ofeat_1cfMUxltq5Bk2TIlhYHaim8ozahn', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1H4oL3iyKctvRqAmVVeD4VA9h57w', '100'),
    ('ofeat_1iJGwVAsf5gWbk8wJ6Yl5kbTni9G', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1aFWGyzD3RdEzh0PsL07nR4fC76x', '500'),
    ('ofeat_1LqD1sgUKHbEXs9eCgJ5cyNYdW7h', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1qKDpC9z71UYfX0zrjjPMdmJAKW6', '0');

-- Scout: Unlimited repos (PaidOrgPlanScoutReposLimit = unlimited)
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1JSxIjAkCQ0tX2wdPdyr2E4cP1jy', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1EoOgSb3d4r3l1n1a66rQpOPvZnw', 'true'),
    ('ofeat_1hQrsLCty53XeK346H790rfspZt9', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_16eSchjGFelOXCVq91AdcVVqle0A', 'true'),
    ('ofeat_17dKvs6GGs8Cz0KrKeynuJG4Jttc', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1cutxJqhUVUFCvtiimRcvhgZ6S0Z', 'true'),
    ('ofeat_1yBFEHTsaFTyqpEedxTGo4oGIrpc', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1VCDFZwGhJqB0o2WdT8PHrXqUKbQ', 'true'),
    ('ofeat_1ug1zN1WZiVTYrwDQIAwl2NdB091', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1RU4uSBgvqlkppgN50T3PfFhbSC8', '0'),
    ('ofeat_1jONLI6rNdSbrtTndQPrNbh8I0wt', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1A1k27pKrtKCnnCu0jwji5l8cxgh', 'standard'),
    ('ofeat_1sRJdXDhfPI6SwBvUkSgEDqkclLd', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1lacqaWYhXeeTXFxjEKVxmGxgc1G', 'standard'),
    ('ofeat_1kR2Q7JYDgmDdSrN9jVbWetrcHSS', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1EkfLOUJPsDzgjxGPC6iZ8oZj9zQ', 'true'),
    ('ofeat_1GlHVLnxqQaMO6QDjhXOOaNLVPcy', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1ngYjostIs259530Kln6bmniEzzT', 'false'),
    ('ofeat_1v091H9EbnU2ciNyZSHSSP5vE05W', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1kvaLHrvLHeLXPFOigGlhfASMi4k', 'false'),
    ('ofeat_1VjPWUwjgTecHg2V2qh52RG8Vwon', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1WDgl7GgOCInCrRvZ1BMH1kqN7rd', NULL);  -- Unlimited

-- Admin: RBAC, audit logs, 10 OATs, 10 OIDC connections
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1sKWSFydPzDRdAPIxq1HXSOb2Hi4', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1Ymy6uzYcIOp0CD30CuqTmO47P9Y', 'true'),
    ('ofeat_1diYw0BCidLtzwbtL8dzgwXPuHgA', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1dpwUNfiQEG1WdFifyUSxrFBl4Ua', '10'),
    ('ofeat_1N6kQdjQVEjdzveGhF3OFpCoWgdI', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1EDIRimtL1bnTBvzGSS2OlmLs51z', 'false'),
    ('ofeat_1NZqIYLvVHmZvZ7dZfnSzpPDDj3W', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1KlOvT9jdUJlnraLPS5htSEmykbY', 'true'),
    ('ofeat_1afpUwhgAt2VnAmj89JTSYPQeeKf', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1Q72e0hebmsLHuHyIGFkopOgoDBu', 'true'),
    ('ofeat_1uNRIJBkfS3bZ23LfaAvurCm8y0R', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_141mflU952H7mCojrbfr96YIZC6X', 'false'),
    ('ofeat_1IDAOHrziHpAtr2r1YCmJk0h7aUA', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_15uR0xuJU7SBRIfStQ4IIZwoyxQ5', 'false'),
    ('ofeat_1c4fwr4EIPl893gGDrfngDndIeRu', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1BD39XvtBJuRMW1CtgC6HNQ7dCtf', 'false'),
    ('ofeat_15qKDfNySv0czxQyhecgPYsVzVVZ', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1F0S8SGgLA6H6dj9Fbjy7039PimJ', '0'),
    ('ofeat_1NDcIrfvgXUH06SZabz6bxD180tM', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1oBQdBLFYEYXN9i3zY4kfz3v6HKI', 'false'),
    ('ofeat_1oaRX7sNGQuc8NukgktUkmBuwVbG', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1SAFn7F7sMP5trbYCahqkvsVTyrd', 'false'),
    ('ofeat_1dvhMsisLugVGJpmPx1xbEOrYsn1', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1dxpiOsfAJHlaTcT0b3vf6BEGCSh', 'false'),
    ('ofeat_1Z0sYsCvI6L6N5LCILfSaNf28dh1', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1z5sG1h7kmFrkKnGcDtszFwIX6ho', 'false'),
    ('ofeat_1YlGUcJJcvZ7PLzSegUbsHlhAqgi', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1cqsTpFfEPg5tigJtjk0hcJXfRQa', '10'),
    ('ofeat_1JeCKn3tkTl1uySekoiTzqUWcekM', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1HwyOg8zVoa4zdmeR48uYaXfutEv', 'false');

-- -----------------------------------------------------------------------------
-- DOCKER BUSINESS ($24/month, $288/year per seat - minimum 5 seats)
-- Based on: PaidOrgPlan with enhanced entitlements from saas-mega
-- -----------------------------------------------------------------------------

-- General: 5 seats minimum
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1iQWJ5MyIzAEqB9kQL5aRvZliOdg', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', '5');

-- Hub: Unlimited repos, 1M pulls monthly, 15 concurrent builds, image access management
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1R559tKqR961AoNLpGuI7jMXrqpB', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1RXGtFPSM3asOPxs2H1va6OpReLC', 'false'),
    ('ofeat_1NRnm3tSqB3sksJCkPhIN43RVxLO', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1NFdRltuP87bCSdAP9xGaRpYhqVy', 'false'),
    ('ofeat_1ofxfv65HJ0JEWCRcv5yYWsdcXWi', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1FpNtoYO1T0sKzAyjVjoahE6KdTZ', 'false'),
    ('ofeat_1NasvZeN4XVw24JnZ7dA9BZTO2GD', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1RhOD36WibsTQt9TszZUad5Qx06A', 'false'),
    ('ofeat_1FKfNRokEz8N4D9Azn2vEOfuGEZA', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1V3tPvJeo3opKG3JaF6ZFRLQnWh8', 'false'),
    ('ofeat_1pdrGpVQJPvGbchIpizUwnynaNNO', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1qwb1aexL67VFyGscPOgIx0B2gTS', 'false'),
    ('ofeat_1kRarmQfddoawuG7H63aTsUK2fjx', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1JnGqFqSqD8fXvwX0R7jP6SuCWFa', '15'),
    ('ofeat_1jeKxr705HrgYnjxBz0NcTR0rWC0', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1ICu9LZ3sq513iCGUTvPgNYfnVCx', NULL),  -- Unlimited
    ('ofeat_14vig6cDyCqfrUCo24A3seyBFWfg', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_18a2clmVyxnhIRGDRFkyWptUuUU5', NULL),  -- Unlimited
    ('ofeat_18p0Ioz12jmdlnEOjjxZWkjtxMqw', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_118gN6FBPprdJ6gUCKTZDk2x4Nvw', 'true'),
    ('ofeat_1G1SuRMIV2lpMfnrVWxWQwndmouo', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1OptAPM9JMJ6FpqKQUJKYujWCkIC', '0'),  -- No hourly limit
    ('ofeat_1GhYo72eVGYulQDysYAvRiCg3LNH', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1a7JyU4qwUI9Pq21axfsYX22jBzn', '1000000'),
    ('ofeat_1hN2r6tg3sQn0Bm2PvUvBQAGxet5', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1L1Agb4ZkfYxz7M5DpuqtVwPTKW7', '0'),
    ('ofeat_1QvtKbdHWQZZKh2iOCvtOfaf85iW', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1x8rMPZnJaPQRjxzypgsVDO7AciE', NULL),  -- Unlimited
    ('ofeat_1avdfoSufMGW7p596ycqRL3duWej', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1mDXSXyoxWDTUEjhtCnkVdWhXwB8', '0'),
    ('ofeat_1oQONibTurWaoPyTiX8Vl32ds7Ri', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1Xadzh2oqV0WDSHwPH19EjQR90Ht', 'feat_1n7mUFqm6Ppi8JFLBmuRIPBbOmn1', '0');

-- Build: 1500 minutes monthly, unlimited concurrent, 200GB storage, standard builders
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1SKGgvixn0vlOeRoCpuY54qYpOcT', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1KQ2ne2aAhWwVjzfkDO6NKkyHUG2', NULL),  -- Unlimited
    ('ofeat_13dee0NTTglqpaS2ax1J2h3Ot93R', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1P93kehpeMsMsJPlS0fU9DbGS5wp', 'standard'),
    ('ofeat_1bJ0EBJBVhVK7NIDxI0hFvN7VA6I', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1H4oL3iyKctvRqAmVVeD4VA9h57w', '200'),
    ('ofeat_1MoS2Vh21427GmfgXIcIfWy2ie8O', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1aFWGyzD3RdEzh0PsL07nR4fC76x', '1500'),
    ('ofeat_1lUwgqJYiuFMn1frbJQBOYMvjbeX', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1zIJKVviBponckfnsE7hyjkM837a', 'feat_1qKDpC9z71UYfX0zrjjPMdmJAKW6', '0');

-- Scout: Unlimited repos, all features
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_16CQWCiiFDOa3wmOzEuZ4XK1FGWB', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1EoOgSb3d4r3l1n1a66rQpOPvZnw', 'true'),
    ('ofeat_1AAkL28SnmKMc7OHxBgTHlhgfzVe', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_16eSchjGFelOXCVq91AdcVVqle0A', 'true'),
    ('ofeat_15s2ralDIYHxEwWtdQP75xgVzDPL', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1cutxJqhUVUFCvtiimRcvhgZ6S0Z', 'true'),
    ('ofeat_1yD74h2SB3idjvZoBzTCA2jO4Jnx', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1VCDFZwGhJqB0o2WdT8PHrXqUKbQ', 'true'),
    ('ofeat_1eni1rsTEWCmB1ocpjUPMOUuUzg7', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1RU4uSBgvqlkppgN50T3PfFhbSC8', '0'),
    ('ofeat_1aRrvi1YSu9xHkpvi4QCnSVm5gUy', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1A1k27pKrtKCnnCu0jwji5l8cxgh', 'standard'),
    ('ofeat_17r6c4pXMAkLXhZZ0y6ZcAjWLvjD', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1lacqaWYhXeeTXFxjEKVxmGxgc1G', 'standard'),
    ('ofeat_1whfmDizG7riupdpQDaGDLfkaAjX', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1EkfLOUJPsDzgjxGPC6iZ8oZj9zQ', 'true'),
    ('ofeat_1JLaAtG6lnsQNwdcQ382opjjqwOf', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1ngYjostIs259530Kln6bmniEzzT', 'true'),
    ('ofeat_1zMsZu6yReiRaI5CVeMFx9AqECPB', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1kvaLHrvLHeLXPFOigGlhfASMi4k', 'true'),
    ('ofeat_1DxCoZxjde15cUXnN32tcidVdKgn', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1qwoNGSQTsqAYuKI34yD3Vx11yfT', 'feat_1WDgl7GgOCInCrRvZ1BMH1kqN7rd', NULL);  -- Unlimited

-- Admin: Full enterprise features - SSO, SCIM, 100 OATs, 100 OIDC, custom roles
INSERT INTO offering_features (id, offering_id, service_id, feature_id, value) VALUES
    ('ofeat_1uPDSGsBAmTkApgxuN1vCC7s3DLz', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1Ymy6uzYcIOp0CD30CuqTmO47P9Y', 'true'),
    ('ofeat_1kU0IENGzrAAJUWBL22Ozqx3KUen', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1dpwUNfiQEG1WdFifyUSxrFBl4Ua', '100'),
    ('ofeat_19wLMOeOtDOmVFryIbUYBMCPEias', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1EDIRimtL1bnTBvzGSS2OlmLs51z', 'true'),
    ('ofeat_1Df1bHTp96Ld3gelpyEJj7FT0Gyc', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1KlOvT9jdUJlnraLPS5htSEmykbY', 'true'),
    ('ofeat_1eWquLv6iDgFTncXTF2F3ZSzXCng', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1Q72e0hebmsLHuHyIGFkopOgoDBu', 'true'),
    ('ofeat_1pD9XqxBwFjkiaAzAlU2fX8HHTXT', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_141mflU952H7mCojrbfr96YIZC6X', 'true'),
    ('ofeat_1h1BdNPu1qO7UAKhPqbSAFob1TKR', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_15uR0xuJU7SBRIfStQ4IIZwoyxQ5', 'true'),
    ('ofeat_16Ee1WlLWJGAuIarwOe5Yu79Uq6G', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1BD39XvtBJuRMW1CtgC6HNQ7dCtf', 'true'),
    ('ofeat_1Ae8wifa7hmXNM3JpCS4R8Mr5lKD', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1F0S8SGgLA6H6dj9Fbjy7039PimJ', '0'),
    ('ofeat_1cwuTeVu5xk11D1c4yE52kIg8KYk', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1oBQdBLFYEYXN9i3zY4kfz3v6HKI', 'true'),
    ('ofeat_1M4GSO6TI4s8Kdt5pDx9FEPaU1o2', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1SAFn7F7sMP5trbYCahqkvsVTyrd', 'true'),
    ('ofeat_186gu0PL4L6tJI2uH3Nc6MpqF2Ec', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1dxpiOsfAJHlaTcT0b3vf6BEGCSh', 'true'),
    ('ofeat_1E0QCxfltFOO0gJGAfpQUh5STNtX', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1z5sG1h7kmFrkKnGcDtszFwIX6ho', 'true'),
    ('ofeat_1PNx7ZS9lTHO1Y50UPibScSVcXSy', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1cqsTpFfEPg5tigJtjk0hcJXfRQa', '100'),
    ('ofeat_1pJ69mVqcz2WIwWB4jEXp4taMxmR', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_15UgZhtU1uF5DqEIr9bjG5KXadQN', 'feat_1HwyOg8zVoa4zdmeR48uYaXfutEv', 'true');

-- =============================================================================
-- 8. STRATEGY CONSTRAINTS (Business rules for mutable features)
-- =============================================================================

-- Personal: 1 seat (fixed)
INSERT INTO offering_constraints (id, offering_id, service_id, feature_id, origin, minimum_allowed, maximum_allowed, constraint_message) VALUES
    ('const_1J55kC0nw8a6yZ3azh3aIa2gZGbP', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', 'self-serve', 1, 1, 'Personal tier is limited to 1 user');

-- Pro: 1 seat (fixed)
INSERT INTO offering_constraints (id, offering_id, service_id, feature_id, origin, minimum_allowed, maximum_allowed, constraint_message) VALUES
    ('const_1fwEDEwCWeJHZvnwl6qnnu2gzjL6', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', 'self-serve', 1, 1, 'Pro tier is limited to 1 user');

-- Team: 5-100 seats (self-serve), 5+ seats (inside-sales)
INSERT INTO offering_constraints (id, offering_id, service_id, feature_id, origin, minimum_allowed, maximum_allowed, constraint_message) VALUES
    ('const_1zwyOD2slUqQASbxELdr0TG9LCRy', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', 'self-serve', 5, 100, 'Contact sales for more than 100 seats'),
    ('const_1uwXnCM0wIsfFWOqWcYxfYNQel4K', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', 'inside-sales', 5, NULL, NULL);

-- Business: 5+ seats
INSERT INTO offering_constraints (id, offering_id, service_id, feature_id, origin, minimum_allowed, maximum_allowed, constraint_message) VALUES
    ('const_1a4gNtDCpqGFVsEjBHL8SSiVIXPk', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', 'self-serve', 5, 100, 'Contact sales for more than 100 seats'),
    ('const_1EScActmq330D4TJuV60oIrnOtqZ', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', 'inside-sales', 5, NULL, NULL);

-- =============================================================================
-- 9. STRATEGY LIFECYCLE TRANSITIONS
-- =============================================================================

-- Personal -> Pro (upgrade)
INSERT INTO offering_lifecycle_transitions (id, from_offering_id, to_offering_id, transition_type, timing, allowed) VALUES
    ('trans_1DdKss8ucHo3jEBih85lc7ZOTbKm', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'upgrade', 'immediate', true);

-- Pro -> Personal (downgrade)
INSERT INTO offering_lifecycle_transitions (id, from_offering_id, to_offering_id, transition_type, timing, allowed) VALUES
    ('trans_1Zp0SgnTD20xZxefEIyrl2rAxNJ0', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'downgrade', 'end_of_period', true);

-- Team -> Business (upgrade)
INSERT INTO offering_lifecycle_transitions (id, from_offering_id, to_offering_id, transition_type, timing, allowed) VALUES
    ('trans_1azwtWuhumFScW8flojvThnu8l3Z', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'upgrade', 'immediate', true);

-- Business -> Team (downgrade)
INSERT INTO offering_lifecycle_transitions (id, from_offering_id, to_offering_id, transition_type, timing, allowed) VALUES
    ('trans_1GAHD6uZ4y7i3XN0sOcUU7PQ0NCy', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'downgrade', 'end_of_period', true);

-- =============================================================================
-- 10. METERED RESOURCES
-- =============================================================================

-- General service seat resource (used for pricing all subscription tiers)
INSERT INTO metered_resources (id, service_id, resource_slug, resource_name, description, status) VALUES
    ('res_1zSlAC5QvmV054mB6oSajONG2L1A', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'seat', 'Docker Seat', 'User seat across all Docker subscription tiers', 'active');

-- =============================================================================
-- 11. RATE CARDS (Pricing)
-- =============================================================================

-- Docker Personal: Free
INSERT INTO rate_cards (id, offering_id, service_id, feature_id, list_price, account_id, pricing_model, billing_timing, billing_cycle, currency, external_price_id, external_system, effective_date, expiration_date) VALUES
    ('rc_1q2okbnGNWvZb7aHTb0VZTU6GfN8', 'off_18tdbPfLyPYPRnsUvG13FwGI8FsE', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', true, NULL, 'fixed', 'advance', 'monthly', 'USD', 'price_1PxgztCi2Sw6UZ9JjIVo75Sq', 'stripe', '2024-01-01', NULL);

INSERT INTO rate_card_fixed (rate_card_id, service_id, resource_id, fixed_price) VALUES
    ('rc_1q2okbnGNWvZb7aHTb0VZTU6GfN8', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'res_1zSlAC5QvmV054mB6oSajONG2L1A', ROW('USD', 0, 0)::docker_money);

-- Docker Pro: $11/month per user
INSERT INTO rate_cards (id, offering_id, service_id, feature_id, list_price, account_id, pricing_model, billing_timing, billing_cycle, currency, external_price_id, external_system, effective_date, expiration_date) VALUES
    ('rc_1sLNHTypnV0LGeVjbyk7fHEwl8mu', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', true, NULL, 'per_unit', 'advance', 'monthly', 'USD', 'price_1Pxh7CCi2Sw6UZ9JdVboAG0k', 'stripe', '2024-01-01', NULL),
    ('rc_1tRpqMZJpPf63oUKaTDBF056uD9O', 'off_1EF0MxEZyUwjO6uUvwG9AWDI3Sd4', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', true, NULL, 'per_unit', 'advance', 'annual', 'USD', 'price_1Pxh7CCi2Sw6UZ9JvpKp9fE1', 'stripe', '2024-01-01', NULL);

INSERT INTO rate_card_per_unit (rate_card_id, service_id, resource_id, unit_price, conversion_factor, rounding_rule) VALUES
    ('rc_1sLNHTypnV0LGeVjbyk7fHEwl8mu', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'res_1zSlAC5QvmV054mB6oSajONG2L1A', ROW('USD', 11, 0)::docker_money, 1.0, 'up'),
    ('rc_1tRpqMZJpPf63oUKaTDBF056uD9O', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'res_1zSlAC5QvmV054mB6oSajONG2L1A', ROW('USD', 108, 0)::docker_money, 1.0, 'up');

-- Docker Team: $16/month per seat
INSERT INTO rate_cards (id, offering_id, service_id, feature_id, list_price, account_id, pricing_model, billing_timing, billing_cycle, currency, external_price_id, external_system, effective_date, expiration_date) VALUES
    ('rc_1UTobmo4Vvp5MJ9gsPX6YQW6Xgzd', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', true, NULL, 'per_unit', 'advance', 'monthly', 'USD', 'price_1PxhIvCi2Sw6UZ9Jf1pSdtsl', 'stripe', '2024-01-01', NULL),
    ('rc_1xhy1kPM6wwKsLFr0Hps4gR9MmQ7', 'off_1IrrWi4fwjqzIrK2GWJl7eAu3LtJ', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', true, NULL, 'per_unit', 'advance', 'annual', 'USD', 'price_1PxhIvCi2Sw6UZ9Jc8jLxtSP', 'stripe', '2024-01-01', NULL);

INSERT INTO rate_card_per_unit (rate_card_id, service_id, resource_id, unit_price, conversion_factor, rounding_rule) VALUES
    ('rc_1UTobmo4Vvp5MJ9gsPX6YQW6Xgzd', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'res_1zSlAC5QvmV054mB6oSajONG2L1A', ROW('USD', 16, 0)::docker_money, 1.0, 'up'),
    ('rc_1xhy1kPM6wwKsLFr0Hps4gR9MmQ7', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'res_1zSlAC5QvmV054mB6oSajONG2L1A', ROW('USD', 180, 0)::docker_money, 1.0, 'up');

-- Docker Business: Annual only (no monthly option available)
INSERT INTO rate_cards (id, offering_id, service_id, feature_id, list_price, account_id, pricing_model, billing_timing, billing_cycle, currency, external_price_id, external_system, effective_date, expiration_date) VALUES
    ('rc_1fQQH3Ks3P6HA7Vma5VwlLhYkYrX', 'off_1Npj1Em4KfEEAshElmzI5nOU4csp', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', true, NULL, 'per_unit', 'advance', 'annual', 'USD', 'price_1PxhLECi2Sw6UZ9Jt086VkIk', 'stripe', '2024-01-01', NULL);

INSERT INTO rate_card_per_unit (rate_card_id, service_id, resource_id, unit_price, conversion_factor, rounding_rule) VALUES
    ('rc_1fQQH3Ks3P6HA7Vma5VwlLhYkYrX', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'res_1zSlAC5QvmV054mB6oSajONG2L1A', ROW('USD', 288, 0)::docker_money, 1.0, 'up');  -- $288/year per seat

-- =============================================================================
-- USAGE METERING SEED DATA
-- =============================================================================

-- Supported unit types for meters
INSERT INTO supported_unit_types (unit_type, display_name, description, category) VALUES
    -- Time units
    ('seconds', 'Seconds', 'Time in seconds', 'time'),
    ('minutes', 'Minutes', 'Time in minutes', 'time'),
    ('hours', 'Hours', 'Time in hours', 'time'),

    -- Data units (decimal)
    ('bytes', 'Bytes', 'Data in bytes', 'data'),
    ('kb', 'Kilobytes', 'Data in kilobytes (1000 bytes)', 'data'),
    ('mb', 'Megabytes', 'Data in megabytes (1000 KB)', 'data'),
    ('gb', 'Gigabytes', 'Data in gigabytes (1000 MB)', 'data'),
    ('tb', 'Terabytes', 'Data in terabytes (1000 GB)', 'data'),

    -- Data units (binary)
    ('kib', 'Kibibytes', 'Data in kibibytes (1024 bytes)', 'data'),
    ('mib', 'Mebibytes', 'Data in mebibytes (1024 KiB)', 'data'),
    ('gib', 'Gibibytes', 'Data in gibibytes (1024 MiB)', 'data'),
    ('tib', 'Tebibytes', 'Data in tebibytes (1024 GiB)', 'data'),

    -- Composite units
    ('gb_hours', 'Gigabyte-Hours', 'Gigabytes multiplied by hours', 'data'),
    ('gib_hours', 'Gibibyte-Hours', 'Gibibytes multiplied by hours', 'data'),
    ('cpu_seconds', 'CPU-Seconds', 'CPU cores multiplied by seconds', 'compute'),
    ('vcpu_hours', 'vCPU-Hours', 'Virtual CPU cores multiplied by hours', 'compute'),

    -- Request/transaction units
    ('requests', 'Requests', 'Number of API requests', 'requests'),
    ('operations', 'Operations', 'Number of operations', 'requests'),
    ('invocations', 'Invocations', 'Number of function invocations', 'requests');

-- =============================================================================
-- METERS
-- =============================================================================

-- General service meter for seat usage
INSERT INTO meters (id, service_id, feature_id, slug, meter_name, unit_type, environment, status) VALUES
    ('meter_1zSlAC5QvmV054mB6oSajONG2M1', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k', 'feat_1eeyKAGaC4HXHybQJKg5TwG9PnMa', 'seat_usage', 'Seat Usage', 'requests', 'prod', 'active');

-- =============================================================================
-- RESOURCE METERS (Link meters to resources)
-- =============================================================================

INSERT INTO resource_meters (meter_id, resource_id, service_id) VALUES
    ('meter_1zSlAC5QvmV054mB6oSajONG2M1', 'res_1zSlAC5QvmV054mB6oSajONG2L1A', 'svc_1PufmTkFkbSpQ9LDHsQa05MJCv5k');
