"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import { EyeIcon, MailIcon, LockIcon, EyeClosedIcon } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string[] | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        await refreshUser();
        router.replace(redirectUrl);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setErrors(
          err.response.data.errors || { general: [err.response.data.message] }
        );
      } else {
        setErrors({ general: ["Terjadi kesalahan"] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="flex flex-col items-center mb-6">
        <div className="size-28 mb-4">
          <Image alt="Logo" src={"/icons/icon.png"} width={512} height={512} />
        </div>
        <h1 className="text-3xl font-bold mb-1">Welcome Back</h1>
        <p className="">Sign in to your account to continue</p>
      </div>

      <Form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
        <TextField
          isRequired
          type="email"
          onInput={handleChange}
          value={formData.email}
          name="email"
          isInvalid={!!errors.email?.length || undefined}
        >
          <Label>Email</Label>
          <InputGroup className={"h-10"}>
            <InputGroup.Prefix>
              <MailIcon className="size-4 text-muted" />
            </InputGroup.Prefix>
            <InputGroup.Input
              className="w-full max-w-[280px]"
              placeholder="name@email.com"
            />
          </InputGroup>
          <FieldError>{errors.email?.[0]}</FieldError>
        </TextField>
        <TextField
          isRequired
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onInput={handleChange}
          isInvalid={!!errors.password?.length || undefined}
        >
          <div className="flex items-center">
            <Label>Password</Label>
            <Link
              href={"/auth/forgot-password"}
              className="ms-auto text text-xs hover:underline  text-primary"
            >
              Forgot Password?
            </Link>
          </div>
          <InputGroup className="h-10">
            <InputGroup.Prefix>
              <LockIcon className="size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input className="w-full" placeholder="••••••••" />
            <InputGroup.Suffix className="pr-0.5">
              <Button
                onPress={() => setShowPassword((prev) => !prev)}
                className="rounded-xl"
                size="sm"
                isIconOnly
                type="button"
                variant="ghost"
              >
                {showPassword ? (
                  <EyeIcon className="size-4" />
                ) : (
                  <EyeClosedIcon className="size-4" />
                )}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
          <FieldError>{errors.password?.[0]}</FieldError>
        </TextField>

        {errors.general && (
          <div className="text-sm text-danger bg-danger/10 p-3 rounded-lg">
            {errors.general?.[0]}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold mt-4"
          variant="primary"
          isPending={isLoading}
        >
          {({ isPending }) => (isPending ? "Signing in..." : "Sign In")}
        </Button>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
