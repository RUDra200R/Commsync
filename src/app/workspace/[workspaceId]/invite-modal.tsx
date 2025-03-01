import { Dialog,
        DialogClose,
        DialogContent,
        DialogDescription,
        DialogTitle,
        DialogHeader,
 } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code";
import { useConfirm } from "@/hooks/use-confirm";
interface InviteModalProps{
    open: boolean;
    setOpen: (open: boolean) => void;
    name: string;
    joincode: string;
}


export const InviteModal = ({open, setOpen, name, joincode
}: InviteModalProps) => {

    const workspaceId = useWorkspaceId();

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "This Will deactivate the current invite link and generate a new one."
    )

    const {mutate, isPending} = useNewJoinCode();

    const handleNewCode = async () =>{
        const ok = await confirm();

        if(!ok) return;

        mutate({workspaceId},  {
            onSuccess: () => {
                toast.success("Invite code regenerated");
            },
            onError: (error) => {
                toast.error("Failed to regenerate invite code");
            }
        })
    }

    const handleCopy = () =>{
        const invitelink = `${window.location.origin}/join/${workspaceId}`;

        navigator.clipboard
            .writeText(invitelink)
            .then(() => toast.success("Invite link copied to clipboard"));
    }

    return(
        <>
           <ConfirmDialog />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite people to {name}</DialogTitle>
                        <DialogDescription>
                            Use the code below to invite people to your workspace
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-y-4 items-center justify-center py-10">
                        <p className="text-4xl font-bold tracking-widest uppercase">
                            {joincode}
                        </p>
                        <Button variant="ghost" size="sm"
                        onClick={handleCopy}>
                            Copy link
                            <CopyIcon className="size-4 ml-1"/>
                        </Button>
                    </div>
                    <div className="flex items-center justify-between w-full">
                        <Button disabled={isPending} onClick={handleNewCode} variant="outline">
                            New Code 
                            <RefreshCcw className="size-4 ml-2"/>
                        </Button>
                        <DialogClose asChild>
                            <Button>Close</Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}