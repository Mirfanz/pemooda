"use client";

import { useState } from "react";
import { Button, FieldError, Form, InputGroup, TextField } from "@heroui/react";
import {
  MailIcon,
  ArrowLeftIcon,
  CheckCheck,
  KeyRoundIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="">
        <div className="flex flex-col mb-6">
          <Button className="size-18 shadow-lg mb-4 shadow-success/40 bg-success">
            <CheckCheck className="size-8" />
          </Button>
          <h1 className="text-2xl font-bold mb-2">Link Sent</h1>
          <p className="text-muted text-sm">
            Please check your email for a link to reset your password.
          </p>
        </div>
        <Button
          size="lg"
          type="button"
          fullWidth
          variant="ghost"
          onPress={router.back}
        >
          <ArrowLeftIcon className="size-4" /> Go Back
        </Button>
      </main>
    );
  }

  return (
    <main className="">
      <div className="flex flex-col mb-6">
        <Button className="size-18 shadow-lg mb-4 shadow-primary/40">
          <KeyRoundIcon className="size-10" />
        </Button>
        <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
        <p className="text-muted text-sm">
          Dont worry, We will send you a recovery link to your email.
        </p>
      </div>
      <Form onSubmit={handleSubmit} autoComplete="off">
        <TextField
          className="mb-6"
          name="email"
          value={email}
          onChange={(val) => setEmail(val)}
          isRequired
        >
          <InputGroup fullWidth className="h-11">
            <InputGroup.Prefix>
              <MailIcon className="size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              className=""
              type="email"
              placeholder="Your Email Address"
            />
          </InputGroup>
          <FieldError />
        </TextField>
        <Button
          size="lg"
          className="shadow-lg mb-4 shadow-primary/40"
          fullWidth
          type="submit"
          isPending={isLoading}
        >
          {({ isPending }) => (isPending ? "Sending..." : "Send Reset Link")}
        </Button>
        <Button
          size="lg"
          type="button"
          fullWidth
          variant="ghost"
          onPress={router.back}
        >
          <ArrowLeftIcon className="size-4" /> Go Back
        </Button>
      </Form>
    </main>
  );
};

export default ForgotPassword;
