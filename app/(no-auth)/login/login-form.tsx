"use client"

import {useState} from "react"
import {motion} from "framer-motion"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import Link from "next/link"
import {Sparkles} from "lucide-react"
import {loginFormSchema} from "@/app/(no-auth)/login/schema";

export default function LoginPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            id: "",
            password: "",
        },
    })

    function onSubmit(values: z.infer<typeof loginFormSchema>) {
        setIsSubmitting(true)
        // Simulate API call
        setTimeout(() => {
            console.log(values)
            setIsSubmitting(false)
        }, 2000)
    }

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Animated background elements */}
            <motion.div
                className="absolute left-1/4 top-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{repeat: Number.POSITIVE_INFINITY, duration: 15, ease: "easeInOut"}}
            />
            <motion.div
                className="absolute right-1/4 bottom-1/4 -z-10 h-[250px] w-[250px] rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 blur-3xl"
                animate={{
                    x: [0, -30, 0],
                    y: [0, 50, 0],
                }}
                transition={{repeat: Number.POSITIVE_INFINITY, duration: 20, ease: "easeInOut", delay: 2}}
            />

            <div className="w-full max-w-md">
                <motion.div
                    className="relative bg-background/80 backdrop-blur-sm p-8 border border-primary/10 rounded-3xl shadow-2xl"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.8}}
                >
                    <div
                        className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-3xl blur opacity-20"></div>
                    <div className="relative">
                        <div className="flex justify-center mb-6">
                            <motion.div
                                className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"
                                whileHover={{scale: 1.1, rotate: 5}}
                                transition={{type: "spring", stiffness: 400, damping: 10}}
                            >
                                <Sparkles className="h-8 w-8 text-white"/>
                            </motion.div>
                        </div>

                        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground mb-8">
                          <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                            길드 로그인
                          </span>
                        </h2>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="id"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>아이디 (캐릭터 이름)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="게임 내 캐릭터 이름" {...field} />
                                            </FormControl>
                                            <FormMessage>
                                                {form.formState.errors.id?.message}
                                            </FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>비밀번호</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••" {...field} />
                                            </FormControl>
                                            <FormMessage>
                                                {form.formState.errors.password?.message}
                                            </FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <Link href="/forgot-password"
                                              className="text-primary hover:text-primary/80 transition-colors">
                                            비밀번호를 잊으셨나요?
                                        </Link>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "로그인 중..." : "로그인"}
                                </Button>

                                <div className="text-center mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        계정이 없으신가요?{" "}
                                        <Link href="/register"
                                              className="text-primary hover:text-primary/80 transition-colors font-medium">
                                            회원가입
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </Form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
