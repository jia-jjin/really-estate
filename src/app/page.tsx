'use client'
import { Button, Input, } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
    return (
        <div className="mx-auto pb-[50px]">
            <div className='h-[400px] md:m-12 m-4 relative group overflow-hidden'>
                <Image width={1000} height={500} src="/home-hero-bg.jpeg" alt="" className='size-full object-cover scale-100 group-hover:scale-110 duration-200 ' />
                <div className="size-full bg-black/40 group-hover:bg-black/60 duration-200 z-10 absolute top-0 left-0 flex items-center">
                    <div className="container mx-auto flex flex-col items-center justify-center">
                        <div className="md:p-12 p-6 border-white w-fit border-4 flex items-center justify-center">
                            <h1 className='sm:text-5xl xs:text-3xl text-2xl text-white tracking-widest font-extrabold'>reallyEstate&#8482;</h1>
                        </div>
                        <h1 className='text-xl text-white italic font-semibold mt-4 underline-offset-4 underline text-center mx-4'>Think of real estate, think of reallyEstate&#8482;.</h1>
                    </div>
                </div>
            </div>
            <h1 className='sm:block hidden text-center mb-12 text-4xl font-bold'>Hover these cards for
                <span className="before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-pink-500 relative inline-block mx-3">
                    <span className="relative text-white">surprises</span>
                </span>!
            </h1>
            <div className="container mx-auto px-2 sm:mt-0 mt-8 relative overflow-x-clip">
                <div className='sm:block hidden [perspective:800px] group relative'>
                    <div className="w-2/3 relative">
                        <div className="shadow-xl rounded-xl h-[500px] md:h-[400px] bg-yellow-400 group-hover:bg-yellow-500 duration-300 group-hover:[transform:rotateY(5deg)] ">
                        </div>
                        <div className="shadow-xl rounded-xl h-[500px] md:h-[400px] w-full bg-slate-500 group-hover:bg-slate-400 duration-300 group-hover:[scale:0.9] group-hover:[transform:rotateY(5deg)] group-hover:top-0 top-2 left-2 absolute">
                            <div className="size-full p-8 flex flex-col justify-center group-hover:justify-center gap-6 duration-300">
                                <h1 className='xs:text-4xl text-2xl text-white font-bold'>Looking to buy or rent a new property?</h1>
                                <div className='group-hover:block hidden space-y-8'>
                                    <h1 className='xs:text-5xl text-3xl duration-300 text-yellow-300 drop-shadow-lg font-bold'>Explore over 10 properties on our webpage!</h1>
                                    <div className="flex gap-2">
                                        <Link href={'/property_list/buy'} scroll={true}>
                                            <div className='hover:scale-105 cursor-pointer rounded-md border-2 bg-yellow-300 border-yellow-500 hover:bg-yellow-200 hover:border-yellow-400 duration-300 flex items-center px-3 py-2 relative w-[80px] h-[40px] group/edit overflow-hidden'>
                                                <button className='text-sm font-semibold focus-visible:outline left-7 text-nowrap absolute duration-300 group-hover/edit:left-[200px]'>
                                                    Buy
                                                </button>
                                                <div className='-left-14 absolute duration-300 group-hover/edit:left-7'>🏠</div>
                                            </div>
                                        </Link>
                                        <Link href={'/property_list/rent'} scroll={true}>
                                            <div className='hover:scale-105 cursor-pointer rounded-md border-2 bg-yellow-300 border-yellow-500 hover:bg-yellow-200 hover:border-yellow-400 duration-300 flex items-center px-3 py-2 relative w-[80px] h-[40px] group/edit overflow-hidden'>
                                                <button className='text-sm font-semibold focus-visible:outline left-6 text-nowrap absolute duration-300 group-hover/edit:left-[200px]'>
                                                    Rent
                                                </button>
                                                <div className='-left-14 absolute duration-300 group-hover/edit:left-7'>🏠</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div></div>
                    <div className='rounded-2xl absolute -top-20 -z-10 scale-50 right-80 opacity-0 group-hover:opacity-100 group-hover:[scale:1.5] [perspective:400px] group-hover:top-0 group-hover:right-0 md:group-hover:right-0 duration-300'>
                        <Image height={1000} width={1000} src="/home-hero-bg.jpeg" alt="" className='group-hover:ms-24 object-cover size-full rounded-2xl [transform:rotateY(0)] duration-300 group-hover:[transform:rotateY(-5deg)] shadow-xl' />
                    </div>
                </div>
                <div className="sm:hidden block relative">
                    {/* <div className="shadow-xl rounded-xl h-[400px] bg-yellow-500 duration-300">
                    </div> */}
                    <div className="shadow-xl rounded-xl w-full bg-slate-400 duration-300 top-0 z-10 border-5 border-yellow-500">
                        <div className="size-full p-8 flex flex-col justify-center gap-6 duration-300">
                            <h1 className='text-2xl text-white font-bold'>Looking to buy or rent a new property?</h1>
                            <div className='space-y-8'>
                                <h1 className='text-4xl duration-300 text-yellow-300 drop-shadow-lg font-bold'>Explore over 10 properties on our webpage!</h1>
                                <div className="flex gap-2">
                                    <Link href={'/property_list/buy'} scroll={true}>
                                        <button className='bg-yellow-300 border-yellow-500 py-2 px-5 border rounded-md text-sm font-semibold focus-visible:outline text-nowrap duration-300'>
                                            Buy
                                        </button>
                                    </Link>
                                    <Link href={'/property_list/rent'} scroll={true}>
                                        <button className='bg-yellow-300 border-yellow-500 py-2 px-5 border rounded-md text-sm font-semibold focus-visible:outline text-nowrap duration-300'>
                                            Rent
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex md:flex-row flex-col mt-48 gap-8 h-[400px] [perspective:300px]">
                    <div className="w-full min-h-[200px] relative group [transform:rotateX(5deg)] hover:[transform:rotateX(0deg)] duration-200">
                        <div className=" pointer-events-none size-full absolute group-hover:bg-black/20 bg-transparent top-0 left-0 group-hover:[scale:1.02] duration-200"></div>
                        <Link href={'/property_list/new_launches'} scroll={true}>
                            <div className="relative flex flex-col gap-4 p-2 items-center justify-center size-full bg-yellow-300 group-hover:bg-yellow-400 group-hover:scale-90 duration-200 group-hover:shadow-2xl shadow-md z-50 cursor-pointer">
                                <Image height={1000} width={1000} src="/condo.jpg" alt="" className='size-full object-cover absolute top-0 left-0 opacity-0 group-hover:opacity-80 duration-200' />
                                <div className="p-4 bg-transparent rounded-xl z-10 group-hover:bg-white group-hover:shadow-xl duration-200"><h1 className='text-3xl font-bold drop-shadow-xl text-gray-800 text-center'>Explore all recent new launches!</h1></div>
                                <Button variant='solid' color='warning' size='lg' className='shadow-md'>View Now</Button>
                            </div>
                        </Link>
                    </div>
                    <div className="w-full min-h-[200px] relative group [transform:rotateX(5deg)] hover:[transform:rotateX(0deg)] duration-200">
                        <div className=" pointer-events-none size-full absolute group-hover:bg-black/20 bg-transparent top-0 left-0 group-hover:[scale:1.02] duration-200"></div>
                        <Link href={'/property_list/all'} scroll={true}>
                            <div className="relative flex flex-col gap-4 items-center justify-center size-full bg-yellow-300 group-hover:bg-yellow-400 group-hover:scale-90 duration-200 group-hover:shadow-2xl shadow-md z-50 cursor-pointer">
                                <Image height={1000} width={1000} src="/dream.webp" alt="" className='size-full object-cover absolute top-0 left-0 opacity-0 group-hover:opacity-80 duration-200' />
                                <div className="p-4 bg-transparent rounded-xl z-10 group-hover:bg-white group-hover:shadow-xl duration-200"><h1 className='text-3xl font-bold drop-shadow-xl text-gray-800 text-center'>Check out all properties!</h1></div>
                                <Button variant='solid' color='warning' size='lg' className='shadow-md'>View Now</Button>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            {/* <div className='w-full h-96 relative' > */}
            {/* <div className='bg-slate-800/60 rounded-lg w-1/2 h-1/2 absolute -bottom-1/2 translate-x-1/2 -translate-y-1/2 p-9'>
                    <div className='flex gap-2'>
                    <Input
                        type="text"
                        variant='flat'
                        placeholder='Search for a place...'
                        radius='sm'
                    //   startContent={
                    //     <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    //   }
                    />
                    <Button variant='solid'>
                        Search
                    </Button>
                    </div>
                </div> */}
            {/* </div> */}
        </div>
    )
}