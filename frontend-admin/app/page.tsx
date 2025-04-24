import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // Redirect to admin login or dashboard
  redirect('/admin/login');
}