'use client'

import { Select, SelectItem, Button, DatePicker, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { now, getLocalTimeZone, parseDate } from "@internationalized/date";
import moment from "moment";
import FileDnD from "@/components/agent/uploadImages";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db, storage } from "@/firebase/config";
import { getBytes, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import Swal from "sweetalert2";
import { getCookies } from "@/utils/firebase";
import { toast } from "react-toastify";
import ManageProperties from "@/components/agent/ManageProperties";
import AddProperty from "@/components/agent/AddProperty";

export default function Page() {
    return (
        <div className="container mx-auto py-6 px-2">
            <h1 className="text-3xl font-bold">Manage & Sell Properties</h1>
            <div className="rounded-xl bg-slate-200 w-full min-h-20 mt-8 p-6 shadow-lg">
                <h1 className="text-2xl font-semibold">Manage all properties</h1>
                <p className="text-base">Edit or delete properties that you put on sale.</p>
                <ManageProperties/>
            </div>
            <div className="rounded-xl bg-slate-200 w-full min-h-20 mt-6 p-6 shadow-lg">
                <h1 className="text-2xl font-semibold">Add a New Property</h1>
                <p className="text-base">Put a new property on sale. Add images and details to make it look more appealing.</p>
                <AddProperty/>
            </div>
        </div>
    )
}