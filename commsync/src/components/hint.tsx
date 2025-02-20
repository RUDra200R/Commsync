"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,

} from "@/components/ui/tooltip";
import { lazy } from "react";

interface HintProps{
    label: string;
    children: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end" ;
};

export const Hint = ({
    label,
    children,
    side,
    align,
}: HintProps) =>{
    return(
        <TooltipProvider>
            <Tooltip delayDuration={50}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent side={side} align={align} className="bg-black text-white border border-white/5">
                    <p className="text-sm">
                        {label}
                    </p>

                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

    )
}