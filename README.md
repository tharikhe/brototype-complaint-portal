# 🎄 Brototype Student Complaint Portal

A modern, feature-rich student complaint management system with a festive Christmas theme, built using Next.js 14, Supabase, and shadcn/ui.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green)

## ✨ Features

### 🎯 Core Functionality
- **🔐 Email Authentication** - Secure user authentication powered by Supabase
- **👥 Role-Based Access Control** - Separate dashboards for Students and Admins
- **🎫 Ticket Management** - Create, track, and manage complaints with ease
- **💬 Comment System** - Interactive comments on tickets
- **📊 Analytics Dashboard** - Real-time statistics and data visualization
- **📱 Responsive Design** - Beautiful UI on all devices

### 🎨 Design Features
- **❄️ Animated Snowfall** - Realistic snow animation using react-snowfall
- **🎅 Christmas Theme** - Festive design with Santa imagery
- **🌙 Dark Mode** - Sleek dark interface with glassmorphism effects
- **✨ Smooth Animations** - Polished transitions and micro-interactions
- **📱 Mobile Optimized** - Fully responsive layout

### 👨‍🎓 Student Portal
- Submit new complaints with categories and priorities
- Track complaint status (Open, In Progress, Resolved)
- View complaint history and statistics
- Add comments to tickets
- Update profile information
- Draft auto-save functionality

### 👨‍💼 Admin Dashboard
- View all student complaints in one place
- Update ticket statuses
- Filter by status, priority, and category
- Export data to CSV
- View detailed analytics with charts
- Search and sort functionality

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 18.x or higher installed
- **npm** or **yarn** package manager
- A **Supabase** account (free tier works!)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/brototype-complaint-portal.git
   cd brototype-complaint-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Run the following SQL in your Supabase SQL Editor:

   ```sql
   -- Create profiles table
   create table profiles (
     id uuid references auth.users on delete cascade primary key,
     email text,
     full_name text,
     role text check (role in ('student', 'admin')),
     batch_id text,
     admission_number text,
     phone text,
     domain text,
     avatar_url text,
     joining_date date,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Enable Row Level Security
   alter table profiles enable row level security;

   -- Policy: Users can read their own profile
   create policy "Users can read own profile"
     on profiles for select
     using (auth.uid() = id);

   -- Policy: Users can update their own profile  
   create policy "Users can update own profile"
     on profiles for update
     using (auth.uid() = id);

   -- Policy: Admins can read all profiles
   create policy "Admins can read all profiles"
     on profiles for select
     using (
       exists (
         select 1 from profiles
         where id = auth.uid() and role = 'admin'
       )
     );

   -- Function to automatically create profile on signup
   create or replace function public.handle_new_user()
   returns trigger as $$
   begin
     insert into public.profiles (id, email, full_name, role)
     values (
       new.id,
       new.email,
       new.raw_user_meta_data->>'full_name',
       new.raw_user_meta_data->>'role'
     );
     return new;
   end;
   $$ language plpgsql security definer;

   -- Trigger to call the function
   create trigger on_auth_user_created
     after insert on auth.users
     for each row execute procedure public.handle_new_user();
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Creating Your First Account

1. Click **Sign Up** on the login page
2. Fill in your details:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
   - Confirm Password
   - Select Role (Student or Staff/Admin)
3. Click **Create Account**

### Student Workflow

1. **Login** to your student dashboard
2. Click **Raise New Complaint** to create a ticket
3. Fill in:
   - Title
   - Description
   - Category (Curriculum, Facilities, Technical, Administrative, Other)
   - Priority (Low, Medium, High)
   - Optional: Attach a screenshot
4. Track your complaints and add comments as needed

### Admin Workflow

1. **Login** to the admin dashboard
2. View all student complaints with statistics
3. **Filter** tickets by status, priority, or category
4. **Update** ticket statuses (Open → In Progress → Resolved)
5. **Search** for specific tickets
6. **Export** data to CSV for reporting
7. View analytics charts for insights

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Animations:** [react-snowfall](https://github.com/cahilfoley/react-snowfall)

### Backend & Database
- **Authentication:** [Supabase Auth](https://supabase.com/docs/guides/auth)
- **Database:** [Supabase (PostgreSQL)](https://supabase.com/)
- **Storage:** LocalStorage (for tickets and comments)

### Development Tools
- **Linting:** ESLint
- **Formatting:** Prettier (recommended)
- **Type Checking:** TypeScript

## 📂 Project Structure

```
brototype/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin dashboard
│   ├── student/             # Student dashboard
│   ├── page.tsx             # Login page
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui components
│   ├── analytics-charts.tsx # Charts component
│   ├── logout-button.tsx    # Logout button
│   └── social-icons.tsx     # Social media icons
├── lib/                     # Utilities and configurations
│   ├── supabase/            # Supabase client
│   ├── auth-context.tsx     # Authentication context
│   ├── mock-data.ts         # Mock data store
│   └── types.ts             # TypeScript types
├── public/                  # Static assets
│   ├── logo.png
│   └── santa_v2.png
└── package.json
```

## 🔐 Security

- **Environment Variables:** Never commit `.env.local` to version control
- **Row Level Security (RLS):** All database tables are protected with RLS policies
- **Role-Based Access:** Students can only access their own data
- **Secure Authentication:** Powered by Supabase's battle-tested auth system
- **Input Validation:** All forms include client-side validation

## 🎨 Customization

### Changing the Theme

The Christmas theme can be customized by modifying the Tailwind configuration and global styles:

- **Colors:** Edit `tailwind.config.js`
- **Animations:** Modify CSS in `app/globals.css`
- **Snow Effect:** Adjust parameters in `app/page.tsx`

### Adding New Ticket Categories

Update the `TicketCategory` type in `lib/types.ts`:

```typescript
export type TicketCategory = 
  | 'curriculum' 
  | 'facilities' 
  | 'technical' 
  | 'administrative' 
  | 'new_category'  // Add your category here
  | 'other';
```

## 🚧 Future Enhancements

- [ ] **Supabase Tickets Table** - Move tickets from localStorage to Supabase
- [ ] **Real-time Updates** - Live ticket updates using Supabase subscriptions
- [ ] **Email Notifications** - Notify users of status changes
- [ ] **Advanced Search** - Full-text search capabilities
- [ ] **File Upload** - Support for multiple attachments
- [ ] **Ticket Assignment** - Assign tickets to specific admins
- [ ] **Priority Escalation** - Auto-escalate high-priority tickets
- [ ] **Mobile App** - React Native version
- [ ] **Analytics Export** - Download charts and reports
- [ ] **Bulk Operations** - Handle multiple tickets at once

## 🐛 Known Issues

- Tickets are currently stored in localStorage (will migrate to Supabase)
- CSV export doesn't include comments
- Mobile responsiveness on some older devices needs improvement

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Built with ❤️ for **Brototype Coding Bootcamp**

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- Brototype for the inspiration and support

---

<div align="center">
  <strong>🎄 Happy Holidays from Brototype! 🎅</strong>
</div>
