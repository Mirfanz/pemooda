"use client";

import { useState } from "react";
import { Button, Form, Input } from "@heroui/react";
import { RotateCcwKeyIcon, EyeClosedIcon, EyeIcon } from "lucide-react";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string[] | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Change password error:", error);
      setErrors({ general: ["Terjadi kesalahan"] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="flex flex-col mb-6">
        <Button
          className="rounded-3xl size-18 shadow-lg mb-4 shadow-primary/40"
          color="primary"
          isIconOnly
        >
          <RotateCcwKeyIcon className="size-10" />
        </Button>
        <h1 className="text-2xl font-bold mb-2">Change Password</h1>
        <p className="text-muted text-sm">
          Change your password to keep your account secure from attackers.
        </p>
      </div>
      <Form onSubmit={handleSubmit} autoComplete="off" className="space-y-2">
        <Input
          variant="flat"
          isRequired
          type={showNewPassword ? "text" : "password"}
          classNames={{ helperWrapper: "pb-0!" }}
          onInput={handleChange}
          value={formData.newPassword}
          name="newPassword"
          label="New Password"
          labelPlacement="outside-top"
          placeholder="New password"
          isInvalid={!!errors.newPassword?.length || undefined}
          errorMessage={errors.newPassword?.[0]}
          validate={(val) => {
            if (val.length < 8) return "Password must be at least 8 characters";
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val))
              return "Password must contain uppercase, lowercase, and number";
            return true;
          }}
          endContent={
            <Button
              onPress={() => setShowNewPassword((prev) => !prev)}
              className="-mr-2"
              size="sm"
              isIconOnly
              type="button"
              variant="light"
            >
              {showNewPassword ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeClosedIcon className="size-4" />
              )}
            </Button>
          }
        />

        <Input
          variant="flat"
          isRequired
          type={showConfirmPassword ? "text" : "password"}
          classNames={{ helperWrapper: "pb-0!" }}
          onInput={handleChange}
          value={formData.confirmPassword}
          name="confirmPassword"
          label="Confirm Password"
          labelPlacement="outside-top"
          placeholder="Confirm new password"
          validate={(val) => {
            if (val != formData.newPassword) return "Password didn't match";
            return true;
          }}
          endContent={
            <Button
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              className="-mr-2"
              size="sm"
              isIconOnly
              type="button"
              variant="light"
            >
              {showConfirmPassword ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeClosedIcon className="size-4" />
              )}
            </Button>
          }
        />

        {errors.general && (
          <div className="text-sm text-danger bg-danger/10 p-3 rounded-lg">
            {errors.general?.[0]}
          </div>
        )}

        <Button
          type="submit"
          className="mt-4"
          variant="shadow"
          fullWidth
          color="primary"
          radius="full"
          isLoading={isLoading}
        >
          {isLoading ? "Changing..." : "Change Password"}
        </Button>
      </Form>
    </main>
  );
};

export default ChangePassword;
