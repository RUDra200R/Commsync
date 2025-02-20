"use client";

import { Provider } from "jotai";
import { Chilanka } from "next/font/google";
import React from "react";

interface JotaiProviderProps{
    children: React.ReactNode;
}

export const JotaiProvider= ({children}: JotaiProviderProps) =>{
    return(
        <Provider>
            {children}
        </Provider>
    )
}