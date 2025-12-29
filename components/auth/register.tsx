"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button, Checkbox, Form, Input } from "@heroui/react";
import {
  EyeIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  LockKeyholeIcon,
  EyeClosedIcon,
} from "lucide-react";
import Image from "next/image";
const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrors((prev) => ({
        ...prev,
        general: ["You must agree to the terms and conditions"],
      }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        router.replace("/auth/verify");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        if (errorData.errors) {
          setErrors(errorData.errors);
        } else {
          setErrors({ general: [errorData.message || "Registration failed"] });
        }
      } else {
        setErrors({ general: ["An unexpected error occurred"] });
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
        <h1 className="text-3xl font-bold mb-1">Create Account</h1>
        <p>Join with us by creating an account</p>
      </div>
      <Form className="space-y-2" onSubmit={handleSubmit} autoComplete="off">
        <Input
          name="name"
          value={formData.name}
          onInput={handleChange}
          type="text"
          classNames={{ helperWrapper: "pb-0!" }}
          isRequired
          minLength={3}
          isInvalid={!!errors.name?.length || undefined}
          errorMessage={errors.name?.[0]}
          label="Full Name"
          placeholder="What's your name?"
          labelPlacement="outside-top"
          startContent={<UserIcon className="size-4 text-muted mr-1" />}
        />

        <Input
          name="email"
          value={formData.email}
          onInput={handleChange}
          type="email"
          classNames={{ helperWrapper: "pb-0!" }}
          isRequired
          isInvalid={!!errors.email?.length || undefined}
          errorMessage={errors.email?.[0]}
          label="Email Address"
          placeholder="example@email.com"
          labelPlacement="outside-top"
          startContent={<MailIcon className="size-4 text-muted mr-1" />}
        />
        <Input
          name="password"
          value={formData.password}
          onInput={handleChange}
          type={showPassword ? "text" : "password"}
          classNames={{ helperWrapper: "pb-0!" }}
          isRequired
          validate={(val) => {
            if (val.length < 8) return "Password must be at least 8 characters";
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val))
              return "Password must contain uppercase, lowercase, and number";
            return true;
          }}
          isInvalid={!!errors.password?.length || undefined}
          errorMessage={errors.password?.[0]}
          label="Password"
          labelPlacement="outside-top"
          placeholder="••••••••"
          startContent={<LockIcon className="size-4 text-muted mr-1" />}
          endContent={
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="-me-2"
              onPress={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeClosedIcon className="size-4" />
              )}
            </Button>
          }
        />
        <Input
          name="confirm_password"
          value={formData.confirm_password}
          onInput={handleChange}
          type={showConfirmPassword ? "text" : "password"}
          classNames={{ helperWrapper: "pb-0!" }}
          isRequired
          validate={(val) => {
            if (val != formData.password) return "Password didn't match";
            return true;
          }}
          label="Confirm Password"
          labelPlacement="outside-top"
          placeholder="••••••••"
          startContent={<LockKeyholeIcon className="size-4 text-muted mr-1" />}
          endContent={
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="-me-2"
              onPress={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeClosedIcon className="size-4" />
              )}
            </Button>
          }
        />
        <div className="flex gap-3 items-center">
          <Checkbox isSelected={agreeTerms} onValueChange={setAgreeTerms}>
            <p className="text-sm">
              I agree to the{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </Checkbox>
        </div>

        {errors.general && (
          <div className="text-sm text-danger bg-danger/10 p-3 rounded-lg">
            {errors.general?.[0]}
          </div>
        )}

        <Button
          size="lg"
          isLoading={isLoading}
          type="submit"
          fullWidth
          className="mt-3"
          variant="shadow"
          color="primary"
          radius="full"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </Form>
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
