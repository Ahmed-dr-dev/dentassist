import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  );
}
