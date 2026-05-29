# SokoOnline Environment Variables Template

## Copy this to your Render environment variables

### Database Configuration
```
DATABASE_URL=postgresql://sokoonline:YOUR_PASSWORD@host:5432/sokoonline
DATABASE_USERNAME=sokoonline
DATABASE_PASSWORD=38QO4idPmpyRWSGzY0UGgwKY4Tt0rxyP
```

### JWT Configuration
```
JWT_SECRET=your-super-secret-key-at-least-32-characters-long-make-it-random
JWT_EXPIRATION_MS=86400000
```

### Cloudinary Configuration (Image Storage)
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### M-Pesa Configuration (Payment) - OPTIONAL (Not Needed)
```
# SKIP THESE IF NOT USING M-PESA
# MPESA_CONSUMER_KEY=your_mpesa_consumer_key
# MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
# MPESA_SHORTCODE=your_mpesa_shortcode
# MPESA_PASSKEY=your_mpesa_passkey
# MPESA_CALLBACK_URL=https://sokoonline-api.onrender.com/api/mpesa/callback
```

## How to Get These Values

### 1. Database (Render creates this)
- Go to Render PostgreSQL service
- Copy the connection string
- Extract username and password

### 2. JWT Secret
Generate a strong random string:
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32 | ForEach-Object {[char](Get-Random -InputObject (33..126))} | Join-String)))

# Or use any online generator: https://generate-random.org/
```

### 3. Cloudinary
- Sign up at https://cloudinary.com
- Go to Account Settings → API Keys
- Copy Cloud Name, API Key, API Secret

### 4. M-Pesa (Optional - Only if implementing payment)
- Register at https://www.safaricom.co.ke/business/mpesa-apis
- Get credentials from developer portal
- Set callback URL to your Render app URL

---

## Example (Replace with your actual values)
```
DATABASE_URL=postgresql://sokoonline:abc123xyz@oregon-postgres.render.com:5432/sokoonline
DATABASE_USERNAME=sokoonline
DATABASE_PASSWORD=abc123xyz
JWT_SECRET=Z8kX9pL2mQ5vN3dF6rH7jW8bX9yC2mP3sK6tL7uJ9wQ1rN5sM8vH2kP4bY7cF9x
JWT_EXPIRATION_MS=86400000
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc_xyz_123_secret_key
```

**Note:** M-Pesa variables are omitted since payment integration is not being used.

---

## Security Notes ⚠️
- Never commit `.env` files to Git
- Never share these values
- Render keeps them encrypted
- Rotate JWT_SECRET periodically
- Use strong random values for all secrets
