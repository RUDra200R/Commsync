import { Id } from "../../../../convex/_generated/dataModel";

import { useGetMember } from "../api/use-get-member";
import { useUpdateMember } from "../api/use-update-member";
import { useRemoveMember } from "../api/use-remove-member";
import { useCurrentMember } from "../api/use-current-members";



import { ChevronDownIcon } from "lucide-react";
import { XIcon, Loader, AlertTriangle, MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useConfirm } from "@/hooks/use-confirm";






interface ProfileProps{
    memberId: Id<"members">;
    onClose: () => void;
};

export const Profile =({ memberId, onClose}: ProfileProps) => {
    const Router = useRouter();

    const workspaceId = useWorkspaceId();

    const [LeaveDialog, confirmLeave] = useConfirm(
        "Leave workspace",
        "Are you sure you want to leave this workspace",
    );
    const [RemoveDialog, confirmRemove] = useConfirm(
        "Remove member",
        "Are you sure you want to remove this member",
    );

    const [UpdateDialog, confirmUpdate] = useConfirm(
        "Change role",
        "Are you sure you want to change this member's role?",
    );

    const { data: currentMember, isLoading: isLoadingCurrentMember} = useCurrentMember({
        workspaceId
    });
    const { data: member, isLoading: isLoadingMember} = useGetMember({id: memberId});

    const {mutate: updateMember, isPending: isUpdatingMember} = useUpdateMember();
    const {mutate: removeMember, isPending: isRemovingMember} = useRemoveMember();

    const onRemove = async () => {

        const ok = await confirmRemove();

        if (!ok) return;

        removeMember({id: memberId}, {
            onSuccess: () => {
                toast.success("Member removed");
                onClose();
            },
            onError: () => {
                toast.error("Failed to remove member");
            }
        })
    };

    const onLeave = async() => {
        const ok = await confirmLeave();

        if (!ok) return;

        removeMember({id: memberId}, {
            onSuccess: () => {
                Router.replace("/");
                toast.success("you left the workspace");
                onClose();
            },
            onError: () => {
                toast.error("Failed to leave the workspace");
            }
        })
    };

    const onUpdate = async( role: "admin" | "member") => {
        const ok = await confirmUpdate();

        if (!ok) return;

        updateMember({id: memberId, role}, {
            onSuccess: () => {
                toast.success("Role changed");
                onClose();
            },
            onError: () => {
                toast.error("Failed to change role");
            }
        });
    }


    if(isLoadingMember || isLoadingCurrentMember ){
        return(
            <div className="h-full flex flex-col">
                <div className=" h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Profile</p>
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
    if(!member){
        return(
            <div className="h-full flex flex-col">
                <div className=" h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Profile</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-[1.5]"/>
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <AlertTriangle className="size-5  text-muted-foreground"/>
                    <p className="text-sm text-muted-foreground">Profile Not found</p>
                </div>
            </div>
        );
    }

    const avatarfallback = member.user.name?.[0] ?? "?"
    return(
        <>
        <RemoveDialog/>
        <LeaveDialog/>
        <UpdateDialog/>
        
        <div className="h-full flex flex-col">
            <div className=" h-[49px] flex justify-between items-center px-4 border-b">
                <p className="text-lg font-bold">Profile</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                         <XIcon className="size-5 stroke-[1.5]"/>
                    </Button>
            </div>
          <div className="flex flex-col items-center justify-center p-4">
            <Avatar className="max-w-[100px] max-h-[100px] size-full ">
                <AvatarImage src={member.user.image}/>
                <AvatarFallback className="aspect-square text-6xl">
                    {avatarfallback}
                </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col p-4">
            <p className="text-xl font-bold">{member.user.name}</p>
            {/* This logic is for a admin who is looking to other admin and admin can remove it */}
            {currentMember?.role === "admin" && 
                currentMember?._id !== memberId ? (
                    <div className="flex items-center gap-2 mt-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full capitalize">
                                    {member.role} <ChevronDownIcon className="size-4 ml-2"/>
                                </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            <DropdownMenuRadioGroup
                            value={member.role}
                            onValueChange={(role) => onUpdate(role as "admin" | "member")}>
                                <DropdownMenuRadioItem value="admin">
                                    Admin
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="member">
                                    Member
                                </DropdownMenuRadioItem>

                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={onRemove} variant="outline" className="w-full" >
                            Remove
                        </Button>
                    </div>
            // This logic for a member who is looking for themselve and they can leave
                ): currentMember?._id === memberId &&
                      currentMember?.role !== "admin" ? (
                        <div className="mt-4">
                            <Button onClick={onLeave} variant="outline" className="w-full capitalize">
                                Leave
                            </Button>
                        </div>
                      ): null
            }
          </div>
          <Separator/>
          <div className="flex flex-col p-4">
            <p className="text-sm font-bold mb-4">
                Contact Information
            </p>
            <div className="flex items-center gap-2">
                <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                    <MailIcon className="size-4"/>
                </div> 
                <div className="flex flex-col">
                    <p className="text-[13px] font-semibold text-muted-foreground">Email Address</p>
                    <Link
                    href={`mailto: ${member.user.email}`}
                    className="text-sm hover:underline text-[#1264a3]"
                    >
                        {member.user.email}
                    </Link>
                </div>
            </div>

          </div>
    </div>
    </>
    );
};