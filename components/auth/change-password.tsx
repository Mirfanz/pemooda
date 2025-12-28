"use client";

import { useState } from "react";
import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import { RotateCcwKeyIcon, EyeClosedIcon, EyeIcon } from "lucide-react";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="flex flex-col mb-6">
        <Button className="size-18 shadow-lg mb-4 shadow-primary/40">
          <RotateCcwKeyIcon className="size-12" />
        </Button>
        <h1 className="text-2xl font-bold mb-2">Change Password</h1>
        <p className="text-muted text-sm">
          Change your password to keep your account secure from attacker.
        </p>
      </div>
      <Form onSubmit={handleSubmit} autoComplete="off">
        <div className="mb-8 space-y-3">
          <TextField
            name="password"
            type={showPassword ? "text" : "password"}
            isRequired
            value={formData.password}
            onInput={handleChange}
          >
            <Label>Current Password</Label>
            <InputGroup fullWidth className="h-10">
              <InputGroup.Input placeholder="Your current password" />
              <InputGroup.Suffix className="pr-0.5">
                <Button
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
            <FieldError />
          </TextField>
          <TextField
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={formData.newPassword}
            onInput={handleChange}
            isRequired
            validate={(val) => {
              if (val.length < 8)
                return "Password must be at least 8 characters";
              if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val))
                return "Password must contain uppercase, lowercase, and number";
              return true;
            }}
          >
            <Label>New Password</Label>
            <InputGroup fullWidth className="h-10">
              <InputGroup.Input placeholder="New password" />
              <InputGroup.Suffix className="pr-0.5">
                <Button
                  variant="ghost"
                  onPress={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? (
                    <EyeIcon className="size-4" />
                  ) : (
                    <EyeClosedIcon className="size-4" />
                  )}
                </Button>
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError />
          </TextField>
          <TextField
            name="confirmPassword"
            type={showNewPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onInput={handleChange}
            isRequired
            validate={() => {
              if (formData.newPassword !== formData.confirmPassword)
                return "New password didn't match";
              return true;
            }}
          >
            <InputGroup fullWidth className="h-10">
              <InputGroup.Input placeholder="Confirm new password" />
              <InputGroup.Suffix className="pr-0.5">
                <Button
                  variant="ghost"
                  onPress={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? (
                    <EyeIcon className="size-4" />
                  ) : (
                    <EyeClosedIcon className="size-4" />
                  )}
                </Button>
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError />
          </TextField>
        </div>
        <Button
          size="lg"
          className="shadow-lg shadow-primary/40"
          fullWidth
          type="submit"
          isPending={isLoading}
        >
          {({ isPending }) =>
            isPending ? (
              <>
                <Spinner color="current" />
                Change Password
              </>
            ) : (
              "Change Password"
            )
          }
        </Button>
      </Form>
    </main>
  );
};

export default ChangePassword;
