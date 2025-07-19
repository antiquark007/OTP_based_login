# OTP-Based Login System

This project implements an OTP-based login system using:

- **Fast2SMS** for sending OTPs via SMS
- **JWT** for user authentication
- **MongoDB** (with Mongoose) to store OTPs

**Flow:**  
1. Generate OTP  
2. Send OTP via SMS  
3. Store OTP in DB  
4. Verify OTP  
5. Authenticate user

---

## API Endpoints

### 1. Send OTP

**POST** `/api/auth/send-otp`

**Request Body:**
```json
{
  "mobile": "9876543210"
}
```
**Response:**
```json
{
  "message": "OTP sent successfully"
}
```
### 2. Verify OTP
**POST** `/api/auth/verify-otp`
**Request Body:**
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```