'use server'

import { redirect } from "next/navigation"
import { auth, provider, db } from '@/firebase/config'
import { collection, addDoc, doc, query, where, getDocs, getDoc } from "firebase/firestore"

import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithRedirect, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"


// export const userSignUp = async (info) => {
//     console.log('signing up user');
//     const { name, username, email, password } = info;
//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         const collectionRef = collection(db, 'users');
//         await addDoc(collectionRef, {
//             username: username,
//             name: name,
//             email: email,
//         });
//         return { status: 200, msg: "Sign up successful." };
//     } catch (error) {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         return { status: 400, msg: errorMessage };
//     }
// };



export const checkUserLogin = async (email, name, image, uid) => {
    // console.log('checking if there exists a user session')
    // const user = auth.currentUser;
    // if (user) {
    const collectionRef = collection(db, 'users')
    const q = query(collectionRef, where('email', '==', email))
    const userList = await getDocs(q)
    const userInfo = userList.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))[0]
    return userInfo

    // } else {
    //     console.log('no user logged in')
    //     return null
    // }



}

export const setCookies = async (emailz = '', namez = '', imagez = '', username = '', uid = '') => {
    try {
        const { id, name, username, email, image, type, phone_number } = await checkUserLogin(emailz, namez, imagez, uid)
        cookies().set('email', email)
        cookies().set('username', username)
        cookies().set('name', name)
        cookies().set('id', id)
        cookies().set('image', image)
        cookies().set('type', type)
        cookies().set('phone_number', phone_number)
        return
    } catch (e) {
        return { msg: e.message, error: e.errorCode }
    }
}

export const getCookies = () => {
    const email = cookies().get('email') ? cookies().get('email').value : ''
    const id = cookies().get('id') ? cookies().get('id').value : ''
    const name = cookies().get('name') ? cookies().get('name').value : ''
    const username = cookies().get('username') ? cookies().get('username').value : ''
    const image = cookies().get('image') ? cookies().get('image').value : ''
    const type = cookies().get('type') ? cookies().get('type').value : ''
    const phone_number = cookies().get('phone_number') ? cookies().get('phone_number').value : ''
    return { email, name, username, id, image, type, phone_number }
}

export const removeCookies = () => {
    cookies().delete('email')
    cookies().delete('username')
    cookies().delete('name')
    cookies().delete('id')
    cookies().delete('image')
    cookies().delete('type')
    cookies().delete('phone_number')
    return
}

export const refreshLayout = (path) => {
    revalidatePath(path)
}

export const redirectToHome = () => {
    redirect('/')
}