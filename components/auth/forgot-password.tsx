"use client";

import { useState } from "react";
import { Button, Form, Input } from "@heroui/react";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckRead, KeySquare2, Letter } from "@solar-icons/react";

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
            <CheckRead weight="BoldDuotone" className="size-8" />
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
          <ArrowLeft weight="Linear" className="size-4" /> Go Back
        </Button>
      </main>
    );
  }

  return (
    <main className="">
      <div className="flex flex-col mb-6">
        <Button
          className="rounded-3xl size-18 shadow-lg mb-4 shadow-primary/40"
          color="primary"
          isIconOnly
        >
          <KeySquare2 weight="BoldDuotone" className="size-10" />
        </Button>
        <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
        <p className="text-muted text-sm">
          Dont worry, We will send you a recovery link to your email.
        </p>
      </div>
      <Form onSubmit={handleSubmit} autoComplete="off">
        <Input
          className="mb-4"
          name="email"
          value={email}
          onValueChange={(val) => setEmail(val)}
          isRequired
          placeholder="Your Email Address"
          startContent={
            <Letter weight="Broken" className="size-4 mr-1 text-muted" />
          }
        />
        <Button
          className="shadow-lg mb-2"
          fullWidth
          type="submit"
          isLoading={isLoading}
          color="primary"
          variant="shadow"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </Form>
    </main>
  );
};

export default ForgotPassword;
