import Image from "next/image"
import { useState } from "react"
import { Carousel } from "react-responsive-carousel"

const ImagesCarousel = ({ images, isVisible, setIsVisible }: any) => {

    return (
        <>
            {
                isVisible &&
                <div className="fixed size-full top-0 left-0 z-50 bg-black/60">
                    <div className="absolute top-4 right-4 cursor-pointer z-50 bg-black/40 p-2">
                        {/* <img width={'40px'} height={'40px'} src="/cancel.svg" alt="" /> */}
                        <svg onClick={() => setIsVisible(false)} fill="#FFFFFF" className="hover:fill-slate-200 duration-200" width="40px" height="40px" viewBox="-28 0 512 512" xmlns="http://www.w3.org/2000/svg" ><title>Close image preview</title><path d="M64 388L196 256 64 124 96 92 228 224 360 92 392 124 260 256 392 388 360 420 228 288 96 420 64 388Z" /></svg>
                    </div>
                    <div className="container mx-auto flex h-full justify-center items-center">
                        <Carousel className="max-w-3xl" infiniteLoop>
                            {images.map((image: string, index: number) => {
                                return (
                                    <div key={'image' + index} className="w-full h-[500px]">
                                        <Image alt={'image'+index} width={1000} height={1000} src={image} className="object-cover size-full" />
                                        <p className="legend">Image {index + 1}</p>
                                    </div>
                                )
                            })}
                        </Carousel>
                    </div>
                </div>
            }
        </>
    )
}

export default ImagesCarousel