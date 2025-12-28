"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Button,
  Checkbox,
  FieldError,
  Form,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
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
  const [agreeTerms, setAgreeTerms] = useState(false);

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
      <Form className="space-y-3" onSubmit={handleSubmit} autoComplete="off">
        <TextField
          name="name"
          value={formData.name}
          onInput={handleChange}
          type="text"
          isRequired
          minLength={3}
          isInvalid={!!errors.name?.length || undefined}
        >
          <Label>Full Name</Label>
          <InputGroup className="h-10">
            <InputGroup.Prefix>
              <UserIcon className="size-4 text-muted" />
            </InputGroup.Prefix>
            <InputGroup.Input
              className={"w-full"}
              placeholder="Whats your name?"
            />
          </InputGroup>
          <FieldError>{errors.name?.[0]}</FieldError>
        </TextField>
        <TextField
          name="email"
          value={formData.email}
          onInput={handleChange}
          type="email"
          isRequired
          isInvalid={!!errors.email?.length || undefined}
        >
          <Label>Email Address</Label>
          <InputGroup className="h-10">
            <InputGroup.Prefix>
              <MailIcon className="size-4 text-muted" />
            </InputGroup.Prefix>
            <InputGroup.Input
              className={"w-full"}
              placeholder="example@email.com"
            />
          </InputGroup>
          <FieldError>{errors.email?.[0]}</FieldError>
        </TextField>
        <TextField
          name="password"
          value={formData.password}
          onInput={handleChange}
          type={showPassword ? "text" : "password"}
          isRequired
          validate={(val) => {
            if (val.length < 8) return "Password must be at least 8 characters";
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val))
              return "Password must contain uppercase, lowercase, and number";
            return true;
          }}
          isInvalid={!!errors.password?.length || undefined}
        >
          <Label>Password</Label>
          <InputGroup className="h-10">
            <InputGroup.Prefix>
              <LockIcon className="size-4 text-muted" />
            </InputGroup.Prefix>
            <InputGroup.Input className={"w-full"} placeholder="••••••••" />
            <InputGroup.Suffix className="pr-0.5">
              <Button
                isIconOnly
                variant="ghost"
                onPress={() => setShowPassword((prev) => !prev)}
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
        <TextField
          name="confirm_password"
          value={formData.confirm_password}
          onInput={handleChange}
          type={showConfirmPassword ? "text" : "password"}
          isRequired
          validate={(val) => {
            if (val != formData.password) return "Password didn't match";
            return true;
          }}
        >
          <Label>Confirm Password</Label>
          <InputGroup className="h-10">
            <InputGroup.Prefix>
              <LockKeyholeIcon className="size-4 text-muted" />
            </InputGroup.Prefix>
            <InputGroup.Input className={"w-full"} placeholder="••••••••" />
            <InputGroup.Suffix className="pr-0.5">
              <Button
                isIconOnly
                variant="ghost"
                onPress={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <EyeIcon className="size-4" />
                ) : (
                  <EyeClosedIcon className="size-4" />
                )}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
          <FieldError />
        </TextField>
        <div className="flex gap-3 items-center">
          <Checkbox isSelected={agreeTerms} onChange={setAgreeTerms}>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content className="font-normal text-sm items-center">
              <p className="">
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </Checkbox.Content>
          </Checkbox>
        </div>

        {errors.general && (
          <div className="text-sm text-danger bg-danger/10 p-3 rounded-lg">
            {errors.general?.[0]}
          </div>
        )}

        <Button
          size="lg"
          isPending={isLoading}
          type="submit"
          fullWidth
          className="mt-3"
        >
          {({ isPending }) =>
            isPending ? "Creating Account..." : "Create Account"
          }
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
