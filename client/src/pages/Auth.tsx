import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Label } from '@radix-ui/react-label'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        // TODO: check uniqueness of username
        navigate(`/auth/register?username=${username}`)
    }
    return (
        <div className='h-screen w-screen flex justify-center items-center'>
            <div className={cn("flex flex-col gap-6")} style={{ minWidth: "40%"}}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Video Transcoding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    {/* TODO: suggest usernames based on db data */}
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Continue
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
