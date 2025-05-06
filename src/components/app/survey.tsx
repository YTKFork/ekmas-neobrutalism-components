"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { usePostHog } from "posthog-js/react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { cn } from "@/lib/utils"

import { Input } from "../ui/input"

const FormSchema = z.object({
  interested: z.enum(["yes", "no"], {
    required_error: "This field is required.",
  }),
  price: z.enum(["50-70", "70-90", "90"]).optional(),
  email: z.string().optional(),
})

export default function Survey() {
  const posthog = usePostHog()

  const [active, setActive] = useState<boolean>(false)
  const [triggerActive, setTriggerActive] = useState<boolean>(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      interested: undefined,
      price: undefined,
      email: "",
    },
  })

  function onSubmit({ interested, price, email }: z.infer<typeof FormSchema>) {
    if (interested === "yes") {
      if (!price) {
        form.setError("price", {
          type: "manual",
          message: "Please select a price range",
        })
        return
      } else {
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          form.setError("email", {
            type: "manual",
            message: "Please enter a valid email address",
          })
          return
        }

        posthog.capture("survey_interested", {
          price,
          email,
        })

        localStorage.setItem("survey_is_done", "true")
        setActive(false)
        setTriggerActive(false)
      }
    } else {
      posthog.capture("survey_not_interested")

      localStorage.setItem("survey_is_done", "true")
      setActive(false)
      setTriggerActive(false)
    }
  }

  useEffect(() => {
    const surveyDone = localStorage.getItem("survey_is_done")
    if (!surveyDone) {
      setTriggerActive(true)
    }
  }, [])

  return (
    <Dialog open={active} onOpenChange={setActive}>
      <div
        className={cn(
          "fixed w-[240px] text-center bottom-5 bg-background rounded-base border-2 border-border shadow-shadow p-4 gap-4 flex flex-col items-center right-5",
          !triggerActive && "hidden",
        )}
      >
        <p className="text-wrap">
          Please take a moment to fill out this survey.
        </p>
        <div className="grid grid-cols-2 gap-2 w-full">
          <DialogTrigger asChild>
            <Button
              variant="noShadow"
              size="sm"
              className="w-full cursor-pointer"
            >
              Fill
            </Button>
          </DialogTrigger>
          <Button
            variant="noShadow"
            size="sm"
            className="w-full cursor-pointer bg-secondary-background text-foreground"
            onClick={() => {
              localStorage.setItem("survey_is_done", "true")
              setActive(false)
              setTriggerActive(false)
            }}
          >
            No thanks
          </Button>
        </div>
      </div>

      <DialogContent
        aria-describedby="Would you be interested in buying neobrutalism themes?"
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Survey</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="interested"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="sm:text-base text-sm">
                    Would you be interested in buying neobrutalism themes?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            className="dark:border-white"
                            value="yes"
                          />
                        </FormControl>
                        <FormLabel>Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            className="dark:border-white"
                            value="no"
                          />
                        </FormControl>
                        <FormLabel>No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("interested") === "yes" && (
              <>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="sm:text-base text-sm">
                        How much would you be willing to pay for a multi-page
                        theme?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                className="dark:border-white"
                                value="50-70"
                              />
                            </FormControl>
                            <FormLabel>50-70$</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                className="dark:border-white"
                                value="70-90"
                              />
                            </FormControl>
                            <FormLabel>70-90$</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                className="dark:border-white"
                                value="90"
                              />
                            </FormControl>
                            <FormLabel>90+$</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="sm:text-base text-sm">
                        Leave email to get notified when the themes are ready
                        (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john@example.com"
                          type="email"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button size="sm" className="w-full" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
