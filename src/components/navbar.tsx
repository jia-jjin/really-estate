'use client'
import { NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Link as NextUILink, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Spinner } from "@nextui-org/react";
import { getCookies, redirectToHome, removeCookies } from "@/utils/firebase"
import { revalidatePath } from "next/cache"
import Link from 'next/link'
import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { usePathname } from "next/navigation";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import "@/../public/reallyestate-logo.png";
import { profile } from "console";
import Image from "next/image";

const Topbar = () => {
  const userLogout = async () => {
    // console.log('logging out user')
    try {
      await signOut(auth)
      await removeCookies()
      // console.log('user logged out successfully')
      redirectToHome()
      return { status: 200, msg: "Logged out successfully." }
    } catch (e) {
      return { status: 400, msg: "An error occured." }
    }
  }

  const currentPath = usePathname();
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('');
  const [image, setImage] = useState('');
  const [email, setEmail] = useState('');
  const [profileIsLoading, setProfileIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const possiblePropertyListPaths = ["buy", "all", "rent", "new_launches"]
  if (currentPath.includes('/property_list')) {
    if (!possiblePropertyListPaths.includes(currentPath.split('/')[2])) {
      return <></>
    }
  }

  const menuItems = [
    {
      name: "Home",
      link: "/"
    },
    {
      name: "Buy",
      link: "/property_list/buy"
    },
    {
      name: "Rent",
      link: "/property_list/rent"
    },
    {
      name: "New Launches",
      link: "/property_list/new_launches"
    },
    {
      name: "All Properties",
      link: "/property_list/all"
    },
  ];

  const onLoad = async () => {
    setProfileIsLoading(true)
    try {
      let res: any = await getCookies()
      setUsername(res.username)
      setEmail(res.email)
      setImage(res.image)
      setUserType(res.type)
      setProfileIsLoading(false)
    } catch (e: any) {
      console.error({ msg: e.message, error: e.errorCode })
      return
    }
  }

  useEffect(() => {
    onLoad()
  }, []);
  
  useEffect(() => {
    onLoad()
  }, [auth.currentUser]);

  const onLogoutHandler = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will have to login again!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Logout"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setUsername('')
        setEmail('')
        setImage('')
        setUserType('')
        let res: any = await userLogout()
        Swal.fire({
          title: res.status >= 400 ? "Error" : "Success",
          text: res.msg,
          icon: res.status >= 400 ? "error" : "success"
        })
      }
    });
  }



  return (
    <Navbar maxWidth="full" className="border-b-slate-400 border-b" isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        item: [
          "flex",
          "relative",
          "h-full",
          "items-center",
          // "data-[active=true]:after:content-['']",
          // "data-[active=true]:after:absolute",
          // "data-[active=true]:after:bottom-[10px]",
          // "data-[active=true]:after:left-0",
          // "data-[active=true]:after:right-0",
          // "data-[active=true]:after:h-[2px]",
          // "data-[active=true]:after:w-full",
          // "data-[active=true]:after:rounded-[2px]",
          // "data-[active=true]:after:bg-secondary",
          "data-[active=true]:after:opacity-100",
          // "hover:after:content-['']",
          // "hover:after:absolute",
          // "hover:after:bottom-[10px]",
          // "hover:after:left-0",
          // "hover:after:right-0",
          // "hover:after:h-[2px]",
          // "hover:after:w-full",
          // "hover:after:rounded-[2px]",
          // "hover:after:bg-secondary",
          "hover:after:opacity-60",
          "after:content-['']",
          "after:absolute",
          "after:bottom-[10px]",
          "after:left-0",
          "after:right-0",
          "after:h-[2px]",
          "after:w-full",
          "after:rounded-[2px]",
          "after:bg-secondary",
          "after:opacity-0",
          "after:duration-200",
          "after:transition-all"
        ],
      }}
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Link scroll={true} href="/" className="">
            <Image src="/reallyestate-logo.png" width={200} height={800} alt="logo" className="mx-auto" />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarBrand>
          <Link scroll={true} href="/" className="">
            <Image src="/reallyestate-logo.png" width={200} height={800} alt="logo" className="mx-auto" />
          </Link>
        </NavbarBrand>
        {menuItems.map((item, index) => {
          return (
            <NavbarItem className="flex justify-center" isActive={item.name !== "All Properties" ? item.link === currentPath : currentPath.includes('property/') || currentPath.includes('property_list/all')} key={`${item.name}-${index}`}>
              <NextUILink color={item.name !== "All Properties" ? item.link === currentPath ? "secondary" : "foreground" : currentPath.includes('property/') || currentPath.includes('property_list/all') ? "secondary" : "foreground"}>
                <Link scroll={true} href={item.link}>
                  {item.name}
                </Link>
              </NextUILink>
            </NavbarItem>
          )
        })}
        {userType == 'agent' ? <NavbarItem className="flex justify-center" isActive={"/sell" === currentPath} key={`sell`}>
          <NextUILink color={"/sell" === currentPath ? "secondary" : "foreground"}>
            <Link scroll={true} href={"/sell"}>
              Sell a Property
            </Link>
          </NextUILink>
        </NavbarItem> : <></>}

      </NavbarContent>
      <NavbarContent as="div" justify="end">
        {!profileIsLoading ? email ? <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              name={username || undefined}
              size="sm"
              src={image}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="faded" className="text-black">
            <DropdownItem key="profile" className="h-14 gap-2">
              <Link scroll={true} href={'/settings'} className="size-full">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{email}</p>
              </Link>
            </DropdownItem>
            <DropdownItem key="settings">
              <Link scroll={true} href={'/settings'} className="size-full">
                <div className="size-full">Settings</div>
              </Link>
            </DropdownItem>
            <DropdownItem key="reservations">
              <Link scroll={true} href={'/settings'} className="size-full">
                <div className="size-full">Reservations</div>
              </Link>
            </DropdownItem>
            {/* <DropdownItem key="help_and_feedback">
              <Link scroll={true} href={'/help'} className="size-full">
                <div className="size-full">Help & Feedback</div>
              </Link>
            </DropdownItem> */}
            <DropdownItem key="logout" color="danger" onClick={() => onLogoutHandler()}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown> : <>
          <NavbarItem className="hidden lg:flex hover:after:opacity-0">
            <Link scroll={true} href="/login">Login</Link>
          </NavbarItem>
          <NavbarItem className="hover:after:opacity-0">
            <Button as={Link} color="secondary" href="/signup" variant="flat">
              Sign Up
            </Button>
          </NavbarItem></> : <div className="gap-4 flex items-center">
          <Spinner size="sm" color="warning"></Spinner>
          <h1>Loading profile...</h1>
        </div>}
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarItem className="flex justify-center h-[50px] w-fit" isActive={item.name !== "All Properties" ? item.link === currentPath : currentPath.includes('property/') || currentPath.includes('property_list/all')} key={`${item.name}-${index}`}>
            <NextUILink color={item.name !== "All Properties" ? item.link === currentPath ? "secondary" : "foreground" : currentPath.includes('property/') || currentPath.includes('property_list/all') ? "secondary" : "foreground"}>
              <Link scroll={true} href={item.link} onClick={() => setIsMenuOpen(false)}>
                {item.name}
              </Link>
            </NextUILink>
          </NavbarItem>
        ))}
      </NavbarMenu>
    </Navbar>

    // <nav className="bg-gray-800">
    //   <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
    //     <div className="relative flex h-16 items-center justify-between">
    //       <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
    //         {/* <!-- Mobile menu button--> */}
    //         <button type="button" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
    //           <span className="absolute -inset-0.5"></span>
    //           <span className="sr-only">Open main menu</span>
    //           {/* <!--
    //         Icon when menu is closed.

    //         Menu open: "hidden", Menu closed: "block"
    //       --> */}
    //           <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
    //             <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    //           </svg>
    //           {/* <!--
    //         Icon when menu is open.

    //         Menu open: "block", Menu closed: "hidden"
    //       --> */}
    //           <svg className="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
    //             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    //           </svg>
    //         </button>
    //       </div>
    //       <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
    //         <div className="flex flex-shrink-0 items-center">
    //           <img className="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" />
    //         </div>
    //         <div className="hidden sm:ml-6 sm:block">
    //           <div className="flex space-x-4">
    //             {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
    //             <a href="/home" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Home</a>
    //             <a href="/buy" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Buy</a>
    //             <a href="/rent" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Rent</a>
    //             <a href="/sell" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Sell</a>
    //           </div>
    //         </div>
    //       </div>
    //       <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
    //         {!username ? <>
    //           <a href='/login'>
    //             <button className="bg-blue-600 p-3 py-2 rounded-lg text-sm">
    //               Login
    //             </button>
    //           </a>
    //           <a href="/signup">
    //             <button className="bg-blue-600 p-3 py-2 rounded-lg text-sm ms-2">
    //               Sign up
    //             </button>
    //           </a>
    //         </> :
    //           <>
    //           <h1>hi, {username}</h1>
    //           <a onClick={() => onLogoutHandler()}>
    //             <button className="bg-red-600 p-3 py-2 rounded-lg text-sm ms-2">
    //               Log out
    //             </button>
    //           </a>
    //           </>
    //           }
    //         {/* <h1>{user}</h1> */}
    //       </div>
    //     </div>
    //   </div>

    //   {/* <!-- Mobile menu, show/hide based on menu state. --> */}
    //   <div className="sm:hidden" id="mobile-menu">
    //     <div className="space-y-1 px-2 pb-3 pt-2">
    //       {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
    //       <a href="#" className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white" aria-current="page">Dashboard</a>
    //       <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Team</a>
    //       <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Projects</a>
    //       <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Calendar</a>
    //     </div>
    //   </div>
    // </nav>

  )
}

export default Topbar