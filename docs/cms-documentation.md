# SenseBy CBD Admin CMS Documentation

This document provides an overview of the SenseBy CBD Admin CMS, which allows you to manage products, categories, orders, users, and translations for your e-commerce store.

## Table of Contents

1. [Accessing the Admin CMS](#accessing-the-admin-cms)
2. [Dashboard](#dashboard)
3. [Products Management](#products-management)
4. [Categories Management](#categories-management)
5. [Orders Management](#orders-management)
6. [Users Management](#users-management)
7. [Translations Management](#translations-management)
8. [Security](#security)

## Accessing the Admin CMS

The Admin CMS is accessible at `/admin` and is protected by authentication. Only users with admin privileges can access the CMS.

To access the CMS:
1. Log in to your account
2. Navigate to `/admin`
3. If you don't have admin privileges, you will be redirected to the homepage

## Dashboard

The dashboard provides an overview of your store's performance and recent activity:

- **Key Statistics**: Total products, orders, users, and revenue
- **Low Stock Alerts**: Notifications for products with low inventory
- **Recent Orders**: A list of the most recent orders with quick access to details

## Products Management

The Products Management section allows you to manage your product catalog:

### Viewing Products

- Navigate to `/admin/products`
- Use the search bar to find specific products
- Filter products by category
- Sort products by name, price, or stock

### Adding a New Product

1. Click the "Add Product" button
2. Fill in the product details:
   - **Basic Information**: Name, slug, description
   - **Pricing & Inventory**: Regular price, sale price, stock quantity
   - **Category**: Assign the product to a category
   - **Images**: Upload a main image and additional images
   - **Specifications**: Add product specifications as key-value pairs
   - **Translations**: Add translations for the product name and description
3. Click "Create Product" to save

### Editing a Product

1. Click the edit icon next to a product
2. Update the product details
3. Click "Update Product" to save changes

### Deleting a Product

1. Click the delete icon next to a product
2. Confirm the deletion in the confirmation dialog

## Categories Management

The Categories Management section allows you to organize your products into categories:

### Viewing Categories

- Navigate to `/admin/categories`
- Use the search bar to find specific categories

### Adding a New Category

1. Click the "Add Category" button
2. Fill in the category details:
   - **Name**: The category name
   - **Slug**: The URL-friendly version of the name
   - **Description**: A description of the category
   - **Image URL**: A URL for the category image
   - **Translations**: Add translations for the category name and description
3. Click "Create Category" to save

### Editing a Category

1. Click the edit icon next to a category
2. Update the category details
3. Click "Update Category" to save changes

### Deleting a Category

1. Click the delete icon next to a category
2. Confirm the deletion in the confirmation dialog
   - Note: You cannot delete a category that has products assigned to it

## Orders Management

The Orders Management section allows you to track and manage customer orders:

### Viewing Orders

- Navigate to `/admin/orders`
- Use the search bar to find specific orders
- Filter orders by status
- Sort orders by date or total amount

### Order Details

1. Click the "View" button next to an order
2. View customer information, shipping address, and order items
3. Update the order status:
   - Pending
   - Processing
   - Shipped
   - Delivered
   - Cancelled

## Users Management

The Users Management section allows you to manage user accounts:

### Viewing Users

- Navigate to `/admin/users`
- Use the search bar to find specific users
- Sort users by name, email, or join date

### User Details

1. Click the "View" button next to a user
2. View user information, including contact details and order history
3. Grant or revoke admin privileges

## Translations Management

The Translations Management section allows you to manage translations for products and categories:

### Managing Translations

1. Navigate to `/admin/translations`
2. Select either "Products" or "Categories"
3. Select an item from the list
4. Add or edit translations for each language:
   - Dutch (nl)
   - German (de)
   - French (fr)
5. Click "Save Translations" to save changes

## Security

The Admin CMS is secured with several measures:

- **Authentication**: Only authenticated users can access the CMS
- **Authorization**: Only users with admin privileges can access the CMS
- **Row Level Security**: Database queries are restricted based on user roles
- **CSRF Protection**: Cross-Site Request Forgery protection is enabled
- **XSS Protection**: Cross-Site Scripting protection is enabled

## Best Practices

- Regularly update product information and inventory
- Process orders promptly and update their status
- Use descriptive names and slugs for products and categories
- Provide translations for all content to support international customers
- Regularly review user accounts and admin privileges
