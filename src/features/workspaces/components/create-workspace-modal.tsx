import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateWorkspacemodal } from "../store/use-create-workspace-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const CreateWorkspaceModal = () =>{
    const router = useRouter();
    const [open, setOpen] = useCreateWorkspacemodal();
    const [name, setName] = useState("");

    const { mutate, data, error, isPending, isSuccess, isSettled, isError } = useCreateWorkspace();

    const handleclose = () =>{
        setOpen(false);
        setName("");
        //TODO: clear form
    }
     const handleSubmit = async (e: React.FormEvent<HTMLFormElement> ) =>{
        e.preventDefault();

        mutate({ name }, {
            onSuccess(id){
            toast.success("Workspace created");
            router.push(`/workspace/${id}`);
            handleclose();
            },
        })

     }
    
    return (
        <Dialog open={open} onOpenChange={handleclose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a Workspace</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                    required
                    autoFocus
                    minLength={3}
                    placeholder="Workspace name e.g. 'work', 'Personal', 'Home;"
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending}>
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>

        </Dialog>
    );
};