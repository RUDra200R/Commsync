import {atom, useAtom} from "jotai";

const modalState = atom(false);

export const useCreateWorkspacemodal = ()=>{
    return useAtom(modalState);
};

