"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Avatar,
  Button,
  Form,
  Input,
  Card,
  CardBody,
  Divider,
  Alert,
  addToast,
} from "@heroui/react";
import {
  SparklesIcon,
  CameraIcon,
  PhoneIcon,
  Share2Icon,
  SaveIcon,
  UploadIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Navbar from "../navbar";
import {
  BuildingIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterXIcon,
  WhatsappIcon,
} from "@/components/icons";

const NewOrganization = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    phone: "",
    instagram: "",
    twitter: "",
    facebook: "",
  });
  const [image, setImage] = useState<{
    previewUrl?: string;
    file?: File;
  }>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);

    if (file) {
      if (!file.type.startsWith("image/")) {
        addToast({
          color: "danger",
          title: "Please select a valid image file",
        });
        return;
      }

      if (file.size > 1024 * 1024) {
        addToast({
          color: "danger",
          title: "Image size must be less than 1MB",
        });
        return;
      }

      setImage({
        previewUrl: URL.createObjectURL(file),
        file,
      });

      if (errors.image) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const payload: Record<string, string | undefined> = {
        name: formData.name.trim(),
        tagline: formData.tagline.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        instagramUrl: formData.instagram.trim() || undefined,
        twitterUrl: formData.twitter.trim() || undefined,
        facebookUrl: formData.facebook.trim() || undefined,
      };

      const response = await axios.post("/api/organization", payload);

      if (response.data.success) {
        addToast({
          color: "success",
          title: "Organization created successfully!",
        });
        await refreshUser();
        router.replace("/");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;

        if (errorData.errors && Array.isArray(errorData.errors)) {
          const fieldErrors: Record<string, string> = {};
          errorData.errors.forEach(
            (err: { path: string[]; message: string }) => {
              const field = err.path[0];
              fieldErrors[field] = err.message;
            }
          );
          setErrors(fieldErrors);
        } else {
          setErrors({
            general: errorData.message,
          });
        }

        addToast({
          color: "danger",
          title: errorData.message,
        });
      } else {
        const errorMsg = "An unexpected error occurred. Please try again.";
        setErrors({ general: errorMsg });
        addToast({
          color: "danger",
          title: errorMsg,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary-50/20">
      <Navbar
        title="Create Organization"
        endContent={
          <Button
            size="sm"
            onPress={() => formRef.current?.requestSubmit()}
            className="ms-auto font-medium"
            variant="solid"
            color="primary"
            isLoading={isLoading}
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <SaveIcon className="size-3.5" />
                Save
              </>
            )}
          </Button>
        }
      />
      <main className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {/* Let&apos;s create your organization */}
            Create Organization
          </h1>
          <p className="text-muted text-sm">
            Fill in the details below to get started with your organization
            profile.
          </p>
        </div>

        <Form
          className="space-y-5"
          ref={formRef}
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {/* Logo Upload Section */}
          <Card
            fullWidth
            shadow="none"
            className="border-2 border-dashed border-primary/20 bg-primary-50/30"
          >
            <CardBody className="p-6">
              <div className="flex flex-row sm:flex-row items-center gap-6">
                <Avatar
                  // isBordered
                  radius="lg"
                  color="primary"
                  src={image.previewUrl}
                  className="size-28 border-2 border-primary/30 bg-background"
                  icon={<CameraIcon className="size-12 text-primary/60" />}
                />
                <div className="flex-1 w-full">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Organization Logo
                  </h3>
                  <Button
                    size="sm"
                    variant="solid"
                    // color="primary"
                    onPress={() => logoInputRef.current?.click()}
                    fullWidth
                    radius="md"
                  >
                    <UploadIcon className="size-3.5" />
                    Upload Image
                  </Button>
                  <p className="text-xs text-muted mt-2">
                    Square image, at least 512x512px
                  </p>
                  <Input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="" shadow="sm" fullWidth>
            <CardBody className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BuildingIcon className="size-5 text-primary" />
                Basic Information
              </h3>
              <Divider />

              <Input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                isRequired
                minLength={3}
                maxLength={100}
                label="Organization Name"
                placeholder="Enter your organization name"
                labelPlacement="outside"
                variant="bordered"
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                startContent={
                  <BuildingIcon className="size-4 text-muted me-1" />
                }
              />

              <Input
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                maxLength={200}
                label="Tagline"
                description="A short description of your organization"
                placeholder="e.g., Building the future of technology"
                labelPlacement="outside"
                variant="bordered"
                isInvalid={!!errors.tagline}
                errorMessage={errors.tagline}
                startContent={
                  <SparklesIcon className="size-4 text-muted me-1" />
                }
              />
            </CardBody>
          </Card>

          <Card shadow="sm" fullWidth>
            <CardBody className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <PhoneIcon className="size-5 text-primary" />
                Contact Information
              </h3>
              <Divider />

              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                label="Whatsapp (Optional)"
                description="Format: 08xxxxxxxxx"
                placeholder="08123456789"
                labelPlacement="outside"
                variant="bordered"
                isInvalid={!!errors.phone}
                errorMessage={errors.phone}
                startContent={
                  <WhatsappIcon className="size-4 text-muted me-1" />
                }
              />
            </CardBody>
          </Card>

          <Card shadow="sm" fullWidth>
            <CardBody className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Share2Icon className="size-5 text-primary" />
                Social Media
              </h3>
              <Divider />
              <p className="text-sm text-muted">
                Connect your social media profiles (optional)
              </p>

              <div className="space-y-3">
                <Input
                  name="instagram"
                  type="url"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/yourorg"
                  labelPlacement="outside"
                  variant="bordered"
                  isInvalid={!!errors.instagramUrl}
                  errorMessage={errors.instagramUrl}
                  startContent={
                    <InstagramIcon className="size-4 text-muted me-1" />
                  }
                />

                <Input
                  name="twitter"
                  type="url"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/yourorg"
                  labelPlacement="outside"
                  variant="bordered"
                  isInvalid={!!errors.twitterUrl}
                  errorMessage={errors.twitterUrl}
                  startContent={
                    <TwitterXIcon className="size-4 text-muted me-1" />
                  }
                />

                <Input
                  name="facebook"
                  type="url"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/yourid"
                  labelPlacement="outside"
                  variant="bordered"
                  isInvalid={!!errors.facebookUrl}
                  errorMessage={errors.facebookUrl}
                  startContent={
                    <FacebookIcon className="size-4 text-muted me-1" />
                  }
                />
              </div>
            </CardBody>
          </Card>

          {errors.general && (
            <Alert
              color="danger"
              variant="faded"
              title={errors.general}
              className="mb-4"
            />
          )}
        </Form>
      </main>
    </div>
  );
};

export default NewOrganization;
