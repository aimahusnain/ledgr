# Ledgr - Accounting Ledger System

Ledgr is a comprehensive Accounting Ledger System built with Next.js, TypeScript, Tailwind CSS, and Prisma, using MongoDB as the database.

## Features

- Dashboard with overview of financial data
- Order management
- Payout tracking
- Configuration settings
- Responsive design with dark and light theme support

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- MongoDB
- shadcn/ui components

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/ledgr.git
   cd ledgr
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your MongoDB database and update the `.env` file with your database URL:
   ```
   DATABASE_URL="your-mongodb-url"
   ```

4. Run Prisma migrations:
   ```
   npx prisma db push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/app`: Next.js 13 App Router pages and layouts
- `/components`: Reusable React components
- `/lib`: Utility functions and shared logic
- `/prisma`: Prisma schema and migrations
- `/public`: Static assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.