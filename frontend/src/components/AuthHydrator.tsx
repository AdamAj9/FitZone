import { useMe } from "../hooks/useAuth";

/** Triggers /auth/me/ on mount when an access token is present, to refresh the
 *  user payload and detect stale sessions. Renders nothing. */
export function AuthHydrator() {
  useMe();
  return null;
}
