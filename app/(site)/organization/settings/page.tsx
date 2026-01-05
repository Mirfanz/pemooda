import OrganizationSettings from "@/components/site/organization/settings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan Organisasi",
};

export default function Page() {
  return <OrganizationSettings />;
}
