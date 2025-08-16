# **App Name**: Catering Commander

## Core Features:

- Secure Login: Provides a secure login using hardcoded credentials (admin@catering.com / Catering123) with redirection to the dashboard upon successful authentication.
- Dashboard Layout: Displays a top navigation bar with the app name ('Catering Dashboard') and a logout button, plus a sidebar navigation menu with links to Dashboard, Orders, Menu Management, Customers, and Reports.
- Dashboard Overview: Presents a summary of key metrics including Total Orders Today, Total Customers, Revenue, and Upcoming Events, visualized with a small chart of orders/revenue over the last 7 days.
- Orders Management: Manages orders through a table displaying Order ID, Customer Name, Event Date, and Status (Pending/In Progress/Completed), with the option to update the order status.
- Menu Management: Enables menu management by listing menu items with Name, Category (Veg/Non-Veg), and Price, with functionalities to Add/Edit/Delete items using simple forms.
- Customer Database: Presents customer data in a table format, showing Customer Name, Phone, Email, and Total Orders.
- Reporting Dashboard: Generates revenue and order reports using basic charts to visualize key business metrics.

## Style Guidelines:

- Primary color: A muted lavender (#B5B0D8) to evoke a sense of calm and reliability, reflecting the trustworthiness of the catering service.
- Background color: Light gray (#F0F0F5), a very desaturated version of the primary hue to ensure a clean and unobtrusive backdrop.
- Accent color: Soft blue (#94BBD9), analogous to lavender, to add visual interest without overwhelming the user.
- Body and headline font: 'PT Sans' (sans-serif), known for its modern yet approachable style, making it suitable for both headers and body text.
- Employs a clean, modern dashboard layout optimized for both mobile and desktop screens using Tailwind CSS. Reusable components such as cards, tables, and forms are utilized for consistency.
- Adopts a consistent set of simple icons for navigation and status indicators throughout the application.
- Applies subtle transitions and animations for a smooth and engaging user experience when navigating between pages and updating data.