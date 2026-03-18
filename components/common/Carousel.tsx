'use client';
import * as React from "react"
import { Card, CardContent } from "../ui/card"
import {
  Carousel as CarouselPrimitive,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel"

export function Carousel({items, styles}: {items: string[]; styles?:string}) {
  return (
    <CarouselPrimitive className={` w-full     ${styles}`}>
      <CarouselContent className=" w-full h-[90vh]  ">
        {items.map((item, index) => (
          <CarouselItem key={index} className="border-0">
 
              {/* <Card className="border-0 "> */}
                <CardContent className="flex w-[100vw]   items-center justify-center border-0 p-0">
                    <img src={item} alt={`Carousel item ${index + 1}`} className="h-full w-full object-cover" />
                </CardContent>
              {/* </Card> */}
            
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-0 " />
      <CarouselNext className="absolute right-0" />
    </CarouselPrimitive>
  )
}
