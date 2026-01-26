"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button, Form, Input } from "@heroui/react";
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
          err.response.data.errors || { general: [err.response.data.message] },
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

      <Form onSubmit={handleSubmit} className="space-y-2" autoComplete="on">
        <Input
          variant="flat"
          isRequired
          type="email"
          classNames={{ helperWrapper: "pb-0!" }}
          onInput={handleChange}
          value={formData.email}
          name="email"
          label="Email"
          labelPlacement="outside-top"
          placeholder="example@gmail.com"
          isInvalid={!!errors.email?.length || undefined}
          errorMessage={errors.email?.[0]}
          startContent={<MailIcon className="size-4 text-muted mr-1" />}
        />

        <div className="w-full">
          <div className="flex w-full justify-between items-center mb-1">
            <label className="text-sm">Password</label>
            <Link
              href={"/auth/forgot-password"}
              className="text-xs text-primary"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            variant="flat"
            isRequired
            type={showPassword ? "text" : "password"}
            classNames={{ helperWrapper: "pb-0!" }}
            name="password"
            labelPlacement="outside-top"
            placeholder="••••••••"
            value={formData.password}
            onInput={handleChange}
            isInvalid={!!errors.password?.length || undefined}
            errorMessage={errors.password?.[0]}
            startContent={<LockIcon className="size-4 text-muted mr-1" />}
            endContent={
              <Button
                onPress={() => setShowPassword((prev) => !prev)}
                className="-mr-2"
                size="sm"
                isIconOnly
                type="button"
                variant="light"
              >
                {showPassword ? (
                  <EyeIcon className="size-4" />
                ) : (
                  <EyeClosedIcon className="size-4" />
                )}
              </Button>
            }
          />
        </div>
        {/* <div className="flex items-center">
            <Link
              href={"/auth/forgot-password"}
              className="ms-auto text text-xs hover:underline  text-primary"
            >
              Forgot Password?
            </Link>
          </div> */}

        {errors.general && (
          <div className="text-sm text-danger bg-danger/10 p-3 rounded-lg">
            {errors.general?.[0]}
          </div>
        )}

        <Button
          type="submit"
          className="mt-4"
          fullWidth
          variant="solid"
          size="lg"
          color="primary"
          radius="full"
          isLoading={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
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
