import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import WorkspaceIdPage from "@/app/workspace/[workspaceId]/page";

interface UsecurrentMemberProps{
    workspaceId: Id<"workspaces">;
}

export const useCurrentMember = ({ workspaceId }: UsecurrentMemberProps) =>{
    const data = useQuery(api.members.current, {workspaceId});
    const isLoading = data === undefined;

    return {data, isLoading};

};