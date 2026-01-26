"use client";

import { FC, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Form,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  Divider,
  Alert,
  addToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import {
  MapPinIcon,
  LinkIcon,
  Globe2Icon,
  LockKeyholeIcon,
  EllipsisIcon,
  LayersIcon,
  PlusIcon,
  InfoIcon,
  BookTextIcon,
  HeartPulseIcon,
  MegaphoneIcon,
  HandCoinsIcon,
  Users2Icon,
} from "lucide-react";
import { ActivityType } from "@/lib/generated/prisma/enums";
import { useCreateActivity } from "@/hooks/queries/activity";
import Navbar from "../navbar";
import {
  CalendarIcon,
  CheckReadIcon,
  MapPoinWaveIcon,
  TrashIcon,
} from "@/components/icons";
import { formatErrors } from "@/lib/utils";
import { IconSvgProps } from "@/types";
import clsx from "clsx";
import { activityTypeLabel } from "@/config/enum-label";
import axios from "axios";

const activityTypeOptions: {
  key: ActivityType;
  label: string;
  icon: FC<IconSvgProps>;
  color: string;
}[] = [
  {
    key: ActivityType.MEETING,
    label: activityTypeLabel[ActivityType.MEETING],
    icon: Users2Icon,
    color: "violet",
  },
  {
    key: ActivityType.TRAINING,
    label: activityTypeLabel[ActivityType.TRAINING],
    icon: BookTextIcon,
    color: "orange",
  },
  {
    key: ActivityType.VOLUNTEER,
    label: activityTypeLabel[ActivityType.VOLUNTEER],
    icon: HandCoinsIcon,
    color: "cyan",
  },
  {
    key: ActivityType.GATHERING,
    label: activityTypeLabel[ActivityType.GATHERING],
    icon: HeartPulseIcon,
    color: "yellow",
  },
  {
    key: ActivityType.SEMINAR,
    label: activityTypeLabel[ActivityType.SEMINAR],
    icon: MegaphoneIcon,
    color: "teal",
  },
  {
    key: ActivityType.OTHER,
    label: activityTypeLabel[ActivityType.OTHER],
    icon: EllipsisIcon,
    color: "default",
  },
];

const NewActivity = () => {
  const router = useRouter();
  const createActivityMutation = useCreateActivity();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    mapsUrl: "",
    visibility: "private",
    type: "" as ActivityType,
    startDate: "",
    endDate: "",
  });
  const [notes, setNotes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim(),
        mapsUrl: formData.mapsUrl.trim() || undefined,
        type: formData.type,
        isPublic: formData.visibility == "public",
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : "",
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : undefined,
        notes: notes.map((note) => note.trim()),
      };

      await createActivityMutation.mutateAsync(payload);

      addToast({
        color: "success",
        title: "Activity created successfully!",
      });
      router.replace("/activity");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors) setErrors(formatErrors(errorData.errors));
        else setErrors({ general: errorData.message });

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
    }
  };

  return (
    <div className="">
      <Navbar
        title="Create New Activity"
        endContent={
          <Popover placement="bottom">
            <PopoverTrigger>
              <Button
                className="text-primary-foreground"
                size="sm"
                variant="light"
                isIconOnly
              >
                <InfoIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="text-small font-bold">Create Activity</div>
                <div className="text-tiny">
                  Create new activity for your organization
                </div>
              </div>
            </PopoverContent>
          </Popover>
        }
      />
      <main className="p-4 pb-6">
        <Alert
          description="Fill in the details below to create a new activity for your organization."
          className="mb-4"
          color="secondary"
          variant="faded"
          draggable
        />

        <Form
          className="space-y-5"
          ref={formRef}
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {/* Basic Information */}
          <Card shadow="sm" fullWidth className="">
            <CardBody className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2.5">
                <CalendarIcon className="size-5 text-secondary" />
                Basic Information
              </h3>
              <Divider />
              <Input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                // isRequired
                // minLength={3}
                // maxLength={200}
                label="Activity Title"
                placeholder="Enter activity title"
                labelPlacement="outside"
                variant="flat"
                isInvalid={!!errors.title}
                errorMessage={errors.title}
              />

              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                label="Description (Optional)"
                placeholder="Describe your activity..."
                labelPlacement="outside"
                variant="flat"
                isInvalid={!!errors.description}
                errorMessage={errors.description}
                minRows={3}
              />
            </CardBody>
          </Card>

          {/* Basic Information */}
          <Card shadow="sm" fullWidth className="">
            <CardBody className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2.5">
                <CalendarIcon className="size-5 text-secondary" />
                Additional Information
              </h3>
              <Divider />
              <Select
                items={activityTypeOptions}
                variant="flat"
                label="Activity Type"
                labelPlacement="outside-left"
                classNames={{ mainWrapper: "ms-auto min-w-0 w-34" }}
                name="type"
                selectedKeys={[formData.type]}
                isInvalid={!!errors.type}
                onSelectionChange={(key) => {
                  setFormData((prev) => ({
                    ...prev,
                    type: key.currentKey as ActivityType,
                  }));
                  if (errors.type) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.type;
                      return newErrors;
                    });
                  }
                }}
                renderValue={(items) =>
                  items.map((item) =>
                    item.data ? (
                      <div
                        key={item.key}
                        className={clsx(
                          "flex items-center gap-2",
                          `text-${item.data.color}-600`,
                        )}
                      >
                        <item.data.icon className="size-4 text-current" />
                        <p className="text-sm grow">{item.data?.label}</p>
                      </div>
                    ) : undefined,
                  )
                }
              >
                {(item) => (
                  <SelectItem
                    key={item.key}
                    startContent={<item.icon className="size-4" />}
                    hideSelectedIcon
                  >
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                items={[
                  { key: "private", label: "Private", icon: LockKeyholeIcon },
                  { key: "public", label: "Public", icon: Globe2Icon },
                ]}
                variant="flat"
                name="visibility"
                label="Visibility"
                labelPlacement="outside-left"
                classNames={{ mainWrapper: "ms-auto min-w-0 w-34" }}
                selectedKeys={[formData.visibility]}
                onSelectionChange={(key) => {
                  setFormData((prev) => ({
                    ...prev,
                    visibility: key.currentKey || "private",
                  }));
                  if (errors.isPublic) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.isPublic;
                      return newErrors;
                    });
                  }
                }}
                isInvalid={!!errors.isPublic}
                renderValue={(items) =>
                  items.map((item) =>
                    item.data ? (
                      <div
                        key={item.key}
                        className={clsx("flex items-center gap-2")}
                      >
                        <item.data.icon className="size-4" />
                        <p className="text-sm grow">{item.data?.label}</p>
                      </div>
                    ) : null,
                  )
                }
              >
                {(item) => (
                  <SelectItem
                    key={item.key}
                    startContent={<item.icon className="size-4" />}
                    hideSelectedIcon
                  >
                    {item.label}
                  </SelectItem>
                )}
              </Select>

              {formData.visibility == "public" && (
                <Alert
                  color="warning"
                  description="This activity can be seen and participated by public"
                />
              )}
            </CardBody>
          </Card>

          {/* Location & Time */}
          <Card shadow="sm" fullWidth className="">
            <CardBody className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2.5">
                <MapPoinWaveIcon className="size-5 text-secondary" />
                Location & Time
              </h3>
              <Divider />

              <Input
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                // isRequired
                // maxLength={200}
                label="Location"
                placeholder="Location Name"
                labelPlacement="outside"
                variant="flat"
                isInvalid={!!errors.location}
                errorMessage={errors.location}
                startContent={<MapPinIcon className="size-4 text-muted me-1" />}
              />

              <Input
                name="mapsUrl"
                type="url"
                value={formData.mapsUrl}
                onChange={handleChange}
                label="Maps URL (Optional)"
                placeholder="https://maps.google.com/..."
                labelPlacement="outside"
                variant="flat"
                isInvalid={!!errors.mapsUrl}
                errorMessage={errors.mapsUrl}
                startContent={<LinkIcon className="size-4 text-muted me-1" />}
              />

              <Input
                name="startDate"
                type="datetime-local"
                label="Start Date"
                labelPlacement="outside-top"
                variant="flat"
                onChange={handleChange}
                value={formData.startDate}
                isInvalid={!!errors.startDate}
                errorMessage={errors.startDate}
              />
              <Input
                name="endDate"
                type="datetime-local"
                label="End Date (Optional)"
                labelPlacement="outside-top"
                variant="flat"
                value={formData.endDate}
                onChange={handleChange}
                isInvalid={!!errors.endDate}
                errorMessage={errors.endDate}
              />
            </CardBody>
          </Card>

          {/* Additional notes */}
          <Card shadow="sm" fullWidth className="">
            <CardBody className="p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <LayersIcon className="size-5 text-secondary" />
                <h3 className="font-semibold">
                  Notes <span className="text-muted">(Optional)</span>
                </h3>
                <Button
                  size="sm"
                  className="ms-auto"
                  color="primary"
                  startContent={<PlusIcon className="size-4" />}
                  variant="flat"
                  onPress={() => {
                    const newNotes = [...notes];
                    newNotes.push("");
                    setNotes(newNotes);
                  }}
                  isDisabled={notes.length > 9}
                >
                  Add
                </Button>
              </div>
              <Divider />
              {!notes.length && (
                <p className="my-1 text-center text-sm text-muted">
                  Haven&apos;t any notes
                </p>
              )}
              {notes.map((note, index) => (
                <div key={"note-" + index} className="relative">
                  <Textarea
                    minRows={1}
                    placeholder={`Note ${index + 1}`}
                    value={note}
                    onChange={(e) => {
                      const newNotes = [...notes];
                      newNotes[index] = e.target.value;
                      setNotes(newNotes);
                    }}
                  />
                  <Button
                    size="sm"
                    isIconOnly
                    color="danger"
                    variant="flat"
                    className="absolute top-1 right-1"
                    onPress={() => {
                      const newNotes = notes.filter((_, i) => i !== index);
                      setNotes(newNotes);
                    }}
                  >
                    <TrashIcon className="size-4.5" />
                  </Button>
                </div>
              ))}
            </CardBody>
          </Card>

          {errors.general && (
            <Alert
              color="danger"
              variant="flat"
              description={errors.general}
              className="mb-6"
            />
          )}
        </Form>
      </main>
      <div className="p-4 bg-white border-t rounded-t-3xl border-gray-200">
        <Button
          fullWidth
          className="font-medium"
          color="primary"
          variant="shadow"
          size="lg"
          isLoading={createActivityMutation.isPending}
          onPress={() => formRef.current?.requestSubmit()}
          startContent={<CheckReadIcon className="size-7" />}
        >
          Create Activity
        </Button>
      </div>
    </div>
  );
};

export default NewActivity;
