'use client'

import { redirectToHome, setCookies } from "@/utils/firebase"
import { signInWithPopup, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { collection, addDoc } from "firebase/firestore"
import { useState } from "react"
import Swal from "sweetalert2"
import { FormEvent } from "react"
import { Button } from "@nextui-org/react"
import Link from "next/link"
import { auth, provider, db } from "@/firebase/config"

export default function SignUp() {
    const [signUpDetails, setSignUpDetails] = useState({ image: 'https://images.macrumors.com/t/n4CqVR2eujJL-GkUPhv1oao_PmI=/1600x/article-new/2019/04/guest-user-250x250.jpg' })
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSignUpDetails({ ...signUpDetails, [e.target.name]: e.target.value })
    }
    async function userSignUp(info: any) {
        // console.log('signing up user');
        const { name, username, email, password, image } = info;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const collectionRef = collection(db, 'users');
            await addDoc(collectionRef, {
                username: username,
                name: name,
                email: email,
                image: image
            });
            return { status: 200, msg: "Sign up successful.", email: email };
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            return { status: 400, msg: errorMessage };
        }
    }
    async function onSignUpHandler(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        // console.log('sign up handler activate')
        try {
            let res: any = await userSignUp(signUpDetails)
            Swal.fire({
                title: res.status >= 400 ? "Error" : "Success",
                text: res.msg,
                icon: res.status >= 400 ? "error" : "success"
            })
                .then(async () => {
                    if (res.status < 400) {
                        // console.log('registered user')
                        await setCookies(res.email)
                        redirectToHome()
                    }
                });
        } catch (e: any) {
            console.error({ error: e.error, msg: e.message })
        }
    
    }

    async function onGoogleSignIn(e: any) {
        try {
            await signInWithPopup(auth, provider)
            const email = auth.currentUser?.email || 'test@gmail.com'
            const name = auth.currentUser?.displayName || 'tester'
            const image = auth.currentUser?.photoURL || 'https://images.macrumors.com/t/n4CqVR2eujJL-GkUPhv1oao_PmI=/1600x/article-new/2019/04/guest-user-250x250.jpg'
            await setCookies(email, name, image)
            redirectToHome()
        } catch (e: any) {
            console.log({ error: e.error, msg: e.message })
        }
    }

    return (
        <div className=" flex flex-col justify-center items-center bg-white p-2 py-6">
            <Link scroll={true} href="/" className="">
                <img src="/reallyestate-logo.png" width={300} className="mx-auto" />
            </Link>
            <div className="border border-black w-full sm:max-w-md mt-6 p-8 bg-gray-200 shadow-md sm:rounded-lg text-black ">
                <div className="w-full flex justify-center"><h1 className='text-5xl font-semibold mb-6 mx-auto'>Sign Up</h1></div>
                <form method="POST" onSubmit={onSignUpHandler}>
                    <label>Name</label>
                    <input onChange={onChangeHandler} type="text" name="name" className="mt-1 mb-3 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1" />
                    <label>Username</label>
                    <input onChange={onChangeHandler} type="text" name="username" className="mt-1 mb-3 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1" />
                    <label>Email</label>
                    <input onChange={onChangeHandler} type="email" name="email" className="mt-1 mb-3 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1" />
                    <label>Password</label>
                    <input onChange={onChangeHandler} type="password" name="password" className="mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1" />
                    <Button type='submit' variant='solid' color='primary' className='w-full mt-4'>Sign Up</Button>
                </form>
                <div className="w-full relative flex py-4 items-center">
                    <div className="flex-grow border-t border-gray-400"></div>
                    <span className="flex-shrink mx-4">or</span>
                    <div className="flex-grow border-t border-gray-400"></div>
                </div>
                <div className='flex flex-row justify-center'><Button variant='faded' className='w-full' onClick={onGoogleSignIn}><img alt='google-logo' src='./google.svg' />Sign up with Google</Button></div>
                <div className="mt-4 mx-auto flex justify-center"><a className="underline text-blue-800" href="/login">Already have an account?</a></div>
            </div>
        </div>
    )
}