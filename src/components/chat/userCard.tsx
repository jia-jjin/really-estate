'use client'
import { db } from "@/firebase/config";
import { collection, doc, limit, onSnapshot, orderBy, query, setDoc, } from "firebase/firestore";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState, useRef } from "react"
import { toast } from "react-toastify";


const UserCard = (props: any) => {
    const [messages, setMessages]: Array<any> = useState([])
    const { image, username, name, chatId, setUnreadCount, setSelectedChat, selectedChat, index, userID } = props
    const [isThisChatSelected, setIsThisChatSelected] = useState(false);
    const [unreadMessages, setUnreadMessages]: Array<any> = useState([])
    const [lastMessageRef, setLastMessageRef] = useState<any>({})
    const dataRef = useRef(isThisChatSelected); // Initialize ref with the state - chatgpt

    useEffect(() => {
        dataRef.current = isThisChatSelected; // Keep the ref updated with the latest state - chatgpt
    }, [isThisChatSelected]);

    useEffect(() => {
        setIsThisChatSelected(selectedChat.chatId === chatId)
    }, [selectedChat])

    useEffect(() => {
        if (unreadMessages.length > 0) {
            setUnreadCount((unreadChats: Array<string>) => Array.from(new Set([...unreadChats, chatId])))
        }
    }, [unreadMessages])

    useEffect(() => {
        async function onLoad() {
            const chatsRef = collection(db, 'chats', chatId, 'messages');
            const q = query(chatsRef, orderBy('timeCreated', 'asc'))
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const chatsTempData: any[] = [];
                const tempUnreadMessages: any[] = []
                querySnapshot.docs.map((docz) => {
                    const tempData = docz.data();
                    tempData.id = docz.id
                    if (!tempData.isRead && (tempData.senderID == userID)) {
                        tempUnreadMessages.push(docz.id)
                    }
                    chatsTempData.push(tempData)
                });

                if (!dataRef.current) {
                    setUnreadMessages(tempUnreadMessages)
                }

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
                setLastMessageRef(chatGroupAccordingToDateArray[chatGroupAccordingToDateArray.length - 1]?.messages[chatGroupAccordingToDateArray[chatGroupAccordingToDateArray.length - 1].messages.length - 1])

                //check if this chat is selected, then it will update the ui with the latest messages
                if (dataRef.current) {
                    setSelectedChat({ messages: chatGroupAccordingToDateArray, username, name, chatId, })
                    if (tempUnreadMessages.length) {
                        setTimeout(() => {
                            markAsRead(tempUnreadMessages)
                        }, 500);
                    }
                }
            }, (error) => {
                console.error('Error fetching data for user card:', error.message);
            });

            return () => unsubscribe();
        }

        onLoad()
    }, []);
    const onClickHandler = async () => {
        await markAsRead(unreadMessages)
        setSelectedChat({ messages, username, name, chatId, })
        setIsThisChatSelected(true)
    }

    const markAsRead = async (theRealUnreadMessages: Array<string>) => {
        console.log('ahahhaha2')
        try {
            setUnreadCount((unreadChats: Array<string>) => {
                if (unreadChats.includes(chatId)) {
                    return unreadChats.filter(unreadChat => {
                        return unreadChat != chatId
                    })
                }

                return unreadChats
            })
            await Promise.all(
                theRealUnreadMessages.map(async (messageID: string) => {
                    const messageRef = doc(db, 'chats', chatId, 'messages', messageID)
                    await setDoc(messageRef, {
                        isRead: true
                    },
                        { merge: true }
                    )
                })
            )
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    return (
        <div className={`w-full md:border-0 border-b border-gray-400 flex items-center gap-4 p-3 duration-200 transition-all cursor-pointer ${selectedChat.chatId === chatId ? "bg-red-400" : "bg-transparent hover:bg-red-300 "}`} onClick={() => onClickHandler()} >
            <Image src={image} alt={name + "_pfp"} width={40} height={40} className="rounded-full object-cover" />
            <div className="overflow-hidden w-full">
                <div className="flex justify-between items-center w-full">
                    <h1 className="font-bold truncate">{name}</h1>
                    {/* <p>{moment().format('DD/MM/YYYY')}</p> */}
                    <p className="text-sm text-nowrap">{lastMessageRef ? moment(lastMessageRef?.timeCreated).diff(new Date(), 'hours') > -24? moment(lastMessageRef?.timeCreated).format('h:mm a'): moment(lastMessageRef?.timeCreated).format('DD/MM/YYYY') : <></>}</p>
                </div>
                <div className="flex justify-between items-center w-full">
                    <p className={`text-sm truncate ${unreadMessages.length > 0 && "font-semibold"}`}>{lastMessageRef?.content}</p>
                    {unreadMessages.length > 0 && <div className="text-sm bg-secondary-500 rounded-full px-2 text-white">{unreadMessages.length}</div>}
                </div>
            </div>
        </div>
    )
}

export default UserCard;