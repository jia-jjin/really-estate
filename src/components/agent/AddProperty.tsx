import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure, Input, Select, SelectItem, DatePicker, Textarea, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import EditProperty from "./EditProperty";
import { useEffect, useMemo, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, addDoc, getDocs } from "firebase/firestore";
import { listAll, ref, getBytes, getDownloadURL, uploadBytes } from 'firebase/storage'
import { db, storage } from "@/firebase/config";
import { getCookies } from "@/utils/firebase";
import moment from "moment";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import FileDnD from "./uploadImages";

const AddProperty = () => {

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const initialFormInfo = { size: "" as any, bathroom: "", description: "", bedroom: "", date: null as any, coverImage: [], images: [], address: "", furnished: "", name: "", price: 0, tenure: "", type: "" }
    const [formInfo, setFormInfo] = useState(initialFormInfo)
    const [imagesErrorText, setImagesErrorText] = useState('')
    const [dateErrorText, setDateErrorText] = useState('')
    const [amenities, setAmenities] = useState<any>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedAmenities, setSelectedAmenities]: Array<any> = useState([]);

    useEffect(() => {
        setFormInfo(initialFormInfo)
    }, [isOpen])

    useEffect(() => {
        getAmenities()
    }, [])

    const onChangeHandler = (e: any) => {
        setFormInfo({ ...formInfo, [e.target.name]: e.target.type == "number" ? parseInt(e.target.value) : e.target.value })
    }

    function onUploadImageHandler(e: any) {
        setFormInfo({ ...formInfo, images: e })
        setImagesErrorText('')
    }

    const onDateChangeHandler = (e: any) => {
        setFormInfo({ ...formInfo, date: moment(`${e.year}${e.month < 10 ? "0" + e.month : e.month}${e.day < 10 ? "0" + e.day : e.day}`, "YYYYMMDD") })
        setDateErrorText('')
    }

    const getAmenities = async () => {
        setIsLoading(true)
        try {
            const collectionRef = collection(db, 'amenities')
            const amenitiesSnapshot = await getDocs(collectionRef)
            const allAmenities = amenitiesSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }))
            setAmenities(allAmenities)
            setIsLoading(false)
        } catch (e) {
            console.error("Can't get all amenities")
            setAmenities([])
        }
    }

    const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!formInfo.date) {
            setDateErrorText('Please select a date!')
            return
        }
        if (!formInfo.images.length) {
            setImagesErrorText('Please upload at least an image!')
            return
        }
        const collectionRef = collection(db, 'properties');
        const { images, date, coverImage, ...propertyInfo } = formInfo
        try {
            const { id: userID } = await getCookies()
            const property = await addDoc(collectionRef, {
                ...propertyInfo,
                owner: userID,
                dateListed: moment().format(),
                builtDate: moment(date).format(),
                isBought: false,
                amenities: Array.from(selectedAmenities)
            });
            await Promise.all(
                images.map(async (image: File) => {
                    const storageRef = ref(storage, `properties/${property.id}/${image.name}`);
                    await uploadBytes(storageRef, image)
                })
            )
            toast.success("Property added successfully!")
            onClose()
        } catch (e: any) {
            Swal.fire({
                title: "Error!",
                text: `${e.message}`,
                icon: "error"
            });
        }
    }


    const formInputs = [
        {
            label: "Name",
            name: "name",
            type: 'text',
        },
        {
            label: "Address",
            name: "address",
            type: 'text',
        },
        {
            customElement:
                <Select
                    label="Type"
                    name="type"
                    className="col-span-6"
                    variant="faded"
                    onChange={onChangeHandler}
                    isRequired
                    key={'type'}
                >
                    <SelectItem key="buy" value="buy">
                        For Sale
                    </SelectItem>
                    <SelectItem key="rent" value="rent">
                        For Rental
                    </SelectItem>
                    <SelectItem key="new_launches" value="new_launches">
                        New Launches
                    </SelectItem>
                </Select>,
            label: "Type",
            type: 'text',
            placeholder: 'rent or buy',
            colSpan: "col-span-6"
        },
        {
            label: "Price",
            name: "price",
            type: 'number',
            colSpan: "col-span-6",
            startContent: <div className="pointer-events-none flex items-center">
                <span className="text-default-600 text-small">RM</span>
            </div>
        },
        {
            customElement:
                <>
                    <DatePicker key={'builtDate'} onChange={onDateChangeHandler} name="builtDate" label="Built Date" isRequired className="col-span-12" variant="faded" showMonthAndYearPickers />
                    {dateErrorText && <h1 className="text-red-600 col-span-12 text-sm">{dateErrorText}</h1>}
                </>,
            colSpan: "col-span-3",
        },
        {
            customElement:
                <Select
                    label="Tenure"
                    className="col-span-6"
                    variant="faded"
                    name="tenure"
                    onChange={onChangeHandler}
                    isRequired
                    key={'tenure'}
                >
                    <SelectItem key="freehold" value="Freehold">
                        Freehold
                    </SelectItem>
                    <SelectItem key="leasehold" value="Leasehold">
                        Leasehold
                    </SelectItem>
                </Select>,
            label: "Tenure",
            type: 'text',
        },
        {
            customElement:
                <Select
                    label="Furnished"
                    className="col-span-6"
                    variant="faded"
                    onChange={onChangeHandler}
                    name="furnished"
                    isRequired
                    key={'furnished'}
                >
                    <SelectItem key="Fully furnished" value="Fully furnished">
                        Fully Furnished
                    </SelectItem>
                    <SelectItem key="Semi-furnished" value="Semi-furnished">
                        Semi-Furnished
                    </SelectItem>
                    <SelectItem key="Not furnished" value="Not furnished">
                        Not Furnished
                    </SelectItem>
                </Select>,
            label: "Furnished",
            type: 'text',
        },
        {
            label: "Size",
            name: 'size',
            type: 'number',
            value: formInfo.size,
            endContent:
                <div className="pointer-events-none flex items-center">
                    <span className="text-default-600 text-small">sqft</span>
                </div>,
            colSpan: "col-span-6",
        },
        {
            label: "Bedroom",
            name: 'bedroom',
            type: 'number',
            colSpan: "col-span-3",
        },
        {
            label: "Bathroom",
            name: 'bathroom',
            type: 'number',
            colSpan: "col-span-3",
        },
        {
            customElement: <Select
                label="Amenities"
                selectionMode="multiple"
                placeholder="Select amenities"
                selectedKeys={selectedAmenities}
                onSelectionChange={setSelectedAmenities}
                className="col-span-12"
                variant="faded"
                name="amenities"
                isRequired
                required
                key={'amenities'}
            >
                {amenities.map((amenity: any) => (
                    <SelectItem key={amenity.name}>
                        {amenity.name}
                    </SelectItem>
                ))}
            </Select>
        },
        {
            customElement:
                <Textarea
                    isRequired
                    required
                    onChange={onChangeHandler}
                    label="Description"
                    labelPlacement="inside"
                    placeholder="Enter your description"
                    className="col-span-12"
                    variant="faded"
                    name="description"
                />
        },
        {
            customElement:
                <div className="col-span-12">
                    <FileDnD onChange={onUploadImageHandler} />
                    {imagesErrorText && <h1 className="text-red-600 col-span-12 text-sm mt-1">{imagesErrorText}</h1>}
                </div>
        }
    ]

    return (
        <>
            <div className="flex mt-4 gap-4 items-center">
                <Button className="" color="secondary" onPress={onOpen} isDisabled={isLoading}>Add +</Button>
                {isLoading ?
                    <Spinner size="sm" color="warning" /> : <></>
                }
            </div>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                className="max-w-2xl"
                scrollBehavior="outside"
                isDismissable={false}
                isKeyboardDismissDisabled={false}
            >
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={onSubmitHandler}>
                            <ModalHeader className="flex flex-col gap-1">Add a New Property</ModalHeader>
                            <ModalBody className="grid grid-cols-12">
                                {formInputs.map(formInput => {
                                    return (
                                        <>
                                            {!formInput.customElement ? <Input
                                                startContent={formInput.startContent}
                                                endContent={formInput.endContent}
                                                label={formInput.label}
                                                name={formInput.name}
                                                type={formInput.type}
                                                min={1}
                                                isRequired
                                                required
                                                value={formInput.value}
                                                placeholder={formInput.placeholder}
                                                variant="faded"
                                                labelPlacement="inside"
                                                onChange={onChangeHandler}
                                                key={formInput.name}
                                                className={`${formInput.colSpan || "col-span-12"}`}
                                            /> : formInput.customElement}
                                        </>
                                    )
                                })}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="secondary" type="submit">
                                    Add
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default AddProperty;