'use client'
import { db } from "@/firebase/config";
import { collection, limit, onSnapshot, orderBy, query, } from "firebase/firestore";
import { useEffect, useState, useRef } from "react"


const UserCard = (props: any) => {
    const [messages, setMessages]: Array<any> = useState([])
    const { image, username, name, chatId, setSelectedChat, selectedChat, index } = props
    const [isThisChatSelected, setIsThisChatSelected] = useState(false);
    const dataRef = useRef(isThisChatSelected); // Initialize ref with the state - chatgpt

    useEffect(() => {
        dataRef.current = isThisChatSelected; // Keep the ref updated with the latest state - chatgpt
    }, [isThisChatSelected]);

    useEffect(() => {
        setIsThisChatSelected(selectedChat.chatId === chatId)
    }, [selectedChat])

    useEffect(() => {
        async function onLoad() {
            const chatsRef = collection(db, 'chats', chatId, 'messages');
            const q = query(chatsRef, orderBy('timeCreated', 'asc'))
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const chatsTempData: any[] = [];
                querySnapshot.docs.map((docz) => {
                    const tempData = docz.data();
                    tempData.id = docz.id
                    chatsTempData.push(tempData)
                });

                const chatGroupAccordingToDate = chatsTempData.reduce((groups, message) => {
                    const date = message.timeCreated.split('T')[0];
                    if (!groups[date]) {
                        groups[date] = [];
                    }
                    groups[date].push(message);
                    return groups;
                }, {});

                const chatGroupAccordingToDateArray = Object.keys(chatGroupAccordingToDate).map((date) => {
                    return {
                        date,
                        messages: chatGroupAccordingToDate[date]
                    };
                });
                setMessages(chatGroupAccordingToDateArray);
                //check if this chat is selected, then it will update the ui with the latest messages
                if (dataRef.current) {
                    setSelectedChat({ messages: chatGroupAccordingToDateArray, username, name, chatId })
                }
            }, (error) => {
                console.error('Error fetching data:', error.message);
            });

            return () => unsubscribe();
        }

        onLoad()
    }, []);
    const onClickHandler = () => {
        setSelectedChat({ messages: messages, username: username, name: name, chatId: chatId })
        setIsThisChatSelected(true)
    }
    return (
        <div className={`w-full md:border-0 border-b border-gray-400 flex items-center gap-4 p-3 duration-200 transition-all cursor-pointer ${selectedChat.chatId === chatId ? "bg-red-400" : "bg-transparent hover:bg-red-300 "}`} onClick={() => onClickHandler()} >
            <img src={image} alt={name + "_pfp"} width={'50px'} className="rounded-full object-cover" />
            <div className="overflow-hidden">
                <h1 className="font-bold text-lg">{name}</h1>
                <p className="text-sm truncate">{messages[messages.length-1]?.messages[messages[messages.length-1].messages.length - 1]?.content}</p>
            </div>
        </div>
    )
}

export default UserCard;