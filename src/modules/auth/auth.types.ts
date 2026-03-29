export interface SignUpDto {
  email: string
  username: string
  passord: string
  firstname: string
  lastname: string
}

export interface SignInDto {
  email: string
  password: string
  deviceId: string
}

export interface RefreshTokenDto {
  deviceId: string
}

export interface TokenPayload {
  sub: string // user ID
  sid: string
  kid: string
  email: string
  username: string
}

export interface AuthTokens {
  accessToken: string
}
