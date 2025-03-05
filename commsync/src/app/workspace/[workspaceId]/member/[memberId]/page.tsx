"use client";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";

import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { AlertTriangle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Conversation } from "./conversation";


const MemberIdPage = () => {
    const memberId = useMemberId();
    const workspaceId = useWorkspaceId();

    const [conversationId, setConversationId] = useState<Id<"conversations">| null>(null);

    const { mutate, isPending} = useCreateOrGetConversation();
    useEffect(() => {
        mutate({
            workspaceId,
            memberId,
        },{
            onSuccess(data) {
                setConversationId(data)
            },
            onError(error){
                toast.error("Failed to get conversations")
            }
        })
    }, [memberId, workspaceId, mutate]);

    if(isPending){
        return(
            <div className="h-full flex-1 flex items-center justify-center">
                <Loader className="animated-spin size-6 text-muted-foreground"/>
            </div>
        )
    }

    if(!conversationId){
        return(
            <div className="h-full flex flex-col gap-y-2 items-center justify-center">
                <AlertTriangle className="size-6 text-muted-foreground"/>
                <span>
                    Conversation not found
                </span>
            </div>
        )
    }

    return <Conversation id={conversationId}/>
};

export default MemberIdPage;