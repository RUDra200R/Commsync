import { Id } from "../../../../convex/_generated/dataModel";
import Quill from "quill";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Message } from "@/components/message";

import { AlertTriangle, icons, XIcon } from "lucide-react";
import { Loader } from "lucide-react";
import { useState } from "react";

import { useGetMessage } from "../api/use-get-message";
import { useCurrentMember } from "@/features/members/api/use-current-members";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCreateMessage } from "../api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelId } from "@/hooks/use-channel-id";
import { useGetMessages } from "../api/use-get-messages";
import { format, isToday, isYesterday, differenceInMinutes } from "date-fns";

const TIME_THRESHOLD = 5;

const Editor = dynamic(() => import("@/components/editor"), {ssr: false});

interface ThreadProps{
    messageId: Id<"messages">;
    onClose: () => void;
};

type createMessageValue ={
    channelId: Id<"channels">;
    workspaceId: Id<"workspaces">;
    parentMessageId: Id<"messages">;
    body: string;
    image?: Id<"_storage"> | undefined;
}
const formatDateLabel = (dateStr: string) =>{
    const date = new Date(dateStr);
    if (isToday(date)) {
        return "Today";
    }
    if (isYesterday(date)) {
        return "Yesterday";
    }

    return format(date, "EEEE, MMMM d");
} 


export const Thread = ({messageId, onClose}: ThreadProps) => {

    const channelId = useChannelId();
    const workspaceId = useWorkspaceId();

    const [editingId, setEditingId] = useState<Id<"messages">| null>(null);
    const [editorKey, setEditorKey] = useState(0);
    const [isPending , setIsPending] = useState(false);

    const editorRef = useRef<Quill| null>(null);

    const { mutate: generateUploadUrl} = useGenerateUploadUrl();
    const {mutate: createMessage} = useCreateMessage();

    const {data: currentMember} = useCurrentMember({workspaceId});
    const {data: message, isLoading: loadingMessage} = useGetMessage({id: messageId});
    const {results, status, loadMore} = useGetMessages({
        channelId,
        parentMessageId: messageId,
    });

    const canLoadMore = status === "CanLoadMore";
    const isLoadingMore = status === "LoadingMore";


    const handleSubmit = async ({
        body,
        image,
    }: {
        body: string;
        image: File| null;
    }) =>{
        try{
            setIsPending(true);

            editorRef?.current?.enable(false);

            const values: createMessageValue = {
                channelId,
                workspaceId,
                parentMessageId: messageId,
                body,
                image: undefined,
            }

            if(image){
                const url = await generateUploadUrl({}, {throwError: true});

                if(!url){
                    throw new Error("Url not found");
                }
                
                const result = await fetch(url,{
                    method: "POST",
                    headers: { "Content-Type": image.type },
                    body: image,
                });

                if(!result.ok){
                    throw new Error("Failed to upload image");
                }

                const { storageId } = await result.json();

                values.image = storageId;
            }
            await createMessage( values, {throwError: true});

            setEditorKey((prevkey) => prevkey + 1);
        } catch(error){
                toast.error("Failed to send message");
               
        } finally{
            editorRef?.current?.enable(true);
            setIsPending(false);
        }
       
    };

    const groupMessages = results?.reduce(
            (groups, message) => {
                const date = new Date(message._creationTime);
                const dateKey = format(date, "yyyy-MM-dd");
    
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].unshift(message);
    
                return groups;
            },
            {} as Record<string, typeof results>
        );

    if(loadingMessage || status ==="LoadingFirstPage" ){
        return(
            <div className="h-full flex flex-col">
                <div className=" h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-[1.5]"/>
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <Loader className="size-5 animate-spin text-muted-foreground"/>
                    <p className="text-sm text-muted-foreground">Message Not found</p>
                </div>
            </div>
        );
        
    }
    if(!message){
        return(
            <div className="h-full flex flex-col">
                <div className=" h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-[1.5]"/>
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <AlertTriangle className="size-5  text-muted-foreground"/>
                    <p className="text-sm text-muted-foreground">Message Not found</p>
                </div>
            </div>
        );
    }

    return(
        <div className="h-full flex flex-col">
            <div className=" h-[49px] flex justify-between items-center px-4 border-b">
                <p className="text-lg font-bold">Thread</p>
                <Button onClick={onClose} size="iconSm" variant="ghost">
                    <XIcon className="size-5 stroke-[1.5]"/>
                </Button>
            </div>
            <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
                {Object.entries(groupMessages || {}).map(([datekey, messages]) => (
                                <div key={datekey}>
                                    <div className="text-center my-2 relative">
                                        <hr  className="absolute top-1/2 left-0 right-0 border-gray-300"/>
                                        <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                                            {formatDateLabel(datekey)}
                                        </span>
                                    </div>
                                    {messages.map((message, index) =>{
                                        const prevMessage = messages[index-1];
                                        const isCompact =
                                            prevMessage && 
                                            prevMessage.user ?._id === message.user?._id &&
                                            differenceInMinutes(
                                                new Date(message._creationTime),
                                                new Date(prevMessage._creationTime)
                                            ) < TIME_THRESHOLD;
                
                                        return (
                                            <Message
                                            key={message._id}
                                            id={message._id}
                                            memberId={message.memberId}
                                            authorImage={message.user.image}
                                            authorName={message.user.name}
                                            isAuthor={message.memberId === currentMember?._id}
                                            reactions={message.reactions}
                                            body={message.body}
                                            image={message.image}
                                            updateAt={message.updateAt}
                                            createdAt={message._creationTime}
                                            isEditing={editingId === message._id}
                                            setEditingId={setEditingId}
                                            isCompact={isCompact}
                                            hideThreadButton
                                            threadCount={message.threadCount}
                                            threadImage={message.threadImage}
                                            threadTimestamp={message.threadTimestamp}
                                            />
                                        )
                                    })}
                                </div>
                            ))} 
                 <div 
             className="h-1"
                ref={(el) => {
                if (el) {
                    const observer = new IntersectionObserver(
                        ([entry]) => {
                            if (entry.isIntersecting && canLoadMore) {
                                loadMore();
                            }
                        },
                        {threshold: 1.0}
                    );
                    observer.observe(el);
                    return () => observer.disconnect();
                }
            }}
            />
            {isLoadingMore && (
                    <div className="text-center my-2 relative">
                    <hr  className="absolute top-1/2 left-0 right-0 border-gray-300"/>
                    <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                        <Loader className="size-4 animate-spin"></Loader>
                    </span>
                </div>
                )}
           
                <Message
                hideThreadButton
                memberId={message.memberId}
                authorImage={message.user.image}
                authorName={message.user.name}
                isAuthor={message.memberId === currentMember?._id}
                body={message.body}
                image={message.image}
                createdAt={message._creationTime}
                updateAt={message.updateAt}
                id={message._id}
                reactions={message.reactions}
                isEditing={editingId === message._id}
                setEditingId={setEditingId}
                />
            </div>
            <div className="px-4 ">
                <Editor
                key={editorKey}
                onSubmit={handleSubmit}
                innerRef={editorRef}
                disabled={isPending}
                placeholder="Reply.."/>
            </div>
        </div>
    )
}