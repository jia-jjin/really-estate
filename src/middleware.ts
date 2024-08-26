import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export function middleware (request: NextRequest) {
    if(request.nextUrl.pathname ==='/login' || request.nextUrl.pathname === '/signup'){
        if(cookies().has('email')){
            return NextResponse.redirect(new URL('/' , request.url))
        }
        return NextResponse.next()
    }

    if(request.nextUrl.pathname ==='/settings'){
        if(cookies().has('email')){
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL('/' , request.url))
    }

    if(request.nextUrl.pathname ==='/sell'){
        if(cookies().has('type')){
            if(cookies().get('type')?.value == "agent"){
                return NextResponse.next()
            }
        }
        return NextResponse.redirect(new URL('/' , request.url))
    }
}

export const config = {
    matcher: ['/login' , '/signup', '/sell', '/', '/settings']
};
