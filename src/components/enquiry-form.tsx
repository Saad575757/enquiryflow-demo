"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createEnquiry, updateEnquiry } from "@/actions/enquiries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ENQUIRY_SOURCE_VALUES,
  ENQUIRY_TYPE_VALUES,
  SOURCE_META,
  TYPE_META,
} from "@/lib/enquiry";
import {
  enquiryFormSchema,
  type EnquiryFormData,
  type EnquiryFormValues,
} from "@/lib/validation";

type TeamMemberOption = {
  id: string;
  name: string;
};

const UNASSIGNED = "__unassigned__";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-destructive">{message}</p>;
}

export function EnquiryForm({
  teamMembers,
  today,
  enquiryId,
  defaultValues,
}: {
  teamMembers: TeamMemberOption[];
  today: string;
  enquiryId?: string;
  defaultValues?: Partial<EnquiryFormValues>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const isEdit = Boolean(enquiryId);

  const form = useForm<EnquiryFormValues, unknown, EnquiryFormData>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      title: "",
      contactName: "",
      email: "",
      phone: "",
      organisation: "",
      enquiryType: "OTHER",
      source: "WEBSITE",
      description: "",
      dateReceived: today,
      assignedOwnerId: "",
      nextAction: "",
      nextActionDueAt: "",
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = form;

  const [enquiryType, setEnquiryType] = useState<EnquiryFormValues["enquiryType"]>(
    defaultValues?.enquiryType ?? "OTHER",
  );
  const [source, setSource] = useState<EnquiryFormValues["source"]>(
    defaultValues?.source ?? "WEBSITE",
  );
  const [assignedOwnerId, setAssignedOwnerId] = useState(
    defaultValues?.assignedOwnerId ?? "",
  );

  function onSubmit() {
    setFormError(null);

    startTransition(async () => {
      const values = getValues();

      const result = isEdit
        ? await updateEnquiry({ ...values, id: enquiryId })
        : await createEnquiry(values);

      if (!result.ok) {
        setFormError(result.message ?? "The enquiry could not be saved.");

        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            setError(field as keyof EnquiryFormValues, {
              message: messages[0],
            });
          }
        }

        toast.error(result.message ?? "The enquiry could not be saved.");
        return;
      }

      const createdId = "id" in result ? result.id : undefined;

      toast.success(isEdit ? "Enquiry updated." : "Enquiry created.");

      router.push(createdId ? `/enquiries/${createdId}` : "/enquiries");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enquiry details</CardTitle>
          <CardDescription>
            Who made the enquiry and what they need.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Curriculum review for Northfield Academy"
                aria-required
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">
                Contact name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactName"
                placeholder="Priya Raman"
                aria-required
                aria-invalid={Boolean(errors.contactName)}
                {...register("contactName")}
              />
              <FieldError message={errors.contactName?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organisation">Organisation</Label>
              <Input
                id="organisation"
                placeholder="Northfield Academy"
                aria-invalid={Boolean(errors.organisation)}
                {...register("organisation")}
              />
              <FieldError message={errors.organisation?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="priya@example.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+44 20 7946 0000"
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              <FieldError message={errors.phone?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enquiryType">Type of enquiry</Label>
              <Select
                value={enquiryType}
                onValueChange={(value) => {
                  const next = value as EnquiryFormValues["enquiryType"];
                  setEnquiryType(next);
                  setValue("enquiryType", next, { shouldValidate: true });
                }}
              >
                <SelectTrigger
                  id="enquiryType"
                  aria-invalid={Boolean(errors.enquiryType)}
                >
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_TYPE_VALUES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {TYPE_META[type].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {TYPE_META[enquiryType]?.description}
              </p>
              <FieldError message={errors.enquiryType?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">How did they find us?</Label>
              <Select
                value={source}
                onValueChange={(value) => {
                  const next = value as EnquiryFormValues["source"];
                  setSource(next);
                  setValue("source", next, { shouldValidate: true });
                }}
              >
                <SelectTrigger id="source" aria-invalid={Boolean(errors.source)}>
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_SOURCE_VALUES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {SOURCE_META[value].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.source?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateReceived">
                Date received <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dateReceived"
                type="date"
                aria-required
                aria-invalid={Boolean(errors.dateReceived)}
                {...register("dateReceived")}
              />
              <FieldError message={errors.dateReceived?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedOwnerId">Owner</Label>
              <Select
                value={assignedOwnerId || UNASSIGNED}
                onValueChange={(value) => {
                  const next = value === UNASSIGNED ? "" : value;
                  setAssignedOwnerId(next);
                  setValue("assignedOwnerId", next, { shouldValidate: true });
                }}
              >
                <SelectTrigger
                  id="assignedOwnerId"
                  aria-invalid={Boolean(errors.assignedOwnerId)}
                >
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.assignedOwnerId?.message} />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="description">What do they need?</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Full context, timelines, budget signals…"
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next action</CardTitle>
          <CardDescription>
            What happens next, and when it is due. This is what shows on the
            dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nextAction">Action</Label>
            <Input
              id="nextAction"
              placeholder="Send proposal and book a discovery call"
              aria-invalid={Boolean(errors.nextAction)}
              {...register("nextAction")}
            />
            <FieldError message={errors.nextAction?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextActionDueAt">Due date</Label>
            <Input
              id="nextActionDueAt"
              type="date"
              aria-invalid={Boolean(errors.nextActionDueAt)}
              {...register("nextActionDueAt")}
            />
            <FieldError message={errors.nextActionDueAt?.message} />
          </div>
        </CardContent>
      </Card>

      {formError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-6 lg:px-6 xl:-mx-10 xl:px-10">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <Save className="size-4" />
          {isPending
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Create enquiry"}
        </Button>
      </div>
    </form>
  );
}
