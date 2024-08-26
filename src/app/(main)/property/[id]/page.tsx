'use client'

import { getDoc, doc, addDoc, collection, getDocs, or, query, where, and } from "firebase/firestore";
import { db, storage } from "@/firebase/config";
import { BreadcrumbItem, Breadcrumbs, Button, image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getDownloadURL, listAll, ref } from "firebase/storage";
import Error from "next/error";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import moment from "moment";
import ImagesCarousel from "@/components/property/ImagesCarousel";
import { getCookies } from "@/utils/firebase";
import { toast } from "react-toastify";
import MortgageCalculator from "@/components/property/MortgageCalculator";
import Swal from "sweetalert2";
import { auth } from "@/firebase/config";
import Image from "next/image";

const Property = ({ params: { id } }: { params: any }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [userID, setUserID] = useState('')

    interface propertyObject {
        id: string,
        name: string,
    }
    const menuItems = [
        {
            name: "For Sale",
            link: "/property_list/buy",
            type: "buy"
        },
        {
            name: "For Rental",
            link: "/property_list/rent",
            type: "rent"
        },
        {
            name: "New Launches",
            link: "/property_list/new_launches",
            type: "new_launches"
        },
    ];

    const startChat = async (listerID: string, listerName: string, propertyName: string) => {
        if (!userID) {
            toast.error("Please sign in first!")
            return
        }
        try {
            const collectionRef = collection(db, 'chats')
            const q = query(collectionRef, or(where('users', "==", [userID, listerID]), where('users', "==", [listerID, userID])))
            const currentChats = await getDocs(q)
            const currentChat = currentChats.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }))[0]
            if (!currentChat) {
                toast.success(`Created a chat with ${listerName}!`)
                const chat = await addDoc(collectionRef, {
                    dateCreated: moment().format(),
                    users: [listerID, userID]
                })
                const chatRef = collection(db, 'chats', chat.id, 'messages')
                await addDoc(chatRef, {
                    content: `Hello! I would like to know more about ${propertyName}.`,
                    senderID: userID,
                    timeCreated: moment().format()
                })
            } else {
                toast.error('Chat already exists!')
            }
        } catch (e: any) {
            console.error({ msg: e.message, error: e.errorCode })
            toast.error(`Error creating chat with ${listerName}!`)
        }
    }

    const [propertyFound, setPropertyFound] = useState<any>()
    const [isLoading, setIsLoading] = useState(true)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const getProperty = async () => {
            const { id: userID } = await getCookies()
            setUserID(userID)
            const docRef = doc(db, 'properties', id)
            let docSnapshot = await getDoc(docRef)
            if (docSnapshot.exists()) {
                const storageRef = ref(storage, `properties/${id}`);
                const images = await listAll(storageRef)
                const tempImages: any[] = []
                await Promise.all(
                    images.items.map(async imageRef => {
                        const tempImage = await getDownloadURL(imageRef)
                        tempImages.push(tempImage)
                    })
                )
                const listerRef = doc(db, 'users', docSnapshot.data().owner)
                const lister = await getDoc(listerRef)
                let listerData = {}
                if (lister.exists()) {
                    listerData = { id: lister.id, ...lister.data() }
                }
                setPropertyFound({ ...docSnapshot.data(), id: docSnapshot.id, images: tempImages, lister: listerData, })
            }
            setIsLoading(false)
        }
        getProperty()
    }, [])

    useEffect(() => {
        console.log(propertyFound)
    }, [propertyFound])

    const bookReservation = async () => {
        if (!userID) {
            toast.error("Please sign in first!")
            return
        }
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `You will be booking a reservation with ${propertyFound.lister.name} regarding the property "${propertyFound.name}".`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, I am sure!"
        })
        if (!result.isConfirmed) return
        try {
            const reservationsRef = collection(db, 'reservations')
            const listerID = propertyFound.lister.id
            const q = query(reservationsRef,
                and(
                    where('user', '==', userID),
                    and(
                        where('agent', '==', listerID),
                        and(
                            where('property', '==', propertyFound.id),
                            or(
                                where('status', '==', 'Pending'),
                                where('status', '==', 'Confirmed'),
                            )
                        ),
                    ),
                )
            )
            const currentReservations = await getDocs(q)
            const currentReservation = currentReservations.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }))[0]
            if (currentReservation) {
                toast.error('There is still a pending/confirmed reservation with the agent!')
                return
            }
            await addDoc(reservationsRef, {
                user: userID,
                agent: listerID,
                property: propertyFound.id,
                status: "Pending",
                dateCreated: moment().format(),
                dateCancelledOrConfirmed: "",
                dateSettled: ""
            })
            toast.success("Your booking was successful!")
        } catch (e: any) {
            toast.error(`${e.message} | Code: ${e.errorCode}`)
        }
    }

    if (isLoading)
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Spinner label="Loading..." color="warning" />
            </div>
        )

    return (
        <>
            {propertyFound ?
                <div className="container mx-auto relative px-2">
                    <div className="my-4">
                        <Breadcrumbs underline="hover">
                            <BreadcrumbItem><Link scroll={true} href={'/'} className="hover:text-gray-950 duration-200 text-gray-400">Home</Link></BreadcrumbItem>
                            <BreadcrumbItem><Link scroll={true} href={menuItems.find((item) => item.type == propertyFound?.type)?.link || '/'} className="hover:text-gray-950 duration-200 text-gray-400">{menuItems.find((item) => item.type == propertyFound?.type)?.name}</Link></BreadcrumbItem>
                            <BreadcrumbItem>{propertyFound?.name}</BreadcrumbItem>
                        </Breadcrumbs>
                    </div>
                    <ImagesCarousel images={propertyFound.images} isVisible={isVisible} setIsVisible={setIsVisible} />
                    <div className="max-w-3xl sm:h-[500px] h-[200px] rounded-xl mx-auto relative group">
                        {propertyFound.images.length > 1 ? <>
                            <Image height={1000} width={1000} src={propertyFound.images[0]} alt="" className="rounded-xl cursor-pointer object-cover h-full w-full" onClick={() => setIsVisible(true)} />
                            <div className="size-full absolute top-0 left-0 bg-black rounded-xl group-hover:opacity-40 opacity-0 pointer-events-none duration-250">
                            </div>
                            <div className="size-full absolute top-0 left-0 rounded-xl group-hover:opacity-80 opacity-0 pointer-events-none duration-250">
                                <div className="flex flex-col items-center justify-center text-center text-white size-full group-hover:opacity-100">
                                    <svg className="w-16 h-16 mr-1 text-current-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="m-0 text-lg">Click to see more images.</p>
                                </div>
                            </div>
                        </> : <Image height={1000} width={1000} src={propertyFound.images[0]} alt="" className="rounded-xl object-cover h-full w-full" />}
                    </div>
                    <div className="flex h-full lg:flex-row flex-col">
                        <div className="lg:w-2/3 w-full">
                            <h1 className="mt-8 text-3xl font-bold">{propertyFound.name}</h1>
                            <h1 className="mt-4">{propertyFound.address}</h1>
                            <hr className="border border-gray-300 mt-6" />
                            <div className="flex my-6 sm:flex-row flex-col sm:gap-0 gap-4">
                                <div className="sm:w-2/5 flex flex-col justify-center">
                                    <h1 className="text-2xl font-semibold">RM {propertyFound.price.toLocaleString()} {propertyFound.type == 'rent' && <span>/ mo</span>}</h1>
                                    {propertyFound.type != 'rent' && <a href="#calculate-mortgage"><h1 className="mt-2 text-secondary-500 font-semibold hover:underline">{'Calculate mortgage >'} </h1></a>}
                                </div>
                                <div className="sm:w-3/5 flex sm:border-l sm:border-t-0 border-t sm:pt-0 pt-4 border-gray-300 ps-8 gap-8 sm:flex-row flex-col items-center">
                                    <div className="flex gap-8">
                                        <div className="flex flex-col items-center gap-2 text-gray-600 font-semibold">
                                            <h2 className="text-3xl">🛏️</h2>
                                            <h2>{propertyFound.bedroom} beds</h2>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 text-gray-600 font-semibold">
                                            <h2 className="text-3xl">🛁</h2>
                                            <h2>{propertyFound.bathroom} baths</h2>
                                        </div>
                                    </div>
                                    <div className="flex gap-8">
                                        <div className="flex flex-col items-center gap-2 text-gray-600 font-semibold">
                                            <h2 className="text-3xl">🏠</h2>
                                            <h2>{propertyFound.size.toLocaleString()} sqft</h2>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 text-gray-600 font-semibold">
                                            <h2 className="text-3xl">💲</h2>
                                            <h2>RM {Math.round(propertyFound.price / propertyFound.size)} psft</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr className="border border-gray-300" />
                            <div className="my-10">
                                <h1 className="text-2xl font-bold">Description</h1>
                                <h1 className="mt-6 ms-3">{propertyFound.description}</h1>
                            </div>
                            <hr className="border border-gray-300" />
                            <div className="my-10">
                                <h1 className="text-2xl font-bold">Amenities</h1>
                                <div className="grid grid-cols-10 mt-6 text-gray-600 [&>*]:col-span-5 [&>*]:border-b [&>*]:border-gray-200 [&>*]:pb-2 [&>*]:mx-3 [&>*]:mb-3">
                                    {propertyFound.amenities.map((amenity: any, index:number) => {
                                        return (
                                            <div className="" key={amenity + "-" + index}>
                                                <p className="font-semibold">✅ {amenity}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <hr className="border border-gray-300" />
                            <div className="my-10">
                                <h1 className="text-2xl font-bold">More details</h1>
                                <div className="grid grid-cols-10 mt-6 text-gray-600 [&>*]:col-span-5 [&>*]:border-b [&>*]:border-gray-200 [&>*]:pb-2 [&>*]:mx-3 [&>*]:mb-3 [&>*]:ps-1">
                                    <div className="">
                                        <p>Property Type</p>
                                        <p className="font-semibold">{propertyFound.type == 'buy' ? "For Sale" : propertyFound.type == 'rent' ? "For Rental" : "Newly Launching"}</p>
                                    </div>
                                    <div className="">
                                        <p>Floor Size</p>
                                        <p className="font-semibold">{propertyFound.size} sqft</p>
                                    </div>
                                    <div className="">
                                        <p>Furnishing</p>
                                        <p className="font-semibold">{propertyFound.furnished}</p>
                                    </div>
                                    <div className="">
                                        <p>PSF</p>
                                        <p className="font-semibold">RM {Math.round(propertyFound.price / propertyFound.size)} psft</p>
                                    </div>
                                    <div className="">
                                        <p>Built Year</p>
                                        <p className="font-semibold">{moment(propertyFound.builtDate).format('MMM YYYY')}</p>
                                    </div>
                                    <div className="">
                                        <p>Tenure</p>
                                        <p className="font-semibold">{propertyFound.tenure.charAt(0).toUpperCase() + propertyFound.tenure.slice(1)}</p>
                                    </div>
                                    <div className="">
                                        <p>Listed On</p>
                                        <p className="font-semibold">{moment(propertyFound.dateListed).format('D MMM YYYY')}</p>
                                    </div>
                                </div>
                            </div>
                            {(propertyFound.type != 'rent') && <>
                                <hr className="border border-gray-300" />
                                <div className="my-10" id="calculate-mortgage">
                                    <MortgageCalculator initialLoanAmount={propertyFound.price * 0.9} initialPropertyPrice={propertyFound.price} />
                                </div>
                            </>}
                        </div>
                        <div className="lg:w-1/3 p-8 h-fit lg:sticky block top-20">
                            <div className="size-full rounded-xl border-gray-300 border p-6 max-w-[300px] mx-auto">
                                <div className="flex gap-4 items-center">
                                    <Image height={1000} width={1000} src={propertyFound.lister.image} alt="agent_pfp" className="object-cover rounded-full w-16" />
                                    <div>
                                        <h1 className="text-lg font-bold p-0 m-0">{propertyFound.lister.name}</h1>
                                        <p className="p-0 m-0 text-slate-600">{propertyFound.lister.username}</p>
                                    </div>
                                </div>
                                <hr className="border border-gray-300 my-6" />
                                <Button variant="bordered" color="secondary" className="w-full" radius="full" isDisabled={userID == propertyFound.lister.id} onClick={() => startChat(propertyFound.lister.id, propertyFound.lister.name, propertyFound.name)}>Chat with Agent</Button>
                                <div className="rounded-full border-secondary-500 bg-transparent hover:bg-secondary-500 border-2 py-2 w-full text-center text-secondary-500 hover:text-white mt-2 h-10 duration-200 group">
                                    <p className="text-sm m-0 group-hover:hidden">Hover to show email</p>
                                    <p className="text-sm m-0 opacity-0 hidden group-hover:opacity-100 group-hover:block">{propertyFound.lister.email}</p>
                                </div>
                                <div className="my-4 w-[50px] border border-gray-300 mx-auto"></div>
                                <Button variant="bordered" color="secondary" className="w-full" radius="full" isDisabled={userID == propertyFound.lister.id} onClick={bookReservation}>Book a Reservation</Button>
                            </div>
                        </div>
                    </div>
                </div > : <Error statusCode={404} withDarkMode={false} />
            }
        </>
    )
}

export default Property;