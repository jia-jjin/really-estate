import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@nextui-org/react";
import EditProperty from "./EditProperty";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs } from "firebase/firestore";
import { listAll, ref, getBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from "@/firebase/config";
import { getCookies } from "@/utils/firebase";

const ManageProperties = () => {
    const [properties, setProperties] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { isOpen: isManageOpen, onOpen: onManageOpen, onOpenChange: onManageOpenChange } = useDisclosure();
    useEffect(() => {
        const getProperty = async () => {
            try {
                const docRef = collection(db, "properties");
                const { id: userID } = await getCookies()
                const q = query(docRef, where("owner", "==", userID), orderBy("dateListed", 'desc'));
                const unsubscribe = onSnapshot(q, async (querySnapshot) => {
                    setIsLoading(true);
                    setTimeout(async () => {
                        const tempData: any = [];
                        const fetchPromises = querySnapshot.docs.map(async (docz) => {
                            const storageRef = ref(storage, `properties/${docz.id}`);
                            const images = await listAll(storageRef)
                            const tempImages: any[] = []
                            const tempCoverImages = []
                            const tempCoverImage = await getDownloadURL(images.items[0])
                            tempCoverImages.push(tempCoverImage)
                            const imagesFetching = images.items.map(async imageRef => {
                                const blob = new Blob([await getBytes(imageRef)], { type: 'image/jpeg' })
                                const tempImage = new File([blob], imageRef.name, { type: "image/jpeg" })
                                tempImages.push(tempImage)
                            })
                            const listerRef = doc(db, 'users', docz.data().owner)
                            const lister = await getDoc(listerRef)
                            let listerData = {}
                            if (lister.exists()) {
                                listerData = lister.data()
                            }
                            await Promise.all(imagesFetching)
                            const collectionRef = collection(db, 'amenities')
                            const amenitiesSnapshot = await getDocs(collectionRef)
                            const allAmenities = amenitiesSnapshot.docs.map(doc => ({
                                ...doc.data(),
                                id: doc.id
                            }))
                            tempData.push({ id: docz.id, ...docz.data(), coverImage: tempCoverImages, imagesRef: images.items, images: tempImages, lister: listerData, defaultAmenities: allAmenities});
                        })
                        await Promise.all(fetchPromises)
                        await setProperties(tempData);
                        setIsLoading(false)
                    }, 2000);
                }, (error) => {
                    console.error('Error fetching data for properties:', error.message);
                });


                return () => unsubscribe();
            } catch (e: any) {
                console.error({ msg: e.message, code: e.errorCode })
            }
        };
        getProperty();
    }, []);
    return (
        <>
            <div className="flex mt-4 gap-4 items-center">
                <Button className="" color="secondary" onPress={onManageOpen} isDisabled={isLoading}>Manage</Button>
                {isLoading ?
                    <Spinner size="sm" color="warning" /> : <></>
                }
            </div>
            <Modal
                isDismissable={false}
                isKeyboardDismissDisabled={false}
                isOpen={isManageOpen}
                onOpenChange={onManageOpenChange}
                className="max-w-3xl"
                scrollBehavior="outside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Manage Your Properties</ModalHeader>
                            <ModalBody className="p-4 flex flex-col items-center min-h-[400px]">
                                {isLoading ? <div className="size-full flex flex-col justify-center h-[400px]"><Spinner size="lg" label="Loading..." color="warning" /></div>
                                    : properties.length
                                        ? properties.map((property: Object, index: number) => {
                                            return (
                                                <EditProperty key={'edit_property'+index} property={property} />
                                            )
                                        }) : <div className="h-[400px] flex flex-col gap-4 justify-center items-center">
                                            <h1 className="text-5xl opacity-40">🏢</h1>
                                            <h1 className="text-xl opacity-40">No properties that you list are found!</h1>
                                        </div>}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="secondary" variant="ghost" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default ManageProperties;