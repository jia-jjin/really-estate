'use client'

import { redirectToHome, setCookies } from '../../../utils/firebase'
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import Swal from 'sweetalert2'
import { useState, FormEvent } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@nextui-org/react'
import { provider, auth, db } from '@/firebase/config'
import { cookies } from 'next/headers'
import Image from 'next/image'
import { doc, setDoc } from 'firebase/firestore'

export default function Login() {
    const [signInDetails, setSignInDetails] = useState({ email: "", password: "" })
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSignInDetails({ ...signInDetails, [e.target.name]: e.target.value })
    }
    async function onSubmitHandler(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        // console.log('sign in handler activate')
        let res: any = await signIn(signInDetails.email, signInDetails.password)
        Swal.fire({
            title: res.status >= 400 ? "Error" : "Success",
            text: res.msg,
            icon: res.status >= 400 ? "error" : "success"
        })
            .then(() => {
                if (res.status < 400) {
                    // console.log('sign in successful')
                    redirectToHome()
                }
            });
    }
    async function signIn(email: any, password: any) {
        try {
            await signInWithEmailAndPassword(auth, email, password)
            await setCookies(email)
            return { status: 200, msg: "Login successful." };
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            return { status: 400, msg: errorMessage };
        }
    }
    
    async function onGoogleSignIn(e: any) {
        try {
            await signInWithPopup(auth, provider)
            const uid = auth.currentUser?.uid || "test"
            const email = auth.currentUser?.email || 'test@gmail.com'
            const name = auth.currentUser?.displayName || 'tester'
            const image = auth.currentUser?.photoURL || 'https://images.macrumors.com/t/n4CqVR2eujJL-GkUPhv1oao_PmI=/1600x/article-new/2019/04/guest-user-250x250.jpg'
            const userRef = doc(db, 'users', uid);
            const username = name.split(' ').join('') + Math.floor((Math.random() * 10000))
            await setDoc(userRef, {
                username: username,
                name: name,
                email: email,
                image: image,
                type: "user",
                phone_number: ""
            });
            await setCookies(email, name, image, uid)
            redirectToHome()
        } catch (e: any) {
            console.log({ error: e.error, msg: e.message })
        }
    }

    return (
        <div className=" flex flex-col justify-center items-center bg-white p-2 py-6 pb-12">
            <Link scroll={true} href="/" >
                <Image src="/reallyestate-logo.png" height={300} width={300} className="mx-auto" alt="app-logo" />
            </Link>
            <div className="border border-black w-full sm:max-w-md mt-6 p-8 bg-gray-200 shadow-md sm:rounded-lg text-black ">
                <div className="w-full flex justify-center"><h1 className='text-5xl font-semibold mb-6 mx-auto'>Sign In</h1></div>
                <form onSubmit={onSubmitHandler}>
                    <label>Email</label>
                    <input onChange={onChangeHandler} type="email" name="email" className="mt-1 mb-3 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1" />
                    <label>Password</label>
                    <input onChange={onChangeHandler} type="password" name="password" className="mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1" />
                    <Button type='submit' variant='solid' color='primary' className='w-full mt-4'>Login</Button>
                </form>
                <div className="w-full relative flex py-4 items-center">
                    <div className="flex-grow border-t border-gray-400"></div>
                    <span className="flex-shrink mx-4">or</span>
                    <div className="flex-grow border-t border-gray-400"></div>
                </div>
                <div className='flex flex-row justify-center'><Button variant='faded' className='w-full' onClick={onGoogleSignIn}><Image alt='google-logo' src='/google.svg' width={20} height={20} />Sign in with Google</Button></div>
                <div className="mt-4 mx-auto flex justify-center"><a className="underline text-blue-800" href="/signup">{"Haven't registered?"}</a></div>
            </div>
        </div>
    )
}