"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/user-current-user";
import { Loader, LogOut} from "lucide-react";
import { useRouter } from "next/navigation"; 
import { useAuthActions } from "@convex-dev/auth/react";

export const UserButton = () =>{
    const authActions = useAuthActions();
    const {data, isLoading } = useCurrentUser();
    const router = useRouter(); // Assuming you're using Next.js for routing

    const handleSignOut = async () => {
        try {
            await authActions.signOut();
            console.log("Signed out successfully");
            router.push("/auth"); // Redirect to the correct auth page
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };
    if (isLoading){
        return <Loader className="size-4 animate-spin text-muted-foreground"/>
    }

    if (!data)
    {
        return null;
    }

    const {image, name} = data;
    const avatarFallback = name!.charAt(0).toUpperCase()

    return(
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none">
                <Avatar className=" rounded-md size-10 hover: opacity-75 transition">
                    <AvatarImage className="rounded-md" alt={name} src={image}/>
                    <AvatarFallback className="rouned-md bg-sky-500 text-white">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align= "center" side="right" className="w-60">
                <DropdownMenuItem onClick={handleSignOut } className="h-10">
                        <LogOut className="size-4 mr-2"/>
                        LogOut
                </DropdownMenuItem>

            </DropdownMenuContent>

        </DropdownMenu>
    );
};