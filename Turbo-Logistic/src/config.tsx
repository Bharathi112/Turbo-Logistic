"use client"; // Mark this as a client component

import { usePathname } from 'next/navigation';
import { Bell, Briefcase, Home, Settings, User, Truck, List, MapPin, BarChart,PieChart, Activity } from 'lucide-react';
import { useSession } from 'next-auth/react'; // Import useSession

export const NavItems = () => {
  const pathname = usePathname();
  const { data: session } = useSession(); // Get the session data

  // Extract user details from session
  const roles = session?.user?.roles || [];

  // Log user roles
  console.log("User Roles:", roles);

  function isNavItemActive(pathname: string, nav: string) {
    return pathname.includes(nav);
  }

  // Define navigation items with required roles
  const navItems = [
    {
      name: 'Trip-List',
      href: '/',
      icon: <Home size={20} />,
      active: pathname === '/',
      position: 'top',
      roles: ['Turbo-Logistic-Management'], // All roles can access
    },
    {
      name: 'Trip-List',
      href: '/AgencyList',
      icon: <List size={20} />,
      active: isNavItemActive(pathname, '/AgencyList'),
      position: 'top',
      roles: ['Agency'], // Turbo-Logistic-Management and Agency can access
    },
    {
      name: 'Book-Trip',
      href: '/Book-Trip',
      icon: <User size={20} />,
      active: isNavItemActive(pathname, '/Book-Trip'),
      position: 'top',
      roles: ['Agency'], // Only Turbo-Logistic-Management can access
    },
    {
      name: 'Owners',
      href: '/Add-Owners',
      icon: <User size={20} />,
      active: isNavItemActive(pathname, '/Add-Owners'),
      position: 'top',
      roles: ['Turbo-Logistic-Management'], // Turbo-Logistic-Management and Owners can access
    },
    {
      name: 'Trip-List',
      href: '/OwnerList',
      icon: <MapPin size={20} />,
      active: isNavItemActive(pathname, '/OwnerList'),
      position: 'top',
      roles: ['Owners'], // Turbo-Logistic-Management and Owners can access
    },
    {
      name: 'Vehicle-List',
      href: '/Vehicle-List',
      icon: <Truck size={20} />,
      active: isNavItemActive(pathname, '/Vehicle-List'),
      position: 'top',
      roles: ['Owners'], // Turbo-Logistic-Management and Owners can access
    },
    
    
    {
      name: 'Agencies',
      href: '/Add-Agency',
      icon: <Truck size={20} />,
      active: isNavItemActive(pathname, '/Add-Agency'),
      position: 'top',
      roles: ['Turbo-Logistic-Management'], // Turbo-Logistic-Management and Agency can access
    },
    
    {
      name: 'Telemetry',
      href: '/Telemetry',
      icon: <Activity size={20} />,
      active: isNavItemActive(pathname, '/Telemetry'),
      position: 'top',
      roles: ['Turbo-Logistic-Management'], // Only Turbo-Logistic-Management can access
    },
    
    {
      name: 'More',
      href: '/More',
      icon: <Settings size={20} />,
      active: isNavItemActive(pathname, '/More'),
      position: 'bottom',
      roles: ['Turbo-Logistic-Management'], // Only Turbo-Logistic-Management can access
    },
    
    


  ];

  // Filter navigation items based on user roles
  const filteredNavItems = navItems.filter((item) => {
    // If no roles are specified, allow access to all users
    if (!item.roles || item.roles.length === 0) return true;

    // Check if the user has at least one of the required roles
    return item.roles.some((role) => roles.includes(role));
  });

  return filteredNavItems;
};