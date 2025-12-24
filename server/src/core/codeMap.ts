export const codeMap = {
  // Generic
  ok: [200, 'Request completed'],
  err_unknown: [500, 'An unknown occurred, please try again later'],

  // #region JSON body parsing
  err_empty_json_body: [400, "Body cannot be empty when content-type is set to 'application/json'"],
  err_syntax_json_body: [400, 'Request body has a syntax error'],
  err_route_requires_json_body: [400, 'Route requests a JSON body'],

  // #region User Login
  err_login_password_validation: [401, "The provided password and the registered user's password don't match"],
  err_login_user_inactive: [401, 'The registered user has been deactivated and is unable to login'],
  err_login_user_email_unverified: [401, "The registered user's email address has not been verified yet"],
  err_login_user_notfound: [400, 'The provided e-mail "{{email}}" is not registered as an user'],
  err_user_login_no_body: [400, 'No body response provided for user login validation route'],
  err_user_login_no_password: [400, 'No password provided for user login validation'],
  err_user_login_no_username: [400, 'No username provided for user login validation'],
  suceess_user_login: [200, "You're logged in"],

  // #region User Register
  err_user_register_duplicated_username: [409, 'Provided username "{{username}}" is already being used by another account'],
  err_user_register_duplicated_email: [409, 'Provided e-mail "{{email}}" is already being used by another account'],
  success_user_register: [201, 'Your user account was created successfully'],
  err_user_register_no_body: [400, 'No body response provided for user registering route'],
  err_user_register_no_password: [400, 'No password provided for user registering'],
  err_user_register_no_username: [400, 'No username provided for user registering'],
  err_user_register_no_email: [400, 'No email provided for user registering'],
  err_user_register_email_invalid: [400, 'Provided email address is invalid'],
  err_user_register_password_nolowercase: [400, 'Provided password must contain at least one lowercase character'],
  err_user_register_password_nonumber: [400, 'Provided password must contain at least one numeric digit'],
  err_user_register_password_nospecialchar: [400, 'Provided password must contain at least one special character'],
  err_user_register_password_nouppercase: [400, 'Provided password must contain at least one uppercase character'],
  err_user_register_password_toobig: [400, "Provided password can't have more than 32 characters"],
  err_user_register_password_toosmall: [400, 'Provided password must have at least 8 characters'],
  err_user_register_username_invalid_type1: [400, 'Provided username is not valid due to forbidden symbols: # % +'],
  err_user_register_username_invalid_type2: [400, "Provided username can't start or end with period, underscore, or hyphen"],
  err_user_register_username_nospaceallowed: [400, "Provided username can't have space characters"],
  err_user_register_username_toobig: [400, "Provided username can't have more than 32 characters"],
  err_user_register_username_toosmall: [400, 'Provided username must have at least 3 characters'],
} as const
