<table>
  <tr>
    <td width="500">
     <img width="500" height="500" alt="Sokoonline E-Market Project" src="https://github.com/user-attachments/assets/d4cbb84a-a30d-4468-bea7-3d32883b67d8" /> 
    </td>
    <td>
      <h1>SokoOnline</h1>
      <p>
        An e-market/ecommerce platform built specifically for the Nairobi market. Connecting local suppliers 
        directly with customers. 
      </p>
    </td>
  </tr>
</table>

---

## What is SokoOnline?

SokoOnline is an online marketplace designed around how Nairobi actually shops. The idea is to give local suppliers a digital storefront and give customers a fast, clean way to browse, buy and pay using M-Pesa without leaving the platform.

The project covers everything a real e-commerce platform needs: a customer-facing store, a complete admin panel, a full order flow from cart to payment confirmation, and a JWT-secured REST API powering it all.

---

## What it can do

**For shoppers**
- Browse and filter products by category and subcategory
- Search across the full catalogue in real time
- View full product details with related product suggestions
- Manage a cart — add, adjust quantities, remove items
- Check out with delivery details and pay via M-Pesa STK Push
- Track order status from pending to delivered

**For admins**
- Add, edit and delist products with image uploads via Cloudinary
- Manage the full category and subcategory hierarchy
- Run time-limited promotions with custom badge labels and expiry dates
- View and update order statuses across all customers

**Platform-wide**
- JWT authentication with role-based access (customer vs admin)
- Modal-based sign in and register — no page redirects
- Fully responsive across desktop and mobile
- Secure by default — public and protected routes properly separated

---

## Built with

**Backend**
- Java 17 + Spring Boot 3
- Spring Security with JWT
- Spring Data JPA + PostgreSQL
- Cloudinary — image storage
- Safaricom Daraja API — M-Pesa STK Push
- Maven

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Axios
- React Router v6
- Lucide React

---

## Running it locally

### Backend
```bash
cd backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Fill in your database, JWT, Cloudinary and M-Pesa credentials
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env
npm run dev
```

---

## Contributing

Contributions are welcome. If you have an idea, spotted a bug or want to improve something:

1. Fork the repository
2. Create a new branch — `git checkout -b your-feature-name`
3. Make your changes and commit — `git commit -m "what you changed"`
4. Push to your fork — `git push origin your-feature-name`
5. Open a pull request describing what you did and why

For bigger changes — open an issue first so we can discuss before you build.

Please keep contributions focused. This project has a clear identity — a Nairobi-market e-commerce platform. Contributions that fit that vision are most likely to be merged.

---

## License

This project is licensed under **CC BY-NC 4.0**.

You are free to view, learn from and build on this code for personal and educational purposes. Commercial use ,including deploying a modified version as a product or service is not permitted without explicit written permission from the author.

---

## Author

Built by **Weston** — full-stack developer.

If you find this project useful or interesting, a star goes a long way ⭐
