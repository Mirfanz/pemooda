"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Form,
  Input,
  Textarea,
  Card,
  CardBody,
  Divider,
  Alert,
  addToast,
  Checkbox,
  CheckboxGroup,
  Skeleton,
} from "@heroui/react";

import { useCreateAttendance } from "@/hooks/queries/attendance";
import { useOrganizationMembers } from "@/hooks/queries/organization";
import Navbar from "../navbar";

import { formatErrors } from "@/lib/utils";
import axios from "axios";
import {
  CalendarAdd,
  UsersGroupRounded,
  DocumentAdd,
  Global,
} from "@solar-icons/react";

type Props = {
  activityId: string;
};

const NewAttendance = ({ activityId }: Props) => {
  const router = useRouter();
  const createAttendanceMutation = useCreateAttendance();
  const { data: members, isLoading: loadingMembers } = useOrganizationMembers();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    allowExternalUsers: false,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
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
        activityId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        allowExternalUsers: formData.allowExternalUsers,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,
        userIds: selectedUsers,
      };

      await createAttendanceMutation.mutateAsync(payload);

      addToast({
        color: "success",
        title: "Attendance created successfully!",
      });
      router.back();
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
      <Navbar title="Create Attendance" />
      <main className="p-4 pb-6">
        <Alert
          description="Create attendance for this activity. You can select members who should attend."
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
          <Card shadow="sm" fullWidth>
            <CardBody className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2.5">
                <DocumentAdd
                  weight="Broken"
                  className="size-5 text-secondary"
                />
                Basic Information
              </h3>
              <Divider />
              <Input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                label="Attendance Name"
                placeholder="e.g., Absen Masuk, Absen Pulang"
                labelPlacement="outside"
                variant="flat"
                isInvalid={!!errors.name}
                errorMessage={errors.name}
              />

              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
                label="Description (Optional)"
                placeholder="Describe this attendance..."
                labelPlacement="outside"
                variant="flat"
                isInvalid={!!errors.description}
                errorMessage={errors.description}
                minRows={2}
              />

              <Input
                name="startDate"
                type="datetime-local"
                label="Start Date (Optional)"
                description="Leave empty to start manually later"
                labelPlacement="outside-top"
                variant="flat"
                onChange={handleChange}
                value={formData.startDate}
                isInvalid={!!errors.startDate}
                errorMessage={errors.startDate}
              />

              <Checkbox
                isSelected={formData.allowExternalUsers}
                onValueChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    allowExternalUsers: checked,
                  }))
                }
              >
                <div className="flex items-center gap-2">
                  <Global weight="Broken" className="size-4" />
                  <span className="text-sm">Allow external users</span>
                </div>
              </Checkbox>
            </CardBody>
          </Card>

          {/* Select Members */}
          <Card shadow="sm" fullWidth>
            <CardBody className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2.5">
                <UsersGroupRounded
                  weight="BoldDuotone"
                  className="size-5 text-secondary"
                />
                Select Members (Optional)
              </h3>
              <Divider />
              <p className="text-sm text-default-500">
                Select members who should attend. Others can still scan QR to
                attend.
              </p>

              {loadingMembers ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              ) : (
                <CheckboxGroup
                  value={selectedUsers}
                  onValueChange={setSelectedUsers}
                  classNames={{
                    wrapper: "gap-2",
                  }}
                >
                  {members?.map((member) => (
                    <Checkbox key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{member.name}</span>
                        {member.role && (
                          <span className="text-xs text-default-400">
                            ({member.role})
                          </span>
                        )}
                      </div>
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              )}
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
          isLoading={createAttendanceMutation.isPending}
          onPress={() => formRef.current?.requestSubmit()}
          startContent={<CalendarAdd weight="Broken" className="size-7" />}
        >
          Create Attendance
        </Button>
      </div>
    </div>
  );
};

export default NewAttendance;
