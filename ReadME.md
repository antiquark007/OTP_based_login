Example Usage
POST /api/auth/send-otp
{
  "mobile": "9876543210"
}
POST /api/auth/verify-otp
{
  "mobile": "9876543210",
  "otp": "123456"
}
Response:
{
  "message": "Signup successful",
  "token": "eyJhbGciOi...",
  "user": {
    "mobile": "9876543210"
  }
}