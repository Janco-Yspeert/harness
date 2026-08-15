# Security Policy

## Supported Versions

Harness is experimental software under active development. Security fixes are
provided only for the latest revision of `main`; older commits and spike
artifacts are retained as historical records and are not supported releases.

## Reporting a Vulnerability

Please report suspected vulnerabilities through GitHub's private vulnerability
reporting feature on the repository's **Security** page. Do not open a public
issue for an undisclosed vulnerability.

Include enough information to reproduce and assess the issue, including the
affected revision, expected and observed behaviour, impact, and a minimal proof
of concept where practical. Avoid including credentials, tokens, private
repository contents, or other sensitive data in the report.

## Current Security Posture

Harness is a development-stage remote code-execution control surface. It starts
local processes and allows a connected client to send them input.

The current implementation:

- binds only to `127.0.0.1`;
- has no authentication or authorization; and
- permits any local process able to connect to control the active session.

Do not expose Harness through a public network interface, reverse proxy, port
forward, tunnel, container port publication, or permissive firewall rule. The
localhost-only design reduces network exposure but is not a security boundary
between processes or users on the same host.

Harness is not currently intended for production or shared-host deployment.
