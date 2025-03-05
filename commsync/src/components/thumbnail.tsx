/* eslint-disable @next/next/no-img-element */

import { VisuallyHidden } from '@reach/visually-hidden';

import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
 } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";

interface ThumbnailProps {
    url: string | null | undefined;
};

export const Thumbnail = ({url}: ThumbnailProps) => {
    if(!url) return null;

    return (
        <Dialog>
        <DialogTrigger>
            <div className="relative overflow-hidden max-w-[180px] border rounded-lg my-2 cursor-zoom-in">
                <img src={url} alt="Message image"  className="rounded-md object-cover size-full"/>
            </div>
        </DialogTrigger>
        <DialogContent className="max-w-[600px] border-none bg-transparent p-0 shadow-none">
            <VisuallyHidden>
                <DialogTitle>Image Preview</DialogTitle>
            </VisuallyHidden>
            <img src={url} alt="Message image"  className="rounded-md object-cover size-full"/>
        </DialogContent>
    </Dialog>
       
    );
};