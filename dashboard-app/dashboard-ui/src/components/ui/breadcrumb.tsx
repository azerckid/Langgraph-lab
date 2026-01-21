import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
    return <nav className={cn("flex items-center text-sm", className)} {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
    return <ol className={cn("flex items-center gap-1.5", className)} {...props} />
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
    return <li className={cn("flex items-center gap-1.5", className)} {...props} />
}

function BreadcrumbLink({
    className,
    asChild,
    ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
    const Comp = asChild ? "span" : "a"
    return (
        <Comp
            className={cn("transition-colors hover:text-foreground text-muted-foreground", className)}
            {...props}
        />
    )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
    return (
        <span
            role="link"
            aria-disabled="true"
            aria-current="page"
            className={cn("font-normal text-foreground", className)}
            {...props}
        />
    )
}

function BreadcrumbSeparator({
    children,
    className,
    ...props
}: React.ComponentProps<"li">) {
    return (
        <li
            role="presentation"
            aria-hidden="true"
            className={cn("[&>svg]:size-3.5 text-muted-foreground/50", className)}
            {...props}
        >
            {children ?? <ChevronRight />}
        </li>
    )
}

export {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
}
