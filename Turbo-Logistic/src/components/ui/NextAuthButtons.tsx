"use client";
import { useEffect, useRef, useState } from "react";
import { signIn, signOut } from "next-auth/react";

export const SignIn = () => {
  const signInButtonRef = useRef<HTMLButtonElement>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds === 0) {
      signInButtonRef.current?.click();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // Clean up the interval on component unmount
  }, [seconds]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button ref={signInButtonRef} onClick={() => signIn("keycloak")}></button>
      {/*<div>Auto-sign in in {seconds} seconds...</div>*/}
      <div className="text-center text-lg font-semibold text-gray-700">
        User Logout..
      </div>
    </div>
  );
};

export const SignOut = () => {
  return (
    <button
      onClick={() => signOut()}
      className="block mx-auto mt-4 bg-red-500 text-white py-2 px-4 rounded-md"
    >
      SignOut
    </button>
  );
};
