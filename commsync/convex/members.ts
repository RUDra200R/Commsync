import { query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";


// We cannot show all the member schema details on the front-end \
// So the following helper function will help us get the member name and their image and relation with the admin.
const populateUser = (ctx: QueryCtx, id: Id<"users">) =>{
    return ctx.db.get(id);
};

export const getById = query({
    args: {id: v.id("members")},
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId)
        {
            return null; // since the 'get' method will retuen an array
        }

        const member = await ctx.db.get(args.id)

        if(!member){
            return null;
        }

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
            q.eq("workspaceId", member.workspaceId).eq ("userId", userId),
        );

        if(!currentMember){
            return null;
        }

        const user = await populateUser(ctx, member.userId);

        if(!user)
        {
            return null;

        }

        return{
            ...member,
            user,
        }
    }
})
export const get = query({
    args: {workspaceId: v.id("workspaces")},
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId)
        {
            return []; // since the 'get' method will retuen an array
        }
        const member = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),)
        .unique()

        if(!member){
            return [];
        }

        const data = await ctx.db
            .query("members")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const members = [];
        for (const member of data) {
            const user = await populateUser(ctx, member.userId);

            if(user)
            {
                members.push({
                    ...member,
                    user,
                });
            }
        }
        return members;
    },  
})

export const current = query({
    args: { workspaceId: v.id("workspaces")},
    handler:async (ctx, args) =>{
        const userId = await auth.getUserId(ctx);

        if(!userId)
        {
            return null;
        }
        const member = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),)
        .unique()

        if(!member){
            return null;
        }

        return member
    },
}); 