'use client'

import { Tabs, Tab, Card, CardBody, Input, Spinner, CardHeader, Button } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { checkUserLogin, getCookies, redirectToHome, removeCookies } from "@/utils/firebase";
import { signOut, deleteUser, getAuth, User } from "firebase/auth";
import Swal from "sweetalert2";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, where } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { easeIn, useReducedMotion } from "framer-motion";
import { toast } from "react-toastify";
import moment from "moment";
import Image from "next/image";

export default function Settings() {
    const [reservations, setReservations] = useState<Array<any>>([])
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [image, setImage] = useState('')
    const [userID, setUserID] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [userType, setUserType] = useState('')
    const [formInfo, setFormInfo] = useState({ name: "", email: "", phone_number: "" })
    const [profileIsLoading, setProfileIsLoading] = useState(true)
    const [reservationsIsLoading, setReservationsIsLoading] = useState(true)

    const userLogout = async () => {
        // console.log('logging out user')
        try {
            await signOut(auth)
            await removeCookies()
            //   console.log('user logged out successfully')
            redirectToHome()
            return { status: 200, msg: "Logged out successfully." }
        } catch (e) {
            return { status: 400, msg: "An error occured." }
        }
    }

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
                let res: any = await userLogout()
                Swal.fire({
                    title: res.status >= 400 ? "Error" : "Success",
                    text: res.msg,
                    icon: res.status >= 400 ? "error" : "success"
                })
            }
        });
    }

    const fetchProfileData = async () => {
        setProfileIsLoading(true)
        let { id }: any = await getCookies()
        const userRef = doc(db, 'users', id)
        const userSnapshot = await getDoc(userRef)
        const res = userSnapshot.data()
        setName(res?.name)
        setEmail(res?.email)
        setImage(res?.image)
        setPhoneNumber(res?.phone_number)
        setUserType(res?.type)
        setUserID(userSnapshot.id)
        setFormInfo({ ...formInfo, name: res?.name, email: res?.email, phone_number: res?.phone_number })
        setTimeout(() => {
            setProfileIsLoading(false)
        }, 500);
    };

    const fetchReservationsData = async () => {
        setReservationsIsLoading(true)
        let { id, type }: any = await getCookies()
        const reservationsRef = collection(db, 'reservations')
        const q = query(reservationsRef, where(type, '==', id), orderBy('dateCreated', 'desc'))
        const currentReservationsSnapshot = await getDocs(q)
        const currentReservations: any = currentReservationsSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }))
        const modifiedReservations: any = []
        await Promise.all(
            currentReservations.map(async (reservation: any) => {
                const userRef = doc(db, 'users', type == "user" ? reservation.agent : reservation.user)
                const userSnapshot = await getDoc(userRef)
                const propertyRef = doc(db, 'properties', reservation.property)
                const propertySnapshot = await getDoc(propertyRef)
                if (type == 'user') {
                    modifiedReservations.push(
                        {
                            ...reservation,
                            agent: { ...userSnapshot.data(), id: userSnapshot.id },
                            property: { ...propertySnapshot.data(), id: propertySnapshot.id },
                        }
                    )
                } else {
                    modifiedReservations.push(
                        {
                            ...reservation,
                            user: { ...userSnapshot.data(), id: userSnapshot.id },
                            property: { ...propertySnapshot.data(), id: propertySnapshot.id },
                        }
                    )
                }
            })
        )
        setReservations(modifiedReservations)

        setTimeout(() => {
            setReservationsIsLoading(false)
        }, 500);
    };

    useEffect(() => {
        fetchProfileData();
        fetchReservationsData()
    }, []);

    const onChangeHandler = (e: any) => {
        setFormInfo({ ...formInfo, [e.target.name]: e.target.value })
    }

    const onDeleteUser = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete my account!"
        })
        if (!result.isConfirmed) return
        try {
            const auth = await getAuth()
            const user = auth.currentUser

            //@ts-ignore
            await deleteUser(user)
            const userCollection = collection(db, 'users')
            const q = query(userCollection, where('email', '==', user?.email))
            const userIDs = await getDocs(q)
            const userID = userIDs.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }))[0]
            const userRef = doc(db, 'users', userID.id)
            await deleteDoc(userRef)
            await removeCookies()
            redirectToHome()
            Swal.fire({
                title: "Deleted!",
                text: "Your account has been deleted.",
                icon: "success"
            });
        } catch (e: any) {
            Swal.fire({
                title: "Error!",
                text: e.message,
                icon: "error"
            });

        }
    }

    const onUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            const userRef = doc(db, 'users', userID)
            const userSnapshot = await getDoc(userRef)
            const userInfo = userSnapshot.data()

            await setDoc(userRef, {
                ...userInfo,
                name: formInfo.name,
                phone_number: formInfo.phone_number,
            })
            toast.success("Successfully updated profile!")
            fetchProfileData()
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const onCancelHandler = async (index: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This user will have to book another reservation with you.",
            icon: "warning",
            input: "text",
            inputLabel: "Reason of cancellation:",
            confirmButtonText: "Submit",
            cancelButtonText: "Nevermind",
            inputAttributes: {
                autocapitalize: "off",
                required: "true"
            },
            showCancelButton: true
        })
        if (!result.isConfirmed) return
        try {
            const reservationRef = doc(db, 'reservations', reservations[index].id)
            await setDoc(reservationRef, {
                ...reservations[index],
                property: reservations[index].property.id,
                user: reservations[index].user.id,
                dateCancelledOrConfirmed: moment().format(),
                dateSettled: moment().format(),
                reasonOfCancellation: result.value,
                status: "Cancelled"
            })
            fetchReservationsData()
            toast.success("Cancelled reservation with " + reservations[index].user.name)
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const onConfirmHandler = async (index: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will be booking a reservation with " + reservations[index].user.name + ".",
            icon: "warning",
            input: "date",
            showCancelButton: true,
            confirmButtonText: "Yes, I'm sure",
            cancelButtonText: "Nevermind",
            inputLabel: "Select a date for the reservation:",
            inputAttributes: {
                required: "true",
                min: moment().format("YYYY-MM-DD")
            },
        })
        if (!result.isConfirmed) return
        try {
            const reservationRef = doc(db, 'reservations', reservations[index].id)
            await setDoc(reservationRef, {
                ...reservations[index],
                property: reservations[index].property.id,
                user: reservations[index].user.id,
                dateCancelledOrConfirmed: moment().format(),
                status: "Confirmed",
                reservationDate: moment(result.value).format()
            })
            fetchReservationsData()
            toast.success("Confirmed reservation with " + reservations[index].user.name)
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const onSettleHandler = async (index: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Please double check if you have finished a reservation with " + reservations[index].user.name + ".",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, I'm sure",
            cancelButtonText: "Nevermind",
        })
        if (!result.isConfirmed) return
        try {
            const reservationRef = doc(db, 'reservations', reservations[index].id)
            await setDoc(reservationRef, {
                ...reservations[index],
                property: reservations[index].property.id,
                user: reservations[index].user.id,
                dateSettled: moment().format(),
                status: "Settled"
            })
            fetchReservationsData()
            toast.success("Finished reservation with " + reservations[index].user.name)
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    if (profileIsLoading || reservationsIsLoading)
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Spinner label="Loading..." color="warning" />
            </div>
        )

    return (
        <div className="container mx-auto py-6 flex flex-col">
            <div className="w-full flex justify-between items-center mb-6">
                <div className="w-20 flex gap-4 items-center">
                    <Image height={80} width={80} alt="user_image" src={image} className="object-cover rounded-full w-full" />
                    <div>
                        <h1 className="text-lg font-bold p-0 m-0">{name}</h1>
                        <p className="p-0 m-0">{email}</p>
                    </div>
                </div>
                {/* <Button color="danger" variant="ghost" onClick={onLogoutHandler}>
                    Log out
                </Button> */}
            </div>
            <div className="flex gap-4 md:flex-row flex-col">
                <Card className="w-full h-fit">
                    <CardBody className="p-8 w-full">
                        <h1 className="text-2xl font-bold">My Reservations</h1>
                        {reservations.length ? <div className="mt-4 gap-2">
                            {
                                reservations.map((reservation: any, index: number) => {
                                    return (
                                        <div key={'reservation' + index} className='rounded-xl w-full bg-slate-300 mb-3 shadow-md border border-black'>
                                            <div className="flex justify-between">
                                                <div className="p-6">
                                                    <h1 className="text-xl font-semibold underline underline-offset-2">Property: {reservation.property.name}</h1>
                                                    <div className="mt-2">
                                                        {userType == "user" ? <h1 className="">Agent: <span className="font-semibold">{reservation.agent.name}</span></h1> : <h1 className="">User: <span className="font-semibold">{reservation.user.name}</span></h1>}
                                                        <h1>Date created: <span className="font-semibold">{moment(reservation.dateCreated).format('DD/MM/YYYY')}</span></h1>
                                                        {reservation.status == "Cancelled" && <div className="mt-2">
                                                            <h1>Reason of cancellation: </h1>
                                                            <h1 className="font-semibold">{reservation.reasonOfCancellation}</h1>
                                                        </div>}
                                                        {(reservation.status == "Confirmed" || reservation.status == "Settled") && <div className="mt-2">
                                                            <h1>Date of reservation: <span className="font-semibold">{moment(reservation.reservationDate).format("DD/MM/YYYY")}</span></h1>
                                                        </div>}
                                                    </div>
                                                </div>
                                                <div className={`uppercase text-sm font-bold h-fit rounded-xl p-2 px-3 m-4 ${reservation.status == "Pending" ? "bg-yellow-300" : reservation.status == "Confirmed" ? "bg-green-400" : reservation.status == "Cancelled" ? "bg-red-400" : "bg-slate-400"}`}>
                                                    <h1>{reservation.status}</h1>
                                                </div>
                                            </div>
                                            {userType == "agent" ? reservation.status == "Pending" ?
                                                <>
                                                    <hr className="border border-gray-500 mb-4" />
                                                    <div className="flex justify-end">
                                                        <div className="flex gap-2 mx-4 mb-4">
                                                            <Button color="danger" onClick={() => onCancelHandler(index)}>
                                                                Cancel
                                                            </Button>
                                                            <Button color="secondary" onClick={() => onConfirmHandler(index)}>
                                                                Confirm
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </>
                                                : reservation.status == "Confirmed" ?
                                                    <>
                                                        <hr className="border border-gray-500 mb-4" />
                                                        <div className="flex justify-end">
                                                            <div className="flex gap-2 mx-4 mb-4">
                                                                <Button color="secondary" onClick={() => onSettleHandler(index)}>
                                                                    Done with reservation
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </>
                                                    : <></>
                                                : <></>
                                            }
                                        </div>
                                    )
                                }
                                )
                            }
                        </div> :
                            <div className="h-[330px] flex flex-col gap-4 justify-center items-center">
                                <h1 className="text-5xl opacity-40">📝</h1>
                                <h1 className="text-xl opacity-40">No reservations found!</h1>
                            </div>
                        }
                    </CardBody>
                </Card>
                <Card className="w-full h-fit">
                    <CardBody className="p-8 w-full">
                        <h1 className="text-2xl font-bold">Profile</h1>
                        <form className="mt-8" onSubmit={onUpdateProfile}>
                            <Input variant="bordered" onChange={onChangeHandler} label="Name" placeholder={name} value={formInfo.name} name="name" type="text" required isRequired></Input>
                            <Input
                                startContent={<div className="pointer-events-none flex items-center">
                                    <span className="text-default-600 text-small">+60</span>
                                </div>}
                                variant="bordered" onChange={onChangeHandler} label="Phone Number" placeholder={phoneNumber} value={formInfo.phone_number} name="phone_number" type="number" required isRequired className="mt-4"></Input>
                            <Input variant="bordered" onChange={onChangeHandler} label="Email" value={formInfo.email} name="email" type="email" className="mt-4" required isRequired isDisabled></Input>
                            <h1 className="text-sm text-gray-500 ms-2 mt-3">✅ Email verified</h1>
                            <div className="flex gap-2 mt-6">
                                <Button color="secondary" variant="solid" type="submit">
                                    Save
                                </Button>
                                <Button color="danger" variant="solid" onClick={onDeleteUser}>
                                    Delete account
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
            {/* <Tabs aria-label="Options" isVertical={true} >
                <Tab key="photos" style={{ width: '200px', height: '60px' }} title='Profile'>
                    <Card className="">
                        <CardBody className="p-8 w-full">
                            <h1 className="text-2xl font-bold">Profile</h1>
                            <form className="mt-8">
                                <Input variant="bordered" onChange={onChangeHandler} label="Name" placeholder={name} value={formInfo.name} name="name" type="text" isRequired></Input>
                                <Input variant="bordered" onChange={onChangeHandler} label="Phone Number" value={formInfo.phone_number} name="phone_number" type="text" isRequired className="mt-4"></Input>
                                <Input variant="bordered" onChange={onChangeHandler} label="Email" value={formInfo.email} name="email" type="email" className="mt-4" isRequired isDisabled></Input>
                                <div className="flex gap-2 mt-6">
                                    <Button color="secondary" variant="solid">
                                        Save
                                    </Button>
                                    <Button color="danger" variant="solid">
                                        Delete account
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="music" style={{ width: '200px', height: '60px' }} title="Reservations">
                    <Card>
                        <CardBody>
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs> */}
        </div>
    )
}