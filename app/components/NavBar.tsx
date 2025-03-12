"use client";
import { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCredits } from "@/app/contexts/CreditsContext";

export default function NavBar() {
  const { data: session } = useSession();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileImgWrapperRef = useRef<HTMLDivElement>(null);
  const { credits } = useCredits();


  const handleProfileClick = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  // Close the profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileImgWrapperRef.current &&
        !profileImgWrapperRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // Fallback URL in case the user's image fails to load
  const fallbackImage =
    "https://www.svgrepo.com/show/475656/google-color.svg";

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 to-purple-800 text-white shadow-lg sticky top-0 z-50">
      {/* Left side (Logo/App Name) */}
      <Link href="/">
        <div className="text-2xl font-extrabold">Linked Boost</div>
      </Link>

      {/* Right side (Session buttons and credits) */}
      <div className="flex items-center space-x-6">
        {session ? (
          <div className="flex items-center space-x-4">
            {/* Credits display (hidden on very small screens) */}
            <div className="hidden sm:flex items-center space-x-1">
              <span className="text-lg">Credits:</span>
              <span className="font-semibold text-lg">
                {credits !== null ? credits : "Loading..."}
              </span>
            </div>

            {/* Profile image with dropdown menu */}
            <div className="relative">
              <div
                ref={profileImgWrapperRef}
                onClick={handleProfileClick}
                className="cursor-pointer"
              >
                <Image
                  src={session.user?.image || fallbackImage}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white"
                />
              </div>
              {isProfileMenuOpen && (
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-2 text-black"
                >
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-blue-700 transition duration-150"
            onClick={() => signIn("google")}
          >
            <Image
              className="w-6 h-6"
              src={fallbackImage}
              alt="google logo"
              width={24}
              height={24}
              loading="lazy"
            />
            <span className="font-semibold">Login with Google</span>
          </button>
        )}
      </div>
    </nav>
  );
}
