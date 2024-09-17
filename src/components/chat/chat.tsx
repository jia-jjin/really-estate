'use client'
import { auth, db } from "@/firebase/config"
import { error } from "console"
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore"
import { useState, useEffect } from "react"
import UserCard from "./userCard"
import { getCookies } from "@/utils/firebase"
import ChatInput from "./chatInput"
import moment from "moment"
import { usePathname } from "next/navigation"
import { Badge } from "@nextui-org/react"

export function Chat() {
    const currentPath = usePathname();
    const [selectedChat, setSelectedChat] = useState({ name: "", username: "", messages: [{ date: "", messages: [{ content: "", senderID: "", timeCreated: 0 }] }], chatId: "" })
    const [user, setUser] = useState("")
    const [chats, setChats]: Array<any> = useState([])
    const [unreadCount, setUnreadCount] = useState([])

    useEffect(() => {
        const messageRoom = document.getElementById('messageRoom')
        if (messageRoom?.children[0]) {
            messageRoom?.children[messageRoom.children.length - 1].scrollIntoView(true)
        }
    }, [selectedChat])

    const onClickChat = () => {
        const chatspace = document.getElementById('chatspace')
        chatspace?.classList.toggle('hidden')
        exitChat() 
    }

    const exitChat = () => {
        setSelectedChat({ name: "", username: "", messages: [{ date: "", messages: [{ content: "", senderID: "", timeCreated: 0 }] }], chatId: "" })
    }

    useEffect(() => {
        async function setUserID() {
            const { id: userId } = await getCookies();
            setUser(userId)
        }
        setUserID()
    }, [auth.currentUser])

    useEffect(() => {
        async function onLoad() {
            const { id: userId } = await getCookies();
            const chatsRef = collection(db, 'chats');
            const q = query(chatsRef, where("users", "array-contains", userId));

            const unsubscribe = onSnapshot(q, async (querySnapshot) => {
                const chatsTempData: any[] = [];
                const fetchPromises = querySnapshot.docs.map(async (docz) => {
                    const tempData = docz.data();
                    tempData.id = docz.id
                    const otherUserId = tempData.users.find((ref: any) => ref !== userId);

                    if (otherUserId) {
                        const otherUserRef = doc(db, 'users', otherUserId)
                        const otherUserDoc = await getDoc(otherUserRef);
                        tempData.otherUser = otherUserDoc.exists() ? { ...otherUserDoc.data(), id: otherUserDoc.id } : null;
                    } else {
                        tempData.otherUser = null;
                    }

                    return tempData;
                });

                // Wait for all fetchPromises to complete
                const results = await Promise.all(fetchPromises);
                setChats(results);
            }, (error) => {
                console.error('Error fetching data in getting chats:', error.message);
            });

            return () => unsubscribe();
        }
        onLoad()
    }, [auth.currentUser]);

    if (!user || currentPath.startsWith('/login') || currentPath.startsWith('/signup')) {
        return <></>
    }

    return (
        <div className="fixed z-50 bottom-0 xs:right-5 right-0 flex items-end flex-col">
            <Badge content={unreadCount.length} color="secondary" className={unreadCount.length? "flex" : "hidden"}>
                <div className="p-5 py-4 rounded-t-xl bg-red-400 w-min cursor-pointer" onClick={() => onClickChat()}>
                    <h1 className="font-bold text-white whitespace-nowrap">💬 CHAT</h1>
                </div>
            </Badge>
            <div id="chatspace" className="bg-slate-200 hidden md:w-[500px] xs:w-[300px] w-full" style={{ height: '400px' }}>
                <div className="h-full flex w-full">
                    {chats.length?
                        <>
                            <div className={`${selectedChat.chatId && "md:block hidden"} overflow-x-auto overflow-y-auto md:w-2/5 w-full min-w-[250px] border-r-1 border-gray-400`}>
                                {
                                    chats.map((chat: any) => {
                                        return <UserCard setUnreadCount={setUnreadCount} setSelectedChat={setSelectedChat} selectedChat={selectedChat} key={chat.id} image={chat.otherUser.image} name={chat.otherUser.name} username={chat.otherUser.username} userID={chat.otherUser.id} chatId={chat.id} />
                                    })
                                }
                            </div>
                            <div className={`${!selectedChat.chatId && "md:block hidden"} md:w-3/5 w-full`}>
                                {
                                    selectedChat.chatId ?
                                        <div className="flex flex-col justify-end h-full w-full relative">
                                            <div onClick={exitChat} className="sticky top-0 w-full left-0 p-2 bg-slate-600 hover:bg-slate-700 text-white cursor-pointer">{`< ${selectedChat.name}`}</div>
                                            <div className="flex flex-col h-full overflow-y-auto gap-1 p-2 mb-1" id="messageRoom">
                                                {
                                                    selectedChat.messages.length ? selectedChat.messages.map(messageGroup => {
                                                        return (
                                                            <>
                                                                <h1 className="text-sm text-center mb-2 mt-4" key={messageGroup?.date}>{moment(messageGroup?.date)?.format('D MMM, YYYY')}</h1>
                                                                {messageGroup?.messages?.map((message, index) =>
                                                                    <div key={messageGroup?.date + "-" + index} className={`min-w-[40%] max-w-[80%] p-2 rounded-xl ${message.senderID == user ? "place-self-end bg-blue-800" : "place-self-start bg-slate-800"}`}>
                                                                        <h1 className=" text-white ">{message.content}</h1>
                                                                        <div className="text-xs place-self-end text-end text-gray-400">{moment(message.timeCreated).format('h:mm a')}</div>
                                                                    </div>)}
                                                            </>
                                                        )
                                                    })
                                                        : <div className="h-[400px] flex flex-col gap-4 justify-center items-center">
                                                            <h1 className="text-5xl opacity-40">💬</h1>
                                                            <h1 className="text-xl opacity-40">Start saying hi!</h1>
                                                        </div>
                                                }
                                            </div>
                                            <ChatInput chatId={selectedChat.chatId} />
                                        </div> :
                                        <div className="size-full flex flex-col gap-4 justify-center items-center p-8">
                                            <h1 className="text-5xl opacity-60">💬</h1>
                                            <h1 className="text-xl opacity-60 text-center">Select a chat on the left to start chatting!</h1>
                                        </div>
                                }
                            </div>
                    </> : user?
                        <div className="size-full flex justify-center items-center"><h1 className="text-black">No chats found.</h1></div>:
                        <div className="size-full flex justify-center items-center"><h1 className="text-black">Please login first!</h1></div>
                        }
                </div>
            </div>
        </div>
    )
}