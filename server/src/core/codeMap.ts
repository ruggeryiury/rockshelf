export const codeMap = {
  // Generic
  ok: [200, 'Request completed'],
  err_unknown: [500, 'An unknown occurred, please try again later'],

  // #region Specific
  err_empty_json_body: [400, "Body cannot be empty when content-type is set to 'application/json'"],
  err_syntax_json_body: [400, 'Request body has a syntax error'],
  err_route_requires_json_body: [400, 'Route requests a JSON body'],
} as const
