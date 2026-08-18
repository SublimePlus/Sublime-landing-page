/**
 * Cal.com booking configuration.
 *
 * Cal.com (free tier) handles the whole booking: real availability, blocking a
 * slot the moment someone books it, and writing the meeting into a connected
 * Google Calendar. The site only needs the event link.
 *
 * Set `NEXT_PUBLIC_CAL_LINK` in the environment to the Cal.com event path
 * (username/event-slug). Until it is set, the default below is used, which
 * will only resolve once a Cal.com account and event exist at that path.
 */
export const CAL_LINK =
  process.env.NEXT_PUBLIC_CAL_LINK ?? "sublime-s0s2if";

/** A stable namespace so the popup can be initialised once and reused. */
export const CAL_NAMESPACE = "discovery";
