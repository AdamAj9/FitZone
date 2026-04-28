"""Centralised helper for writing AuditLog entries.

Call sites use `record(action, actor=..., target=..., metadata={...})`
rather than constructing AuditLog rows directly so the schema can evolve
in one place."""

from __future__ import annotations

from typing import Any

from .models import AuditLog


def record(
    action: str,
    *,
    actor=None,
    target=None,
    metadata: dict[str, Any] | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    target_type = ""
    target_id = None
    if target is not None:
        target_type = f"{target._meta.app_label}.{target.__class__.__name__}"
        target_id = getattr(target, "pk", None)

    return AuditLog.objects.create(
        actor=actor if (actor and getattr(actor, "is_authenticated", False)) else None,
        action=action,
        target_type=target_type,
        target_id=target_id,
        metadata=metadata or {},
        ip_address=ip_address,
    )
