// There's no real auth-based identity in this demo build — every screen
// acts as this one hardcoded member. Centralized here (previously
// duplicated as a local const in OkrMapPage.jsx) so ReviewPage.jsx (#B27)
// doesn't have to redeclare it to filter "my" objectives.
export const VIEWER_OWNER_NAME = 'Satoshi Kimura'
