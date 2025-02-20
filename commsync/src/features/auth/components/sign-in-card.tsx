import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import {FcGoogle} from "react-icons/fc";
import {FaGithub} from "react-icons/fa";
import { SignInFlow } from "../type";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { TriangleAlert } from "lucide-react";


interface SignInCardPros {
    setState: (state: SignInFlow)=> void;
}


export const SignInCard = ({setState}: SignInCardPros) => {
    const {signIn} = useAuthActions();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    const OnPasswordSignIn = (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setPending(true);
        signIn("password", {email, password, flow: "signIn"})
            .catch(() =>{
                setError("Invalid email or passowrd");
            })
            .finally(() =>{
                setPending(false);
            })
    }

    const OnProviderSignIn =( value:"github"| "google") =>{
        setPending(true);
        signIn(value)
            .finally(() => {
                setPending(false);
            })
    }
    return(
        <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
                <CardTitle>
                Login to continue
                </CardTitle>
            <CardDescription>
                Use your email or another service  to contiue
            </CardDescription>
            </CardHeader>
            {!!error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                    <TriangleAlert className="size-4"/>
                    <p>{error}</p>
                </div>
            
            )}
            
            <CardContent className="space-y-5 px-0 pb-0">
                <form  onSubmit={OnPasswordSignIn} className="space-y-2.5">
                    <Input
                    disabled={pending}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    required
                    />
                    <Input
                    disabled={pending}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    required
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={pending}>
                        Login
                    </Button>
                </form>
                <Separator/>
                <div className="flex flex-col gap-y-2.5">
                    <Button className="w-full relative" size="lg" disabled={pending} variant="outline" onClick={() => OnProviderSignIn("google")}>
                        <FcGoogle className="size-5 absolute top-3 left-2.5"/>
                        Continue with google
                    </Button>
                    <Button className="w-full relative" size="lg" disabled={pending} variant="outline" onClick={() => OnProviderSignIn("github")}>
                        <FaGithub className="size-5 absolute top-3 left-2.5"/>
                        Continue with GithHub
                    </Button>
                </div>
                <p className="text-x5 text-muted-foreground">
                    Don't have an account?<span onClick={() => setState("signUp")} className="text-sky-700 hover:underline cursor-pointer">Sign Up</span>
                </p>
            </CardContent>
        </Card>
    );
};
