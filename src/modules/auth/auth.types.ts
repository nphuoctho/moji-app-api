export interface SignUpPayload {
  email: string
  username: string
  password: string
  firstname: string
  lastname: string
}

export interface SignInPayload {
  email: string
  password: string
  deviceId: string
}

export interface RefreshTokenPayload {
  deviceId: string
}

export interface TokenPayload {
  sub: string // user ID
  sid: string
  kid: string
}

export interface AuthTokens {
  accessToken: string
}
