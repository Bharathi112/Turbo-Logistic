'use client'; // Mark this component as a Client Component

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { NavItems } from '@/config';
import { Menu } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import 'animate.css'; // Import Animate.css

interface HeaderProps {
  username: string; // Username passed as a prop
}

export default function Header({ username }: HeaderProps) {
  const navItems = NavItems();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [animate, setAnimate] = useState(false); // State to control animation

  // Log user information
  useEffect(() => {
    if (session) {
      const roles = session.user?.roles;
      const preferredUsername = session.user?.preferred_username;
      const accessToken = session.access_token;

      //console.log("User Roles:", roles);
      //console.log("User:", preferredUsername);
      //console.log("Access Token:", accessToken);
    }
  }, [session]);

  // Handle logout with Access Token
  const handleLogout = async () => {
    const accessToken = session?.access_token;

    if (accessToken) {
      try {
        // Call your backend logout endpoint (if required)
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }

    // Clear the session and redirect
    signOut({ callbackUrl: '/' });
  };

  // Trigger animation every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true); // Enable animation
      setTimeout(() => setAnimate(false), 1000); // Disable animation after 1 second
    }, 3000); // Repeat every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 justify-between">
      <Link
        href="#"
        className="flex items-center gap-2 text-lg font-semibold md:text-base"
        prefetch={false}
      >
        <span className="w-8 h-8 border bg-accent rounded-full" />
        {/* Add animate__rotateIn animation */}
        <span
          className={`animate__animated ${animate ? 'animate__rotateIn' : ''}`}
        >
          TURBO LOGISTIC
        </span>
      </Link>

      <div className="ml-4 flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
                <Avatar>
                    <AvatarFallback className="text-white">{(session?.user?.preferred_username || username)?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{session?.user?.preferred_username || username}</DropdownMenuLabel> {/* Display preferred username or fallback to username */}
            {/*<DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />*/}
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem> {/* Logout button */}
          </DropdownMenuContent>
        </DropdownMenu>

        <button onClick={() => setIsOpen(true)} className="block sm:hidden">
          <Menu size={24} />
        </button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="right" className='block md:hidden'>
            <div className="pt-4 overflow-y-auto h-fit w-full flex flex-col gap-1">
              {navItems.map((navItem, idx) => (
                <Link
                  key={idx}
                  href={navItem.href}
                  onClick={() => setIsOpen(false)}
                  className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
                    navItem.active
                      ? 'font-base text-sm bg-neutral-200 shadow-sm text-neutral-700 dark:bg-neutral-800 dark:text-white'
                      : 'hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                  }`}
                >
                  <div className="relative font-base text-sm py-1.5 px-2 flex flex-row items-center space-x-2 rounded-md duration-100">
                    {navItem.icon}
                    <span>{navItem.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}