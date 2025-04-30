"use client";
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export function withRoleAccess(allowedRoles: string[], redirectPath: string = '/unauthorized') {
  return async function RoleAccessWrapper(Component: React.ComponentType) {
    const session = await getServerSession(authOptions);
    const userRoles = session?.user?.roles || [];

    // Check if the user has at least one of the allowed roles
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

    // Redirect if the user doesn't have access
    if (!hasAccess) {
      redirect(redirectPath);
    }

    // Return the original component if the user has access
    return <Component />;
  };
}