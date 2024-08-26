"use client";

import { db, storage } from "@/firebase/config";
import { collection, getDocs, query, where, doc, getDoc, and, or, addDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
    Input,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Spinner,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Slider
} from "@nextui-org/react";
import Link from "next/link";
import Error from "next/error";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { getCookies } from "@/utils/firebase";
import { toast } from "react-toastify";
import moment from "moment";
import Image from "next/image";

export default function Page({ params: { type } }: { params: any }) {
    const [properties, setProperties] = useState<any>();
    const [priceRange, setPriceRange] = useState<any>(type == 'rent' ? [0, 50000] : [0, 2000000]);
    const [userID, setUserID] = useState('')
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBeds, setSelectedBeds]: Array<any> = useState(new Set([]));
    const [search, setSearch] = useState('')

    const selectedValue = useMemo(() => {
        return selectedBeds.size
            ? [
                Array.from(selectedBeds).length == 5
                    ? "Any"
                    : Array.from(selectedBeds).join(", ").replaceAll("_", " "),
                "🛏️",
            ].join(" ")
            : "Bedroom";
    }, [selectedBeds]);

    const onSearchChangeHandler = (e: any) => {
        setSearch(e.target.value)
    }

    // GOOGLE MAPS (deprecated since it requires credit/debit card info)
    // const {isLoaded} = useLoadScript({
    //     googleMapsApiKey: "AIzaSyABgXWW3tmW6B5O4jaJpdNSWzLPgRbqmIw"
    // })
    // if(!isLoaded) return <div>isLoading</div>

    const getProperty = async () => {
        setIsLoading(true)
        const { id } = await getCookies()
        setUserID(id)
        const tempData: any = [];
        const docRef = collection(db, "properties");
        const beds = Array.from(selectedBeds).map((bed: any) => bed == '3++' ? bed : parseInt(bed))
        const q = query(docRef, and(
            type != "all" ? where("type", "==", type) : where('type', 'in', ['buy', 'rent', 'new_launches']),
            and(
                where('isBought', '==', false),
                and(
                    beds.length
                        ? beds.includes('3++')
                            ? or(
                                where('bedroom', 'in', beds),
                                where('bedroom', '>', 3)
                            )
                            : where('bedroom', 'in', beds)
                        : where('bedroom', '>=', 0),
                    and(
                        where('price', '>=', priceRange[0]),
                        where('price', '<=', priceRange[1]),
                    ))
            )));
        let querySnapshot = await getDocs(q);

        const fetchPromises = querySnapshot.docs.map(async (docz) => {
            const storageRef = ref(storage, `properties/${docz.id}`);
            const images = await listAll(storageRef)
            const tempImages: any[] = []
            const tempImage = await getDownloadURL(images.items[0])
            tempImages.push(tempImage)
            // const imagesFetching = images.items.map(async imageRef => {
            // })
            const listerRef = doc(db, 'users', docz.data().owner)
            const lister = await getDoc(listerRef)
            let listerData = {}
            if (lister.exists()) {
                listerData = { id: lister.id, ...lister.data() }
            }
            // await Promise.all(imagesFetching)
            tempData.push({ id: docz.id, ...docz.data(), images: tempImages, lister: listerData });
        });
        await Promise.all(fetchPromises)
        const searchResults = tempData.filter((item: any) => {
            return search.toLowerCase() === ''
                ? item
                : item.name.toLowerCase().includes(search.toLowerCase())
                || item.address.toLowerCase().includes(search.toLowerCase())
        })
        await setProperties(searchResults);
        setIsLoading(false);
    };

    useEffect(() => {
        getProperty();
    }, []);

    const possibleTypes = ["buy", "all", "rent", "new_launches"]
    if (!possibleTypes.includes(type)) {
        return <Error statusCode={404} withDarkMode={false} />
    }

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

    return (
        <div className="container mx-auto">
            <div className="my-4 px-2">
                <Breadcrumbs underline="hover">
                    <BreadcrumbItem>
                        <Link scroll={true} href={"/"}>Home</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>{type == 'buy' ? 'Properties for Sale' : type == "rent" ? 'Properties for Rental' : type == 'all' ? 'All Properties' : 'New Launches'}</BreadcrumbItem>
                </Breadcrumbs>
            </div>
            <hr />
            <div className="w-full my-4 flex justify-between items-center xs:flex-row flex-col gap-2">
                <div className="flex gap-2 w-full lg:flex-row flex-col xs:items-start items-center">
                    <Input
                        type="text"
                        onChange={onSearchChangeHandler}
                        placeholder="Search for a location..."
                        endContent={
                            <div className="pointer-events-none flex items-center">
                                <Image src="/search.svg" alt="search" width={20} height={20} />
                            </div>
                        }
                        className="max-w-[300px] border-gray-400 border-1 rounded-xl"
                    />
                    <div className="flex gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="bordered">{selectedValue}</Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                variant="faded"
                                aria-label="Static Actions"
                                closeOnSelect={false}
                                selectionMode="multiple"
                                selectedKeys={selectedBeds}
                                onSelectionChange={setSelectedBeds}
                                disallowEmptySelection={false}
                            >
                                <DropdownItem key="0">Studio</DropdownItem>
                                <DropdownItem key="1">1 bedroom</DropdownItem>
                                <DropdownItem key="2">2 bedrooms</DropdownItem>
                                <DropdownItem key="3">3 bedrooms</DropdownItem>
                                <DropdownItem key="3++">3++ bedrooms</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Popover placement="bottom" showArrow offset={5}>
                            <PopoverTrigger>
                                <Button color="default" variant="bordered">RM {parseInt(priceRange.toString().split(',')[0]).toLocaleString()} ~ RM {parseInt(priceRange.toString().split(',')[1]).toLocaleString()}</Button>
                            </PopoverTrigger>
                            <PopoverContent className="sm:w-[500px] w-[200px]">
                                {(titleProps) => (
                                    <div className="px-1 py-2 w-full">
                                        <p className="text-small font-bold text-foreground">
                                            Price
                                        </p>
                                        <Slider
                                            onChange={setPriceRange}
                                            label={" "}
                                            step={type == 'rent' ? 100 : 10000}
                                            minValue={0}
                                            maxValue={type == 'rent' ? 50000 : 2000000}
                                            defaultValue={priceRange}
                                            getValue={(price) => `RM ${parseInt(price.toString().split(',')[0]).toLocaleString()} ~ RM ${parseInt(price.toString().split(',')[1]).toLocaleString()}`}
                                        // formatOptions={{ style: "unit",  }}
                                        // className="max-w-md"
                                        />
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <Button variant="solid" color="secondary" onClick={() => getProperty()}>Search</Button>
            </div>
            <hr />
            {!isLoading ? <div className="mt-4 xs:px-0 px-2">
                <h1>Found {properties.length} properties {type == 'buy' ? 'for sale' : type == "rent" ? 'for rental' : type == 'all' ? 'across Malaysia' : 'that are newly launching'}!</h1>
                <div className="my-6 flex flex-wrap justify-center gap-8">
                    {!properties.length
                        ? <div className="h-[400px] flex flex-col gap-4 justify-center items-center">
                            <h1 className="text-5xl opacity-40">🏢</h1>
                            <h1 className="text-xl opacity-40">No properties found!</h1>
                        </div>
                        : properties.map((property: any, index: number) => {
                            return (
                                <Card className="w-[400px]" key={'property' + index}>
                                    <Link scroll={true} href={`/property/${property.id}`} className="opacity-100 hover:opacity-90 cursor-pointer transition-all duration-200">
                                        <CardHeader className="p-0 w-full h-[250px]">
                                            <Image height={1000} width={1000} src={property.images[0]} alt="" className="object-cover w-full h-full" />
                                        </CardHeader>
                                        <hr />
                                        <CardBody className="pb-0 pt-2 px-4 flex-col items-start">
                                            <h4 className="font-bold text-xl">{property.name}</h4>
                                            <small className="text-default-500">{property.address}</small>
                                            <h6 className="font-bold text-medium">RM {property.price.toLocaleString()} {property.type == 'rent' && <span>/ mo</span>}</h6>
                                            <h1 className="my-2">{property.bedroom} 🛏️ · {property.bathroom} 🚿 · {property.size} sqft</h1>
                                            <div className="flex gap-2 mb-4">
                                                <div className="p-2 py-1 rounded-xl bg-secondary-500">
                                                    <h1 className="text-sm text-white">{property.type == 'buy' ? 'For Sale' : property.type == "rent" ? 'For Rental' : 'Newly Launching'}</h1>
                                                </div>
                                                <div className="p-2 py-1 rounded-xl bg-secondary-500">
                                                    <h1 className="text-sm text-white">{property.tenure == 'freehold' ? 'Freehold' : "Leasehold"}</h1>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Link>
                                    <hr />
                                    <CardFooter className="py-4 px-4 flex justify-between">
                                        <div className="space-x-3 flex items-center">
                                            <Image height={40} width={40} src={property.lister.image} alt="agent-pfp" />
                                            <h1>
                                                Listed by <span className="font-bold">{property.lister.name}</span>
                                            </h1>
                                        </div>
                                        <Button variant="bordered" color="secondary" isDisabled={userID == property.lister.id} onClick={() => startChat(property.lister.id, property.lister.name, property.name)}>Chat with Agent</Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                </div>
            </div> : <div className="min-h-[500px] flex justify-center items-center">
                <Spinner label="Loading..." color="warning" />
            </div>}
        </div>
    );
}

// function Map() {
//     const center = useMemo(() => ({ lat: 44, lng: -80 }), [])

//     return (
//         <GoogleMap zoom={10} center={center}>
//             <Marker position={center} />
//         </GoogleMap>
//     )
// }