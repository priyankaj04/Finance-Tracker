# Money Tracker React Native App


## Overview


Money Tracker is a custom-built React Native application designed to help you and your friends efficiently track your credits and debits. The app offers a personalized solution for managing your finances by allowing you to log all your financial transactions in a user-friendly interface. The backend of the application is hosted on the cloud, using Supabase with PostgreSQL as the database. The server-side logic is implemented with Node.js and Express, providing a simple yet effective CRUD (Create, Read, Update, Delete) API for managing your financial data.


## Features

* `Custom Financial Tracking`: Log credits and debits tailored to your specific needs.
* `User-Friendly Interface`: Simple and intuitive UI for easy transaction management.
* `Cloud-Hosted Backend`: The backend is hosted using Supabase, ensuring reliable and secure data storage.
* `CRUD Operations`: The app supports full CRUD operations through a Node.js and Express API, allowing you to create, read, update, and delete financial records.


## Technology Stack


<b>Frontend</b>

* `React Native`: Used to build the mobile application for both Android and iOS platforms.

<b>Backend</b>

* `Node.js`: Server-side JavaScript runtime environment.
* `Express.js`: Lightweight framework for building web applications and APIs.
* `Supabase`: Managed service providing PostgreSQL as a cloud database.


## Repository Structure


This repository contains the React Native application for MoneyTracker. For the backend code, please refer to the [MoneyTracker Backend Repository](https://github.com/priyankaj04/money-tracker-backend).



## Configure the Backend


* Set up your Supabase project and obtain the API keys.
* Create a `.env` file in the root of your backend directory with the following content:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=your_preferred_port
```

* Update the PostgreSQL database schema to fit your application's needs by running migrations or setting it up manually via the Supabase dashboard.


### Thank you
For any inquiries or support, please reach out to me.
