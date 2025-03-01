import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import WorkspaceIdPage from "@/app/workspace/[workspaceId]/page";

interface UseGetMembersProps{
    workspaceId: Id<"workspaces">;
}

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) =>{
    const data = useQuery(api.members.get, {workspaceId});
    const isLoading = data === undefined;

    return {data, isLoading};

};