import { Badge, Button, DatePicker, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea, useDisclosure } from "@nextui-org/react";
import { now, getLocalTimeZone, parseDate } from "@internationalized/date";
import FileDnD from "./uploadImages";
import { useEffect, useState } from "react";
import moment from "moment";
import Swal from "sweetalert2";
import { deleteObject, ref, uploadBytes } from "firebase/storage";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/config";
import { toast } from "react-toastify";
import Image from "next/image";

const EditProperty = (props: any) => {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    // const [saved, setSaved] = useState(false)
    const { defaultAmenities, amenities, isBought, address, bathroom, bedroom, builtDate, description, furnished, id, coverImage, imagesRef, images, name, price, size, tenure, type, owner, dateListed } = props.property
    let initialFormInfo = { isBought: isBought.toString(), size: size, bathroom: bathroom, description: description, bedroom: bedroom, date: builtDate, images: images, address: address, furnished: furnished, name: name, price: price, tenure: tenure, type: type }
    const [formInfo, setFormInfo] = useState(initialFormInfo)
    // const [date, setDate] = useState<any>({ year: moment(builtDate).format('YYYY'), month: moment(builtDate).format('MM'), day: moment(builtDate).format('DD') })
    const [imagesErrorText, setImagesErrorText] = useState('')
    const [dateErrorText, setDateErrorText] = useState('')
    const [selectedAmenities, setSelectedAmenities]: Array<any> = useState(amenities);

    useEffect(() => {
        initialFormInfo = { isBought: isBought.toString(), size: size, bathroom: bathroom, description: description, bedroom: bedroom, date: builtDate, images: images, address: address, furnished: furnished, name: name, price: price, tenure: tenure, type: type }
        setTimeout(() => {
            setFormInfo(initialFormInfo)
        }, 50);
    }, [isOpen])

    // useEffect(() => {
    //     initialFormInfo = { size: size, bathroom: bathroom, bedroom: bedroom, date: builtDate, images: images, address: address, furnished: furnished, name: name, price: price, tenure: tenure, type: type }
    //     setFormInfo(initialFormInfo)
    //     console.log('hello')
    // }, [saved])

    // useEffect(() => {
    //     setFormInfo({ ...formInfo, date: moment(`${date.year}${date.month.length < 2 ? "0" + date.month : date.month}${date.day.length < 2 ? "0" + date.day : date.day}`, "YYYYMMDD") })
    // }, [date])

    const onChangeHandler = (e: any) => {
        setFormInfo({ ...formInfo, [e.target.name]: e.target.type == "number" ? parseInt(e.target.value) : e.target.value })
    }

    const onDateChangeHandler = (e: any) => {
        setFormInfo({ ...formInfo, date: moment(`${e.year}${e.month < 10 ? "0" + e.month : e.month}${e.day < 10 ? "0" + e.day : e.day}`, "YYYYMMDD") })
        setDateErrorText('')
    }

    const onDeleteHandler = async (e: any) => {
        e.preventDefault()
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        })
        if (!result.isConfirmed) return
        try {
            const deleteImagesPromise = imagesRef.map(async (imageRef: any) => {
                await deleteObject(imageRef)
            })
            await Promise.all(deleteImagesPromise)
            await deleteDoc(doc(db, "properties", id));
            onClose()
            toast.success("Deleted property!");
        } catch (error: any) {
            Swal.fire({
                title: "Error!",
                text: `${error.message}`,
                icon: "error"
            });
        }
    }

    const onEditHandler = async (e: any) => {
        e.preventDefault()
        const { images, date, isBought, ...propertyInfo } = formInfo
        if (!images.length) {
            setImagesErrorText('Please upload at least an image!')
            return
        }
        try {
            const docRef = doc(db, 'properties', id);
            await setDoc(docRef, {
                ...propertyInfo,
                builtDate: moment(date).format(),
                isBought: isBought === "true",
                owner,
                dateListed: props.property.dateListed,
                images: images.map((image: File) => image.name),
                amenities: Array.from(selectedAmenities)
            });
            // await Promise.all(
            //     images.map(async (image: File) => {
            //         const storageRef = ref(storage, `properties/${id}/${image.name}`);
            //         if (!imagesRef.includes(storageRef)) {
            //             await deleteObject(storageRef)
            //         }
            //     })
            // )
            let initialImagesNames = imagesRef.map((ref: any) => ref.name)
            await Promise.all(
                images.map(async (image: File) => {
                    if (!initialImagesNames.includes(image.name) || initialImagesNames.includes(image.name)) {
                        const storageRef = ref(storage, `properties/${id}/${image.name}`);
                        await uploadBytes(storageRef, image)
                        const index = initialImagesNames.indexOf(initialImagesNames.find((name: String)=> name == image.name))
                        if (index > -1) { // only splice array when item is found
                            initialImagesNames.splice(index, 1); // 2nd parameter means remove one item only
                        }
                    }
                })
            )
            await Promise.all(
                initialImagesNames.map(async (name: String) => {
                    const storageRef = ref(storage, `properties/${id}/${name}`);
                        await deleteObject(storageRef)
                })
            )
            toast.success("Edited property successfully!");
            onClose()
        } catch (error: any) {
            Swal.fire({
                title: "Error!",
                text: `${error.message}`,
                icon: "error"
            });
        }
    }

    function onUploadImageHandler(e: any) {
        setFormInfo({ ...formInfo, images: e })
        setImagesErrorText('')
    }

    const formInputs = [
        {
            label: "Name",
            name: "name",
            type: 'text',
            value: formInfo.name,
        },
        {
            label: "Address",
            name: "address",
            type: 'text',
            value: formInfo.address
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
                    value={formInfo.type}
                    defaultSelectedKeys={[formInfo.type]}
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
            value: formInfo.price,
            colSpan: "col-span-6",
            startContent: <div className="pointer-events-none flex items-center">
                <span className="text-default-600 text-small">RM</span>
            </div>
        },
        {
            customElement:
                <>
                    <DatePicker key={'builtDate'} value={parseDate(moment(formInfo.date).format('YYYY-MM-DD'))} onChange={onDateChangeHandler} name="builtDate" label="Built Date" isRequired className="col-span-12" variant="faded" showMonthAndYearPickers />
                    {dateErrorText && <h1 className="text-red-600 col-span-12 text-sm">{dateErrorText}</h1>}
                </>,
        },
        {
            customElement:
                <Select
                    label="Bought"
                    className="col-span-12"
                    variant="faded"
                    name="isBought"
                    onChange={onChangeHandler}
                    isRequired
                    defaultSelectedKeys={[formInfo.isBought]}
                    key={'isBought'}
                >
                    <SelectItem key="true" value="Bought">
                        Bought
                    </SelectItem>
                    <SelectItem key="false" value="Not Bought">
                        Not Bought
                    </SelectItem>
                </Select>,
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
                    defaultSelectedKeys={[formInfo.tenure]}
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
                    defaultSelectedKeys={[formInfo.furnished]}
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
            value: formInfo.bedroom,
        },
        {
            label: "Bathroom",
            name: 'bathroom',
            type: 'number',
            colSpan: "col-span-3",
            value: formInfo.bathroom,
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
                key={'amenities'}
            >
                {defaultAmenities.map((amenity: any) => (
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
                    value={formInfo.description}
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
                    <FileDnD onChange={onUploadImageHandler} initialImages={images} />
                    <h1 className="text-red-600 col-span-12 text-sm mt-1">{imagesErrorText}</h1>
                </div>
        }
    ]
    return (
        <>
            <div onClick={onOpen} className="w-full flex xs:flex-row gap-4 flex-col rounded-xl cursor-pointer mt-2 bg-slate-300 min-h-[200px] p-4 duration-200 hover:bg-slate-200 shadow-xl">
                <div className="xs:w-[200px] w-full h-[200px] rounded-xl">
                    <Image height={1000} width={1000} src={coverImage[0]} alt="property_image" className="rounded-xl object-cover h-full w-full" />
                </div>
                <div className="flex items-center">
                    <div>
                        <h4 className="font-bold text-xl">{name}</h4>
                        <small className="text-default-500">{address}</small>
                        <h6 className="uppercase font-bold text-medium">RM {price}</h6>
                        <div className="p-2 bg-blue-800 w-fit rounded-2xl mt-4"><h2 className="m-0 text-white font-bold text-sm">{type == 'buy' ? "For Sale" : type == 'rent' ? "For Rental" : "Newly Launching"}</h2></div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="max-w-2xl" scrollBehavior="outside" backdrop="blur" isDismissable={false}
                isKeyboardDismissDisabled={false}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{name}</ModalHeader>
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
                            <ModalFooter className="flex justify-between">
                                <Button color="secondary" variant="bordered" onPress={onClose}>
                                    Close
                                </Button>
                                <div className="flex gap-2">
                                    <Button color="danger" onClick={onDeleteHandler}>
                                        Delete
                                    </Button>
                                    <Button color="secondary" onClick={onEditHandler}>
                                        Save
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default EditProperty;