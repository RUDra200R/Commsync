import { Doc, Id } from "../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import {format, isToday, isYesterday } from "date-fns";
import { Hint } from "./hint";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { Reactions } from "./reactions";

import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useToogleReactions } from "@/features/reactions/api/use-toogle-reaction";
import { usePanel } from "@/hooks/use-panel";
import { ThreadBar } from "./thread-bar";

const Renderer = dynamic(() => import("@/components/renderer"), {ssr: false});
const Editor = dynamic(() => import("@/components/editor"), {ssr: false})


interface MessageProps{
    id: Id<"messages">;
    memberId: Id<"members">;
    authorImage?: string;
    authorName?: string;
    isAuthor: boolean;
    reactions: Array<
    Omit<Doc<"reactions">, "memberId"> &{
        count: number;
        memberIds: Id<"members">[];
    }
    >;
    body: Doc<"messages">["body"];
    image: string | null | undefined;
    createdAt: Doc<"messages">["_creationTime"];
    updateAt: Doc<"messages">["updateAt"];
    isEditing: boolean;
    isCompact?: boolean;
    setEditingId: (id: Id<"messages"> | null) => void;
    hideThreadButton?: boolean;
    threadCount?: number;
    threadImage?: string;
    threadName?: string;
    threadTimestamp?: number;
};

const formatFullTime =(date: Date) =>{
    return `${isToday(date) ? "Today": isYesterday(date) ? "Yesterday": format(date, "MMM d, yyyy")} at ${format(date, "h: mm: ss a")}`;
};


export const Message =({
    id,
    isAuthor,
    memberId,
    authorImage,
    authorName="Member",
    reactions,
    body,
    image,
    createdAt,
    updateAt,
    isEditing,
    isCompact,
    setEditingId,
    hideThreadButton,
    threadCount,
    threadImage,
    threadName,
    threadTimestamp
}: MessageProps) => {

    const {parentMessageId, onOpenMessage, onOpenProfile, onClose} = usePanel();
    const [ConfirmDialog, confirm] = useConfirm(
        "Delete Message",
        "Are you sure you want to delete this message?"
        
    )
    const { mutate: updateMessage, isPending: isUpdatingMessage} = useUpdateMessage();

    const { mutate: removeMessage, isPending: isRemovingMessage} = useRemoveMessage();

    const { mutate: toogleReaction, isPending: isTooglingReaction} = useToogleReactions();
 

    const isPending = isUpdatingMessage || isTooglingReaction;

    const handleReaction = (value: string) => {
        toogleReaction({messageId: id, value},{
            onError: () => {
                toast.error("Failed to set reactions")
            }
        })
    }

    const handleUpdate=({body}: {body: string}) => {
        updateMessage({id, body}, {
            onSuccess: () => {
                toast.success("Message updated");
                setEditingId(null);
            },
            onError: () => {
                toast.success("Failed to update message");
            }
        });
    }

    const handleRemove= async () => {
        const ok = await confirm();

        if(!ok) return;

        removeMessage({ id }, {
            onSuccess: () => {
                toast.success("Message deleted");
                
                if(parentMessageId === id){
                    onClose();
                }
            },
            onError: () => {
                toast.success("Failed to delete message");
            }
        })
    }
    // Compact Message means two or more message together
    if(isCompact){
        return(
            <>
                <ConfirmDialog/>
                <div className={cn
                    ("flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/70 group relative",
                        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
                        isRemovingMessage && 
                        "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200 ",
                    )}>
                    <div className="flex items-start gap-2">
                        <Hint label={formatFullTime(new Date(createdAt))}>
                            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                                {format(new Date(createdAt), "hh:mm")}
                            </button>
                        </Hint>
                        {isEditing ? (
                            <div className="w-full h-full">
                                <Editor
                                onSubmit={handleUpdate}
                                disabled={isPending}
                                defaultvalue={JSON.parse(body)}
                                onCancel={() => setEditingId(null)}
                                variant="update"
                                />
                            </div>
                        ): (
                            <div className="flex flex-col w-full">
                            <Renderer value={body} />
                            <Thumbnail url={image}/>
                            {updateAt ? (
                            <span className="text-xs text-muted-foreground ">(edited)</span>
                            ): null}
                             <Reactions data={reactions} onChange={handleReaction}/>
                             <ThreadBar
                             count={threadCount}
                             image={threadImage}
                             timestamp={threadTimestamp}
                             name={threadName}
                             onClick={() => onOpenMessage(id)}/>

                        </div>
                        )}
                    
                    </div>
                    {!isEditing && (
                    <Toolbar
                    isAuthor={isAuthor}
                    isPending = {false}
                    handleEdit ={() => setEditingId(id)}
                    handleThread = {() => onOpenMessage(id)}
                    handleDelete = {handleRemove}
                    handleReaction = {handleReaction}
                    hideThreadButton={hideThreadButton}
                    />
            )}
                    
                </div>
            </>
        );

    }

    const avatarfallback = authorName.charAt(0).toUpperCase();

    return(
        <> 
            <ConfirmDialog/>
            <div className={cn
                    ("flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/70 group relative",
                        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
                        isRemovingMessage && 
                        "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200 ",
                    )}>
                <div className="flex items-start gap-2">
                    <button onClick={() => onOpenProfile(memberId)}>
                        <Avatar>
                            <AvatarImage src={authorImage} />
                            <AvatarFallback>
                                {avatarfallback}
                            </AvatarFallback>
                        </Avatar>
                    </button> 
                        {isEditing ? (
                            <div className="w-full h-full">
                                <Editor
                                onSubmit={handleUpdate}
                                disabled={isPending}
                                defaultvalue={JSON.parse(body)}
                                onCancel={() => setEditingId(null)}
                                variant="update"
                                />
                            </div>
                             ): (
                        <div className="flex flex-col w-full overflow-hidden">
                            <div className="text-sm">
                                <button onClick={() => onOpenProfile(memberId)}className="font-bold text-primary hover:underline">
                                    {authorName}
                                </button>
                                <span>&nbsp;&nbsp;</span>
                                <Hint label={formatFullTime(new Date(createdAt))}>
                                    <button className="text-xs text-muted-foreground hover:underline">
                                        {format(new Date(createdAt), "h: mm a")}
                                    </button>
                                </Hint>
                            </div>
                            <Renderer value={body} />
                            <Thumbnail url={image}/>
                            {updateAt ? (
                                <span className="text-xs text-muted-foreground ">(edited)</span>
                            ): null}
                           <Reactions data={reactions} onChange={handleReaction}/>
                           <ThreadBar
                             count={threadCount}
                             image={threadImage}
                             timestamp={threadTimestamp}
                             name={threadName}
                             onClick={() => onOpenMessage(id)}/>
                         </div>
                     )}  
                </div>
                    {!isEditing && (
                        <Toolbar
                        isAuthor={isAuthor}
                        isPending = {isPending}
                        handleEdit ={() => setEditingId(id)}
                        handleThread = {() => onOpenMessage(id)}
                        handleDelete = {handleRemove}
                        handleReaction = {handleReaction}
                        hideThreadButton={hideThreadButton}
                        />
                    )}
            </div>
        </>
    )
    
};

