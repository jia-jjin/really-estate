'use client'
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FormEvent } from "react";
import { db } from "@/firebase/config";
import { getCookies } from "@/utils/firebase";
import { Button } from "@nextui-org/react";
import moment from "moment";

const ChatInput = (props: any) => {
    const { chatId } = props
    const [messageContent, setMessageContent] = useState("")
    const onChangeHandler = (e: any) => {
        setMessageContent(e.target.value)
    }
    const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const { id: userId } = await getCookies()
        try {
            const message = messageContent
            setMessageContent('')
            if (message.trim()) {
                const collectionRef = collection(db, 'chats', chatId, 'messages')
                console.log('submitted message')
                await addDoc(collectionRef, {
                    content: message.trim(),
                    senderID: userId,
                    timeCreated: moment().format(),
                    isRead: false
                })
            }
            return
        } catch (e: any) {
            console.error({ msg: e.message, errorCode: e.errorCode })
        }
    }
    return (
        <form action="" onSubmit={onSubmitHandler} className="flex gap-1 m-2">
            <input value={messageContent} placeholder="Send a message..." onChange={onChangeHandler} type="text" name="message" className="w-full p-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"></input>
            <input type="submit" hidden />
            <Button type="submit" color="secondary" isIconOnly>💬</Button>
        </form>
    )
}

export default ChatInput;