# Security

- Never commit secrets, tokens, private keys, production URLs or customer data.
- Use server-side secret management in deployed environments.
- Hash passwords using an appropriate password-hashing algorithm.
- Rotate and revoke refresh tokens.
- Apply authentication, authorization, validation and rate limiting at API boundaries.
- Derive owner identity from authenticated session, never request-body identity.
- Restrict analytics service to private service-to-service access.
- Protect payment webhooks with signature verification and idempotency.
- Redact secrets and personal data from logs.
- Encrypt connections and backups.
- Maintain audit trails for security-sensitive actions.
- Review dependencies and container images.
- Test backup restoration and incident recovery.

Report suspected vulnerabilities privately to the maintainer rather than publishing exploit details.
